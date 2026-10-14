import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { NextRequest } from "next/server";
import { POST } from "../app/api/pdf/upload/route";

async function run() {
  console.log("Testing POST /api/pdf/upload handler directly...");

  // 1. Test fixture upload: aurum-offer
  const fixtureUrl = "http://localhost:3000/api/pdf/upload?fixture=aurum-offer&companyId=test_comp_123";
  const fixtureReq = new NextRequest(fixtureUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-company-id": "test_comp_123",
    },
    body: JSON.stringify({ companyId: "test_comp_123", sampleName: "aurum-offer" }),
  });

  const fixtureRes = await POST(fixtureReq);
  const fixtureJson = await fixtureRes.json();
  console.log("Fixture response status:", fixtureRes.status, fixtureJson.message || fixtureJson);
  assert.equal(fixtureRes.status, 200);
  assert.equal(fixtureJson.success, true);
  assert.ok(fixtureJson.data?.projectId);
  assert.equal(fixtureJson.data?.document?.pages?.length, 4);
  console.log("  ✓ Aurum fixture loading route handler works 100%!");

  // 2. Test multipart file upload
  const pdfFilePath = path.join(process.cwd(), "public/fixtures/aurum-offer.pdf");
  const fileBytes = fs.readFileSync(pdfFilePath);
  const blob = new Blob([fileBytes], { type: "application/pdf" });
  const formData = new FormData();
  formData.append("file", blob, "uploaded-test.pdf");
  formData.append("companyId", "test_comp_123");

  const uploadReq = new NextRequest("http://localhost:3000/api/pdf/upload", {
    method: "POST",
    headers: {
      "x-company-id": "test_comp_123",
    },
    body: formData,
  });

  const uploadRes = await POST(uploadReq);
  const uploadJson = await uploadRes.json();
  console.log("Upload response status:", uploadRes.status, uploadJson.message || uploadJson);
  assert.equal(uploadRes.status, 200);
  assert.equal(uploadJson.success, true);
  assert.ok(uploadJson.data?.projectId);
  assert.equal(uploadJson.data?.document?.pages?.length, 4);
  console.log("  ✓ Multipart file upload route handler works 100%!");

  console.log("\nALL UPLOAD ROUTE TESTS PASSED!");
  process.exit(0);
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
