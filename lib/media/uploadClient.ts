/**
 * lib/media/uploadClient.ts
 * Client-side utility for direct-to-S3 signed uploads with CDN delivery.
 */

export async function uploadMediaFile(
  file: File,
  type: "image" | "video" = "image",
  companyId?: string
): Promise<string> {
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

  const { uploadUrl, cdnUrl, contentType } = await initRes.json();

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
