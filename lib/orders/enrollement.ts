// app/actions/enrollment.ts
"use server";

import prisma from "@/server/db/prismadb"; // Adjust path to your Prisma client instance
import { revalidatePath } from "next/cache";

interface CheckoutEnrollmentPayload {
  courseId: string;
  studentId: string;
  companyId: string;
}

export async function checkoutAndEnrollStudent({
  courseId,
  studentId,
  companyId,
}: CheckoutEnrollmentPayload) {
  try {
    if (!courseId || !studentId || !companyId) {
      return { success: false, error: "Missing required enrollment metadata." };
    }

    // 1. Verify the course exists and belongs to the active tenant/company
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        companyId: companyId,
        // status: "PUBLISHED", // Ensure they cannot purchase draft courses
      },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found or is currently unavailable.",
      };
    }

    // 2. Optional: Check if student has an active current enrollment
    // to prevent double payments before completion/dropping
    const existingEnrollment = await prisma.courseEnrollment.findFirst({
      where: {
        courseId,
        studentId,
        companyId,
        status: "ENROLLED",
      },
    });

    if (existingEnrollment) {
      return {
        success: false,
        error: "You are already actively enrolled in this course.",
      };
    }

    // 3. Create the enrollment record
    const newEnrollment = await prisma.courseEnrollment.create({
      data: {
        courseId,
        studentId,
        companyId,
        status: "ENROLLED",
        progress: 0,
        lessonsCompleted: 0,
      },
    });

    // 4. Revalidate paths to update structural progress counters
    revalidatePath(`/[slug]/products/${courseId}`, "page");

    return {
      success: true,
      enrollmentId: newEnrollment.id,
    };
  } catch (error: any) {
    console.error("Enrollment checkout error:", error);
    return {
      success: false,
      error: "An unexpected payment process error occurred.",
    };
  }
}
