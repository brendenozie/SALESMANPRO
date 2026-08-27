/**
 * lib/whatsapp/queue/worker.ts
 *
 * BullMQ Worker processing inbound WhatsApp events asynchronously.
 * Executes AI reasoning, structured actions, and sends Meta WhatsApp replies.
 */

import { Worker, Job } from "bullmq";
import { redisConnection } from "@/lib/redis";
import prisma from "@/server/db/prismadb";
import { WHATSAPP_QUEUE_NAME, WhatsAppJobData } from "./queue";
import { whatsappAI } from "../ai/whatsappAI";
import { actionRouter } from "../actionRouter";
import { MetaWhatsAppClient } from "../metaClient";
import { whatsappRepository } from "../repository";
import { decrypt } from "@/lib/crypto";
import type { WhatsAppActionContext } from "../types";

export function createWhatsAppWorker() {
  const worker = new Worker<WhatsAppJobData>(
    WHATSAPP_QUEUE_NAME,
    async (job: Job<WhatsAppJobData>) => {
      const {
        accountId,
        companyId,
        contactId,
        conversationId,
        messageId,
        correlationId,
      } = job.data;

      console.log("[WHATSAPP_WORKER_JOB_START]", {
        jobId: job.id,
        conversationId,
        messageId,
        correlationId,
      });

      // 1. Fetch full context records
      const [account, contact, conversation, message] = await Promise.all([
        prisma.whatsAppAccount.findUnique({ where: { id: accountId } }),
        prisma.whatsAppContact.findUnique({ where: { id: contactId } }),
        prisma.whatsAppConversation.findUnique({ where: { id: conversationId } }),
        prisma.whatsAppMessage.findUnique({ where: { id: messageId } }),
      ]);

      if (!account || !contact || !conversation || !message) {
        throw new Error(
          `Missing job dependency data: account=${Boolean(account)}, contact=${Boolean(contact)}, conversation=${Boolean(conversation)}, message=${Boolean(message)}`,
        );
      }

      // 2. Skip processing if assigned to human agent
      if (conversation.mode === "HUMAN" || conversation.humanHandoff) {
        console.info("[WHATSAPP_WORKER_SKIPPED_HUMAN_MODE]", {
          conversationId,
          correlationId,
        });
        return;
      }

      // 3. Mark message as processed
      await prisma.whatsAppMessage.update({
        where: { id: message.id },
        data: { processedByAI: true },
      });

      // 4. Decrypt account access token
      let accessToken = process.env.WHATSAPP_ACCESS_TOKEN ?? "";
      if (account.accessTokenEncrypted && account.accessTokenIv && account.accessTokenTag) {
        accessToken = decrypt({
          value: account.accessTokenEncrypted,
          iv: account.accessTokenIv,
          tag: account.accessTokenTag,
        });
      }

      // 5. Run AI Engine inference
      const aiResult = await whatsappAI.processInboundMessage({
        account,
        contact,
        conversation,
        message,
      });

      let finalReplyText = aiResult.reply;

      const actionContext: WhatsAppActionContext = {
        companyId: account.companyId,
        accountId: account.id,
        conversationId: conversation.id,
        contactId: contact.id,
        waId: contact.waId,
        phoneNumber: contact.phoneNumber,
        customerName: contact.name ?? contact.profileName,
        customerEmail: contact.email,
        consumerId: contact.userId,
        messageId: message.id,
        correlationId,
      };

      // 6. Execute structured domain action if generated
      if (aiResult.action) {
        const actionResult = await actionRouter({
          action: aiResult.action,
          context: actionContext,
        });

        if (actionResult.message) {
          finalReplyText = actionResult.message;
        }

        if (actionResult.shouldEscalate) {
          aiResult.requiresHuman = true;
        }
      }

      // 7. Handle human escalation flag
      if (aiResult.requiresHuman) {
        await whatsappRepository.escalateConversation(
          conversation.id,
          aiResult.intent ?? "Customer assistance requested",
        );
      }

      // 8. Dispatch reply to customer via Meta Client
      if (accessToken && account.phoneNumberId && contact.phoneNumber) {
        const client = new MetaWhatsAppClient({
          accessToken,
          phoneNumberId: account.phoneNumberId,
        });

        const sendResponse = await client.sendTextMessage({
          to: contact.phoneNumber,
          body: finalReplyText,
        });

        // 9. Persist outbound message in database
        await whatsappRepository.persistOutboundMessage({
          companyId: account.companyId,
          accountId: account.id,
          contactId: contact.id,
          conversationId: conversation.id,
          providerMessageId: sendResponse?.messages?.[0]?.id ?? `ai_${Date.now()}`,
          body: finalReplyText,
          status: "SENT",
          senderType: "AI",
          aiModel: aiResult.model,
        });
      }

      console.log("[WHATSAPP_WORKER_JOB_COMPLETED]", {
        jobId: job.id,
        conversationId,
        correlationId,
      });
    },
    {
      connection: redisConnection,
      concurrency: 5,
      limiter: {
        max: 50,
        duration: 1000,
      },
    },
  );

  worker.on("failed", (job, err) => {
    console.error("[WHATSAPP_WORKER_JOB_FAILED]", {
      jobId: job?.id,
      error: err.message,
    });
  });

  worker.on("error", (err) => {
    console.error("[WHATSAPP_WORKER_ERROR]", err);
  });

  return worker;
}
