"use client";

import React, { useState, useEffect } from "react";
import AgentNav from "./AgentNav";
import type { ResolvedAgentContext } from "@/lib/auth/agentGuard";

interface AgentLayoutProps {
  context: ResolvedAgentContext;
  children: React.ReactNode;
}

export default function AgentLayout({ context, children }: AgentLayoutProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDarkMode(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-orange-500/20 transition-colors">
      <AgentNav context={context} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
      <div className="flex flex-1">
        <main className="flex-1 md:pl-64 p-4 md:p-8 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}
