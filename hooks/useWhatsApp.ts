/**
 * hooks/useWhatsApp.ts
 *
 * TanStack React Query Hooks for SalesmanPro WhatsApp Control Center.
 * Provides caching, optimistic updates, background polling, and mutation handlers.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { whatsAppClient, WhatsAppOverviewResponse } from "@/lib/api/whatsAppClient";

export const WHATSAPP_QUERY_KEYS = {
  overview: (range: string, companyId?: string) => ["whatsapp", "overview", range, companyId ?? "current"],
  conversations: (status?: string, search?: string, includeMessages?: boolean, companyId?: string) => [
    "whatsapp",
    "conversations",
    status ?? "ALL",
    search ?? "",
    Boolean(includeMessages),
    companyId ?? "current",
  ],
  conversation: (id: string, companyId?: string) => ["whatsapp", "conversation", id, companyId ?? "current"],
  messages: (conversationId: string, companyId?: string) => [
    "whatsapp",
    "messages",
    conversationId,
    companyId ?? "current",
  ],
  settings: (companyId?: string) => ["whatsapp", "settings", companyId ?? "current"],
  templates: (companyId?: string) => ["whatsapp", "templates", companyId ?? "current"],
};

export function useWhatsAppOverview(range = "30d", companyId?: string, initialData?: WhatsAppOverviewResponse) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.overview(range, companyId),
    queryFn: () => whatsAppClient.getOverview(range, companyId),
    initialData,
    staleTime: 15 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useWhatsAppConversations(params: {
  status?: string;
  search?: string;
  includeMessages?: boolean;
  companyId?: string;
  initialData?: any[];
} = {}) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.conversations(
      params.status,
      params.search,
      params.includeMessages,
      params.companyId
    ),
    queryFn: () => whatsAppClient.getConversations(params),
    initialData: params.initialData,
    staleTime: 5 * 1000,
    refetchInterval: 6 * 1000, // Background polling every 6 seconds for new inbound chats
  });
}

export function useWhatsAppConversation(id: string, companyId?: string) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.conversation(id, companyId),
    queryFn: () => whatsAppClient.getConversation(id, companyId),
    enabled: Boolean(id),
    staleTime: 5 * 1000,
    refetchInterval: 5 * 1000,
  });
}

export function useWhatsAppMessages(conversationId: string, companyId?: string) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.messages(conversationId, companyId),
    queryFn: () => whatsAppClient.getMessages(conversationId, companyId),
    enabled: Boolean(conversationId),
    staleTime: 3 * 1000,
    refetchInterval: 4 * 1000, // Poll active conversation messages every 4 seconds
  });
}

export function useWhatsAppSettings(companyId?: string, initialData?: any) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.settings(companyId),
    queryFn: () => whatsAppClient.getSettings(companyId),
    initialData,
    staleTime: 30 * 1000,
  });
}

export function useWhatsAppTemplates(companyId?: string, initialData?: any[]) {
  return useQuery({
    queryKey: WHATSAPP_QUERY_KEYS.templates(companyId),
    queryFn: () => whatsAppClient.getTemplates(companyId),
    initialData,
    staleTime: 60 * 1000,
  });
}

export function useSendWhatsAppMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      conversationId: string;
      text: string;
      toPhoneNumber?: string;
      companyId?: string;
    }) => whatsAppClient.sendMessage(params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "messages", variables.conversationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "conversations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "overview"],
      });
    },
  });
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: string;
      status?: string;
      aiHandled?: boolean;
      companyId?: string;
    }) => whatsAppClient.updateConversationStatus(params.id, params),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "conversation", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "conversations"],
      });
    },
  });
}

export function useToggleAiHandoff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: {
      id: string;
      aiHandled: boolean;
      companyId?: string;
    }) => whatsAppClient.toggleAiHandoff(params.id, params.aiHandled, params.companyId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "conversation", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["whatsapp", "conversations"],
      });
    },
  });
}

export function useSaveWhatsAppSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => whatsAppClient.saveSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "overview"] });
    },
  });
}

export function useCreateWhatsAppTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => whatsAppClient.createTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "templates"] });
    },
  });
}

export function useDispatchWhatsAppBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => whatsAppClient.dispatchBroadcast(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["whatsapp", "overview"] });
    },
  });
}
