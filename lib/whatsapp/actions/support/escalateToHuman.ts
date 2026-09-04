/**
 * lib/whatsapp/actions/support/escalateToHuman.ts
 *
 * Transfers conversation to a human support agent and pauses automatic AI responses.
 */

import { whatsappRepository } from "../../repository";
import prisma from "@/server/db/prismadb";
import type {
  WhatsAppActionContext,
  WhatsAppActionResult,
  escalateToHumanActionSchema,
} from "../../types";
import { z } from "zod";

type EscalateToHumanArgs = z.infer<typeof escalateToHumanActionSchema>["arguments"];

export async function escalateToHuman(
  args: EscalateToHumanArgs,
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  // Update conversation mode to HUMAN
  await whatsappRepository.escalateConversation(
    context.conversationId,
    args.reason,
  );

  // Create an in-app notification for the company staff
  await prisma.notification.create({
    data: {
      companyId: context.companyId,
      title: "WhatsApp Human Assistance Requested",
      message: `Customer ${context.customerName ?? context.phoneNumber} requested human support: "${args.reason}".`,
      read: false,
    },
  }).catch(() => undefined);

  // Link to AI Workforce Human Escalation queue
  await prisma.aIAgentEscalation.create({
    data: {
      companyId: context.companyId,
      customerPhone: context.phoneNumber,
      customerEmail: context.customerEmail,
      reason: args.reason,
      priority: "HIGH",
      status: "PENDING",
    },
  }).catch(() => undefined);

  return {
    success: true,
    action: "escalate_to_human",
    message: "I've connected you with a member of our team. A representative will assist you shortly. Thank you for your patience! 🙏",
    shouldEscalate: true,
    shouldRespond: true,
    data: {
      escalated: true,
      reason: args.reason,
      conversationId: context.conversationId,
    },
  };
}

export async function createSupportRequest(
  args: { subject: string; description: string; priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" },
  context: WhatsAppActionContext,
): Promise<WhatsAppActionResult> {
  // Create an inquiry or notification for store support
  await prisma.inquiry.create({
    data: {
      clientName: context.customerName ?? context.phoneNumber,
      clientPhone: context.phoneNumber,
      clientEmail: context.customerEmail ?? `wa-${context.waId}@support.local`,
      message: `[${args.priority ?? "MEDIUM"}] ${args.subject}: ${args.description}`,
      companyId: context.companyId,
    },
  }).catch(() => undefined);

  return {
    success: true,
    action: "create_support_request",
    message: `Your support request ("${args.subject}") has been logged with reference to your phone number. Our team will review it and reply soon.`,
    data: { created: true },
  };
}
