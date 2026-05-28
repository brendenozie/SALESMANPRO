// // app/actions/enrollment.ts
// app/actions/enrollment.ts
"use server";

import prisma from "@/server/db/prismadb";
import { revalidatePath } from "next/cache";

import { getCompanyPaymentConfig } from "@/lib/paymentsv2";
import { initiateMpesaPayment } from "@/lib/paymentsv2/mpesa";
import { initiatePaystackPayment } from "@/lib/paymentsv2/paystack";
import { initiateStripePaymentIntent } from "@/lib/paymentsv2/stripe";
import { createPaypalOrder } from "@/lib/paymentsv2/paypal";

interface CheckoutEnrollmentPayload {
  courseId: string;
  studentId: string;
  companyId: string;

  paymentOption:
    | "mpesa"
    | "paystack"
    | "stripe"
    | "paypal"
    | "cod";

  email: string;
  phone: string;
  mpesaPhone?: string;
}

export async function checkoutAndEnrollStudent({
  courseId,
  studentId,
  companyId,
  paymentOption,
  email,
  phone,
  mpesaPhone,
}: CheckoutEnrollmentPayload) {
  try {
    // -----------------------------------
    // VALIDATION
    // -----------------------------------
    if (!courseId || !studentId || !companyId) {
      return {
        success: false,
        error: "Missing required enrollment metadata.",
      };
    }

    // -----------------------------------
    // VERIFY COURSE
    // -----------------------------------
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        companyId,
      },
    });

    if (!course) {
      return {
        success: false,
        error: "Course not found.",
      };
    }

    // -----------------------------------
    // PREVENT DUPLICATE ENROLLMENT
    // -----------------------------------
    const existingEnrollment =
      await prisma.courseEnrollment.findFirst({
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
        error: "Already enrolled in this course.",
      };
    }

    // -----------------------------------
    // CREATE PENDING ENROLLMENT
    // -----------------------------------
    const enrollment =
      await prisma.courseEnrollment.create({
        data: {
          courseId,
          studentId,
          companyId,

          // IMPORTANT:
          // Do not activate before payment succeeds
          status: "PENDING",

          progress: 0,
          lessonsCompleted: 0,
        },
      });

    // -----------------------------------
    // CREATE ORDER RECORD
    // -----------------------------------
    const order = await prisma.customerOrder.create({
      data: {
        companyId,
        consumerId: studentId,

        totalPrice: course.price,
        totalFinalPrice: course.price,

        paymentOption,
        paymentStatus: "PENDING",

        name: "Course Enrollment",
        email,
        phone,
        mpesaPhone,

        notes: `Enrollment for ${course.title}`,

        orderItems: {
          create: [
            {
              productId: course.id,
              quantity: 1,
              price: course.price,
            },
          ],
        },
      },
    });

    // -----------------------------------
    // LOAD PAYMENT CONFIG
    // -----------------------------------
    const cfg =
      await getCompanyPaymentConfig(companyId);

    let paymentResponse: any = null;

    // -----------------------------------
    // INITIATE PAYMENT
    // -----------------------------------
    switch (paymentOption) {
      case "mpesa": {
        const phoneNumber = mpesaPhone || phone;

        paymentResponse =
          await initiateMpesaPayment(
            order,
            phoneNumber,
            cfg.credentials
          );

        break;
      }

      case "paystack":
        paymentResponse =
          await initiatePaystackPayment(
            order,
            email,
            cfg.credentials
          );
        break;

      case "stripe":
        paymentResponse =
          await initiateStripePaymentIntent(
            order,
            cfg.credentials
          );
        break;

      case "paypal":
        paymentResponse =
          await createPaypalOrder(
            order,
            cfg.credentials
          );
        break;

      case "cod":
        paymentResponse = {
          message: "Enrollment reserved.",
        };
        break;

      default:
        return {
          success: false,
          error: "Unsupported payment option.",
        };
    }

    // -----------------------------------
    // OPTIONAL:
    // LINK ORDER TO ENROLLMENT
    // -----------------------------------
    await prisma.courseEnrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        orderId: order.id,
      },
    });

    revalidatePath(`/courses/${courseId}`);

    return {
      success: true,

      enrollmentId: enrollment.id,
      orderId: order.id,

      paymentResponse,

      authorizationUrl:
        paymentResponse?.data?.authorization_url ??
        paymentResponse?.authorization_url ??
        null,
    };
  } catch (error: any) {
    console.error(
      "Enrollment checkout error:",
      error
    );

    return {
      success: false,
      error:
        error?.message ||
        "Unexpected enrollment checkout error.",
    };
  }
}
// "use server";

// import prisma from "@/server/db/prismadb"; // Adjust path to your Prisma client instance
// import { revalidatePath } from "next/cache";

// interface CheckoutEnrollmentPayload {
//   courseId: string;
//   studentId: string;
//   companyId: string;
// }

// export async function checkoutAndEnrollStudent({
//   courseId,
//   studentId,
//   companyId,
// }: CheckoutEnrollmentPayload) {
//   try {
//     if (!courseId || !studentId || !companyId) {
//       return { success: false, error: "Missing required enrollment metadata." };
//     }

//     // 1. Verify the course exists and belongs to the active tenant/company
//     const course = await prisma.course.findFirst({
//       where: {
//         id: courseId,
//         companyId: companyId,
//       },
//     });

//     if (!course) {
//       return {
//         success: false,
//         error: "Course not found or is currently unavailable.",
//       };
//     }

//     // 2. Optional: Check if student has an active current enrollment
//     // to prevent double payments before completion/dropping
//     const existingEnrollment = await prisma.courseEnrollment.findFirst({
//       where: {
//         courseId,
//         studentId,
//         companyId,
//         status: "ENROLLED",
//       },
//     });

//     if (existingEnrollment) {
//       return {
//         success: false,
//         error: "You are already actively enrolled in this course.",
//       };
//     }

//     // 3. Create the enrollment record
//     const newEnrollment = await prisma.courseEnrollment.create({
//       data: {
//         courseId,
//         studentId,
//         companyId,
//         status: "ENROLLED",
//         progress: 0,
//         lessonsCompleted: 0,
//       },
//     });

//     // 4. Revalidate paths to update structural progress counters
//     revalidatePath(`/[slug]/products/${courseId}`, "page");

//     return {
//       success: true,
//       enrollmentId: newEnrollment.id,
//     };
//   } catch (error: any) {
//     console.error("Enrollment checkout error:", error);
//     return {
//       success: false,
//       error: "An unexpected payment process error occurred.",
//     };
//   }
// }
