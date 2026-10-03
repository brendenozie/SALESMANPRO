import { NextRequest, NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { RiderVerificationStatus } from "@prisma/client";

function json(data: any, status = 200) {
  return NextResponse.json(data, { status });
}

// GET /api/rider/onboarding: Fetch current user's rider application status
export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized. Please sign in." }, 401);
    }

    const riderProfile = await prisma.riderProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        vehicles: true,
      },
    });

    return json({
      success: true,
      profile: riderProfile,
      hasApplied: !!riderProfile,
      status: riderProfile?.verificationStatus ?? "NONE",
    });
  } catch (error: any) {
    console.error("[RIDER_ONBOARDING_GET_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to load onboarding status" }, 500);
  }
}

// POST /api/rider/onboarding: Submit or update rider onboarding application
export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.id) {
      return json({ success: false, message: "Unauthorized. Please sign in to apply." }, 401);
    }

    const userId = session.user.id;
    const body = await req.json();

    const {
      fullName,
      phone,
      email,
      emergencyContactName,
      emergencyContactPhone,
      riderType = "MOTORBIKE",
      isCompany = false,
      companyName,
      idType = "NATIONAL_ID",
      idNumber,
      idFrontUrl,
      idBackUrl,
      passportUrl,
      drivingLicenseNo,
      drivingLicenseUrl,
      drivingLicenseExpiry,
      selfieUrl,
      serviceAreas = [],
      operatingCounty,
      operatingCity,
      maxDistanceKm = 20,
      payoutMethod = "MPESA",
      mpesaPhone,
      bankAccountDetails,
      vehicles = [],
      submitForReview = true,
    } = body;

    // Server-side validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length < 3) {
      return json({ success: false, message: "Full legal name is required (at least 3 characters)." }, 400);
    }
    if (!phone || typeof phone !== "string" || phone.trim().length < 9) {
      return json({ success: false, message: "A valid phone number is required." }, 400);
    }

    const isMotorized = ["MOTORBIKE", "CAR", "VAN", "TRUCK"].includes(riderType);

    // If submitting for formal verification, ensure all required documents and details are complete
    if (submitForReview) {
      if (!operatingCounty || !operatingCity) {
        return json({ success: false, message: "Operating county and city/town are required." }, 400);
      }
      if (!idNumber || typeof idNumber !== "string" || idNumber.trim().length < 4) {
        return json({ success: false, message: "Government ID / document number is required." }, 400);
      }
      if (!idFrontUrl) {
        return json({ success: false, message: "Please upload the front photo of your National ID or Passport." }, 400);
      }
      if ((idType === "NATIONAL_ID" || idType === "ALIEN_ID") && !idBackUrl) {
        return json({ success: false, message: "Please upload the back photo of your National ID." }, 400);
      }
      if (!selfieUrl) {
        return json({ success: false, message: "Please upload a clear selfie or passport-style photo." }, 400);
      }
      if (isMotorized) {
        if (!drivingLicenseNo || !drivingLicenseUrl) {
          return json({ success: false, message: "Driving license number and document upload are required for motorized transport." }, 400);
        }
        const v = Array.isArray(vehicles) && vehicles.length > 0 ? vehicles[0] : null;
        if (!v || !v.plateNumber || !v.make || !v.model) {
          return json({ success: false, message: "Vehicle registration plate, make, and model are required." }, 400);
        }
        if (!v.vehiclePhoto) {
          return json({ success: false, message: "Please upload a clear photo of your delivery vehicle." }, 400);
        }
        if (!v.insuranceNumber || !v.insuranceCertUrl) {
          return json({ success: false, message: "Vehicle insurance policy number and certificate document are required." }, 400);
        }
      }
      if (!Array.isArray(serviceAreas) || serviceAreas.length === 0) {
        return json({ success: false, message: "Please select at least one preferred service area." }, 400);
      }
      if (!mpesaPhone || typeof mpesaPhone !== "string" || mpesaPhone.trim().length < 9) {
        return json({ success: false, message: "A valid M-Pesa phone number is required for earnings payouts." }, 400);
      }
    }

    const verificationStatus = submitForReview
      ? RiderVerificationStatus.SUBMITTED
      : RiderVerificationStatus.DRAFT;

    // Upsert rider profile
    const profile = await prisma.riderProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email || session.user.email || null,
        emergencyContactName: emergencyContactName || null,
        emergencyContactPhone: emergencyContactPhone || null,
        riderType,
        isCompany,
        companyName: companyName || null,
        idType,
        idNumber: idNumber ? idNumber.trim() : null,
        idFrontUrl: idFrontUrl || null,
        idBackUrl: idBackUrl || null,
        passportUrl: passportUrl || null,
        drivingLicenseNo: drivingLicenseNo ? drivingLicenseNo.trim() : null,
        drivingLicenseUrl: drivingLicenseUrl || null,
        drivingLicenseExpiry: drivingLicenseExpiry ? new Date(drivingLicenseExpiry) : null,
        selfieUrl: selfieUrl || null,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        operatingCounty: operatingCounty || null,
        operatingCity: operatingCity || null,
        maxDistanceKm: Number(maxDistanceKm) || 20.0,
        payoutMethod,
        mpesaPhone: mpesaPhone ? mpesaPhone.trim() : phone.trim(),
        bankAccountDetails: bankAccountDetails || null,
        verificationStatus,
      },
      update: {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email || undefined,
        emergencyContactName: emergencyContactName || undefined,
        emergencyContactPhone: emergencyContactPhone || undefined,
        riderType,
        isCompany,
        companyName: companyName || null,
        idType: idType || undefined,
        idNumber: idNumber ? idNumber.trim() : undefined,
        idFrontUrl: idFrontUrl || undefined,
        idBackUrl: idBackUrl || undefined,
        passportUrl: passportUrl || undefined,
        drivingLicenseNo: drivingLicenseNo ? drivingLicenseNo.trim() : undefined,
        drivingLicenseUrl: drivingLicenseUrl || undefined,
        drivingLicenseExpiry: drivingLicenseExpiry ? new Date(drivingLicenseExpiry) : undefined,
        selfieUrl: selfieUrl || undefined,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : undefined,
        operatingCounty: operatingCounty || undefined,
        operatingCity: operatingCity || undefined,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        payoutMethod: payoutMethod || undefined,
        mpesaPhone: mpesaPhone ? mpesaPhone.trim() : undefined,
        bankAccountDetails: bankAccountDetails || undefined,
        verificationStatus,
      },
    });

    // Update vehicle records if provided
    if (Array.isArray(vehicles) && vehicles.length > 0) {
      for (const v of vehicles) {
        if (v.id) {
          await prisma.riderVehicle.update({
            where: { id: v.id },
            data: {
              vehicleType: v.vehicleType || "MOTORBIKE",
              make: v.make || null,
              model: v.model || null,
              plateNumber: v.plateNumber || null,
              color: v.color || null,
              vehiclePhoto: v.vehiclePhoto || null,
              insuranceNumber: v.insuranceNumber || null,
              insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry) : null,
              insuranceCertUrl: v.insuranceCertUrl || null,
              logbookUrl: v.logbookUrl || null,
            },
          });
        } else {
          await prisma.riderVehicle.create({
            data: {
              riderProfileId: profile.id,
              vehicleType: v.vehicleType || "MOTORBIKE",
              make: v.make || null,
              model: v.model || null,
              plateNumber: v.plateNumber || null,
              color: v.color || null,
              vehiclePhoto: v.vehiclePhoto || null,
              insuranceNumber: v.insuranceNumber || null,
              insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry) : null,
              insuranceCertUrl: v.insuranceCertUrl || null,
              logbookUrl: v.logbookUrl || null,
            },
          });
        }
      }
    }

    // Ensure user role includes RIDER if not already an ADMIN
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (currentUser && currentUser.role !== "ADMIN" && currentUser.role !== "SUPER_ADMIN") {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "RIDER" },
      });
    }

    return json({
      success: true,
      message: submitForReview
        ? "Application submitted successfully! Our compliance team will review your credentials."
        : "Application draft saved.",
      profile,
    });
  } catch (error: any) {
    console.error("[RIDER_ONBOARDING_POST_ERROR]", error);
    return json({ success: false, message: error.message || "Failed to submit onboarding application" }, 500);
  }
}
