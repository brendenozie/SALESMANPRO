import { ThemeSectionContainer } from '@/lib/website-builder/createThemeSectionAdapter';
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  HomeIcon,
  ArrowPathIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { StoreForm } from "@/types/typings";

type Props = {
  pageData: StoreForm;
  companyId: string;
  status?: number;
  message?: string;
};

export default function DefaultSite({
  pageData,
  companyId,
  status = 404,
  message,
}: Props) {
  const router = useRouter();

  const messages: Record<number, string> = {
    404: "The page you’re looking for doesn’t exist or was moved.",
    500: "We’re experiencing a system error.",
    403: "You don’t have permission to view this page.",
  };

  const displayMessage =
    message || messages[status] || "Something unexpected happened.";

  
  const sectionContent = (
    <div id="section-default" data-editor-section="default" data-editor-component="DefaultSite" className="min-h-screen flex items-center justify-center bg-neutral-50 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-neutral-200 p-10 text-center"
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 0.6 }}
          className="absolute top-0 left-0 h-1 bg-neutral-900 rounded-t-2xl"
        />
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-6xl font-bold tracking-tight text-neutral-900"
        >
          {status}
        </motion.h1>
        <p className="mt-3 text-xl font-medium text-neutral-800">
          Something went wrong
        </p>
        <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">
          {displayMessage}
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition"
          >
            <HomeIcon className="h-4 w-4" />
            Go Home
          </button>
          <button
            onClick={() => router.refresh()}
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2 transition"
          >
            <ArrowPathIcon className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </motion.div>
    </div>
  );

  const sectionMap: Record<string, React.ReactNode> = {
    'default': sectionContent,
  };

  return (
    <ThemeSectionContainer sections={pageData?.sections} sectionMap={sectionMap} staticFallback={sectionContent} />
  );
}
