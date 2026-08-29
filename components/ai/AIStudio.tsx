"use client";

import React, { useState } from "react";
import {
  SparklesIcon,
  BoltIcon as BoltOutlineIcon,
  PhotoIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CreditCardIcon,
  ChartBarIcon,
  DocumentDuplicateIcon,
  CheckIcon,
  ArrowPathIcon,
  ClockIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  Squares2X2Icon,
  ExclamationCircleIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CpuChipIcon,
  MegaphoneIcon,
  UserGroupIcon,
  FolderOpenIcon,
  ArrowDownTrayIcon,
  PlayCircleIcon,
  PaperAirplaneIcon,
} from "@heroicons/react/24/outline";
import { BoltIcon as BoltSolidIcon } from "@heroicons/react/24/solid";

import {
  useAICredits,
  useAIModels,
  useGenerateText,
  useGenerateImage,
  useGenerateVideo,
  useProductAI,
  useAICreditTransactions,
  useAIUsageAnalytics,
  useAIGenerations,
  useBuyAICredits,
  useAIAgent,
  useCancelAIGenerationJob,
} from "@/hooks/useAI";

type ActiveTab =
  | "overview"
  | "text"
  | "image"
  | "video"
  | "product"
  | "marketing"
  | "agents"
  | "generations"
  | "credits"
  | "analytics";

interface AIStudioProps {
companyId: string;
initialProduct?: {
  productId?: string;
  name?: string;
  description?: string;
  price?: string;
  imageUrl?: string;
  category?: string;
  subcategory?: string;
};
}

