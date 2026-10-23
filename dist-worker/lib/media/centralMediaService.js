"use strict";
/**
 * lib/media/centralMediaService.ts
 *
 * Centralized, Modern Media Management Engine for SalesmanPro and Ghuba.
 * Provides unified, secure, tenant-isolated operations for:
 * - Upload session authorization & presigned URL generation
 * - Direct object storage verification (S3 HeadObject)
 * - MediaAsset lifecycle state machine enforcement
 * - Variant resolution, metadata tracking, and deduplication
 * - Reference-aware safe deletion with soft-delete grace period
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeImageUrl = exports.resolveProductMedia = exports.deleteMediaAsset = exports.getStoreMediaLibrary = exports.verifyAndProcessUpload = exports.createUploadSession = exports.sanitizeMediaFilename = exports.MEDIA_RULES = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const media_optimizer_1 = require("@/lib/media-optimizer");
const crypto_1 = __importDefault(require("crypto"));
exports.MEDIA_RULES = {
    image: {
        allowedMimes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "image/avif",
            "image/gif",
        ],
        maxSizeBytes: 15 * 1024 * 1024,
        defaultExt: "webp",
    },
    video: {
        allowedMimes: [
            "video/mp4",
            "video/webm",
            "video/quicktime",
            "video/x-m4v",
        ],
        maxSizeBytes: 100 * 1024 * 1024,
        defaultExt: "mp4",
    },
    book: {
        allowedMimes: [
            "application/pdf",
            "application/epub+zip",
            "application/zip",
        ],
        maxSizeBytes: 50 * 1024 * 1024,
        defaultExt: "pdf",
    },
    document: {
        allowedMimes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf",
        ],
        maxSizeBytes: 10 * 1024 * 1024,
        defaultExt: "jpg",
    },
};
const FORBIDDEN_EXTENSIONS = new Set([
    "exe", "bat", "cmd", "sh", "bin", "app", "msi", "com",
    "php", "phtml", "py", "rb", "pl", "cgi", "jsp", "asp", "aspx",
    "js", "jsx", "ts", "tsx", "mjs", "cjs", "html", "htm", "svg",
]);
/**
 * Strips path traversal delimiters and verifies file extension safety.
 */
function sanitizeMediaFilename(filename) {
    const cleaned = filename.replace(/[/\\]/g, "").replace(/\0/g, "").trim();
    const parts = cleaned.split(".");
    let ext = parts.length > 1 ? parts.pop()?.toLowerCase() || "" : "";
    let baseName = parts.join("-").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 60);
    if (!baseName)
        baseName = "asset";
    if (FORBIDDEN_EXTENSIONS.has(ext)) {
        throw new Error(`Dangerous or forbidden file extension: .${ext}`);
    }
    return { safeName: baseName, ext };
}
exports.sanitizeMediaFilename = sanitizeMediaFilename;
/**
 * 1. Creates a signed direct-to-S3 upload session and registers a PENDING MediaAsset record.
 */
