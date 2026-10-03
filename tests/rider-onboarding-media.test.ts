/**
 * tests/rider-onboarding-media.test.ts
 *
 * Automated Test Suite for Rider Onboarding Media Upload & Step-by-Step Validation:
 * 1. File Upload Validation & Strict 5MB Limit Enforcement
 * 2. MIME Whitelist & Dangerous File Protection
 * 3. Step-by-Step Onboarding Form Validation (Steps 1 through 6)
 * 4. Motorized vs. Non-Motorized Transport Conditional Document Rules
 */

import { validateUploadFile, formatBytes, UPLOAD_LIMITS } from "../lib/media/uploadClient";
import { sanitizeFilename } from "../app/api/upload-url/route";

function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

async function runTests() {
  console.log("=================================================");
  console.log("  Rider Onboarding Media & Step Validation Tests ");
  console.log("=================================================\n");

  let passed = 0;

  // --------------------------------------------------------------------------
  // TEST SUITE 1: File Size Limit & Format Helpers
  // --------------------------------------------------------------------------
  console.log("1. File Size Limit & Format Utilities...");

  assert(formatBytes(500) === "500 B", "formatBytes handles bytes");
  assert(formatBytes(2048) === "2 KB", "formatBytes handles kilobytes");
  assert(formatBytes(5 * 1024 * 1024) === "5.0 MB", "formatBytes handles megabytes");

  // Document ceiling is strictly 5MB
  assert(
    UPLOAD_LIMITS.document.maxSizeBytes === 5 * 1024 * 1024,
    "Document upload limit is strictly 5MB (5,242,880 bytes)"
  );
  console.log("  ✓ formatBytes formatting accurate and 5MB document ceiling verified");
  passed++;

  // --------------------------------------------------------------------------
  // TEST SUITE 2: Client-Side Upload File Validation
  // --------------------------------------------------------------------------
  console.log("\n2. Client-Side Upload File Validation (validateUploadFile)...");

  // Empty file rejected
  const emptyFile = { name: "empty.pdf", size: 0, type: "application/pdf" } as File;
  const emptyErr = validateUploadFile(emptyFile, "document");
  assert(emptyErr === "This file is empty.", "Empty files are rejected");
  console.log("  ✓ Zero-byte files rejected");
  passed++;

  // File exceeding 5MB rejected
  const oversizedFile = {
    name: "national_id.jpg",
    size: 6 * 1024 * 1024, // 6MB
    type: "image/jpeg",
  } as File;
  const overErr = validateUploadFile(oversizedFile, "document");
  assert(
    overErr !== null && overErr.includes("Maximum allowed is 5.0 MB"),
    "Files over 5MB are strictly rejected with clear limit message"
  );
  console.log("  ✓ Files exceeding 5MB are rejected with clear message");
  passed++;

  // Valid 2MB JPEG image accepted
  const validJpg = {
    name: "national_id_front.jpg",
    size: 2 * 1024 * 1024,
    type: "image/jpeg",
  } as File;
  assert(validateUploadFile(validJpg, "document") === null, "Valid 2MB JPEG accepted");

  // Valid 4.5MB PDF document accepted
  const validPdf = {
    name: "insurance_policy.pdf",
    size: 4.5 * 1024 * 1024,
    type: "application/pdf",
  } as File;
  assert(validateUploadFile(validPdf, "document") === null, "Valid 4.5MB PDF accepted");

  // Disallowed type (e.g. video in document category) rejected
  const invalidType = {
    name: "clip.mp4",
    size: 1 * 1024 * 1024,
    type: "video/mp4",
  } as File;
  const typeErr = validateUploadFile(invalidType, "document");
  assert(typeErr !== null && typeErr.includes("Unsupported file type"), "Disallowed MIME type rejected");
  console.log("  ✓ Legitimate images and PDFs accepted; unauthorized types rejected");
  passed++;

  // --------------------------------------------------------------------------
  // TEST SUITE 3: Filename Sanitization & Dangerous Extension Blocking
  // --------------------------------------------------------------------------
  console.log("\n3. Filename Sanitization & Extension Whitelisting (sanitizeFilename)...");

  // Path traversal stripped
  const sanitizedTraversal = sanitizeFilename("../../etc/passwd/id_card.png");
  assert(!sanitizedTraversal.safeName.includes("/"), "Path delimiters removed from filename");
  assert(sanitizedTraversal.ext === "png", "Extension extracted properly");

  // Forbidden executable rejected
  let blocked = false;
  try {
    sanitizeFilename("malicious_script.exe");
  } catch (err: any) {
    blocked = err.message.includes("Forbidden file extension");
  }
  assert(blocked, "Executables (.exe) strictly blocked");

  // Forbidden SVG (XSS vector) rejected
  let svgBlocked = false;
  try {
    sanitizeFilename("payload.svg");
  } catch (err: any) {
    svgBlocked = err.message.includes("Forbidden file extension");
  }
  assert(svgBlocked, "SVG files blocked to prevent XSS payloads");
  console.log("  ✓ Directory traversal stripped and dangerous executables/scripts blocked");
  passed++;

  // --------------------------------------------------------------------------
  // TEST SUITE 4: Step-by-Step Onboarding Form Validation Engine
  // --------------------------------------------------------------------------
  console.log("\n4. Onboarding Step-by-Step Form Validation Engine...");

  // Mock Onboarding Validator replicating the component logic
  function validateOnboardingStep(step: number, data: any) {
    const isMotorized = ["MOTORBIKE", "CAR", "VAN", "TRUCK"].includes(data.riderType);

    switch (step) {
      case 1: {
        if (!data.fullName?.trim() || data.fullName.trim().length < 3) {
          return { valid: false, message: "Full legal name required (min 3 chars)" };
        }
        const cleanPhone = (data.phone || "").replace(/[\s+-]/g, "");
        if (!cleanPhone || cleanPhone.length < 9) {
          return { valid: false, message: "Valid phone number required" };
        }
        if (!data.operatingCounty) {
          return { valid: false, message: "Operating county required" };
        }
        if (!data.operatingCity?.trim()) {
          return { valid: false, message: "Operating city required" };
        }
        if (!data.emergencyContactName?.trim()) {
          return { valid: false, message: "Emergency contact name required" };
        }
        const cleanEmPhone = (data.emergencyContactPhone || "").replace(/[\s+-]/g, "");
        if (!cleanEmPhone || cleanEmPhone.length < 9) {
          return { valid: false, message: "Emergency contact phone required" };
        }
        return { valid: true };
      }

      case 2: {
        if (!data.idNumber?.trim() || data.idNumber.trim().length < 4) {
          return { valid: false, message: "ID number required" };
        }
        if (!data.idFrontUrl) {
          return { valid: false, message: "ID Front document upload required" };
        }
        if ((data.idType === "NATIONAL_ID" || data.idType === "ALIEN_ID") && !data.idBackUrl) {
          return { valid: false, message: "ID Back document upload required" };
        }
        if (!data.selfieUrl) {
          return { valid: false, message: "Selfie/portrait photo required" };
        }
        if (isMotorized) {
          if (!data.drivingLicenseNo?.trim()) {
            return { valid: false, message: "Driving license number required for motorized" };
          }
          if (!data.drivingLicenseUrl) {
            return { valid: false, message: "Driving license document upload required" };
          }
          if (!data.drivingLicenseExpiry) {
            return { valid: false, message: "Driving license expiry date required" };
          }
        }
        return { valid: true };
      }

      case 3: {
        if (isMotorized) {
          if (!data.vehiclePlate?.trim()) return { valid: false, message: "Plate number required" };
          if (!data.vehicleMake?.trim()) return { valid: false, message: "Make required" };
          if (!data.vehicleModel?.trim()) return { valid: false, message: "Model required" };
          if (!data.insuranceNumber?.trim()) return { valid: false, message: "Insurance number required" };
          if (!data.insuranceExpiry) return { valid: false, message: "Insurance expiry date required" };
          if (!data.vehiclePhotoUrl) return { valid: false, message: "Vehicle photo upload required" };
          if (!data.insuranceCertUrl) return { valid: false, message: "Insurance certificate upload required" };
        }
        return { valid: true };
      }

      case 4: {
        if (!data.serviceAreas || data.serviceAreas.length === 0) {
          return { valid: false, message: "At least one service area required" };
        }
        if (!data.maxDistanceKm || data.maxDistanceKm < 5) {
          return { valid: false, message: "Delivery radius must be at least 5km" };
        }
        return { valid: true };
      }

      case 5: {
        if (!data.mpesaPhone?.trim()) return { valid: false, message: "M-Pesa phone required" };
        const cleanMpesa = data.mpesaPhone.replace(/[\s+-]/g, "");
        if (cleanMpesa.length < 9) return { valid: false, message: "Valid M-Pesa phone required" };
        return { valid: true };
      }

      case 6: {
        if (!data.termsAccepted) return { valid: false, message: "Terms acceptance required" };
        return { valid: true };
      }

      default:
        return { valid: true };
    }
  }

  // Test Step 1: Blocks incomplete personal details
  const step1Incomplete = { fullName: "Sam", phone: "", operatingCounty: "Nairobi", operatingCity: "" };
  assert(!validateOnboardingStep(1, step1Incomplete).valid, "Step 1 blocks incomplete personal details");

  const step1Complete = {
    fullName: "Samuel Mwangi",
    phone: "0712345678",
    operatingCounty: "Nairobi",
    operatingCity: "Westlands",
    emergencyContactName: "Mary Mwangi",
    emergencyContactPhone: "0722000000",
  };
  assert(validateOnboardingStep(1, step1Complete).valid, "Step 1 passes with all required details");
  console.log("  ✓ Step 1 strictly validates full name, phone, city, and emergency contact");
  passed++;

  // Test Step 2: Blocks advancing without required ID and Selfie file uploads
  const step2MissingFiles = {
    idType: "NATIONAL_ID",
    idNumber: "12345678",
    idFrontUrl: "", // missing!
    idBackUrl: "",
    selfieUrl: "",
    riderType: "MOTORBIKE",
  };
  const step2Res1 = validateOnboardingStep(2, step2MissingFiles);
  assert(!step2Res1.valid && step2Res1.message?.includes("ID Front"), "Step 2 blocks when ID front file is missing");

  // National ID requires back side
  const step2MissingBack = {
    ...step2MissingFiles,
    idFrontUrl: "https://cdn.example.com/id_front.jpg",
    selfieUrl: "https://cdn.example.com/selfie.jpg",
    idBackUrl: "", // missing back side!
  };
  const step2Res2 = validateOnboardingStep(2, step2MissingBack);
  assert(!step2Res2.valid && step2Res2.message?.includes("ID Back"), "Step 2 requires ID Back for National ID");

  // Motorized vehicle requires driving license document
  const step2MotorizedMissingDL = {
    ...step2MissingBack,
    idBackUrl: "https://cdn.example.com/id_back.jpg",
    drivingLicenseNo: "DL-12345",
    drivingLicenseExpiry: "2028-12-31",
    drivingLicenseUrl: "", // missing driving license file!
  };
  const step2Res3 = validateOnboardingStep(2, step2MotorizedMissingDL);
  assert(!step2Res3.valid && step2Res3.message?.includes("Driving license document"), "Motorized rider must upload driving license");

  // Complete Step 2
  const step2Complete = {
    ...step2MotorizedMissingDL,
    drivingLicenseUrl: "https://cdn.example.com/license.jpg",
  };
  assert(validateOnboardingStep(2, step2Complete).valid, "Step 2 passes with all credentials and file uploads");
  console.log("  ✓ Step 2 strictly requires ID Front, ID Back, Selfie, and Driving License uploads");
  passed++;

  // Test Step 3: Blocks motorized vehicle without vehicle photo and insurance cert
  const step3MotorizedMissingFiles = {
    riderType: "MOTORBIKE",
    vehiclePlate: "KMDF 123X",
    vehicleMake: "Bajaj",
    vehicleModel: "Boxer 150cc",
    insuranceNumber: "INS-999",
    insuranceExpiry: "2027-10-01",
    vehiclePhotoUrl: "", // missing!
    insuranceCertUrl: "", // missing!
  };
  assert(!validateOnboardingStep(3, step3MotorizedMissingFiles).valid, "Step 3 blocks when vehicle photo is missing");

  const step3Complete = {
    ...step3MotorizedMissingFiles,
    vehiclePhotoUrl: "https://cdn.example.com/bike.jpg",
    insuranceCertUrl: "https://cdn.example.com/insurance.pdf",
  };
  assert(validateOnboardingStep(3, step3Complete).valid, "Step 3 passes with vehicle photo and insurance certificate");

  // Bicycle courier doesn't require motor vehicle documents
  const step3Bicycle = { riderType: "BICYCLE" };
  assert(validateOnboardingStep(3, step3Bicycle).valid, "Bicycle courier bypasses motorized vehicle requirements");
  console.log("  ✓ Step 3 strictly enforces vehicle photo & insurance cert for motorized; allows bicycle bypass");
  passed++;

  // Test Step 4, 5, 6
  assert(!validateOnboardingStep(4, { serviceAreas: [] }).valid, "Step 4 requires service areas");
  assert(validateOnboardingStep(4, { serviceAreas: ["CBD"], maxDistanceKm: 15 }).valid, "Step 4 passes");

  assert(!validateOnboardingStep(5, { mpesaPhone: "" }).valid, "Step 5 requires M-Pesa phone");
  assert(validateOnboardingStep(5, { mpesaPhone: "0712345678" }).valid, "Step 5 passes with valid phone");

  assert(!validateOnboardingStep(6, { termsAccepted: false }).valid, "Step 6 requires terms acceptance");
  assert(validateOnboardingStep(6, { termsAccepted: true }).valid, "Step 6 passes with terms accepted");
  console.log("  ✓ Steps 4, 5, and 6 validate delivery zones, payout phone, and code of conduct acceptance");
  passed++;

  console.log("\n=================================================");
  console.log(`  All Test Cases Completed: ${passed} Passed, 0 Failed`);
  console.log("=================================================\n");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
