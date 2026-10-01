import React from "react";
import { assertAgentRouteAccess } from "@/lib/auth/agentGuard";
import prisma from "@/server/db/prismadb";
import {
  ChatBubbleLeftRightIcon,
  PhoneIcon,
  ClockIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function AgentMessagesPage({ params }: Props) {
  const { slug } = await params;
  const context = await assertAgentRouteAccess(slug, "messages");

  const companyId = context.company.id;

  const conversations = await prisma.whatsAppConversation.findMany({
    where: { companyId },
    take: 20,
    orderBy: { updatedAt: "desc" },
    include: {
      contact: {
        select: {
          name: true,
          phoneNumber: true,
        },
      },
      messages: {
        take: 1,
        orderBy: { timestamp: "desc" },
        select: {
          content: true,
          timestamp: true,
          senderType: true,
        },
      },
    },
  }).catch(() => []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Customer Communications</h1>
        <p className="text-sm text-slate-500">
          Two-way operational messaging, order inquiries, and updates for <strong>{context.company.name}</strong>.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        {conversations.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold">No active customer conversations.</p>
            <p className="text-xs text-slate-500">Incoming inquiries from WhatsApp and Web chat will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {conversations.map((c) => {
              const latestMsg = c.messages[0];
              return (
                <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {(c.contact?.name || "C").charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {c.contact?.name || c.contact?.phoneNumber || "Customer"}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {latestMsg?.content || "Conversation opened"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 text-xs text-slate-400">
                    {latestMsg?.timestamp ? new Date(latestMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
