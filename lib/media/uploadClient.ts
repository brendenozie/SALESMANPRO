/**
 * lib/media/uploadClient.ts
 * Client-side utility for direct-to-S3 signed uploads with CDN delivery.
 */

export type UploadMediaType = "image" | "video" | "document";

/** Size ceilings mirrored from app/api/upload-url/route.ts (server is authoritative). */
export const UPLOAD_LIMITS: Record<UploadMediaType, { maxSizeBytes: number; accept: string[] }> = {
  image: {
    maxSizeBytes: 15 * 1024 * 1024,
    accept: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/avif", "image/gif"],
  },
  video: {
    maxSizeBytes: 100 * 1024 * 1024,
    accept: ["video/mp4", "video/webm", "video/quicktime", "video/x-m4v"],
  },
  document: {
    maxSizeBytes: 5 * 1024 * 1024,
    accept: ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"],
  },
};

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Validates a file against the type rules (and an optional stricter size cap).
 * Returns an error message, or null if the file is acceptable.
 */
export function validateUploadFile(
  file: File,
  type: UploadMediaType,
  opts: { maxSizeBytes?: number; accept?: string[] } = {}
): string | null {
  const rule = UPLOAD_LIMITS[type];
  const maxSize = Math.min(opts.maxSizeBytes ?? rule.maxSizeBytes, rule.maxSizeBytes);
  const accept = opts.accept ?? rule.accept;

  if (file.size === 0) return "This file is empty.";
  if (file.size > maxSize) {
    return `File is ${formatBytes(file.size)}. Maximum allowed is ${formatBytes(maxSize)}.`;
  }
  if (file.type && !accept.includes(file.type.toLowerCase())) {
    const friendly = accept.map((m) => m.split("/")[1].toUpperCase()).filter((v, i, a) => a.indexOf(v) === i);
    return `Unsupported file type. Allowed: ${friendly.join(", ")}.`;
  }
  return null;
}

async function requestPresignedUrl(file: File, type: UploadMediaType, companyId?: string) {
  const initRes = await fetch("/api/upload-url", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      filename: file.name,
      type,
      contentType: file.type || (type === "video" ? "video/mp4" : "image/jpeg"),
      fileSize: file.size,
      companyId,
    }),
  });

  if (!initRes.ok) {
    const err = await initRes.json().catch(() => ({}));
    throw new Error(err.error || "Failed to initialize upload");
  }

  return (await initRes.json()) as { uploadUrl: string; cdnUrl: string; contentType?: string };
}

export async function uploadMediaFile(
  file: File,
  type: UploadMediaType = "image",
  companyId?: string
): Promise<string> {
  const { uploadUrl, cdnUrl, contentType } = await requestPresignedUrl(file, type, companyId);

  const uploadRes = await fetch(uploadUrl, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": contentType || file.type,
    },
  });

  if (!uploadRes.ok) {
    throw new Error(`Upload to storage failed (${uploadRes.status})`);
  }

  return cdnUrl;
}

/**
 * Same as uploadMediaFile, but reports progress (0-100) and supports cancellation.
 * Validates type/size on the client before requesting a presigned URL.
 */
export async function uploadMediaFileWithProgress(
  file: File,
  opts: {
    type?: UploadMediaType;
    companyId?: string;
    maxSizeBytes?: number;
    accept?: string[];
    onProgress?: (percent: number) => void;
    signal?: AbortSignal;
  } = {}
): Promise<string> {
  const type = opts.type ?? "image";
  const validationError = validateUploadFile(file, type, opts);
  if (validationError) throw new Error(validationError);

  const { uploadUrl, cdnUrl, contentType } = await requestPresignedUrl(file, type, opts.companyId);

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType || file.type);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload to storage failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Network error during upload. Please try again."));
    xhr.onabort = () => reject(new Error("Upload cancelled."));

    if (opts.signal) {
      if (opts.signal.aborted) return xhr.abort();
      opts.signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(file);
  });

  opts.onProgress?.(100);
  return cdnUrl;
}