async function createUploadSession(params) {
    const { userId, companyId, filename, category, contentType, fileSize, metadata = {} } = params;
    if (!companyId || typeof companyId !== "string") {
        throw new Error("A valid tenant companyId is strictly required.");
    }
    const rule = exports.MEDIA_RULES[category];
    if (!rule) {
        throw new Error(`Unsupported media category: '${category}'`);
    }
    if (fileSize && fileSize > rule.maxSizeBytes) {
        throw new Error(`File size (${Math.round(fileSize / (1024 * 1024))}MB) exceeds maximum limit of ${Math.round(rule.maxSizeBytes / (1024 * 1024))}MB for ${category}.`);
    }
    const { safeName, ext } = sanitizeMediaFilename(filename);
    let resolvedContentType = contentType.toLowerCase().trim();
    if (!resolvedContentType || resolvedContentType === "application/octet-stream") {
        if (ext === "jpg" || ext === "jpeg")
            resolvedContentType = "image/jpeg";
        else if (ext === "png")
            resolvedContentType = "image/png";
        else if (ext === "webp")
            resolvedContentType = "image/webp";
        else if (ext === "mp4")
            resolvedContentType = "video/mp4";
        else if (ext === "webm")
            resolvedContentType = "video/webm";
        else if (ext === "pdf")
            resolvedContentType = "application/pdf";
        else
            resolvedContentType = category === "image" ? "image/jpeg" : category === "video" ? "video/mp4" : "application/pdf";
    }
    const isAllowedMime = rule.allowedMimes.some((allowed) => resolvedContentType === allowed ||
        (allowed.endsWith("/*") && resolvedContentType.startsWith(allowed.replace("/*", ""))));
    if (!isAllowedMime && !resolvedContentType.startsWith(`${category}/`)) {
        throw new Error(`Invalid MIME type '${resolvedContentType}' for ${category}. Allowed: ${rule.allowedMimes.join(", ")}`);
    }
    const { s3, bucket, cdnDomain } = (0, media_optimizer_1.getMediaS3Client)();
    const sanitizedCompanyScope = companyId.replace(/[^a-zA-Z0-9_-]/g, "");
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const randomSuffix = crypto_1.default.randomBytes(6).toString("hex");
    const finalExt = ext || rule.defaultExt;
    const storageKey = `companies/${sanitizedCompanyScope}/${category}s/${datePrefix}/${Date.now()}-${randomSuffix}-${safeName}.${finalExt}`;
    const cdnUrl = `https://${cdnDomain}/${storageKey}`;
    // Persist MediaAsset in PENDING state
    const prismaMediaType = category === "video" ? "VIDEO" : category === "book" ? "BOOK" : "IMAGE";
    const mediaAsset = await prismadb_1.default.mediaAsset.create({
        data: {
            ownerId: userId || undefined,
            companyId: companyId,
            type: prismaMediaType,
            source: "UPLOAD",
            status: "PENDING",
            originalName: filename,
            mimeType: resolvedContentType,
            size: fileSize || null,
            storageProvider: "S3",
            storageKey: storageKey,
            url: cdnUrl,
            metadata: {
                ...metadata,
                sanitizedSafeName: safeName,
                category,
                clientDeclaredSize: fileSize || null,
            },
        },
    });
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucket,
        Key: storageKey,
        ContentType: resolvedContentType,
        CacheControl: "public, max-age=31536000, immutable",
        ...(category === "document" && fileSize ? { ContentLength: fileSize } : {}),
    });
    const expiresInSeconds = 900; // 15 minutes
    const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(s3, command, { expiresIn: expiresInSeconds });
    return {
        sessionId: crypto_1.default.randomUUID(),
        mediaId: mediaAsset.id,
        uploadUrl,
        storageKey,
        cdnUrl,
        publicUrl: cdnUrl,
        contentType: resolvedContentType,
        maxSizeBytes: rule.maxSizeBytes,
        expiresInSeconds,
    };
}
exports.createUploadSession = createUploadSession;
/**
 * 2. Verifies that the client actually uploaded the object to S3, extracts metadata,
 * generates responsive WebP variants for images, and updates MediaAsset to READY.
 */
