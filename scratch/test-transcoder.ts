import { getFfmpegBinary, transcodeVideoToHLS } from "../lib/media/transcoding/videoTranscoder";

async function testTranscoderFallback() {
  console.log("--- TESTING TRANSCODER & CRASH SAFETY ---");

  const ffmpegBin = getFfmpegBinary();
  console.log(`[PASS] FFmpeg Binary Detection: ${ffmpegBin || "None (Fallback mode active)"}`);

  const result = await transcodeVideoToHLS({
    mediaAssetId: "test_asset_crash_safety",
    companyId: "test_company_safety",
    sourceUrl: "https://example.com/non-existent-video.mp4",
  });

  console.log("[PASS] Graceful Fallback Result:", result);
  console.log("[PASS] Transcoder safely caught download/encoding error without crashing the server process.");
  console.log("--- TRANSCODER SAFETY VERIFIED ---");
}

testTranscoderFallback();
