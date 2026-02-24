import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { verifyBackupSecret } from "@/lib/verifyBackupSecret";
import { encrypt } from "@/lib/crypto";

export const runtime = "nodejs"; // IMPORTANT (must not be edge)

export const GET = withApiHandler(async (req) => {
  verifyBackupSecret(req);
  
  const encoder = new TextEncoder();

  const models = Object.keys(
    (prisma as any)._runtimeDataModel.models
  );

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("{\n"));

      for (let i = 0; i < models.length; i++) {
        const modelName = models[i];
        const prismaKey = modelName.charAt(0).toLowerCase() + modelName.slice(1);

        const modelClient = (prisma as any)[prismaKey];

        if (!modelClient) continue;

        controller.enqueue(
          encoder.encode(`"${modelName}": [\n`)
        );

        const batchSize = 1000;
        let skip = 0;
        let batch: any[];

        try {
          do {
            batch = await modelClient.findMany({
              skip,
              take: batchSize,
            });

            for (let j = 0; j < batch.length; j++) {
              const json = JSON.stringify(batch[j]);
              
              // const encrypted = encrypt(json);
              // controller.enqueue(encoder.encode(encrypted));

              controller.enqueue(
                encoder.encode(json)
              );

              if (
                j !== batch.length - 1 ||
                batch.length === batchSize
              ) {
                controller.enqueue(
                  encoder.encode(",\n")
                );
              }
            }

            skip += batchSize;
          } while (batch.length === batchSize);
        } catch (error: any) {
          controller.enqueue(
            encoder.encode(
              `{"__error":"${error.message}"}`
            )
          );
        }

        controller.enqueue(encoder.encode("\n]"));

        if (i !== models.length - 1) {
          controller.enqueue(encoder.encode(",\n"));
        }
      }

      controller.enqueue(encoder.encode("\n}"));
      controller.close();
    },
  });

  

  return new Response(stream, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename=backup-${Date.now()}.json`,
    },
  });
});
// import { NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// export const GET = withApiHandler(async (request) => {
//   // List of models to backup. 
//   // You can also get these dynamically using (prisma as any)._runtimeDataModel.models
//   const models = [
//     "Account",
//     "Session",
//     "VerificationToken",
//     "Notification",
//     "CompanyCategory",
//     "ProductCategory",
//     "StoreCategory",
//     "Company",
//     "CoreValues",
//     "SocialLink",
//     "Policy",
//     "Banner",
//     "Promotion",
//     "AnalyticsConfig",
//     "PaymentSettings",
//     "ShippingSettings",
//     "PageSection",
//     "Locations",
//     "AppPromo",
//     "Product",
//     "Payment",
//     "Appointment",
//     "PropertyType",
//     "Blog",
//     "SeoBlog",
//     "SEO",
//     "Comment",
//     "Task",
//     "Client",
//     "Conversation",
//     "ConversationParticipant",
//     "Message",
//     "SalesAgent",
//     "Transaction",
//     "Role",
//     "UserRole",
//     "User",
//     "Device",
//     "Return",
//     "Address",
//     "ProductAssignment",
//     "InventoryItem",
//     "InventoryLog",
//     "AgentInventory",
//     "CommissionRate",
//     "Commission",
//     "CommissionLog",
//     "Target",
//     "AuditLog",
//     "marketplaceListings",
//     "ProductReview",
//     "ProductReviewLog",
//     "ProductReviewResponse",
//     "ProductReviewLike",
//     "ProductReviewDislike",
//     "ClientInventory",
//     "ClientInventoryLog",
//     "AgentInventoryLog",
//     "SalesSummary",
//     "EventLog",
//     "Request",
//     "Consumer",
//     "ConsumerInventory",
//     "ConsumerInventoryLog",
//     "CustomerOrder",
//     "OrderItem",
//     "Location",
//     "CompanyLocation",
//     "Banners",
//     "Collection",
//     "CollectionItem",
//     "Review",
//     "Question",
//     "RecentlyViewed",
//     "Wishlist",
//     "WishlistItem",
//     "HeadTeacher",
//     "Parent",
//     "Student",
//     "StudentAcademicLevel",
//     "Educator",
//     "AcademicLevel",
//     "Classroom",
//     "EducatorAcademicLevelAssignment",
//     "Course",
//     "CourseEducatorAssignment",
//     "CourseAcademicLevel",
//     "CourseEnrollment",
//     "CourseAssignment",
//     "CourseAssignmentQuestion",
//     "AssignmentSubmission",
//     "AssignmentQuestionResponse",
//     "Announcement",
//     "Event",
//     "EventRegistration",
//     "ClassSchedule",
//     "AttendanceRecord",
//     "ExamCategory",
//     "Exam",
//     "ExamQuestion",
//     "ExamSubmission",
//     "ExamAnswer",
//     "CourseMaterial",
//     "DiscussionTopic",
//     "DiscussionPost",
//     "DiscussionComment",
//     "Department",
//     "Grade",
//     "UserActivity",
//     "ProductMetrics",
//     "Project",
//     "ProjectMember",
//     "Campaign",
//     "Donation",
//     "Property",
//     "PropertyCategory",
//     "Doctor",
//     "Writer",
//     "Podcast",
//     "Tag",
//     "FeeItem",
//     "StudentFeeRecord",
//     "Donor",
//     "Inquiry",
//     "Showing",
//     "OfferContract",
//     "StaffProfile",
//     "PayrollRecord",
//     "Service",
//     "Prescription",
//     "Plan",
//     "Subscription",
//     "SubscriptionCompany",
//     "SubscriptionPayment",
//     "Patient",
//     "Diagnosis",
//     "PatientInvoices",
//     "BillingTransaction",
//     "VideoAlbum",
//     "Video",
//     "Content",
//     "PhotoAlbum",
//     "Photo",
//     "Sponsor",
//     "Case",
//     "Document",
//     "FinanceAppointment",
//     "Invoice",
//     "Expert",
//     "Package",
//     "Testimonial",
//     "FAQ",
//     "Settings",
//     "Destination",
//     "TourPackage",
//     "PromotionDiscount",
//     "Booking",
//     "Communication",
//     "CompanySettings",
//     "Delivery",
//     "Idempotency",
//     "LibraryCategory",
//     "LibraryBook",
//     "LibraryMember",
//     "LibraryIssuance",
//     "LibraryFine",
//     "LibraryReservation",
//     "LibrarySupplierCategory",
//     "LibrarySupplier",
//     "LibraryAcquisition",
//     "TransportVehicle",
//     "TransportRoute",
//     "TransportMaintenance",
//     "TransportFuelLog",
//     "TransportAssignment",
//     "TransportShift",
//     "TransportDriver",
//     "HostelBlock",
//     "HostelRoom",
//     "HostelMember",
//     "HostelAllocation",
//     "HostelMaintenanceRequest",
//     "HostelVisitor",
//     "HostelStaff",
//     "StaffLeave",
//     "StaffPayroll",
//     "LeavePolicy",
//     "LeaveRequest",
//     "LeaveFreeze",
//     "SalaryHistory",
//     "StaffPerformanceReview",
//     "StaffAttendanceRecord",
//     "StaffAttendanceAuditLog",
//     "candidate",
//     "FeeStructure",
//     "FeeStructureItem",
//     "Asset",
//     "AssetTracking",
//     "InventoryAudit",
//     "Lead",
//     "LeadConversation",
//     "Deal",
//     "Expense",
//   ];

//   const backupData: Record<string, any[]> = {};

//   try {
//     for (const model of models) {
//       // @ts-ignore - dynamic access to prisma models
//       backupData[model] = await prisma[model].findMany();
//     }

//     return new NextResponse(JSON.stringify(backupData, null, 2), {
//       status: 200,
//       headers: {
//         "Content-Type": "application/json",
//         "Content-Disposition": `attachment; filename=backup-${new Date().toISOString()}.json`,
//       },
//     });
//   } catch (error: any) {
//     return formatResponse(false, null, `Backup failed: ${error.message}`, 500);
//   }
// });