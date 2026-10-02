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

    if (!fullName || !phone) {
      return json({ success: false, message: "Full legal name and phone number are required." }, 400);
    }

    const verificationStatus = submitForReview
      ? RiderVerificationStatus.SUBMITTED
      : RiderVerificationStatus.DRAFT;

    // Upsert rider profile
    const profile = await prisma.riderProfile.upsert({
      where: { userId },
      create: {
        userId,
        fullName,
        phone,
        email: email || session.user.email || null,
        riderType,
        isCompany,
        companyName: companyName || null,
        idType,
        idNumber: idNumber || null,
        idFrontUrl: idFrontUrl || null,
        idBackUrl: idBackUrl || null,
        passportUrl: passportUrl || null,
        drivingLicenseNo: drivingLicenseNo || null,
        drivingLicenseUrl: drivingLicenseUrl || null,
        drivingLicenseExpiry: drivingLicenseExpiry ? new Date(drivingLicenseExpiry) : null,
        selfieUrl: selfieUrl || null,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : [],
        operatingCounty: operatingCounty || null,
        operatingCity: operatingCity || null,
        maxDistanceKm: Number(maxDistanceKm) || 20.0,
        payoutMethod,
        mpesaPhone: mpesaPhone || phone,
        bankAccountDetails: bankAccountDetails || null,
        verificationStatus,
      },
      update: {
        fullName,
        phone,
        email: email || undefined,
        riderType,
        isCompany,
        companyName: companyName || null,
        idType: idType || undefined,
        idNumber: idNumber || undefined,
        idFrontUrl: idFrontUrl || undefined,
        idBackUrl: idBackUrl || undefined,
        passportUrl: passportUrl || undefined,
        drivingLicenseNo: drivingLicenseNo || undefined,
        drivingLicenseUrl: drivingLicenseUrl || undefined,
        drivingLicenseExpiry: drivingLicenseExpiry ? new Date(drivingLicenseExpiry) : undefined,
        selfieUrl: selfieUrl || undefined,
        serviceAreas: Array.isArray(serviceAreas) ? serviceAreas : undefined,
        operatingCounty: operatingCounty || undefined,
        operatingCity: operatingCity || undefined,
        maxDistanceKm: maxDistanceKm ? Number(maxDistanceKm) : undefined,
        payoutMethod: payoutMethod || undefined,
        mpesaPhone: mpesaPhone || undefined,
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
