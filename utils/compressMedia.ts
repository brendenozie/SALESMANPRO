"use client";

import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile } from "@ffmpeg/util";

// ✅ Create a variable to hold the instance
let ffmpeg: FFmpeg | null = null;

export async function compressImage(file: File): Promise<File> {
  return imageCompression(file, {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  });
}

export async function compressVideo(file: File): Promise<File> {
  // 1. Safety check to ensure we are in the browser
  if (typeof window === "undefined") {
    throw new Error("Video compression is only supported in the browser environment.");
  }

  // 2. Lazy-initialize FFmpeg only when this function is called
  if (!ffmpeg) {
    ffmpeg = new FFmpeg();
  }

  // 3. Load FFmpeg core if it hasn't been loaded yet
  if (!ffmpeg.loaded) {
    await ffmpeg.load({
      coreURL: "/ffmpeg/ffmpeg-core.js",
      wasmURL: "/ffmpeg/ffmpeg-core.wasm",
    });
  }

  const inputName = `input-${file.name}`;
  const outputName = `output-${file.name}`;

  await ffmpeg.writeFile(inputName, await fetchFile(file));

  await ffmpeg.exec([
    "-i",
    inputName,
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    "-preset",
    "veryfast",
    "-movflags",
    "+faststart",
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  
  // ffmpeg.readFile can return a Uint8Array or a base64 string depending on environment/types
  let bytes: Uint8Array;
  if (typeof data === "string") {
    // decode base64 string to bytes
    const binary = atob(data);
    bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  } else {
    bytes = data as Uint8Array;
  }

  return new File([new Uint8Array(bytes)], file.name, { type: "video/mp4" });
}
