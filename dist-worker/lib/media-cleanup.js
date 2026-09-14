"use strict";
/**
 * lib/media-cleanup.ts
 *
 * Media lifecycle cleanup service for Ghuba Marketplace.
 * Safely removes orphaned media, variants, posters, and video assets from S3.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteMediaAssetsFromStorage = exports.extractStorageKeyFromUrl = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const media_optimizer_1 = require("./media-optimizer");
/**
 * Extracts the S3 storage key from a full CloudFront or S3 URL.
 */
function extractStorageKeyFromUrl(url) {
    if (!url || typeof url !== "string")
        return null;
    try {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            const parsed = new URL(url);
            // Remove leading slash
            const pathname = parsed.pathname.replace(/^\/+/, "");
            return pathname.length > 0 ? pathname : null;
        }
        // Relative path
        return url.replace(/^\/+/, "");
    }
    catch {
        return null;
    }
}
exports.extractStorageKeyFromUrl = extractStorageKeyFromUrl;
/**
 * Batch deletes media assets from S3 given an array of URLs or S3 keys.
 */
async function deleteMediaAssetsFromStorage(urlsOrKeys) {
    if (!urlsOrKeys || urlsOrKeys.length === 0) {
        return { deletedCount: 0, errors: [] };
    }
    const { s3, bucket } = (0, media_optimizer_1.getMediaS3Client)();
    const keysToDelete = [];
    for (const item of urlsOrKeys) {
        const key = extractStorageKeyFromUrl(item);
        if (key && !keysToDelete.includes(key)) {
            keysToDelete.push(key);
        }
    }
    if (keysToDelete.length === 0) {
        return { deletedCount: 0, errors: [] };
    }
    const errors = [];
    let deletedCount = 0;
    // S3 DeleteObjects allows up to 1000 keys per request
    const CHUNK_SIZE = 500;
    for (let i = 0; i < keysToDelete.length; i += CHUNK_SIZE) {
        const chunk = keysToDelete.slice(i, i + CHUNK_SIZE);
        try {
            const response = await s3.send(new client_s3_1.DeleteObjectsCommand({
                Bucket: bucket,
                Delete: {
                    Objects: chunk.map((k) => ({ Key: k })),
                    Quiet: true,
                },
            }));
            if (response.Errors && response.Errors.length > 0) {
                for (const err of response.Errors) {
                    errors.push(`Key ${err.Key}: ${err.Message}`);
                }
                deletedCount += chunk.length - response.Errors.length;
            }
            else {
                deletedCount += chunk.length;
            }
        }
        catch (err) {
            console.error("[S3_MEDIA_DELETE_ERROR]", err);
            errors.push(err.message || "Failed to batch delete S3 objects");
        }
    }
    return { deletedCount, errors };
}
exports.deleteMediaAssetsFromStorage = deleteMediaAssetsFromStorage;
