// // app/actions/enrollment.ts
// app/actions/enrollment.ts
"use server";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkoutAndEnrollStudent = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("next/cache");
const paymentsv2_1 = require("@/lib/paymentsv2");
const mpesa_1 = require("@/lib/paymentsv2/mpesa");
const paystack_1 = require("@/lib/paymentsv2/paystack");
const stripe_1 = require("@/lib/paymentsv2/stripe");
const paypal_1 = require("@/lib/paymentsv2/paypal");
async function checkoutAndEnrollStudent({ courseId, studentId, companyId, paymentOption, email, phone, mpesaPhone, }) {
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
        const course = await prismadb_1.default.course.findFirst({
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
        const existingEnrollment = await prismadb_1.default.courseEnrollment.findFirst({
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
        const enrollment = await prismadb_1.default.courseEnrollment.create({
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
        const order = await prismadb_1.default.customerOrder.create({
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
                items: {
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
        const cfg = await (0, paymentsv2_1.getCompanyPaymentConfig)(companyId);
        let paymentResponse = null;
        // -----------------------------------
        // INITIATE PAYMENT
        // -----------------------------------
        switch (paymentOption) {
            case "mpesa": {
                const phoneNumber = mpesaPhone || phone;
                paymentResponse =
                    await (0, mpesa_1.initiateMpesaPayment)(order, phoneNumber, cfg.credentials);
                break;
            }
            case "paystack":
                paymentResponse =
                    await (0, paystack_1.initiatePaystackPayment)(order, email, cfg.credentials, "");
                break;
            case "stripe":
                paymentResponse =
                    await (0, stripe_1.initiateStripePaymentIntent)(order, cfg.credentials);
                break;
            case "paypal":
                paymentResponse =
                    await (0, paypal_1.createPaypalOrder)(order, cfg.credentials);
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
        await prismadb_1.default.courseEnrollment.update({
            where: {
                id: enrollment.id,
            },
            data: {
                orderId: order.id,
            },
        });
        (0, cache_1.revalidatePath)(`/courses/${courseId}`);
        return {
            success: true,
            enrollmentId: enrollment.id,
            orderId: order.id,
            paymentResponse,
            authorizationUrl: paymentResponse?.data?.authorization_url ??
                paymentResponse?.authorization_url ??
                null,
        };
    }
    catch (error) {
        console.error("Enrollment checkout error:", error);
        return {
            success: false,
            error: error?.message ||
                "Unexpected enrollment checkout error.",
        };
    }
}
exports.checkoutAndEnrollStudent = checkoutAndEnrollStudent;
