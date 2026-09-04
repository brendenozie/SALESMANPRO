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
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  ListBulletIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  TagIcon,
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
  useCreateSocialCampaign,
  useSocialProducts,
} from "@/hooks/useSocial";
import { useAICredits } from "@/hooks/useAI";
import {
  SocialPlatform,
  SocialContentType,
  ContentPillar,
  CONTENT_PILLARS,
  CampaignPlanningMode,
  ContentMixConfig,
} from "@/lib/social/types";
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

  // Store Products for Catalog-Aware Campaigns & Posts
  const { data: storeProducts = [] } = useSocialProducts();

  // Multi-Day Campaign Planner State
  const createCampaignMutation = useCreateSocialCampaign();
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [campName, setCampName] = useState("");
  const [campObjective, setCampObjective] = useState("INCREASE SALES & AWARENESS");
  const [campPlanningMode, setCampPlanningMode] = useState<CampaignPlanningMode>("ONE_WEEK");
  const [campStartDate, setCampStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [campEndDate, setCampEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0]);
  const [campPlatforms, setCampPlatforms] = useState<SocialPlatform[]>(["FACEBOOK", "INSTAGRAM"]);
  const [campPillars, setCampPillars] = useState<ContentPillar[]>(["PRODUCT_SHOWCASE", "EDUCATIONAL", "PROMOTIONAL", "SOCIAL_PROOF"]);
  const [campFrequency, setCampFrequency] = useState<"DAILY" | "TWICE_DAILY" | "TWICE_WEEKLY" | "WEEKLY">("DAILY");
  const [campTone, setCampTone] = useState("Engaging, authoritative and persuasive");
  const [campOffer, setCampOffer] = useState("");
  const [campCta, setCampCta] = useState("Shop Now");
  const [campSelectedProducts, setCampSelectedProducts] = useState<string[]>([]);
  const [campPreferredTimes, setCampPreferredTimes] = useState<string[]>(["10:00", "18:00"]);
  const [campIncludeMediaGen, setCampIncludeMediaGen] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [campContentMix, setCampContentMix] = useState<ContentMixConfig>({
    promotional: 40,
    educational: 20,
    engagement: 15,
    brand: 15,
    offers: 10,
  });

  // Calendar View State
  const [calendarView, setCalendarView] = useState<"month" | "week" | "list">("month");
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedPostForEdit, setSelectedPostForEdit] = useState<any>(null);
  const [isPostEditModalOpen, setIsPostEditModalOpen] = useState(false);
  const [postEditCopy, setPostEditCopy] = useState("");
  const [postEditScheduledAt, setPostEditScheduledAt] = useState("");
  const [isSavingPostEdit, setIsSavingPostEdit] = useState(false);

  const posts = postsData?.posts || [];

  // Helper: Handle Planning Mode Switch
  const handlePlanningModeChange = (mode: CampaignPlanningMode) => {
    setCampPlanningMode(mode);
    const start = new Date(campStartDate);
    let days = 7;
    if (mode === "SINGLE_DAY") days = 1;
    else if (mode === "ONE_WEEK") days = 7;
    else if (mode === "TWO_WEEKS") days = 14;
    else if (mode === "ONE_MONTH") days = 30;
    if (mode !== "CUSTOM_RANGE") {
      const end = new Date(start.getTime() + days * 86400000);
      setCampEndDate(end.toISOString().split("T")[0]);
    }
  };

  // Helper: Estimated credit cost calculation
  const getDaysBetween = (d1: string, d2: string) => {
    const start = new Date(d1).getTime();
    const end = new Date(d2).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  };

  const estimatedDays = campPlanningMode === "SINGLE_DAY" ? 1 : getDaysBetween(campStartDate, campEndDate);
  const postsPerDay = campFrequency === "TWICE_DAILY" ? 2 : campFrequency === "DAILY" ? 1 : 0.5;
  const estimatedPostCount = Math.max(1, Math.round(estimatedDays * postsPerDay));
  const estimatedCreditsCost = estimatedPostCount * 5 + (campIncludeMediaGen ? estimatedPostCount * 5 : 0);
  const userCreditBalance = creditsData?.balance ?? 0;
  const hasSufficientCredits = userCreditBalance >= estimatedCreditsCost;

  // Handler: Submit Multi-Day Campaign Creation
  const handleCreateCampaignSubmit = async () => {
    if (!campName.trim()) {
      alert("Please provide a name for your campaign.");
      return;
    }
    if (campPlatforms.length === 0) {
      alert("Please select at least one social platform.");
      return;
    }
    if (!hasSufficientCredits) {
      alert(`Insufficient AI credits. This campaign requires ~${estimatedCreditsCost} credits, but your balance is ${userCreditBalance}.`);
      return;
    }

    setIsCreatingCampaign(true);
    try {
      const res = await createCampaignMutation.mutateAsync({
        name: campName,
        objective: campObjective,
        planningMode: campPlanningMode,
        startDate: new Date(campStartDate),
        endDate: new Date(campEndDate),
        targetPlatforms: campPlatforms,
        contentPillars: campPillars,
        postingFrequency: campFrequency,
        preferredPostingTimes: campPreferredTimes,
        contentMix: campContentMix,
        tone: campTone,
        promotionOrOffer: campOffer,
        callToAction: campCta,
        productIds: campSelectedProducts,
        includeMediaGeneration: campIncludeMediaGen,
      });

      setIsCampaignModalOpen(false);
      setActionSuccessMsg(`Campaign "${res.campaign.name}" created successfully with ${res.campaign.postCount} scheduled multi-day posts!`);
      refetchCampaigns();
      refetchPosts();
      setActiveTab("calendar");
    } catch (err: any) {
      alert(err.message || "Failed to generate campaign");
    } finally {
      setIsCreatingCampaign(false);
    }
  };

  // Handler: Open Post Detail / Edit Modal
  const handleOpenPostEdit = (post: any) => {
    setSelectedPostForEdit(post);
    setPostEditCopy(post.content || "");
    setPostEditScheduledAt(post.scheduledAt ? new Date(post.scheduledAt).toISOString().slice(0, 16) : "");
    setIsPostEditModalOpen(true);
  };

  // Handler: Save Post Edit Changes
  const handleSavePostEdit = async () => {
    if (!selectedPostForEdit) return;
    setIsSavingPostEdit(true);
    try {
      await socialClient.updatePost(selectedPostForEdit.id, {
        content: postEditCopy,
        scheduledAt: postEditScheduledAt ? new Date(postEditScheduledAt).toISOString() : null,
      });
      setIsPostEditModalOpen(false);
      setActionSuccessMsg("Post updated successfully!");
      refetchPosts();
    } catch (err: any) {
      alert(err.message || "Failed to update post");
    } finally {
      setIsSavingPostEdit(false);
    }
  };

  // Handler: Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this scheduled post?")) return;
    try {
      await socialClient.deletePost(postId);
      setIsPostEditModalOpen(false);
      setActionSuccessMsg("Post deleted.");
      refetchPosts();
    } catch (err: any) {
      alert(err.message || "Failed to delete post");
    }
  };

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
        {/* TAB 4: CONTENT CALENDAR (MONTH, WEEK, LIST VIEWS) */}
        {/* ========================================================================= */}
        {activeTab === "calendar" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            {/* Calendar Controls Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
                  <CalendarDaysIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Marketing Content Calendar
                    <span className="text-xs font-normal text-slate-500 dark:text-zinc-400">
                      ({posts.length} total posts)
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    {currentCalendarDate.toLocaleString("default", { month: "long", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Month Navigation */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => {
                      const prev = new Date(currentCalendarDate);
                      prev.setMonth(prev.getMonth() - 1);
                      setCurrentCalendarDate(prev);
                    }}
                    className="p-1 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded"
                    title="Previous Month"
                  >
                    <ChevronLeftIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentCalendarDate(new Date())}
                    className="px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-zinc-200 hover:bg-white dark:hover:bg-zinc-700 rounded transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const next = new Date(currentCalendarDate);
                      next.setMonth(next.getMonth() + 1);
                      setCurrentCalendarDate(next);
                    }}
                    className="p-1 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white rounded"
                    title="Next Month"
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>

                {/* View Switcher Toggle */}
                <div className="flex items-center bg-slate-100 dark:bg-zinc-800/80 rounded-lg p-0.5 border border-slate-200 dark:border-zinc-700">
                  <button
                    onClick={() => setCalendarView("month")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      calendarView === "month"
                        ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Squares2X2Icon className="w-3.5 h-3.5" />
                    Month
                  </button>
                  <button
                    onClick={() => setCalendarView("week")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      calendarView === "week"
                        ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ViewColumnsIcon className="w-3.5 h-3.5" />
                    Week
                  </button>
                  <button
                    onClick={() => setCalendarView("list")}
                    className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                      calendarView === "list"
                        ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <ListBulletIcon className="w-3.5 h-3.5" />
                    List
                  </button>
                </div>

                <button
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  Plan Multi-Day Campaign
                </button>
              </div>
            </div>

            {/* VIEW 1: MONTH GRID */}
            {calendarView === "month" && (() => {
              const year = currentCalendarDate.getFullYear();
              const month = currentCalendarDate.getMonth();
              const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const todayStr = new Date().toDateString();

              return (
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 dark:text-zinc-400 py-1 border-b border-slate-100 dark:border-zinc-800">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                      <div key={d}>{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2 min-h-[480px]">
                    {/* Blank offset days */}
                    {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                      <div
                        key={`empty-${i}`}
                        className="p-2 rounded-xl border border-slate-100/50 dark:border-zinc-800/30 bg-slate-50/30 dark:bg-zinc-900/20 opacity-40 min-h-[90px]"
                      />
                    ))}

                    {/* Real month days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const cellDate = new Date(year, month, dayNum);
                      const isToday = cellDate.toDateString() === todayStr;

                      const dayPosts = posts.filter((p: any) => {
                        const targetTime = p.scheduledAt || p.publishedAt || p.createdAt;
                        if (!targetTime) return false;
                        return new Date(targetTime).toDateString() === cellDate.toDateString();
                      });

                      return (
                        <div
                          key={`day-${dayNum}`}
                          className={`p-2 rounded-xl border text-left flex flex-col justify-between min-h-[95px] transition-all hover:border-blue-400 dark:hover:border-blue-500 ${
                            isToday
                              ? "border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 shadow-xs"
                              : "border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                                isToday
                                  ? "bg-blue-600 text-white shadow-xs"
                                  : "text-slate-700 dark:text-zinc-300"
                              }`}
                            >
                              {dayNum}
                            </span>
                            {dayPosts.length > 0 && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                {dayPosts.length}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1.5 mt-1.5 flex-1 overflow-y-auto max-h-[85px] pr-0.5">
                            {dayPosts.map((dp: any) => {
                              const timeStr = dp.scheduledAt
                                ? new Date(dp.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : dp.publishedAt
                                ? new Date(dp.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "";

                              return (
                                <button
                                  key={dp.id}
                                  onClick={() => handleOpenPostEdit(dp)}
                                  className={`w-full text-left p-1.5 rounded-lg border text-[10px] font-semibold transition-transform hover:scale-[1.02] shadow-2xs block truncate ${
                                    dp.status === "PUBLISHED"
                                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
                                      : dp.status === "SCHEDULED"
                                      ? "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200"
                                      : "bg-slate-100 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="truncate">{dp.title || dp.content.slice(0, 20)}</span>
                                    {timeStr && <span className="text-[9px] opacity-75 shrink-0">{timeStr}</span>}
                                  </div>
                                  <div className="flex items-center gap-1 mt-0.5">
                                    {dp.publications?.slice(0, 3).map((pub: any) => (
                                      <span
                                        key={pub.id}
                                        className="text-[8px] uppercase px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 font-bold"
                                      >
                                        {pub.platform.slice(0, 2)}
                                      </span>
                                    ))}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* VIEW 2: WEEK VIEW */}
            {calendarView === "week" && (() => {
              const startOfWeek = new Date(currentCalendarDate);
              const day = startOfWeek.getDay();
              const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday
              startOfWeek.setDate(diff);

              const weekDays = Array.from({ length: 7 }).map((_, i) => {
                const d = new Date(startOfWeek);
                d.setDate(startOfWeek.getDate() + i);
                return d;
              });

              return (
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3 min-h-[420px]">
                  {weekDays.map((d, i) => {
                    const dateStr = d.toDateString();
                    const isToday = dateStr === new Date().toDateString();
                    const dayPosts = posts.filter((p: any) => {
                      const t = p.scheduledAt || p.publishedAt || p.createdAt;
                      return t && new Date(t).toDateString() === dateStr;
                    });

                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border flex flex-col ${
                          isToday
                            ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                            : "border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40"
                        }`}
                      >
                        <div className="border-b border-slate-200 dark:border-zinc-800 pb-2 mb-2">
                          <p className="text-xs font-bold text-slate-500 dark:text-zinc-400">
                            {d.toLocaleString("default", { weekday: "short" })}
                          </p>
                          <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                            {d.toLocaleString("default", { month: "short", day: "numeric" })}
                          </p>
                        </div>

                        <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px]">
                          {dayPosts.length === 0 ? (
                            <p className="text-[11px] text-slate-400 dark:text-zinc-500 italic py-4 text-center">
                              No posts
                            </p>
                          ) : (
                            dayPosts.map((p: any) => (
                              <div
                                key={p.id}
                                onClick={() => handleOpenPostEdit(p)}
                                className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:shadow-md cursor-pointer transition-all space-y-1.5"
                              >
                                <div className="flex items-center justify-between text-[10px]">
                                  <span className="font-bold text-slate-500 flex items-center gap-1">
                                    <ClockIcon className="w-3 h-3" />
                                    {p.scheduledAt
                                      ? new Date(p.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                      : "Immediate"}
                                  </span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded font-bold text-[9px] ${
                                      p.status === "PUBLISHED"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : "bg-blue-100 text-blue-700"
                                    }`}
                                  >
                                    {p.status}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-2">
                                  {p.title || p.content}
                                </p>
                                <div className="flex items-center gap-1 flex-wrap pt-1">
                                  {p.publications?.map((pub: any) => (
                                    <span
                                      key={pub.id}
                                      className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-700 font-bold uppercase"
                                    >
                                      {pub.platform}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* VIEW 3: LIST VIEW */}
            {calendarView === "list" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-500">
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">Post Preview</th>
                      <th className="py-2.5 px-3">Platforms</th>
                      <th className="py-2.5 px-3">Pillar & Goal</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          No scheduled or published posts found.
                        </td>
                      </tr>
                    ) : (
                      posts.map((post: any) => (
                        <tr key={post.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/40">
                          <td className="py-3 px-3 whitespace-nowrap">
                            <p className="font-bold text-slate-900 dark:text-white">
                              {post.scheduledAt
                                ? new Date(post.scheduledAt).toLocaleDateString()
                                : post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString()
                                : "Unscheduled"}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {post.scheduledAt
                                ? new Date(post.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : post.publishedAt
                                ? new Date(post.publishedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                : "Draft"}
                            </p>
                          </td>
                          <td className="py-3 px-3 max-w-sm">
                            <p className="font-bold text-slate-900 dark:text-white truncate">
                              {post.title || post.content.slice(0, 40)}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">{post.content}</p>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1 flex-wrap">
                              {post.publications?.map((pub: any) => (
                                <span
                                  key={pub.id}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-zinc-800 uppercase"
                                >
                                  {pub.platform}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="text-[10px] font-semibold text-slate-600 dark:text-zinc-300">
                              {post.contentPillars?.join(", ") || "General"}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                post.status === "PUBLISHED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : post.status === "SCHEDULED"
                                  ? "bg-blue-100 text-blue-700"
                                  : post.status === "FAILED"
                                  ? "bg-rose-100 text-rose-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {post.status}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenPostEdit(post)}
                                className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded flex items-center gap-1"
                              >
                                <PencilSquareIcon className="w-3.5 h-3.5" />
                                Edit
                              </button>
                              {post.status !== "PUBLISHED" && (
                                <button
                                  onClick={() => handlePublishNow(post.id)}
                                  className="px-2.5 py-1 text-[11px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded shadow-xs"
                                >
                                  Publish
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: SOCIAL CAMPAIGNS */}
        {/* ========================================================================= */}
        {activeTab === "campaigns" && (
          <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <PaperAirplaneIcon className="w-4 h-4 text-purple-600" />
                  Multi-Day AI Campaigns ({campaigns.length})
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Plan, sequence, and automate multi-day marketing campaigns across Facebook, Instagram, TikTok & YouTube.
                </p>
              </div>

              <button
                onClick={() => setIsCampaignModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
              >
                <SparklesIcon className="w-4 h-4" />
                Plan Multi-Day Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-8 space-y-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 mx-auto flex items-center justify-center">
                  <PaperAirplaneIcon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  No active multi-day campaigns yet
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Launch an orchestrated 1-day flash sale, 1-week launch, 2-week awareness sprint, or 1-month seasonal campaign with automated sequencing and catalog promotion.
                </p>
                <button
                  onClick={() => setIsCampaignModalOpen(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {campaigns.map((camp: any) => (
                  <div
                    key={camp.id}
                    className="p-4 border rounded-xl border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/40 space-y-3 hover:border-purple-300 dark:hover:border-purple-800 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {camp.name}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                            {camp.planningMode || "CAMPAIGN"}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {camp.durationDays ? `${camp.durationDays} Days` : ""}
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full">
                        {camp.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-300">
                      <strong className="text-slate-700 dark:text-zinc-200">Objective:</strong> {camp.objective}
                    </p>

                    {camp.product && (
                      <div className="flex items-center gap-2 text-xs text-slate-500 bg-white dark:bg-zinc-800/80 p-2 rounded-lg border border-slate-200 dark:border-zinc-700">
                        <TagIcon className="w-3.5 h-3.5 text-blue-500" />
                        <span className="truncate font-medium text-slate-800 dark:text-zinc-200">
                          {camp.product.name} ({camp.product.category || "Catalog Item"})
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-zinc-800 text-xs">
                      <div className="flex gap-1">
                        {camp.platforms.map((p: string) => (
                          <span
                            key={p}
                            className="px-1.5 py-0.5 text-[9px] font-bold bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded text-slate-700 dark:text-zinc-300 uppercase"
                          >
                            {p}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveTab("calendar")}
                        className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline"
                      >
                        View in Calendar →
                      </button>
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

      {/* ========================================================================= */}
      {/* MODAL 1: MULTI-DAY CAMPAIGN PLANNER */}
      {/* ========================================================================= */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-3xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Plan Multi-Day AI Marketing Campaign
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Automated, narrative-sequenced content planning across multiple days and platforms.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCampaignModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* Step 1: Planning Mode */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-900 dark:text-white">
                  1. Select Campaign Duration & Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { mode: "SINGLE_DAY", label: "Single Day", desc: "1 Day Flash / Event" },
                    { mode: "ONE_WEEK", label: "1 Week", desc: "7 Days Sequence" },
                    { mode: "TWO_WEEKS", label: "2 Weeks", desc: "14 Days Sprint" },
                    { mode: "ONE_MONTH", label: "1 Month", desc: "30 Days Calendar" },
                    { mode: "CUSTOM_RANGE", label: "Custom Range", desc: "Flexible Dates" },
                  ].map((item) => (
                    <button
                      key={item.mode}
                      type="button"
                      onClick={() => handlePlanningModeChange(item.mode as CampaignPlanningMode)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                        campPlanningMode === item.mode
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 ring-2 ring-purple-400"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                      }`}
                    >
                      <span className="font-bold text-xs">{item.label}</span>
                      <span className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">{item.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Campaign Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Campaign Name *
                  </label>
                  <input
                    type="text"
                    value={campName}
                    onChange={(e) => setCampName(e.target.value)}
                    placeholder="e.g. Spring Inventory Launch & Flash Deal"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Primary Objective
                  </label>
                  <select
                    value={campObjective}
                    onChange={(e) => setCampObjective(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  >
                    <option value="INCREASE SALES & AWARENESS">Increase Sales & Store Conversions</option>
                    <option value="PRODUCT LAUNCH">New Product Launch & Features</option>
                    <option value="HOLIDAY / FLASH SALE">Holiday Promo or Flash Clearance</option>
                    <option value="BRAND ENGAGEMENT">Community Engagement & Brand Story</option>
                    <option value="EDUCATIONAL / EXPERT">Educational & Problem Solving</option>
                  </select>
                </div>
              </div>

              {/* Step 3: Dates & Platforms */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={campStartDate}
                      onChange={(e) => {
                        setCampStartDate(e.target.value);
                        if (campPlanningMode !== "CUSTOM_RANGE") {
                          const start = new Date(e.target.value);
                          let days = 7;
                          if (campPlanningMode === "SINGLE_DAY") days = 1;
                          if (campPlanningMode === "TWO_WEEKS") days = 14;
                          if (campPlanningMode === "ONE_MONTH") days = 30;
                          setCampEndDate(new Date(start.getTime() + days * 86400000).toISOString().split("T")[0]);
                        }
                      }}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={campEndDate}
                      disabled={campPlanningMode !== "CUSTOM_RANGE"}
                      onChange={(e) => setCampEndDate(e.target.value)}
                      className={`w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 ${
                        campPlanningMode !== "CUSTOM_RANGE" ? "opacity-70 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Target Platforms *
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {(["FACEBOOK", "INSTAGRAM", "TIKTOK", "YOUTUBE"] as SocialPlatform[]).map((plat) => {
                      const isSelected = campPlatforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setCampPlatforms(campPlatforms.filter((p) => p !== plat));
                            } else {
                              setCampPlatforms([...campPlatforms, plat]);
                            }
                          }}
                          className={`px-3 py-2 rounded-lg border font-bold text-[11px] transition-all ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-700"
                          }`}
                        >
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Step 4: Content Mix Configuration */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 dark:text-white">
                    4. Content Mix Strategy (Must equal 100%)
                  </label>
                  <span
                    className={`font-bold text-xs ${
                      campContentMix.promotional +
                        campContentMix.educational +
                        campContentMix.engagement +
                        campContentMix.brand +
                        campContentMix.offers ===
                      100
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-rose-600 dark:text-rose-400"
                    }`}
                  >
                    Total:{" "}
                    {campContentMix.promotional +
                      campContentMix.educational +
                      campContentMix.engagement +
                      campContentMix.brand +
                      campContentMix.offers}
                    %
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Product Promo: {campContentMix.promotional}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={campContentMix.promotional}
                      onChange={(e) =>
                        setCampContentMix({ ...campContentMix, promotional: parseInt(e.target.value) || 0 })
                      }
                      className="w-full mt-1 accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Educational: {campContentMix.educational}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={campContentMix.educational}
                      onChange={(e) =>
                        setCampContentMix({ ...campContentMix, educational: parseInt(e.target.value) || 0 })
                      }
                      className="w-full mt-1 accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Engagement: {campContentMix.engagement}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={campContentMix.engagement}
                      onChange={(e) =>
                        setCampContentMix({ ...campContentMix, engagement: parseInt(e.target.value) || 0 })
                      }
                      className="w-full mt-1 accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Brand Story: {campContentMix.brand}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={campContentMix.brand}
                      onChange={(e) =>
                        setCampContentMix({ ...campContentMix, brand: parseInt(e.target.value) || 0 })
                      }
                      className="w-full mt-1 accent-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-zinc-300">
                      Offers / Urgency: {campContentMix.offers}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={campContentMix.offers}
                      onChange={(e) =>
                        setCampContentMix({ ...campContentMix, offers: parseInt(e.target.value) || 0 })
                      }
                      className="w-full mt-1 accent-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Step 5: Inventory-Aware Product Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 dark:text-white">
                    5. Select In-Stock Catalog Products to Feature
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {campSelectedProducts.length === 0
                      ? "All store products available will be used by AI"
                      : `${campSelectedProducts.length} specific product(s) selected`}
                  </span>
                </div>

                {storeProducts.length === 0 ? (
                  <p className="text-slate-400 italic">No in-stock products found in store catalog.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto p-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-800/40">
                    {storeProducts.map((p: any) => {
                      const isChecked = campSelectedProducts.includes(p.id);
                      return (
                        <label
                          key={p.id}
                          className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? "border-purple-500 bg-purple-50/50 dark:bg-purple-950/30"
                              : "border-slate-100 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCampSelectedProducts([...campSelectedProducts, p.id]);
                              } else {
                                setCampSelectedProducts(campSelectedProducts.filter((id) => id !== p.id));
                              }
                            }}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <div className="truncate flex-1">
                            <span className="font-bold text-slate-900 dark:text-white truncate block">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              KES {p.price?.toLocaleString()} • {p.quantity} in stock
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Step 6: Offer & Call to Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Special Offer / Discount (Optional)
                  </label>
                  <input
                    type="text"
                    value={campOffer}
                    onChange={(e) => setCampOffer(e.target.value)}
                    placeholder="e.g. Free shipping this weekend with code SAVE20"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Call to Action (CTA)
                  </label>
                  <input
                    type="text"
                    value={campCta}
                    onChange={(e) => setCampCta(e.target.value)}
                    placeholder="e.g. Shop Now, Order via WhatsApp, Visit Us"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>
              </div>

              {/* Pre-Flight AI Credit Estimation & Ledger Box */}
              <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
                <div className="flex items-center justify-between font-bold text-xs text-purple-900 dark:text-purple-200">
                  <span className="flex items-center gap-1.5">
                    <SparklesIcon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    AI Credit Estimation & Pre-Flight Ledger
                  </span>
                  <span>
                    Your Balance: <strong className="text-emerald-600 dark:text-emerald-400">{userCreditBalance} Credits</strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/40 text-[11px]">
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400">Duration:</span>
                    <p className="font-bold text-slate-900 dark:text-white">{estimatedDays} Days</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400">Planned Posts:</span>
                    <p className="font-bold text-slate-900 dark:text-white">~{estimatedPostCount} Posts</p>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-zinc-400">Required Credits:</span>
                    <p className="font-bold text-purple-700 dark:text-purple-300">{estimatedCreditsCost} Credits</p>
                  </div>
                </div>

                {!hasSufficientCredits && (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-[11px] font-semibold flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-4 h-4 text-rose-600 shrink-0" />
                    Insufficient AI credits. You need {estimatedCreditsCost} credits for this campaign, but your current balance is {userCreditBalance}.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => setIsCampaignModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreateCampaignSubmit}
                disabled={isCreatingCampaign || !hasSufficientCredits}
                className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-sm disabled:opacity-50 flex items-center gap-2"
              >
                <SparklesIcon className="w-4 h-4" />
                {isCreatingCampaign ? "Synthesizing Multi-Day Sequence..." : "Generate & Schedule Campaign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: POST DETAIL & SCHEDULE EDIT MODAL */}
      {/* ========================================================================= */}
      {isPostEditModalOpen && selectedPostForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full my-8 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Edit Scheduled Social Post
                  </h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {selectedPostForEdit.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ID: {selectedPostForEdit.id.slice(0, 10)}...
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsPostEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  Post Copy & Captions
                </label>
                <textarea
                  rows={6}
                  value={postEditCopy}
                  onChange={(e) => setPostEditCopy(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-normal leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Scheduled Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={postEditScheduledAt}
                    onChange={(e) => setPostEditScheduledAt(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-zinc-300 mb-1">
                    Target Platforms
                  </label>
                  <div className="flex gap-1.5 flex-wrap pt-1">
                    {selectedPostForEdit.publications?.map((pub: any) => (
                      <span
                        key={pub.id}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-zinc-800 font-bold text-[10px] text-slate-700 dark:text-zinc-300 uppercase"
                      >
                        {pub.platform}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {selectedPostForEdit.adaptations && (
                <div className="p-3 bg-slate-50 dark:bg-zinc-800/50 rounded-xl border border-slate-200 dark:border-zinc-700 space-y-2">
                  <span className="font-bold text-slate-800 dark:text-zinc-200">Platform Adaptations</span>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-300 space-y-1">
                    {Object.entries(selectedPostForEdit.adaptations).map(([plat, adap]: any) => (
                      <div key={plat} className="p-2 bg-white dark:bg-zinc-900 rounded border border-slate-100 dark:border-zinc-800">
                        <strong className="text-slate-900 dark:text-white uppercase">{plat}:</strong>{" "}
                        {adap.caption || adap.title || "Standard caption"}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
              <button
                type="button"
                onClick={() => handleDeletePost(selectedPostForEdit.id)}
                className="px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1"
              >
                <TrashIcon className="w-4 h-4" />
                Delete Post
              </button>

              <div className="flex items-center gap-2">
                {selectedPostForEdit.status !== "PUBLISHED" && (
                  <button
                    type="button"
                    onClick={async () => {
                      await handlePublishNow(selectedPostForEdit.id);
                      setIsPostEditModalOpen(false);
                    }}
                    className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs"
                  >
                    Publish Now
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSavePostEdit}
                  disabled={isSavingPostEdit}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isSavingPostEdit ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