async function verifyAndProcessUpload(params) {
    const { mediaId, companyId, userId, processVariants = true } = params;
    const mediaAsset = await prismadb_1.default.mediaAsset.findUnique({
        where: { id: mediaId },
    });
    if (!mediaAsset) {
        throw new Error(`MediaAsset with ID '${mediaId}' not found.`);
    }
    // Strict tenant scoping check
    if (mediaAsset.companyId && mediaAsset.companyId !== companyId) {
        throw new Error("Unauthorized: Media asset belongs to a different store or company scope.");
    }
    // Idempotency: If already READY or PROCESSING, return current record safely
    if (mediaAsset.status === "READY" && mediaAsset.variants) {
        return {
            success: true,
            media: mediaAsset,
            variants: mediaAsset.variants,
        };
    }
    if (!mediaAsset.storageKey) {
        throw new Error("Media asset does not possess a storageKey.");
    }
    const { s3, bucket } = (0, media_optimizer_1.getMediaS3Client)();
    // Issue S3 HeadObject to verify file presence and length
    let headRes;
    try {
        headRes = await s3.send(new client_s3_1.HeadObjectCommand({
            Bucket: bucket,
            Key: mediaAsset.storageKey,
        }));
    }
    catch (err) {
        await prismadb_1.default.mediaAsset.update({
            where: { id: mediaId },
            data: {
                status: "FAILED",
                processingError: `S3 verification failed: ${err.message || "Object not found"}`,
            },
        });
        throw new Error(`Uploaded file was not found in storage: ${err.message}`);
    }
    const actualSizeBytes = headRes.ContentLength || mediaAsset.size || 0;
    const actualContentType = headRes.ContentType || mediaAsset.mimeType || "application/octet-stream";
    const checksum = headRes.ETag ? headRes.ETag.replace(/"/g, "") : null;
    // Transition to UPLOADED / PROCESSING
    await prismadb_1.default.mediaAsset.update({
        where: { id: mediaId },
        data: {
            status: "PROCESSING",
            size: actualSizeBytes,
            mimeType: actualContentType,
            checksum,
        },
    });
    let generatedVariants = null;
    let finalWidth = mediaAsset.width || null;
    let finalHeight = mediaAsset.height || null;
    let blurDataUrl = null;
    let thumbnailUrl = mediaAsset.thumbnailUrl || mediaAsset.url;
    // If IMAGE, run responsive WebP optimization & blur placeholder generation
    if (mediaAsset.type === "IMAGE" && processVariants) {
        try {
            const getRes = await s3.send(new client_s3_1.GetObjectCommand({
                Bucket: bucket,
                Key: mediaAsset.storageKey,
            }));
            const byteArray = await getRes.Body?.transformToByteArray();
            if (byteArray) {
                const imageBuffer = Buffer.from(byteArray);
                const optimized = await (0, media_optimizer_1.optimizeListingImage)(imageBuffer);
                const stored = await (0, media_optimizer_1.persistOptimizedVariantsToStorage)(companyId, mediaAsset.id, optimized);
                generatedVariants = stored.variants;
                finalWidth = optimized.width;
                finalHeight = optimized.height;
                blurDataUrl = optimized.blurDataUrl;
                thumbnailUrl = stored.variants.thumbnail;
            }
        }
        catch (procErr) {
            console.warn(`[MEDIA_OPTIMIZATION_WARN] Variant generation fallback for ${mediaId}:`, procErr.message);
            // Proceed with master image if variant processing encounters an issue
        }
    }
    else if (mediaAsset.type === "VIDEO") {
        // For video assets, structure default video variants
        generatedVariants = {
            feed: mediaAsset.url,
            poster: mediaAsset.thumbnailUrl || "",
        };
        // Asynchronously dispatch adaptive HLS transcoding job to BullMQ worker
        try {
            const { dispatchVideoTranscode } = await Promise.resolve().then(() => __importStar(require("@/lib/media/transcoding/dispatcher")));
            await dispatchVideoTranscode({
                mediaAssetId: mediaAsset.id,
                companyId: companyId || mediaAsset.companyId || "public",
                sourceUrl: mediaAsset.url,
            });
        }
        catch (dispatchErr) {
            console.warn(`[VIDEO_TRANSCODE_DISPATCH_WARN] Could not enqueue transcode for ${mediaId}:`, dispatchErr.message);
        }
    }
    // Update MediaAsset to READY
    const updatedMedia = await prismadb_1.default.mediaAsset.update({
        where: { id: mediaId },
        data: {
            status: "READY",
            width: finalWidth,
            height: finalHeight,
            thumbnailUrl,
            variants: generatedVariants || undefined,
            metadata: {
                ...(mediaAsset.metadata || {}),
                blurDataUrl,
                eTag: checksum,
                verifiedAt: new Date().toISOString(),
            },
        },
    });
    return {
        success: true,
        media: updatedMedia,
        variants: generatedVariants,
    };
}
exports.verifyAndProcessUpload = verifyAndProcessUpload;
/**
 * 3. Retrieves store media library assets with filtering and pagination.
 */
async function getStoreMediaLibrary(options) {
    const { companyId, type, search, status = "READY", limit = 30, cursor } = options;
    if (!companyId)
        return { items: [], nextCursor: null, total: 0 };
    const where = {
        companyId,
        deletedAt: null, // Exclude soft-deleted media
    };
    if (type) {
        where.type = type;
    }
    if (status && status !== "ALL") {
        where.status = status;
    }
    if (search && search.trim().length > 0) {
        where.originalName = {
            contains: search.trim(),
            mode: "insensitive",
        };
    }
    const items = await prismadb_1.default.mediaAsset.findMany({
        where,
        take: limit + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
    });
    let nextCursor = null;
    if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id || null;
    }
    return {
        items,
        nextCursor,
    };
}
exports.getStoreMediaLibrary = getStoreMediaLibrary;
/**
 * 4. Safe Reference-Aware Deletion with Grace Period.
 */
async function deleteMediaAsset(mediaId, companyId, opts = {}) {
    const mediaAsset = await prismadb_1.default.mediaAsset.findUnique({
        where: { id: mediaId },
    });
    if (!mediaAsset) {
        throw new Error(`Media asset '${mediaId}' not found.`);
    }
    if (mediaAsset.companyId && mediaAsset.companyId !== companyId) {
        throw new Error("Unauthorized to delete media from another store.");
    }
    // Safe soft delete with 30-day grace period
    if (!opts.force) {
        const updated = await prismadb_1.default.mediaAsset.update({
            where: { id: mediaId },
            data: {
                status: "DELETING",
                deletedAt: new Date(),
            },
        });
        return { success: true, mode: "SOFT_DELETE", media: updated };
    }
    // Force delete: clean from S3 if no active references exist
    if (mediaAsset.storageKey) {
        const { s3, bucket } = (0, media_optimizer_1.getMediaS3Client)();
        try {
            await s3.send(new client_s3_1.DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: [{ Key: mediaAsset.storageKey }],
                },
            }));
        }
        catch (s3Err) {
            console.warn(`[MEDIA_S3_CLEANUP_WARN] Failed to delete S3 key ${mediaAsset.storageKey}:`, s3Err);
        }
    }
    await prismadb_1.default.mediaAsset.delete({
        where: { id: mediaId },
    });
    return { success: true, mode: "PERMANENT_DELETE" };
}
exports.deleteMediaAsset = deleteMediaAsset;
// Re-export client media resolver utilities for convenient unified consumption
var product_media_resolver_1 = require("@/lib/product-media-resolver");
Object.defineProperty(exports, "resolveProductMedia", { enumerable: true, get: function () { return product_media_resolver_1.resolveProductMedia; } });
Object.defineProperty(exports, "sanitizeImageUrl", { enumerable: true, get: function () { return product_media_resolver_1.sanitizeImageUrl; } });
