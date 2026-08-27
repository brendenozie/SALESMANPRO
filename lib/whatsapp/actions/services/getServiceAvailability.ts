/**
 * lib/whatsapp/actions/services/getServiceAvailability.ts
 */

import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  getServiceAvailabilityActionSchema,
} from "../../types";
import { z } from "zod";

type GetServiceAvailabilityArgs = z.infer<typeof getServiceAvailabilityActionSchema>["arguments"];

export async function getServiceAvailability(
  args: GetServiceAvailabilityArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const targetDate = args.date ? new Date(args.date) : new Date();

  // Find existing appointments on the target date to compute available slots
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAppointments = await prisma.appointment.findMany({
    where: {
      companyId: context.companyId,
      date: {
        gte: startOfDay,
        lte: endOfDay,
      },
      status: { not: "CANCELED" },
    },
    select: { date: true },
  });

  const bookedHours = existingAppointments.map((a) => a.date.getHours());
  const standardHours = [9, 10, 11, 14, 15, 16, 17];
  const availableSlots = standardHours
    .filter((h) => !bookedHours.includes(h))
    .map((h) => `${h.toString().padStart(2, "0")}:00`);

  const dateString = targetDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return {
    success: true,
    action: "get_service_availability",
    message: `🕒 *Available Times for ${dateString}:*\n\n${availableSlots.map((s) => `• ${s}`).join("\n")}\n\nReply with your preferred time slot to book!`,
    data: {
      date: targetDate.toISOString().split("T")[0],
      availableSlots,
    },
  };
}

export async function bookService(
  args: { serviceId?: string; listingId?: string; date: string; timeSlot: string; notes?: string },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  // Parse date and timeSlot
  const [hour, minute] = args.timeSlot.split(":").map(Number);
  const appointmentDate = new Date(args.date);
  appointmentDate.setHours(hour ?? 9, minute ?? 0, 0, 0);

  // Resolve user profile or create appointment
  let contact = await prisma.whatsAppContact.findFirst({
    where: { companyId: context.companyId, phoneNumber: context.phoneNumber },
  });

  let userId = contact?.userId;
  if (!userId) {
    const existingUser = await prisma.user.findFirst({
      where: { phone: context.phoneNumber },
      select: { id: true },
    });
    userId = existingUser?.id;
  }

  // If no user exists, create consumer profile user
  if (!userId) {
    const newUser = await prisma.user.create({
      data: {
        name: context.customerName ?? "WhatsApp Customer",
        phone: context.phoneNumber,
        email: `wa-${context.waId}@consumer.local`,
        role: "CONSUMER",
      },
    });
    userId = newUser.id;
  }

  const appointment = await prisma.appointment.create({
    data: {
      userId,
      companyId: context.companyId,
      whatsappConversationId: context.conversationId,
      service: args.notes ?? "Service Appointment",
      date: appointmentDate,
      status: "PENDING",
    },
  });

  const formattedDate = appointmentDate.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    success: true,
    action: "create_service_booking",
    message: `🗓️ *Appointment Requested!*\n\n• Date & Time: *${formattedDate}*\n• Service: ${args.notes ?? "Standard Service"}\n• Booking Ref: \`${appointment.id}\`\n\nWe have reserved your slot. Reply *CONFIRM* to finalize!`,
    data: { appointment },
  };
}

export async function confirmServiceBooking(
  args: { appointmentId: string; confirmation: true },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: args.appointmentId, companyId: context.companyId },
  });

  if (!appointment) {
    return {
      success: false,
      action: "confirm_service_booking",
      message: "I couldn't find that booking to confirm.",
    };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CONFIRMED" },
  });

  return {
    success: true,
    action: "confirm_service_booking",
    message: `✅ *Appointment Confirmed!*\n\nBooking ID: \`${appointment.id}\`\nWe look forward to serving you!`,
    data: { confirmed: true, appointmentId: appointment.id },
  };
}

export async function cancelServiceBooking(
  args: { appointmentId: string; reason: string },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  const appointment = await prisma.appointment.findFirst({
    where: { id: args.appointmentId, companyId: context.companyId },
  });

  if (!appointment) {
    return {
      success: false,
      action: "cancel_service_booking",
      message: "I couldn't find that appointment to cancel.",
    };
  }

  await prisma.appointment.update({
    where: { id: appointment.id },
    data: { status: "CANCELED" },
  });

  return {
    success: true,
    action: "cancel_service_booking",
    message: `Appointment #${appointment.id} has been cancelled as requested.`,
    data: { cancelled: true },
  };
}
