/**
 * components/social/SocialDashboardClient.tsx
 *
 * SalesmanPro Social Media Marketing Command Center.
 * Comprehensive, production-ready interface for multi-platform AI social marketing,
 * connected accounts, content strategy wizard, interactive mockups, and execution.
 */

"use client";

import React, { useState } from "react";
import {
  ShareIcon,
  SparklesIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  PlusCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ArrowTopRightOnSquareIcon,
  KeyIcon,
  AdjustmentsHorizontalIcon,
  LightBulbIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  XMarkIcon,
  ArrowUturnLeftIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import {
  useSocialAccounts,
  useSocialPosts,
  useSocialCampaigns,
  useSocialBrandProfile,
  useSocialAnalytics,
  useGenerateSocialContent,
  usePublishPostNow,
  useScheduleSocialPost,
  useRetryPublication,
} from "@/hooks/useSocial";
import { useAICredits } from "@/hooks/useAI";
import { SocialPlatform, SocialContentType, ContentPillar, CONTENT_PILLARS } from "@/lib/social/types";
import { socialClient } from "@/lib/api/socialClient";

interface Props {
  companyId: string;
  slug: string;
  initialProduct?: {
    productId?: string;
    name?: string;
    category?: string;
    description?: string;
    price?: string;
    imageUrl?: string;
  };
}

type TabType =
  | "overview"
  | "create"
  | "posts"
  | "calendar"
  | "campaigns"
  | "accounts"
  | "analytics"
  | "advisor"
  | "brand";

export default function SocialDashboardClient({ companyId, slug, initialProduct }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>(initialProduct?.productId ? "create" : "overview");

  // Queries
  const { data: accounts = [], refetch: refetchAccounts, isLoading: accountsLoading } = useSocialAccounts();
  const { data: postsData, refetch: refetchPosts, isLoading: postsLoading } = useSocialPosts();
  const { data: campaigns = [], refetch: refetchCampaigns } = useSocialCampaigns();
  const { data: analytics, refetch: refetchAnalytics } = useSocialAnalytics();
  const { data: brandProfile, refetch: refetchBrand } = useSocialBrandProfile();
  const { data: creditsData } = useAICredits();

  // Mutations
  const generateMutation = useGenerateSocialContent();
  const publishMutation = usePublishPostNow();
  const scheduleMutation = useScheduleSocialPost();
  const retryMutation = useRetryPublication();

  // Wizard Creation State
  const [targetPlatforms, setTargetPlatforms] = useState<SocialPlatform[]>(["FACEBOOK", "INSTAGRAM"]);
  const [contentType, setContentType] = useState<SocialContentType>("TEXT");
  const [selectedPillar, setSelectedPillar] = useState<ContentPillar>("PRODUCT_SHOWCASE");
  const [topicOrGoal, setTopicOrGoal] = useState(
    initialProduct?.name
      ? `Promote ${initialProduct.name} - ${initialProduct.description || ""}`
      : ""
  );
  const [productId, setProductId] = useState<string | undefined>(initialProduct?.productId);
  const [customInstructions, setCustomInstructions] = useState("");
  const [includeMediaGen, setIncludeMediaGen] = useState(false);
  const [scheduleTime, setScheduleTime] = useState("");

  // Generated Result & Preview State
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [previewPlatform, setPreviewPlatform] = useState<SocialPlatform>("INSTAGRAM");
  const [editableCopy, setEditableCopy] = useState("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Brand Voice Form State
  const [brandVoice, setBrandVoice] = useState("");
  const [brandTone, setBrandTone] = useState("");
  const [bannedWordsInput, setBannedWordsInput] = useState("");
  const [approvalMode, setApprovalMode] = useState<"MANUAL" | "AUTOMATIC">("MANUAL");

  // Advisor State
  const [advisorQuestion, setAdvisorQuestion] = useState("");
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResponse, setAdvisorResponse] = useState<any>(null);

  const posts = postsData?.posts || [];

  // Handle Generating Content
  const handleGenerate = async () => {
    if (targetPlatforms.length === 0) {
      alert("Please select at least one social platform.");
      return;
    }

    try {
      const result = await generateMutation.mutateAsync({
        productId,
        contentType,
        targetPlatforms,
        contentPillars: [selectedPillar],
        topicOrGoal,
        customInstructions,
        includeMediaGeneration: includeMediaGen,
        mediaType: includeMediaGen ? "IMAGE" : "NONE",
        scheduledAt: scheduleTime ? new Date(scheduleTime) : undefined,
      });

      setGeneratedResult(result);
      setEditableCopy(result.primaryCopy);
      setPreviewPlatform(targetPlatforms[0] || "FACEBOOK");
      setActionSuccessMsg("AI content created successfully!");
    } catch (err: any) {
      alert(err.message || "Generation failed");
    }
  };

  // Handle Publish Now
  const handlePublishNow = async (postId: string) => {
    try {
      const res = await publishMutation.mutateAsync(postId);
      if (res.success) {
        setActionSuccessMsg("Content published successfully!");
      } else {
        alert("Publishing encountered errors on some platforms. Check post details.");
      }
      refetchPosts();
    } catch (err: any) {
      alert(err.message || "Failed to publish post");
    }
  };

  // Handle Asking Advisor
  const handleAskAdvisor = async () => {
    setAdvisorLoading(true);
    try {
      const advice = await socialClient.askAdvisor(advisorQuestion);
      setAdvisorResponse(advice);
    } catch (err: any) {
      alert(err.message || "Advisor error");
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Handle Save Brand Profile
  const handleSaveBrandProfile = async () => {
    try {
      await socialClient.updateBrandProfile({
        brandVoice,
        tone: brandTone,
        bannedWords: bannedWordsInput.split(",").map((w) => w.trim()).filter(Boolean),
        approvalMode,
      });
      refetchBrand();
      setActionSuccessMsg("Brand profile updated successfully!");
    } catch (err: any) {
      alert(err.message || "Failed to update brand profile");
    }
  };

  // Connect platform handler
  const handleConnectPlatform = (platform: SocialPlatform) => {
    window.location.href = `/api/social/connect/${platform.toLowerCase()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 pb-16">
      {/* Header Banner */}
      <div className="bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
                  <ShareIcon className="w-6 h-6" />
                </span>
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    Social Media AI & Marketing Command Center
                    <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 rounded-full">
                      Store Edition
                    </span>
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Create, schedule, and publish platform-adapted content to Facebook, Instagram, TikTok & YouTube.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Pills */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <SparklesIcon className="w-4 h-4 text-emerald-500" />
                <span>AI Credits: {creditsData?.balance?.toLocaleString() ?? "..."}</span>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <span>{accounts.length} Accounts Connected</span>
              </div>

              <button
                onClick={() => {
                  setGeneratedResult(null);
                  setActiveTab("create");
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <PlusCircleIcon className="w-4 h-4" />
                Create Post
              </button>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center gap-1 mt-4 overflow-x-auto border-t border-slate-100 dark:border-zinc-800 pt-2 text-xs font-semibold">
            {[
              { id: "overview", label: "Overview", icon: ChartBarIcon },
              { id: "create", label: "AI Content Wizard", icon: SparklesIcon },
              { id: "posts", label: "Posts & Queue", icon: DocumentTextIcon },
              { id: "calendar", label: "Content Calendar", icon: CalendarDaysIcon },
              { id: "campaigns", label: "Campaigns", icon: PaperAirplaneIcon },
              { id: "accounts", label: "Social Accounts", icon: KeyIcon },
              { id: "analytics", label: "Analytics", icon: ChartBarIcon },
              { id: "advisor", label: "AI Marketing Advisor", icon: LightBulbIcon },
              { id: "brand", label: "Brand Voice", icon: AdjustmentsHorizontalIcon },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccessMsg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-lg flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircleIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {actionSuccessMsg}
            </div>
            <button onClick={() => setActionSuccessMsg(null)}>
              <XMarkIcon className="w-4 h-4 text-emerald-600" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Posts Created</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                  {analytics?.totalPosts ?? posts.length}
                </p>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircleIcon className="w-3.5 h-3.5" />
                  {analytics?.publishedCount ?? 0} Published
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Scheduled in Queue</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                  {analytics?.scheduledCount ?? posts.filter((p: any) => p.status === "SCHEDULED").length}
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <ClockIcon className="w-3.5 h-3.5" />
                  Auto-publishing active
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Audience Reach</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {(analytics?.totalImpressions ?? 0).toLocaleString()}
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <EyeIcon className="w-3.5 h-3.5" />
                  Impressions & views
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
                <p className="text-xs text-slate-500 dark:text-zinc-400">Total Engagements</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {((analytics?.totalLikes ?? 0) + (analytics?.totalComments ?? 0) + (analytics?.totalShares ?? 0)).toLocaleString()}
                </p>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                  <HeartIcon className="w-3.5 h-3.5" />
                  Likes, comments & shares
                </div>
              </div>
            </div>

            {/* Connected Platforms Strip */}
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShareIcon className="w-4 h-4 text-blue-600" />
                  Connected Social Channels
                </h2>
                <button
                  onClick={() => setActiveTab("accounts")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  Manage Connections →
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"] as SocialPlatform[]).map((plat) => {
                  const connected = accounts.filter((a) => a.platform === plat);
                  const isConnected = connected.length > 0;

                  return (
                    <div
                      key={plat}
                      className={`p-4 rounded-xl border transition-all ${
                        isConnected
                          ? "bg-slate-50 dark:bg-zinc-800/40 border-slate-300 dark:border-zinc-700"
                          : "bg-white dark:bg-zinc-900 border-dashed border-slate-300 dark:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">{plat}</span>
                        {isConnected ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded-full flex items-center gap-1">
                            <CheckCircleIcon className="w-3 h-3" /> Connected
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 rounded-full">
                            Disconnected
                          </span>
                        )}
                      </div>

                      {isConnected ? (
                        <div className="mt-3">
                          <p className="text-xs font-semibold truncate text-slate-900 dark:text-white">
                            {connected[0].accountName}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">
                            ID: {connected[0].platformAccountId}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <button
                            onClick={() => handleConnectPlatform(plat)}
                            className="w-full py-1.5 px-3 text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg transition-colors"
                          >
                            Connect {plat}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Scheduled & Published Activity */}
            <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-indigo-600" />
                  Recent Social Posts
                </h2>
                <button
                  onClick={() => setActiveTab("posts")}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  View All Posts ({posts.length}) →
                </button>
              </div>

              {posts.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-zinc-400">
                  No social posts created yet. Launch the AI Content Wizard to generate your first campaign!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400">
                        <th className="py-2.5 px-3">Content</th>
                        <th className="py-2.5 px-3">Platforms</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Schedule</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                      {posts.slice(0, 5).map((post: any) => (
                        <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 px-3 max-w-xs">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {post.title || post.content.slice(0, 50)}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{post.content}</p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1 flex-wrap">
                              {post.targetPlatforms.map((p: string) => (
                                <span
                                  key={p}
                                  className="px-1.5 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-zinc-800 rounded"
                                >
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                post.status === "PUBLISHED"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                                  : post.status === "SCHEDULED"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                                  : post.status === "FAILED"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                  : "bg-slate-100 text-slate-700 dark:bg-zinc-800 dark:text-zinc-300"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-slate-500">
                            {post.scheduledAt
                              ? new Date(post.scheduledAt).toLocaleString()
                              : "Immediate / Draft"}
                          </td>
                          <td className="py-3 px-3 text-right">
                            {post.status !== "PUBLISHED" && (
                              <button
                                onClick={() => handlePublishNow(post.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                              >
                                Publish Now
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AI CONTENT CREATION WIZARD */}
        {/* ========================================================================= */}
        {activeTab === "create" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Wizard Inputs */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <SparklesIcon className="w-4 h-4 text-blue-600" />
                  Step 1: Choose Target Platforms
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"] as SocialPlatform[]).map((plat) => {
                    const isSelected = targetPlatforms.includes(plat);
                    return (
                      <button
                        key={plat}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTargetPlatforms(targetPlatforms.filter((p) => p !== plat));
                          } else {
                            setTargetPlatforms([...targetPlatforms, plat]);
                          }
                        }}
                        className={`p-3 text-xs font-bold rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-400"
                            : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                        }`}
                      >
                        <span>{plat}</span>
                        {isSelected && <CheckIcon className="w-4 h-4 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Content Pillar & Type */}
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-600" />
                  Step 2: Content Pillar & Format
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Select Content Pillar
                  </label>
                  <select
                    value={selectedPillar}
                    onChange={(e) => setSelectedPillar(e.target.value as ContentPillar)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    {CONTENT_PILLARS.map((pil) => (
                      <option key={pil.id} value={pil.id}>
                        {pil.label} — {pil.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "TEXT", label: "Text Post", icon: DocumentTextIcon },
                    { id: "IMAGE", label: "Image Post", icon: PhotoIcon },
                    { id: "VIDEO", label: "Reel / Video", icon: VideoCameraIcon },
                  ].map((ct) => {
                    const Icon = ct.icon;
                    const isSelected = contentType === ct.id;
                    return (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setContentType(ct.id as SocialContentType)}
                        className={`p-3 text-xs font-bold rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? "bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-400"
                            : "bg-slate-50 dark:bg-zinc-800/40 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {ct.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Product / Objective Context */}
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <DocumentTextIcon className="w-4 h-4 text-emerald-600" />
                  Step 3: What do you want to promote?
                </h2>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Campaign Topic or Product Goal
                  </label>
                  <textarea
                    rows={3}
                    value={topicOrGoal}
                    onChange={(e) => setTopicOrGoal(e.target.value)}
                    placeholder="e.g. Introduce our new waterproof hiking boots with an educational angle on mountain safety..."
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="mediaGenToggle"
                    checked={includeMediaGen}
                    onChange={(e) => setIncludeMediaGen(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="mediaGenToggle" className="text-xs font-medium text-slate-700 dark:text-zinc-300">
                    Automatically generate accompanying AI promotional graphic
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    Schedule Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generateMutation.isPending}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <SparklesIcon className="w-4 h-4" />
                  {generateMutation.isPending ? "Generating Tailored Content..." : "Generate Platform-Adapted Posts"}
                </button>
              </div>
            </div>

            {/* Right Column: Platform Mockup Preview & Approval */}
            <div className="lg:col-span-6 space-y-5">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 sticky top-24">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <EyeIcon className="w-4 h-4 text-purple-600" />
                    Interactive Platform Mockup Preview
                  </h2>

                  {/* Platform Switcher */}
                  <div className="flex gap-1 bg-slate-100 dark:bg-zinc-800 p-1 rounded-lg">
                    {targetPlatforms.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPreviewPlatform(p)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          previewPlatform === p
                            ? "bg-white dark:bg-zinc-900 text-blue-600 shadow-xs"
                            : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {!generatedResult ? (
                  <div className="h-96 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <SparklesIcon className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs font-semibold">No Content Generated Yet</p>
                    <p className="text-[11px] mt-1 max-w-xs">
                      Fill out the details on the left and click Generate to preview live platform adaptations.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Platform-Specific Preview Render */}
                    {previewPlatform === "FACEBOOK" && (
                      <div className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4 shadow-sm text-xs space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                            F
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">Store Facebook Page</p>
                            <p className="text-[10px] text-slate-400">Just now • 🌐</p>
                          </div>
                        </div>

                        <p className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                          {generatedResult.adaptations?.FACEBOOK?.caption || editableCopy}
                        </p>

                        {generatedResult.generatedMedia?.[0]?.url && (
                          <div className="rounded-lg overflow-hidden border border-slate-100 dark:border-zinc-800">
                            <img
                              src={generatedResult.generatedMedia[0].url}
                              alt="Ad Media"
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-around text-slate-500 font-semibold text-[11px]">
                          <span className="flex items-center gap-1"><HeartIcon className="w-4 h-4" /> Like</span>
                          <span className="flex items-center gap-1"><ChatBubbleLeftIcon className="w-4 h-4" /> Comment</span>
                          <span className="flex items-center gap-1"><ShareIcon className="w-4 h-4" /> Share</span>
                        </div>
                      </div>
                    )}

                    {previewPlatform === "INSTAGRAM" && (
                      <div className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 shadow-sm text-xs overflow-hidden">
                        <div className="p-3 flex items-center gap-2.5 border-b border-slate-100 dark:border-zinc-800/80">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-0.5">
                            <div className="w-full h-full bg-white dark:bg-zinc-900 rounded-full flex items-center justify-center font-bold text-[10px]">
                              IG
                            </div>
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">store_official</p>
                            <p className="text-[10px] text-slate-400">Sponsored</p>
                          </div>
                        </div>

                        {generatedResult.generatedMedia?.[0]?.url ? (
                          <img
                            src={generatedResult.generatedMedia[0].url}
                            alt="Instagram Post"
                            className="w-full aspect-square object-cover"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-400">
                            [Photo Media Canvas 1:1]
                          </div>
                        )}

                        <div className="p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-slate-700 dark:text-zinc-200">
                              <HeartIcon className="w-5 h-5 cursor-pointer" />
                              <ChatBubbleLeftIcon className="w-5 h-5 cursor-pointer" />
                              <PaperAirplaneIcon className="w-5 h-5 cursor-pointer" />
                            </div>
                          </div>

                          <p className="text-xs text-slate-800 dark:text-zinc-200 whitespace-pre-line leading-relaxed">
                            <span className="font-bold mr-1">store_official</span>
                            {generatedResult.adaptations?.INSTAGRAM?.caption || editableCopy}
                          </p>

                          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {(generatedResult.adaptations?.INSTAGRAM?.hashtags || generatedResult.hashtags || []).join(" ")}
                          </div>
                        </div>
                      </div>
                    )}

                    {previewPlatform === "TIKTOK" && (
                      <div className="border border-slate-200 dark:border-zinc-800 rounded-2xl bg-zinc-900 text-white p-4 shadow-md text-xs relative aspect-[9/16] max-w-[280px] mx-auto flex flex-col justify-between overflow-hidden">
                        <div className="flex justify-between items-center text-[10px] text-white/80">
                          <span>Following | For You</span>
                          <span>🔍</span>
                        </div>

                        <div className="flex justify-end pr-2 space-y-3 flex-col items-center ml-auto">
                          <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center font-bold text-[10px]">
                            🎵
                          </div>
                          <div className="text-center">
                            <HeartIcon className="w-6 h-6 text-white" />
                            <span className="text-[9px]">4.2K</span>
                          </div>
                          <div className="text-center">
                            <ChatBubbleLeftIcon className="w-6 h-6 text-white" />
                            <span className="text-[9px]">128</span>
                          </div>
                        </div>

                        <div className="space-y-1.5 z-10">
                          <p className="font-bold text-[11px]">@store.tiktok</p>
                          <p className="text-[10px] text-white/90 line-clamp-3">
                            {generatedResult.adaptations?.TIKTOK?.caption || editableCopy}
                          </p>
                          <p className="text-[9px] text-amber-300">
                            {(generatedResult.adaptations?.TIKTOK?.hashtags || []).join(" ")}
                          </p>
                        </div>
                      </div>
                    )}

                    {previewPlatform === "YOUTUBE" && (
                      <div className="border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-950 p-4 shadow-sm text-xs space-y-3">
                        <div className="aspect-video bg-zinc-900 rounded-lg flex items-center justify-center text-white text-xs font-semibold relative overflow-hidden">
                          {generatedResult.generatedMedia?.[0]?.url ? (
                            <img
                              src={generatedResult.generatedMedia[0].url}
                              alt="Thumbnail"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>▶ Video Player (16:9)</span>
                          )}
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                          {generatedResult.adaptations?.YOUTUBE?.title || "Video Title"}
                        </h3>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>Store Channel • 1.2K views • Just now</span>
                          <button className="px-3 py-1 bg-red-600 text-white font-bold rounded-full text-[10px]">
                            Subscribe
                          </button>
                        </div>

                        <div className="p-2.5 bg-slate-50 dark:bg-zinc-900 rounded-lg text-slate-700 dark:text-zinc-300 text-[11px] whitespace-pre-line">
                          {generatedResult.adaptations?.YOUTUBE?.caption || editableCopy}
                        </div>
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center gap-3">
                      <button
                        onClick={() => handlePublishNow(generatedResult.post.id)}
                        disabled={publishMutation.isPending}
                        className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                      >
                        <PaperAirplaneIcon className="w-4 h-4" />
                        {publishMutation.isPending ? "Publishing..." : "Approve & Publish Now"}
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("posts");
                          refetchPosts();
                        }}
                        className="py-2.5 px-4 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold text-xs rounded-xl transition-colors"
                      >
                        Save as Draft
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: POSTS & PUBLISHING QUEUE */}
        {/* ========================================================================= */}
        {activeTab === "posts" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                All Social Posts & Queue
              </h2>
              <button
                onClick={() => refetchPosts()}
                className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-lg border border-slate-200 dark:border-zinc-800"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>

            {posts.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No social posts created yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500">
                      <th className="py-2.5 px-3">Title & Content</th>
                      <th className="py-2.5 px-3">Destinations</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Scheduled / Published</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {posts.map((post: any) => (
                      <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                        <td className="py-3 px-3 max-w-sm">
                          <p className="font-bold text-slate-900 dark:text-white truncate">
                            {post.title || post.content.slice(0, 60)}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{post.content}</p>
                        </td>
                        <td className="py-3 px-3">
                          <div className="space-y-1">
                            {post.publications?.map((pub: any) => (
                              <div key={pub.id} className="flex items-center gap-1 text-[10px]">
                                <span className="font-bold uppercase text-slate-700 dark:text-zinc-300">
                                  {pub.platform}:
                                </span>
                                <span
                                  className={`px-1 rounded text-[9px] font-bold ${
                                    pub.status === "PUBLISHED"
                                      ? "bg-emerald-100 text-emerald-700"
                                      : pub.status === "FAILED"
                                      ? "bg-rose-100 text-rose-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {pub.status}
                                </span>
                                {pub.status === "FAILED" && (
                                  <button
                                    onClick={async () => {
                                      await retryMutation.mutateAsync(pub.id);
                                      refetchPosts();
                                    }}
                                    className="text-blue-600 hover:underline text-[9px] font-bold"
                                  >
                                    Retry
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              post.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-700"
                                : post.status === "SCHEDULED"
                                ? "bg-amber-100 text-amber-700"
                                : post.status === "FAILED"
                                ? "bg-rose-100 text-rose-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {post.publishedAt
                            ? new Date(post.publishedAt).toLocaleString()
                            : post.scheduledAt
                            ? `Scheduled: ${new Date(post.scheduledAt).toLocaleString()}`
                            : "Draft"}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {post.status !== "PUBLISHED" && (
                              <button
                                onClick={() => handlePublishNow(post.id)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm"
                              >
                                Publish
                              </button>
                            )}
                            <button
                              onClick={async () => {
                                if (confirm("Delete this social post?")) {
                                  await socialClient.deletePost(post.id);
                                  refetchPosts();
                                }
                              }}
                              className="p-1 text-slate-400 hover:text-rose-600"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CONTENT CALENDAR */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4 text-amber-600" />
                Content Schedule Calendar
              </h2>
            </div>

            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold border-b border-slate-100 dark:border-zinc-800 pb-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                <div key={d} className="text-slate-500">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 min-h-[360px]">
              {Array.from({ length: 28 }).map((_, idx) => {
                const dayNum = idx + 1;
                const dayPosts = posts.filter((p: any) => {
                  if (!p.scheduledAt && !p.publishedAt) return false;
                  const date = new Date(p.scheduledAt || p.publishedAt);
                  return date.getDate() === dayNum;
                });

                return (
                  <div
                    key={idx}
                    className="p-2 rounded-lg border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-left flex flex-col justify-between min-h-[80px]"
                  >
                    <span className="text-[10px] font-bold text-slate-400">{dayNum}</span>
                    <div className="space-y-1 mt-1">
                      {dayPosts.map((dp: any) => (
                        <div
                          key={dp.id}
                          className="px-1.5 py-0.5 rounded text-[9px] font-bold truncate bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300"
                        >
                          {dp.title || dp.content.slice(0, 15)}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SOCIAL CAMPAIGNS */}
        {/* ========================================================================= */}
        {activeTab === "campaigns" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PaperAirplaneIcon className="w-4 h-4 text-purple-600" />
              Active Campaigns ({campaigns.length})
            </h2>

            {campaigns.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-500">
                No active multi-post campaigns. Use the wizard to generate a 7-day social campaign!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp: any) => (
                  <div key={camp.id} className="p-4 border rounded-xl border-slate-200 dark:border-zinc-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">{camp.name}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Objective: {camp.objective}</p>
                    <div className="flex gap-1">
                      {camp.platforms.map((p: string) => (
                        <span key={p} className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONNECTED ACCOUNTS */}
        {/* ========================================================================= */}
        {activeTab === "accounts" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyIcon className="w-4 h-4 text-blue-600" />
                Social Account Connections
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Connect your business pages and creator channels via official OAuth flows.
                Access tokens are hardware-encrypted server-side and never exposed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"] as SocialPlatform[]).map((plat) => {
                const platAccounts = accounts.filter((a) => a.platform === plat);
                const isConnected = platAccounts.length > 0;

                return (
                  <div
                    key={plat}
                    className="p-4 border rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs uppercase">{plat}</span>
                        {isConnected && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                            Active
                          </span>
                        )}
                      </div>

                      {!isConnected ? (
                        <button
                          onClick={() => handleConnectPlatform(plat)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                        >
                          Connect {plat}
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            if (confirm(`Disconnect ${plat} account?`)) {
                              await socialClient.disconnectAccount(platAccounts[0].id);
                              refetchAccounts();
                            }
                          }}
                          className="px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded font-semibold"
                        >
                          Disconnect
                        </button>
                      )}
                    </div>

                    {isConnected && (
                      <div className="text-xs text-slate-600 dark:text-zinc-400 space-y-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Account: {platAccounts[0].accountName}
                        </p>
                        <p className="text-[11px]">ID: {platAccounts[0].platformAccountId}</p>
                        <p className="text-[11px] text-slate-400">
                          Last Synchronized: {platAccounts[0].lastSyncAt ? new Date(platAccounts[0].lastSyncAt).toLocaleString() : "Recently"}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: ANALYTICS */}
        {/* ========================================================================= */}
        {activeTab === "analytics" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ChartBarIcon className="w-4 h-4 text-emerald-600" />
              Cross-Platform Social Analytics
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                <p className="text-xs text-slate-500">Impressions</p>
                <p className="text-xl font-bold mt-1">{analytics?.totalImpressions?.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                <p className="text-xs text-slate-500">Likes</p>
                <p className="text-xl font-bold mt-1 text-rose-600">{analytics?.totalLikes?.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                <p className="text-xs text-slate-500">Comments</p>
                <p className="text-xl font-bold mt-1 text-blue-600">{analytics?.totalComments?.toLocaleString() ?? 0}</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-zinc-800/40 rounded-xl">
                <p className="text-xs text-slate-500">Shares</p>
                <p className="text-xl font-bold mt-1 text-purple-600">{analytics?.totalShares?.toLocaleString() ?? 0}</p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: AI MARKETING ADVISOR */}
        {/* ========================================================================= */}
        {activeTab === "advisor" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4 text-amber-500" />
                AI Marketing Advisor
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Ask strategy questions or receive concrete marketing actions based on real catalog data and analytics.
              </p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={advisorQuestion}
                onChange={(e) => setAdvisorQuestion(e.target.value)}
                placeholder="e.g. Which products haven't been promoted recently, and what should I post next?"
                className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
              <button
                onClick={handleAskAdvisor}
                disabled={advisorLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-lg shadow-sm disabled:opacity-50"
              >
                {advisorLoading ? "Thinking..." : "Ask Advisor"}
              </button>
            </div>

            {advisorResponse && (
              <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-4 text-xs">
                <p className="text-slate-800 dark:text-zinc-200 leading-relaxed font-medium">
                  {advisorResponse.answer}
                </p>

                {advisorResponse.suggestedProductsToPromote?.length > 0 && (
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white mb-2">
                      Suggested Catalog Products to Spotlight:
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {advisorResponse.suggestedProductsToPromote.map((prod: any) => (
                        <div key={prod.id} className="p-2.5 bg-white dark:bg-zinc-900 rounded-lg border border-amber-100 dark:border-zinc-800">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{prod.name}</p>
                          <p className="text-[10px] text-slate-400">{prod.category || "General"}</p>
                          <p className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1">{prod.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 9: BRAND VOICE */}
        {/* ========================================================================= */}
        {activeTab === "brand" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4 max-w-2xl">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-4 h-4 text-indigo-600" />
              Store Brand Profile & Voice Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Brand Voice (e.g. Friendly, formal, educational, bold)
              </label>
              <input
                type="text"
                value={brandVoice}
                onChange={(e) => setBrandVoice(e.target.value)}
                placeholder="Authoritative yet accessible, premium craftsmanship"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Tone
              </label>
              <input
                type="text"
                value={brandTone}
                onChange={(e) => setBrandTone(e.target.value)}
                placeholder="Inspiring, energetic, helpful"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Banned / Prohibited Words (comma-separated)
              </label>
              <input
                type="text"
                value={bannedWordsInput}
                onChange={(e) => setBannedWordsInput(e.target.value)}
                placeholder="cheap, guarantee, 100% free"
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                Publishing Approval Mode
              </label>
              <select
                value={approvalMode}
                onChange={(e) => setApprovalMode(e.target.value as any)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                <option value="MANUAL">Manual Approval (Review before publishing)</option>
                <option value="AUTOMATIC">Automatic Mode (AI schedules & publishes directly)</option>
              </select>
            </div>

            <button
              onClick={handleSaveBrandProfile}
              className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
            >
              Save Brand Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