export default function AIStudio({ companyId, initialProduct }: AIStudioProps) {


  // 1. Default to "marketing" tab if a product was passed in
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    initialProduct?.productId ? "marketing" : "overview"
  );
  const [copiedText, setCopiedText] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [phoneForPayment, setPhoneForPayment] = useState("");

  // ... (Keep existing AI Query Hooks and Mutations) ...

  // 2. Pre-fill Text Tab State
  const [textPrompt, setTextPrompt] = useState(
    initialProduct?.name ? `${initialProduct.name} - ${initialProduct.description || ""} ${initialProduct.price || ""} ${initialProduct.category || ""} ${initialProduct.subcategory || ""}` : ""
  );
  const [textModel, setTextModel] = useState("gemini-2.0-flash");
  const [textTone, setTextTone] = useState("compelling");
  const [textType, setTextType] = useState(initialProduct?.productId ? "social_ad_copy" : "product_description");
  const [generatedTextOutput, setGeneratedTextOutput] = useState<any>(null);

  // 3. Pre-fill Image Tab State
  const [imagePrompt, setImagePrompt] = useState(initialProduct?.name || "");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [imageAction, setImageAction] = useState<any>(initialProduct?.imageUrl ? "REPLACE_BACKGROUND" : "GENERATE_IMAGE");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // (Keep Video Tab State as is)
  const [videoPrompt, setVideoPrompt] = useState(initialProduct?.name || "");
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");

  // 4. Pre-fill Product Tab State
  const [productName, setProductName] = useState(initialProduct?.name || "");
  const [productCategory, setProductCategory] = useState(initialProduct?.category || "");
  const [productSubcategory, setProductSubcategory] = useState(initialProduct?.subcategory || "");
  const [productFeatures, setProductFeatures] = useState(initialProduct?.description || "");
  const [productOutput, setProductOutput] = useState<any>(null);

  // 5. Pre-fill Marketing Tab State (Target Destination)
  const [marketingTopic, setMarketingTopic] = useState(
    initialProduct?.name 
      ? `Product: ${initialProduct.name}. Details: ${initialProduct.description || ""}. Price: Ksh ${initialProduct.price || ""}`
      : ""
  );
  const [marketingType, setMarketingType] = useState("social_ad");
  const [marketingDiscount, setMarketingDiscount] = useState("20% OFF");
  const [marketingOutput, setMarketingOutput] = useState<any>(null);


  // const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  // const [copiedText, setCopiedText] = useState(false);
  // const [showBuyModal, setShowBuyModal] = useState(false);
  // const [selectedPackage, setSelectedPackage] = useState<any>(null);
  // const [phoneForPayment, setPhoneForPayment] = useState("");

  // AI Query Hooks
  const { data: creditsData, isLoading: creditsLoading, refetch: refetchCredits } = useAICredits();
  const { data: modelsData } = useAIModels();
  const { data: transactionsData } = useAICreditTransactions(1, 20);
  const { data: usageData } = useAIUsageAnalytics("month");
  const { data: generationsData, refetch: refetchGenerations } = useAIGenerations(1, 20);

  // AI Mutations
  const textMutation = useGenerateText();
  const imageMutation = useGenerateImage();
  const videoMutation = useGenerateVideo();
  const productMutation = useProductAI();
  const buyCreditsMutation = useBuyAICredits();
  const agentMutation = useAIAgent();
  const cancelJobMutation = useCancelAIGenerationJob();

  // Text Tab State
  // const [textPrompt, setTextPrompt] = useState("");
  // const [textModel, setTextModel] = useState("gemini-2.0-flash");
  // const [textTone, setTextTone] = useState("compelling");
  // const [textType, setTextType] = useState("product_description");
  // const [generatedTextOutput, setGeneratedTextOutput] = useState<any>(null);

  // Image Tab State
  // const [imagePrompt, setImagePrompt] = useState("");
  // const [imageModel, setImageModel] = useState("dall-e-3");
  // const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  // const [imageAction, setImageAction] = useState<any>("GENERATE_IMAGE");
  // const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // Video Tab State
  // const [videoPrompt, setVideoPrompt] = useState("");
  // const [videoDuration, setVideoDuration] = useState(5);
  // const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");

  // Product Tab State
  // const [productName, setProductName] = useState("");
  // const [productCategory, setProductCategory] = useState("");
  // const [productFeatures, setProductFeatures] = useState("");
  // const [productOutput, setProductOutput] = useState<any>(null);

  // Marketing Tab State
  // const [marketingTopic, setMarketingTopic] = useState("");
  // const [marketingType, setMarketingType] = useState("social_ad");
  // const [marketingDiscount, setMarketingDiscount] = useState("20% OFF");
  // const [marketingOutput, setMarketingOutput] = useState<any>(null);

  // Agents Tab State
  const [agentRole, setAgentRole] = useState<"SALES_ASSISTANT" | "SUPPORT_REP" | "MARKETING_ADVISOR" | "BUSINESS_ANALYST">("SALES_ASSISTANT");
  const [agentInput, setAgentInput] = useState("");
  const [agentHistory, setAgentHistory] = useState<Array<{ role: "system" | "user" | "assistant"; content: string; time: string }>>([
    {
      role: "assistant",
      content: "Hello! I am your store AI sales & support agent. How can I help boost sales, check inventory, or draft customer replies today?",
      time: "Just now",
    },
  ]);

  // Generations Tab Filter
  const [generationFilter, setGenerationFilter] = useState<string>("ALL");

  const balance = creditsData?.balance ?? 0;
  const companyName = creditsData?.companyName || "Store";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleGenerateText = async () => {
    if (!textPrompt) return;
    try {
      const res = await textMutation.mutateAsync({
        prompt: `Write a ${textTone} ${textType.replace("_", " ")} for:\n${textPrompt}`,
        modelId: textModel,
        feature: textType,
      });
      setGeneratedTextOutput(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    try {
      const res = await imageMutation.mutateAsync({
        prompt: imagePrompt,
        modelId: imageModel,
        aspectRatio: imageAspectRatio,
        action: imageAction,
      });
      if (res.images) {
        setGeneratedImages((prev) => [...res.images, ...prev]);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoPrompt) return;
    try {
      await videoMutation.mutateAsync({
        prompt: videoPrompt,
        durationSeconds: videoDuration,
        aspectRatio: videoAspectRatio,
      });
      setVideoPrompt("");
      setActiveTab("generations");
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGenerateProductContent = async (action: "DESCRIPTION" | "SEO" | "ATTRIBUTES") => {
    if (!productName) return;
    try {
      const res = await productMutation.mutateAsync({
        action,
        name: productName,
        category: productCategory,
        subcategory: productSubcategory,
        features: productFeatures ? productFeatures.split(",").map((f) => f.trim()) : undefined,
      });
      setProductOutput(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleGenerateMarketing = async () => {
    if (!marketingTopic) return;
    try {
      const res = await textMutation.mutateAsync({
        prompt: `Create a high-converting ${marketingType.replace("_", " ")} campaign with offer '${marketingDiscount}' for: ${marketingTopic}`,
        systemPrompt: "You are an expert eCommerce growth marketing director. Return high-converting hooks, email subject lines, Instagram captions with emojis and hashtags, and WhatsApp broadcast copy.",
        modelId: "gemini-2.0-flash",
        feature: "marketing_campaign",
      });
      setMarketingOutput(res);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSendAgentMessage = async () => {
    if (!agentInput.trim()) return;
    const userText = agentInput;
    setAgentInput("");

    const newHistory = [
      ...agentHistory,
      { role: "user" as const, content: userText, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
    ];
    setAgentHistory(newHistory);

    try {
      const res = await agentMutation.mutateAsync({
        prompt: userText,
        agentRole,
        conversationHistory: newHistory.map((h) => ({ role: h.role, content: h.content })),
      });

      setAgentHistory([
        ...newHistory,
        { role: "assistant" as const, content: res.reply, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
    } catch (err: any) {
      setAgentHistory([
        ...newHistory,
        { role: "assistant" as const, content: `Error: ${err.message || "Agent execution failed."}`, time: "Just now" },
      ]);
    }
  };

  const handlePurchasePackage = async (pkg: any) => {
    try {
      await buyCreditsMutation.mutateAsync({
        packageId: pkg.id,
        phone: phoneForPayment || undefined,
        paymentMethod: "MPESA",
      });
      setShowBuyModal(false);
      refetchCredits();
    } catch (err: any) {
      alert(err.message || "Failed to initiate top-up");
    }
  };

  const filteredGenerations = (generationsData?.jobs || []).filter((job: any) => {
    if (generationFilter === "ALL") return true;
    return job.capability === generationFilter;
  });

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 antialiased">
      {/* Top Sticky Navigation Bar */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight">
                  SalesmanPro AI Studio
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Tenant: <span className="font-semibold text-slate-800">{companyName}</span>
              </p>
            </div>
          </div>

          {/* Credit Wallet Summary & Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200/80 px-3.5 py-2 rounded-xl shadow-2xs">
              <BoltSolidIcon className="w-5 h-5 text-amber-600" />
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block leading-tight">
                  Credit Balance
                </span>
                <span className="text-sm font-black text-amber-950">
                  {creditsLoading ? "..." : balance.toLocaleString()} Credits
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowBuyModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white px-4 py-2 rounded-xl font-bold text-xs sm:text-sm shadow-xs"
            >
              <PlusCircleIcon className="w-4 h-4 stroke-2" />
              <span>Top Up Credits</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="max-w-7xl mx-auto mt-3 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "overview", label: "Overview", icon: Squares2X2Icon },
            { id: "text", label: "Text Copy", icon: DocumentTextIcon },
            { id: "image", label: "Image Studio", icon: PhotoIcon },
            { id: "video", label: "Video Reels", icon: VideoCameraIcon },
            { id: "product", label: "Product AI", icon: ShoppingBagIcon },
            { id: "marketing", label: "Marketing Ads", icon: MegaphoneIcon },
            { id: "agents", label: "Store Agents", icon: UserGroupIcon },
            { id: "generations", label: "Generations", icon: FolderOpenIcon },
            { id: "credits", label: "Wallet & Ledger", icon: CreditCardIcon },
            { id: "analytics", label: "Telemetry", icon: ChartBarIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  active
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 stroke-[1.75]" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Studio Viewport */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                onClick={() => setActiveTab("product")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <ShoppingBagIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Product Content AI</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Generate 1-click descriptions, SEO meta tags, catalog specs, and bullet lists.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Open Catalog AI <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("image")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <PhotoIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Image Studio</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Render studio product shots, isolate backgrounds, and make marketing visuals.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Generate Images <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("video")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <VideoCameraIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Video Reels</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Build dynamic short videos and promotional reels directly for social channels.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Create Video <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("credits")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200 hover:border-slate-400 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CreditCardIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Credit Wallet</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {balance.toLocaleString()} available credits. Inspect real-time audit ledger.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Manage Wallet <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>
            </div>

            {/* Architecture Banner */}
            <div className="bg-teal-950 border border-teal-800/50 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-teal-900 border border-teal-700/60 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6 text-teal-300 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Unified AI Wallet Engine</h4>
                  <p className="text-xs text-teal-100/80 mt-1 max-w-2xl leading-relaxed">
                    Your WhatsApp AI Concierge and Web Studio share the exact same tenant wallet, authorization parameters, and model registry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("analytics")}
                className="text-xs font-bold bg-white text-teal-950 border border-teal-100 px-4 py-2.5 rounded-xl hover:bg-teal-50 transition active:scale-95 shadow-xs whitespace-nowrap"
              >
                View Telemetry
              </button>
            </div>

            {/* Recent Generations Gallery */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Recent AI Generations</h3>
                  <p className="text-xs text-slate-500">Auto-persisted to store Media Library</p>
                </div>
                <button
                  onClick={() => setActiveTab("generations")}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                >
                  View All ({generationsData?.total || 0}) →
                </button>
              </div>

              {generationsData?.jobs && generationsData.jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {generationsData.jobs.slice(0, 4).map((job: any) => (
                    <div
                      key={job.id}
                      className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-2.5 hover:bg-white hover:border-slate-300 transition"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-800 font-bold">
                          {job.capability}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : job.status === "PROCESSING"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{job.prompt}</p>
                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-200 font-medium">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 stroke-2 text-slate-400" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span className="font-semibold text-slate-700">{job.creditsReserved} Credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <SparklesIcon className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-1" />
                  <span>No recent generation jobs recorded yet. Try creating content!</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXT & COPYWRITER TAB */}
        {activeTab === "text" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <DocumentTextIcon className="w-5 h-5 text-indigo-600 stroke-2" />
                <h3 className="font-bold text-slate-900 text-base">Text AI Generator</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Content Format</label>
                <select
                  value={textType}
                  onChange={(e) => setTextType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="product_description">Product Description</option>
                  <option value="marketing_email">Marketing Email Campaign</option>
                  <option value="social_ad_copy">Instagram / Facebook Ad Copy</option>
                  <option value="seo_meta">SEO Title & Meta Tags</option>
                  <option value="sales_pitch">WhatsApp Sales Hook</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Model Engine</label>
                <select
                  value={textModel}
                  onChange={(e) => setTextModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition"
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Ultra-Fast Reasoning)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Default Fast)</option>
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Groq Accelerated)</option>
                  <option value="gpt-4o">GPT-4o Flagship (Deep Strategy)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Tone & Voice</label>
                <div className="grid grid-cols-3 gap-2">
                  {["compelling", "luxurious", "playful", "professional", "technical", "urgency"].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setTextTone(tone)}
                      className={`text-xs capitalize py-2 px-3 rounded-xl border font-bold transition ${
                        textTone === tone
                          ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Prompt / Details</label>
                <textarea
                  value={textPrompt}
                  onChange={(e) => setTextPrompt(e.target.value)}
                  rows={4}
                  placeholder="Describe your product or focus (e.g. Handmade leather messenger bag with brass buckles and 15-inch laptop compartment)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition leading-relaxed"
                />
              </div>

              <button
                type="button"
                disabled={textMutation.isPending || !textPrompt}
                onClick={handleGenerateText}
                className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {textMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                    <span>Generating Copy...</span>
                  </>
                ) : (
                  <>
                    <CpuChipIcon className="w-4 h-4 stroke-2 text-indigo-400" />
                    <span>Generate Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Display */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="font-bold text-slate-900 text-base">Generated Result</h4>
                  {generatedTextOutput && (
                    <button
                      onClick={() => handleCopy(generatedTextOutput.text)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                    >
                      {copiedText ? (
                        <CheckIcon className="w-3.5 h-3.5 text-emerald-600 stroke-2" />
                      ) : (
                        <DocumentDuplicateIcon className="w-3.5 h-3.5 stroke-2 text-slate-500" />
                      )}
                      <span>{copiedText ? "Copied!" : "Copy Text"}</span>
                    </button>
                  )}
                </div>

                {generatedTextOutput ? (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4.5 rounded-xl text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-200 font-normal">
                      {generatedTextOutput.text}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                      <span>
                        Model: <strong className="text-slate-800">{generatedTextOutput.model}</strong>
                      </span>
                      <span>
                        Tokens: <strong className="text-slate-800">{generatedTextOutput.totalTokens}</strong>
                      </span>
                      <span>
                        Credits: <strong className="text-slate-800">{generatedTextOutput.creditsConsumed}</strong>
                      </span>
                      <span>
                        Speed: <strong className="text-slate-800">{generatedTextOutput.executionTimeMs}ms</strong>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <DocumentTextIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                    <span>Your AI-generated copy will render here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* IMAGE STUDIO TAB */}
        {activeTab === "image" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <PhotoIcon className="w-5 h-5 text-purple-600 stroke-2" />
                <h3 className="font-bold text-slate-900 text-base">AI Image Studio</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Action Mode</label>
                <select
                  value={imageAction}
                  onChange={(e) => setImageAction(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition"
                >
                  <option value="GENERATE_IMAGE">Generate from Description</option>
                  <option value="PRODUCT_PHOTO">Clean White Studio Product Shot</option>
                  <option value="REMOVE_BACKGROUND">Isolate & Remove Background</option>
                  <option value="REPLACE_BACKGROUND">Place in Lifestyle Scene</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Aspect Ratio</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "1:1", label: "1:1 Square" },
                    { id: "16:9", label: "16:9 Web" },
                    { id: "9:16", label: "9:16 Story" },
                  ].map((ratio) => (
                    <button
                      key={ratio.id}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio.id as any)}
                      className={`text-xs py-2 px-3 rounded-xl border font-bold transition ${
                        imageAspectRatio === ratio.id
                          ? "border-slate-900 bg-slate-900 text-white shadow-2xs"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {ratio.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Prompt</label>
                <textarea
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  rows={4}
                  placeholder="e.g. Wireless noise-cancelling headphones resting on a marble desk with warm ambient lighting..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition leading-relaxed"
                />
              </div>

              <button
                type="button"
                disabled={imageMutation.isPending || !imagePrompt}
                onClick={handleGenerateImage}
                className="w-full bg-purple-700 hover:bg-purple-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {imageMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                    <span>Rendering Image...</span>
                  </>
                ) : (
                  <>
                    <PhotoIcon className="w-4 h-4 stroke-2" />
                    <span>Generate Image (~20 Credits)</span>
                  </>
                )}
              </button>
            </div>

            {/* Images Grid */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-base mb-4">Generated Images</h4>
              {generatedImages.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-square">
                      <img src={img.url} alt="Generated visual" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 bg-white text-slate-900 rounded-xl shadow-md hover:bg-slate-50 transition"
                        >
                          <ArrowDownTrayIcon className="w-4 h-4 stroke-2" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <PhotoIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                  <span>Images generated will appear here and persist to your Media Library</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIDEO TAB */}
        {activeTab === "video" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <VideoCameraIcon className="w-5 h-5 text-rose-600 stroke-2" />
              <h3 className="font-bold text-slate-900 text-base">Asynchronous Video Reel Studio</h3>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Create product showcase reels and promo clips. Videos are queued and processed asynchronously to ensure non-blocking performance.
            </p>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Prompt Description</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                placeholder="e.g. 360 degree smooth rotation of the titanium smart watch in luxury lighting..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Duration</label>
                <select
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none"
                >
                  <option value={5}>5 Seconds (50 Credits)</option>
                  <option value={10}>10 Seconds (100 Credits)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Aspect Ratio</label>
                <select
                  value={videoAspectRatio}
                  onChange={(e) => setVideoAspectRatio(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none"
                >
                  <option value="16:9">16:9 Landscape</option>
                  <option value="9:16">9:16 TikTok / Reel</option>
                  <option value="1:1">1:1 Square</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              disabled={videoMutation.isPending || !videoPrompt}
              onClick={handleGenerateVideo}
              className="w-full bg-rose-700 hover:bg-rose-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              {videoMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                  <span>Queueing Video Job...</span>
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-4 h-4 stroke-2" />
                  <span>Submit Video Job</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PRODUCT CATALOG AI TAB */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBagIcon className="w-5 h-5 text-blue-600 stroke-2" />
                <h3 className="font-bold text-slate-900 text-base">Product Content Generator</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Ultra-Light Carbon Fiber Road Bike"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <input
                  type="text"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="e.g. Sports & Outdoors > Cycling"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Key Features (comma separated)</label>
                <textarea
                  value={productFeatures}
                  onChange={(e) => setProductFeatures(e.target.value)}
                  rows={3}
                  placeholder="e.g. 7.5kg weight, Shimano 105 drivetrain, hydraulic disc brakes, aerodynamic frame"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("DESCRIPTION")}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-2xs transition disabled:opacity-50"
                >
                  Description
                </button>
                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("SEO")}
                  className="bg-indigo-700 hover:bg-indigo-800 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-2xs transition disabled:opacity-50"
                >
                  SEO Tags
                </button>
                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("ATTRIBUTES")}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold py-2.5 px-3 rounded-xl text-xs shadow-2xs transition disabled:opacity-50"
                >
                  Specs
                </button>
              </div>
            </div>

            {/* Output */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-base mb-3">Generated Product Data</h4>
              {productOutput ? (
                <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-200 text-xs text-slate-800 font-mono whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto">
                  {JSON.stringify(productOutput, null, 2)}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <ShoppingBagIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                  <span>Select an action to generate descriptions, SEO, or attributes</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MARKETING ADS & CAMPAIGNS TAB */}
        {activeTab === "marketing" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <MegaphoneIcon className="w-5 h-5 text-pink-600 stroke-2" />
                <h3 className="font-bold text-slate-900 text-base">Marketing Campaign AI</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Campaign Type</label>
                <select
                  value={marketingType}
                  onChange={(e) => setMarketingType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                >
                  <option value="social_ad">Instagram / Facebook Ad Carousel</option>
                  <option value="flash_sale">Flash Sale Announcement</option>
                  <option value="email_newsletter">Email Marketing Blast</option>
                  <option value="whatsapp_broadcast">WhatsApp Customer Broadcast</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Special Offer / Hook</label>
                <input
                  type="text"
                  value={marketingDiscount}
                  onChange={(e) => setMarketingDiscount(e.target.value)}
                  placeholder="e.g. 20% OFF or Buy 1 Get 1 Free"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Product or Event Details</label>
                <textarea
                  value={marketingTopic}
                  onChange={(e) => setMarketingTopic(e.target.value)}
                  rows={4}
                  placeholder="Describe your sale item or event (e.g. Weekend clearance on winter jacket collection with free expedited shipping)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                />
              </div>

              <button
                type="button"
                disabled={textMutation.isPending || !marketingTopic}
                onClick={handleGenerateMarketing}
                className="w-full bg-pink-700 hover:bg-pink-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {textMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                    <span>Generating Campaign...</span>
                  </>
                ) : (
                  <>
                    <MegaphoneIcon className="w-4 h-4 stroke-2" />
                    <span>Generate Multi-Channel Copy</span>
                  </>
                )}
              </button>
            </div>

            {/* Output */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="font-bold text-slate-900 text-base">Campaign Copy & Hooks</h4>
                  {marketingOutput && (
                    <button
                      onClick={() => handleCopy(marketingOutput.text)}
                      className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
                    >
                      {copiedText ? <CheckIcon className="w-3.5 h-3.5 text-emerald-600 stroke-2" /> : <DocumentDuplicateIcon className="w-3.5 h-3.5 stroke-2 text-slate-500" />}
                      <span>{copiedText ? "Copied!" : "Copy Campaign"}</span>
                    </button>
                  )}
                </div>

                {marketingOutput ? (
                  <div className="bg-slate-50 p-4.5 rounded-xl text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-200 font-normal">
                    {marketingOutput.text}
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <MegaphoneIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                    <span>Your multi-channel promotional copy will appear here</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STORE AI AGENTS TAB */}
        {activeTab === "agents" && (
          <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col h-[650px]">
            {/* Header & Role Picker */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-indigo-400 flex items-center justify-center flex-shrink-0">
                  <UserGroupIcon className="w-5 h-5 stroke-2" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Interactive Store AI Agent</h3>
                  <p className="text-xs text-slate-500">Empowered with safe bounded domain catalog & order tools</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Role:</span>
                <select
                  value={agentRole}
                  onChange={(e) => setAgentRole(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 outline-none shadow-2xs"
                >
                  <option value="SALES_ASSISTANT">Sales Concierge</option>
                  <option value="SUPPORT_REP">Customer Support</option>
                  <option value="MARKETING_ADVISOR">Marketing Strategist</option>
                  <option value="BUSINESS_ANALYST">Business Analyst</option>
                </select>
              </div>
            </div>

            {/* Chat Conversation Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-white">
              {agentHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      msg.role === "user" ? "bg-slate-900 text-white" : "bg-indigo-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? "You" : "AI"}
                  </div>
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-slate-900 text-white rounded-tr-none"
                        : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <span className={`block text-[10px] mt-1.5 font-medium ${msg.role === "user" ? "text-slate-400 text-right" : "text-slate-400"}`}>
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
              {agentMutation.isPending && (
                <div className="flex items-center gap-2 text-xs text-indigo-700 font-bold py-2">
                  <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                  <span>Agent is analyzing store context & executing tools...</span>
                </div>
              )}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-3">
              <input
                type="text"
                value={agentInput}
                onChange={(e) => setAgentInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendAgentMessage();
                  }
                }}
                placeholder="Ask agent to search items, compare products, or draft replies..."
                className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-2xs"
              />
              <button
                onClick={handleSendAgentMessage}
                disabled={agentMutation.isPending || !agentInput.trim()}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shadow-2xs"
              >
                <span>Send</span>
                <PaperAirplaneIcon className="w-3.5 h-3.5 stroke-2" />
              </button>
            </div>
          </div>
        )}

        {/* GENERATIONS HISTORY TAB */}
        {activeTab === "generations" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">AI Generations & Jobs</h3>
                <p className="text-xs text-slate-500">Central audit trail for images, videos, and media assets</p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2">
                {["ALL", "IMAGE", "VIDEO", "TEXT"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setGenerationFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      generationFilter === filter
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {filteredGenerations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredGenerations.map((job: any) => (
                  <div
                    key={job.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {job.capability}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                            job.status === "COMPLETED"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : job.status === "PROCESSING"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-800 line-clamp-3 leading-relaxed">
                        {job.prompt}
                      </p>

                      {/* Render Output Asset if Available */}
                      {job.outputAssets?.videoUrl && (
                        <div className="rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                          <video src={job.outputAssets.videoUrl} controls className="w-full h-full object-cover" />
                        </div>
                      )}
                      {job.outputAssets?.images && job.outputAssets.images.length > 0 && (
                        <div className="rounded-xl overflow-hidden bg-slate-100 aspect-square">
                          <img src={job.outputAssets.images[0].url} alt="Generated visual" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                      <span>{new Date(job.createdAt).toLocaleString()}</span>
                      <span className="font-bold text-slate-800">{job.creditsReserved || job.creditsConsumed || 0} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs">
                <FolderOpenIcon className="w-10 h-10 text-slate-300 mx-auto mb-2 stroke-1" />
                <span>No generation records match the selected filter.</span>
              </div>
            )}
          </div>
        )}

        {/* CREDITS & WALLET TAB */}
        {activeTab === "credits" && (
          <div className="space-y-8">
            {/* Packages Section */}
            <div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">Purchase AI Credit Packages</h3>
              <p className="text-xs text-slate-500 mb-5">
                Top up your shared credit wallet. Credits never expire and work across all AI capabilities.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(creditsData?.packages || []).map((pkg: any) => (
                  <div
                    key={pkg.name}
                    className={`bg-white rounded-2xl p-5 border flex flex-col justify-between relative transition-all ${
                      pkg.isPopular
                        ? "border-slate-900 shadow-md ring-2 ring-slate-900/10"
                        : "border-slate-200 shadow-2xs hover:border-slate-300"
                    }`}
                  >
                    {pkg.badge && (
                      <span className="absolute -top-2.5 right-4 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        {pkg.badge}
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-900">${pkg.price}</span>
                        <span className="text-xs font-semibold text-slate-500">/ {pkg.currency}</span>
                      </div>
                      <span className="inline-block mt-1 text-xs font-extrabold text-indigo-700">
                        {pkg.credits.toLocaleString()} Credits
                      </span>
                      <p className="text-xs text-slate-500 mt-3 leading-relaxed">{pkg.description}</p>
                      <ul className="mt-4 space-y-2 text-xs text-slate-600">
                        {pkg.features.map((feat: string, i: number) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 stroke-2 flex-shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedPackage(pkg);
                        setShowBuyModal(true);
                      }}
                      className={`w-full mt-6 py-2.5 rounded-xl font-bold text-xs transition ${
                        pkg.isPopular
                          ? "bg-slate-900 text-white hover:bg-slate-800 shadow-2xs"
                          : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                      }`}
                    >
                      Purchase Package
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Immutable Credit Ledger</h4>
                  <p className="text-xs text-slate-500">Real-time audit records</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase font-semibold">
                    <tr>
                      <th className="px-6 py-3">Timestamp</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Amount</th>
                      <th className="px-6 py-3">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(transactionsData?.transactions || []).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50 transition">
                        <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap font-medium">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              tx.type === "PURCHASE" || tx.type === "BONUS"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : tx.type === "REFUND" || tx.type === "RELEASE"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-800 font-semibold">{tx.description}</td>
                        <td
                          className={`px-6 py-3.5 font-bold ${
                            tx.amount > 0 ? "text-emerald-700" : "text-slate-800"
                          }`}
                        >
                          {tx.amount > 0 ? `+${tx.amount.toLocaleString()}` : tx.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 font-medium">
                          {tx.balanceAfter != null ? `${tx.balanceAfter.toLocaleString()} Credits` : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* USAGE & TELEMETRY TAB */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Monthly Requests</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">
                  {(usageData?.totalRequests || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Credits Consumed</span>
                <span className="text-3xl font-black text-indigo-700 mt-1 block">
                  {(usageData?.totalCreditsUsed || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Tokens Processed</span>
                <span className="text-3xl font-black text-purple-700 mt-1 block">
                  {(usageData?.totalTokensUsed || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <h4 className="font-bold text-slate-900 text-base mb-4">Breakdown by AI Capability</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(usageData?.byCapability || []).map((cap: any) => (
                  <div key={cap.capability} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-xs font-bold text-slate-700 block">{cap.capability}</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">
                      {cap.credits.toLocaleString()} Credits
                    </span>
                    <span className="text-[11px] text-slate-500 font-medium">{cap.requests} total requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Top-Up Payment Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl space-y-5 border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Top Up AI Credits ({selectedPackage?.name || "Credit Package"})
              </h3>
              <button onClick={() => setShowBuyModal(false)} className="p-1 rounded-lg hover:bg-slate-100 transition">
                <XMarkIcon className="w-5 h-5 text-slate-400 hover:text-slate-600 stroke-2" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">M-Pesa / Contact Phone</label>
              <input
                type="tel"
                value={phoneForPayment}
                onChange={(e) => setPhoneForPayment(e.target.value)}
                placeholder="e.g. 254712345678"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Credits to Add:</span>
                <span className="font-bold">{selectedPackage?.credits?.toLocaleString() || "1,000"} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold">${selectedPackage?.price || "10.00"}</span>
              </div>
            </div>

            <button
              disabled={buyCreditsMutation.isPending}
              onClick={() =>
                handlePurchasePackage(
                  selectedPackage || { id: "starter", name: "Starter AI", credits: 1000, price: 10 },
                )
              }
              className="w-full bg-slate-900 hover:bg-slate-800 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-2xs transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {buyCreditsMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Confirm & Credit Wallet</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}