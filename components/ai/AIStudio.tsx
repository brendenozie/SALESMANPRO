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
  ArrowTopRightOnSquareIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  CpuChipIcon,
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
} from "@/hooks/useAI";

type ActiveTab = "overview" | "text" | "image" | "video" | "product" | "credits" | "analytics";

export default function AIStudio() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [copiedText, setCopiedText] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [phoneForPayment, setPhoneForPayment] = useState("");

  // AI Hooks
  const { data: creditsData, isLoading: creditsLoading, refetch: refetchCredits } = useAICredits();
  const { data: modelsData } = useAIModels();
  const { data: transactionsData } = useAICreditTransactions(1, 10);
  const { data: usageData } = useAIUsageAnalytics("month");
  const { data: generationsData } = useAIGenerations(1, 12);

  // Mutations
  const textMutation = useGenerateText();
  const imageMutation = useGenerateImage();
  const videoMutation = useGenerateVideo();
  const productMutation = useProductAI();
  const buyCreditsMutation = useBuyAICredits();

  // Text Tab State
  const [textPrompt, setTextPrompt] = useState("");
  const [textModel, setTextModel] = useState("gemini-2.0-flash");
  const [textTone, setTextTone] = useState("compelling");
  const [textType, setTextType] = useState("product_description");
  const [generatedTextOutput, setGeneratedTextOutput] = useState<any>(null);

  // Image Tab State
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [imageAspectRatio, setImageAspectRatio] = useState<"1:1" | "16:9" | "9:16">("1:1");
  const [imageAction, setImageAction] = useState<any>("GENERATE_IMAGE");
  const [generatedImages, setGeneratedImages] = useState<any[]>([]);

  // Video Tab State
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoDuration, setVideoDuration] = useState(5);
  const [videoAspectRatio, setVideoAspectRatio] = useState<"16:9" | "9:16" | "1:1">("16:9");

  // Product Tab State
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productFeatures, setProductFeatures] = useState("");
  const [productOutput, setProductOutput] = useState<any>(null);

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
      setActiveTab("overview");
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
        features: productFeatures ? productFeatures.split(",").map((f) => f.trim()) : undefined,
      });
      setProductOutput(res);
    } catch (err: any) {
      console.error(err);
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 antialiased">
      {/* Top Sticky Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-200 ring-4 ring-indigo-50">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold bg-gradient-to-r from-indigo-800 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  SalesmanPro AI Studio
                </h1>
                <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-full">
                  Central Engine
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Tenant: <span className="font-semibold text-slate-700">{companyName}</span>
              </p>
            </div>
          </div>

          {/* Credit Wallet Summary & Action */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-200/80 px-4 py-2 rounded-xl shadow-xs">
              <BoltSolidIcon className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] font-bold tracking-wide uppercase text-amber-800 block leading-tight">
                  Credit Balance
                </span>
                <span className="text-sm font-black text-amber-950">
                  {creditsLoading ? "..." : balance.toLocaleString()} Credits
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowBuyModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] transition-all text-white px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md shadow-indigo-200"
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
            { id: "text", label: "Text & Copywriter", icon: DocumentTextIcon },
            { id: "image", label: "Image Studio", icon: PhotoIcon },
            { id: "video", label: "Video Reel Studio", icon: VideoCameraIcon },
            { id: "product", label: "Product Catalog AI", icon: ShoppingBagIcon },
            { id: "credits", label: "Wallet & Ledger", icon: CreditCardIcon },
            { id: "analytics", label: "Usage & Telemetry", icon: ChartBarIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
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
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <ShoppingBagIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Product Content AI</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Generate 1-click descriptions, SEO meta tags, catalog specs, and bullet lists.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Open Catalog AI <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("image")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <PhotoIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Image Studio</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Render studio product shots, isolate backgrounds, and make marketing visuals.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Generate Images <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("video")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <VideoCameraIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">AI Video Reels</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Build dynamic short videos and promotional reels directly for social channels.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Create Video <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>

              <div
                onClick={() => setActiveTab("credits")}
                className="group cursor-pointer bg-white p-5 rounded-2xl border border-slate-200/80 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <CreditCardIcon className="w-6 h-6 stroke-[1.75]" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">Credit Wallet</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {balance.toLocaleString()} available credits. Inspect real-time audit ledger.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 mt-5 group-hover:translate-x-0.5 transition-transform">
                  Manage Wallet <ArrowRightIcon className="w-3.5 h-3.5 stroke-2" />
                </span>
              </div>
            </div>

            {/* Architecture Banner */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-emerald-800/80 border border-emerald-600/50 flex items-center justify-center flex-shrink-0">
                  <ShieldCheckIcon className="w-6 h-6 text-emerald-300 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Unified AI Wallet Engine</h4>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                    Your WhatsApp AI Concierge and Web Studio share the exact same tenant wallet, authorization parameters, and model registry.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab("analytics")}
                className="text-xs font-bold bg-white text-emerald-950 px-4 py-2.5 rounded-xl hover:bg-emerald-50 transition active:scale-95 shadow-sm whitespace-nowrap"
              >
                View Telemetry
              </button>
            </div>

            {/* Recent Generations Gallery */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Recent AI Generations</h3>
                  <p className="text-xs text-slate-500">Auto-persisted to store Media Library</p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  Syncing Live
                </span>
              </div>

              {generationsData?.jobs && generationsData.jobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {generationsData.jobs.map((job: any) => (
                    <div key={job.id} className="border border-slate-200/80 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5 hover:bg-white hover:border-slate-300 transition">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {job.capability}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md ${job.status === "COMPLETED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : job.status === "PROCESSING"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-slate-200 text-slate-700"
                            }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">{job.prompt}</p>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-200/60 font-medium">
                        <span className="flex items-center gap-1">
                          <ClockIcon className="w-3 h-3 stroke-2" />
                          {new Date(job.createdAt).toLocaleDateString()}
                        </span>
                        <span>{job.creditsReserved} Credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
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
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
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
                      className={`text-xs capitalize py-2 px-3 rounded-xl border font-semibold transition ${textTone === tone
                          ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-xs"
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {textMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                    <span>Generating Copy...</span>
                  </>
                ) : (
                  <>
                    <CpuChipIcon className="w-4 h-4 stroke-2" />
                    <span>Generate Copy</span>
                  </>
                )}
              </button>

              {textMutation.isError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 flex-shrink-0 stroke-2 text-rose-600" />
                  <span>{(textMutation.error as any)?.message || "Failed to generate text"}</span>
                </div>
              )}
            </div>

            {/* Output Display */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <h4 className="font-bold text-slate-900 text-base">Generated Result</h4>
                  {generatedTextOutput && (
                    <button
                      onClick={() => handleCopy(generatedTextOutput.text)}
                      className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition"
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
                    <div className="bg-slate-50 p-4.5 rounded-xl text-slate-800 text-xs sm:text-sm whitespace-pre-wrap leading-relaxed border border-slate-200/80 font-normal">
                      {generatedTextOutput.text}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                      <span>Model: <strong className="text-slate-700">{generatedTextOutput.model}</strong></span>
                      <span>Tokens: <strong className="text-slate-700">{generatedTextOutput.totalTokens}</strong></span>
                      <span>Credits: <strong className="text-slate-700">{generatedTextOutput.creditsConsumed}</strong></span>
                      <span>Speed: <strong className="text-slate-700">{generatedTextOutput.executionTimeMs}ms</strong></span>
                    </div>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
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
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
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
                  <option value="GENERATE_IMAGE">Generate from Prompt Description</option>
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
                      className={`text-xs py-2 px-3 rounded-xl border font-semibold transition ${imageAspectRatio === ratio.id
                          ? "border-purple-600 bg-purple-50 text-purple-700 shadow-xs"
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

              <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                <span>Standard Generation:</span>
                <span className="font-bold">20 Credits</span>
              </div>

              <button
                type="button"
                disabled={imageMutation.isPending || !imagePrompt}
                onClick={handleGenerateImage}
                className="w-full bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-md shadow-purple-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
              >
                {imageMutation.isPending ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                    <span>Rendering Visual...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-4 h-4 stroke-2" />
                    <span>Generate AI Image</span>
                  </>
                )}
              </button>
            </div>

            {/* Gallery Section */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-900 text-base mb-4 border-b border-slate-100 pb-3">
                Session Output Gallery
              </h4>

              {generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedImages.map((img, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden group bg-slate-100 relative shadow-xs">
                      <img src={img.url} alt="Generated visual" className="w-full h-56 object-cover" />
                      <div className="p-3 bg-white flex items-center justify-between border-t border-slate-100">
                        <span className="text-[11px] text-slate-500 font-medium">In Store Library</span>
                        <a
                          href={img.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-bold text-purple-600 hover:underline flex items-center gap-1"
                        >
                          <span>Full Res</span>
                          <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 stroke-2" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <PhotoIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                  <span>Rendered image assets will display here</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIDEO REELS TAB */}
        {activeTab === "video" && (
          <div className="max-w-2xl mx-auto bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <VideoCameraIcon className="w-5 h-5 text-rose-600 stroke-2" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">AI Video Reel Creator</h3>
                <p className="text-xs text-slate-500">Async processing queue engine</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Clip Duration</label>
              <select
                value={videoDuration}
                onChange={(e) => setVideoDuration(parseInt(e.target.value, 10))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none"
              >
                <option value={5}>5 Seconds Reel (50 Credits)</option>
                <option value={10}>10 Seconds Showcase (100 Credits)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Aspect Ratio</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "16:9", label: "16:9 Landscape" },
                  { id: "9:16", label: "9:16 Reels / TikTok" },
                  { id: "1:1", label: "1:1 Square" },
                ].map((ratio) => (
                  <button
                    key={ratio.id}
                    type="button"
                    onClick={() => setVideoAspectRatio(ratio.id as any)}
                    className={`text-xs py-2 px-3 rounded-xl border font-semibold transition ${videoAspectRatio === ratio.id
                        ? "border-rose-600 bg-rose-50 text-rose-700 shadow-xs"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">Prompt Concept</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={4}
                placeholder="e.g. 3D rotation of luxury chronograph watch with subtle fluid motion..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition leading-relaxed"
              />
            </div>

            <button
              type="button"
              disabled={videoMutation.isPending || !videoPrompt}
              onClick={handleGenerateVideo}
              className="w-full bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-semibold py-3 rounded-xl shadow-md shadow-rose-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs"
            >
              {videoMutation.isPending ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin stroke-2" />
                  <span>Submitting to Queue...</span>
                </>
              ) : (
                <>
                  <VideoCameraIcon className="w-4 h-4 stroke-2" />
                  <span>Dispatch Video Worker</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* PRODUCT CATALOG AI TAB */}
        {activeTab === "product" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBagIcon className="w-5 h-5 text-blue-600 stroke-2" />
                <h3 className="font-bold text-slate-900 text-base">Product Catalog AI</h3>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Ergonomic Executive Office Mesh Chair"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Category</label>
                <input
                  type="text"
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  placeholder="e.g. Furniture / Office Supplies"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Features (comma separated)</label>
                <textarea
                  value={productFeatures}
                  onChange={(e) => setProductFeatures(e.target.value)}
                  rows={3}
                  placeholder="Lumbar support, breathable mesh, adjustable armrests, 360 swivel base"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-normal text-slate-800 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("DESCRIPTION")}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <DocumentTextIcon className="w-4 h-4 stroke-2" />
                  <span>Generate Descriptions & Bullets</span>
                </button>

                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("SEO")}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <SparklesIcon className="w-4 h-4 stroke-2" />
                  <span>Generate Meta & Tags</span>
                </button>

                <button
                  type="button"
                  disabled={productMutation.isPending || !productName}
                  onClick={() => handleGenerateProductContent("ATTRIBUTES")}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 rounded-xl text-xs transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Squares2X2Icon className="w-4 h-4 stroke-2" />
                  <span>Extract JSON Attributes</span>
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-900 text-base mb-3 border-b border-slate-100 pb-3">
                Structured Catalog Preview
              </h4>

              {productOutput ? (
                <div className="space-y-4 text-xs text-slate-800">
                  <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono leading-relaxed">
                    {JSON.stringify(productOutput, null, 2)}
                  </pre>
                  <button
                    onClick={() => handleCopy(JSON.stringify(productOutput, null, 2))}
                    className="flex items-center gap-1.5 font-bold text-blue-600 hover:underline"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 stroke-2" />
                    <span>Copy Structured JSON</span>
                  </button>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <ShoppingBagIcon className="w-8 h-8 mb-2 text-slate-300 stroke-1" />
                  <span>Catalog descriptions and metadata will output here</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* WALLET & LEDGER TAB */}
        {activeTab === "credits" && (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">
                  Authoritative Tenant Wallet
                </span>
                <h2 className="text-4xl font-black mt-1 text-white">{balance.toLocaleString()} Credits</h2>
                <p className="text-xs text-slate-300 mt-2">
                  Deducts across Web AI, WhatsApp Concierge, Image Studio, and Video Reels.
                </p>
              </div>
              <button
                onClick={() => setShowBuyModal(true)}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-bold px-6 py-3 rounded-xl shadow-md transition active:scale-[0.98] text-xs sm:text-sm"
              >
                Top Up AI Credits
              </button>
            </div>

            {/* Packages */}
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-4">Select Credit Package</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(creditsData?.packages || []).map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`bg-white rounded-2xl p-5 border transition flex flex-col justify-between ${pkg.isPopular
                        ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/10"
                        : "border-slate-200/80 hover:border-indigo-300"
                      }`}
                  >
                    <div>
                      {pkg.badge && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 inline-block mb-3 border border-indigo-100">
                          {pkg.badge}
                        </span>
                      )}
                      <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                      <div className="mt-2 mb-3">
                        <span className="text-2xl font-black text-slate-900">${pkg.price}</span>
                        <span className="text-xs text-slate-400 font-medium ml-1">/ {pkg.credits.toLocaleString()} Credits</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-4">{pkg.description}</p>
                      <ul className="space-y-2 mb-6 text-xs text-slate-600">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <CheckCircleIcon className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-2" />
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
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition ${pkg.isPopular
                          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs"
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
            <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
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
                      <tr key={tx.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-6 py-3.5 text-slate-500 whitespace-nowrap font-medium">
                          {new Date(tx.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${tx.type === "PURCHASE" || tx.type === "BONUS"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : tx.type === "REFUND" || tx.type === "RELEASE"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-800 font-semibold">{tx.description}</td>
                        <td
                          className={`px-6 py-3.5 font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-slate-800"
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
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Monthly Requests</span>
                <span className="text-3xl font-black text-slate-900 mt-1 block">
                  {(usageData?.totalRequests || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Credits Consumed</span>
                <span className="text-3xl font-black text-indigo-600 mt-1 block">
                  {(usageData?.totalCreditsUsed || 0).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                <span className="text-xs text-slate-500 font-semibold block">Total Tokens Processed</span>
                <span className="text-3xl font-black text-purple-600 mt-1 block">
                  {(usageData?.totalTokensUsed || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
              <h4 className="font-bold text-slate-900 text-base mb-4">Breakdown by AI Capability</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {(usageData?.byCapability || []).map((cap: any) => (
                  <div key={cap.capability} className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                    <span className="text-xs font-bold text-slate-700 block">{cap.capability}</span>
                    <span className="text-xl font-black text-slate-900 mt-1 block">
                      {cap.credits.toLocaleString()} Credits
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{cap.requests} total requests</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Top-Up Payment Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                Top Up AI Credits ({selectedPackage?.name || "Credit Package"})
              </h3>
              <button
                onClick={() => setShowBuyModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 transition"
              >
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

            <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-2xl text-xs text-indigo-950 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600">Credits to Add:</span>
                <span className="font-bold">{selectedPackage?.credits?.toLocaleString() || "1,000"} Credits</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Amount:</span>
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs sm:text-sm"
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