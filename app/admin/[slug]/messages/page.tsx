import React from "react";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import MessagesPageClient, {
  ConversationData,
  UserData,
} from "./MessagesPageClient";
import { findCompanyCached } from "@/lib/company-fetcher";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: Fetches messages and users directly at request-time.
 * Strictly avoids stale state and provides resilient initial data.
 */
export default async function MessagesManagerPage({ params }: Props) {
  const { slug } = await params;
  const session = await getAuthSession();
  const currentUserId = session?.user?.id || "";

  // 1. Resolve Company context
  const identifier = slug || session?.user?.id || "";
  const company = await findCompanyCached(identifier, "page");

  if (!company) {
    return <div className="p-8 text-center text-gray-500">Company not found</div>;
  }

  const companyId = company.id;

  let initialConversations: ConversationData[] = [];
  let allUsers: UserData[] = [];

  try {
    // 2. Fetch conversations and contacts directly from DB for fast, reliable SSR
    const [participantEntries, storeUsers, storeConsumers] = await Promise.all([
      prisma.conversationParticipant.findMany({
        where: {
          isDeleted: false,
          isArchived: false,
          conversation: { companyId },
        },
        orderBy: { conversation: { lastMessageAt: "desc" } },
        select: {
          isArchived: true,
          isDeleted: true,
          unreadCount: true,
          conversation: {
            select: {
              id: true,
              title: true,
              companyId: true,
              createdAt: true,
              updatedAt: true,
              lastMessageAt: true,
              participants: {
                select: {
                  userId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      phone: true,
                    },
                  },
                },
              },
              messages: {
                take: 1,
                orderBy: { createdAt: "desc" },
                select: {
                  id: true,
                  content: true,
                  createdAt: true,
                  sender: { select: { name: true } },
                },
              },
            },
          },
        },
      }),
      prisma.user.findMany({
        where: { companyId },
        select: { id: true, name: true, email: true, phone: true },
        take: 100,
      }),
      prisma.consumer.findMany({
        where: { companyId },
        select: {
          id: true,
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
        take: 100,
      }),
    ]);

    // 3. Deduplicate conversations by conversation.id
    const seenIds = new Set<string>();
    for (const entry of participantEntries) {
      const conv = entry.conversation;
      if (!conv || seenIds.has(conv.id)) continue;
      seenIds.add(conv.id);

      const lastMsg = conv.messages?.[0] ?? null;
      initialConversations.push({
        id: conv.id,
        title: conv.title,
        companyId: conv.companyId,
        createdAt: conv.createdAt ? conv.createdAt.toISOString() : new Date().toISOString(),
        updatedAt: conv.updatedAt ? conv.updatedAt.toISOString() : new Date().toISOString(),
        lastMessageAt: conv.lastMessageAt ? conv.lastMessageAt.toISOString() : null,
        isArchived: entry.isArchived,
        isDeleted: entry.isDeleted,
        unreadCount: entry.unreadCount,
        participants: conv.participants.map((p) => ({
          id: p.user?.id ?? p.userId,
          name: p.user?.name ?? "Unknown User",
          email: p.user?.email ?? "N/A",
          phone: p.user?.phone ?? null,
        })),
        lastMessage: lastMsg
          ? {
              id: lastMsg.id,
              content: lastMsg.content,
              createdAt: lastMsg.createdAt ? lastMsg.createdAt.toISOString() : new Date().toISOString(),
              senderName: lastMsg.sender?.name ?? "Unknown",
            }
          : null,
      });
    }

    // 4. Merge available users/contacts for compose recipient list
    const userMap = new Map<string, UserData>();
    for (const u of storeUsers) {
      if (u.id) {
        userMap.set(u.id, {
          id: u.id,
          name: u.name || "User",
          email: u.email || "",
          phone: u.phone || null,
        });
      }
    }
    for (const c of storeConsumers) {
      if (c.user?.id && !userMap.has(c.user.id)) {
        userMap.set(c.user.id, {
          id: c.user.id,
          name: c.user.name || "Consumer",
          email: c.user.email || "",
          phone: c.user.phone || null,
        });
      }
    }
    allUsers = Array.from(userMap.values());
  } catch (err: any) {
    console.error("[MessagesManagerPage] SSR load error:", err.message);
  }

  // 5. Render Client Component
  return (
    <MessagesPageClient
      initialConversations={initialConversations}
      allUsers={allUsers}
      currentUserId={currentUserId}
      companyId={companyId}
      companyName={company.name || "Store"}
    />
  );
}