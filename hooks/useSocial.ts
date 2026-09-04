/**
 * hooks/useSocial.ts
 *
 * TanStack React Query Hooks for SalesmanPro Social Media AI Platform.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialClient } from "@/lib/api/socialClient";
import { AI_QUERY_KEYS } from "./useAI";

export const SOCIAL_QUERY_KEYS = {
  accounts: () => ["social", "accounts"],
  posts: (filters?: any) => ["social", "posts", filters],
  post: (id: string) => ["social", "post", id],
  campaigns: () => ["social", "campaigns"],
  brandProfile: () => ["social", "brandProfile"],
  analytics: () => ["social", "analytics"],
  products: () => ["social", "products"],
  adminConfigs: () => ["social", "superAdminConfigs"],
};

export function useSocialAccounts() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.accounts(),
    queryFn: () => socialClient.getAccounts(),
    staleTime: 30 * 1000,
  });
}

export function useSocialPosts(filters?: any) {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.posts(filters),
    queryFn: () => socialClient.getPosts(filters),
    staleTime: 15 * 1000,
  });
}

export function useSocialCampaigns() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.campaigns(),
    queryFn: () => socialClient.getCampaigns(),
    staleTime: 30 * 1000,
  });
}

export function useSocialBrandProfile() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.brandProfile(),
    queryFn: () => socialClient.getBrandProfile(),
    staleTime: 60 * 1000,
  });
}

export function useSocialAnalytics() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.analytics(),
    queryFn: () => socialClient.getAnalytics(),
    staleTime: 60 * 1000,
  });
}

export function useGenerateSocialContent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => socialClient.generateContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.posts() });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
    },
  });
}

export function usePublishPostNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (postId: string) => socialClient.publishNow(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.posts() });
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.analytics() });
    },
  });
}

export function useScheduleSocialPost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ postId, scheduledAt }: { postId: string; scheduledAt: Date | string }) =>
      socialClient.schedulePost(postId, scheduledAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.posts() });
    },
  });
}

export function useRetryPublication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (publicationId: string) => socialClient.retryPublication(publicationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.posts() });
    },
  });
}

export function useCreateSocialCampaign() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => socialClient.createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.campaigns() });
      queryClient.invalidateQueries({ queryKey: SOCIAL_QUERY_KEYS.posts() });
      queryClient.invalidateQueries({ queryKey: AI_QUERY_KEYS.credits() });
    },
  });
}

export function useSuperAdminSocialConfigs() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.adminConfigs(),
    queryFn: () => socialClient.getSuperAdminConfigs(),
    staleTime: 60 * 1000,
  });
}

export function useSocialProducts() {
  return useQuery({
    queryKey: SOCIAL_QUERY_KEYS.products(),
    queryFn: () => socialClient.getProducts(),
    staleTime: 60 * 1000,
  });
}

