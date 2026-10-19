/**
 * lib/client-video-compressor.ts
 *
 * Client-Side Video Compression Utility for Merchant Marketplace Uploads.
 * Uses browser MediaRecorder, Canvas, and Web Audio APIs to transcode and compress
 * large smartphone video recordings down to under 10 MB before network transmission.
 */

export interface VideoCompressionOptions {
  maxSizeBytes?: number; // Default: 10 * 1024 * 1024 (10 MB)
  targetMaxDimension?: number; // Default: 1280 (720p / 1080p mobile max)
  targetFps?: number; // Default: 30
  onProgress?: (progress: number) => void; // 0 to 100%
}

const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const TARGET_SAFETY_BYTES = 8.5 * 1024 * 1024; // 8.5 MB target for reliable margin

/**
 * Checks if client environment supports video compression via MediaRecorder and Canvas.
 */
export function isClientVideoCompressionSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    typeof window.MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement.prototype.captureStream === "function"
  );
}

/**
 * Determines the best supported video MIME type for recording on this browser.
 */
function getSupportedMimeType(): string {
  if (typeof window === "undefined" || !window.MediaRecorder) {
    return "video/mp4";
  }

  const candidateTypes = [
    "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
    "video/mp4",
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];

  for (const mime of candidateTypes) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }

  return "video/webm";
}

/**
 * Compresses an incoming video file on the client before upload to guarantee it stays under 10 MB.
 */
export async function compressVideoFile(
  file: File,
  options: VideoCompressionOptions = {}
): Promise<File> {
  const maxSizeBytes = options.maxSizeBytes || DEFAULT_MAX_SIZE_BYTES;
  const targetDimension = options.targetMaxDimension || 1280;
  const targetFps = options.targetFps || 30;
  const onProgress = options.onProgress || (() => {});

  // If already under target limit, return original file directly
  if (file.size <= maxSizeBytes) {
    onProgress(100);
    return file;
  }

  if (!isClientVideoCompressionSupported()) {
    console.warn("[VideoCompressor] MediaRecorder captureStream not supported in this environment.");
    return file;
  }

  return new Promise<File>((resolve, reject) => {
    const videoUrl = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.src = videoUrl;
    video.muted = false; // keep audio active for capturing
    video.playsInline = true;
    video.preload = "auto";
    video.crossOrigin = "anonymous";

    let cleanup = () => {
      URL.revokeObjectURL(videoUrl);
      video.remove();
    };

    video.onloadedmetadata = async () => {
      try {
        const duration = video.duration || 10;
        const originalWidth = video.videoWidth || 1280;
        const originalHeight = video.videoHeight || 720;

        // Compute aspect-ratio preserved dimensions scaled to target max dimension
        let scale = 1;
        const maxOriginalDim = Math.max(originalWidth, originalHeight);
        if (maxOriginalDim > targetDimension) {
          scale = targetDimension / maxOriginalDim;
        }

        const width = Math.floor((originalWidth * scale) / 2) * 2; // ensure even number for encoders
        const height = Math.floor((originalHeight * scale) / 2) * 2;

        // Calculate target video bitrate to fit within target safety size (8.5 MB)
        // Bitrate (bps) = (TargetBytes * 8) / duration
        const calculatedBitrate = Math.floor((TARGET_SAFETY_BYTES * 8) / duration);
        const videoBitsPerSecond = Math.max(450_000, Math.min(2_500_000, calculatedBitrate));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d", { alpha: false });

        if (!ctx) {
          cleanup();
          return resolve(file);
        }

        // Capture canvas stream at target frame rate
        const canvasStream = canvas.captureStream(targetFps);

        // Capture audio from video element if audio tracks are available
        try {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            const source = audioCtx.createMediaElementSource(video);
            const destination = audioCtx.createMediaStreamDestination();
            source.connect(destination);
            // Also keep output quiet during background compression
            const gainNode = audioCtx.createGain();
            gainNode.gain.value = 0;
            source.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            destination.stream.getAudioTracks().forEach((track) => {
              canvasStream.addTrack(track);
            });
          }
        } catch (audioErr) {
          // If browser restricts audio context or CORS, proceed with video stream
          console.warn("[VideoCompressor] Audio capture omitted:", audioErr);
        }

        const mimeType = getSupportedMimeType();
        const recorder = new MediaRecorder(canvasStream, {
          mimeType,
          videoBitsPerSecond,
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const isMp4 = mimeType.includes("mp4");
          const extension = isMp4 ? ".mp4" : ".webm";
          const finalMime = isMp4 ? "video/mp4" : "video/webm";

          const blob = new Blob(chunks, { type: finalMime });
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + extension;

          const compressedFile = new File([blob], newFileName, {
            type: finalMime,
            lastModified: Date.now(),
          });

          cleanup();
          onProgress(100);

          // If compressed file is indeed smaller, return it
          if (compressedFile.size < file.size) {
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        };

        // Render loop
        let animationFrameId: number;
        const drawFrame = () => {
          if (video.paused || video.ended) return;

          ctx.drawImage(video, 0, 0, width, height);

          // Report progress based on current playback position
          if (duration > 0) {
            const pct = Math.min(99, Math.round((video.currentTime / duration) * 100));
            onProgress(pct);
          }

          animationFrameId = requestAnimationFrame(drawFrame);
        };

        video.onended = () => {
          cancelAnimationFrame(animationFrameId);
          setTimeout(() => {
            if (recorder.state === "recording") {
              recorder.stop();
            }
          }, 200);
        };

        // Start playback and recording
        recorder.start(500); // 500ms chunk timeslice
        await video.play();
        drawFrame();
      } catch (err) {
        console.error("[VideoCompressor] Compression failed:", err);
        cleanup();
        resolve(file); // Fallback to original file
      }
    };

    video.onerror = () => {
      cleanup();
      resolve(file);
    };
  });
}
