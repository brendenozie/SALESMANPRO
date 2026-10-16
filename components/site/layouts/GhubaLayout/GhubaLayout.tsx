
"use client";

import React, { ReactNode, useEffect } from "react";
import { StoreForm } from "@/types/typings";
import Footer from "./footer/Footer";
import Header from "./header/Header";

interface GhubaHeaderLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const GhubaHeaderLayout: React.FC<GhubaHeaderLayoutProps> = ({
  params,
  children,
}: {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}) => {
  useEffect(() => {
    // Keep root html/body canvas background synced with dark/light mode
    // to prevent white flashing during fast compositor flings and rubber-band overscroll
    const syncCanvasBackground = () => {
      const isDark = document.documentElement.classList.contains("dark");
      const targetColor = isDark ? "#080808" : "#ffffff";
      document.body.style.backgroundColor = targetColor;
      document.documentElement.style.backgroundColor = targetColor;
    };

    syncCanvasBackground();

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.attributeName === "class") {
          syncCanvasBackground();
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#080808] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-white">
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>
      <div className="flex-1 w-full bg-white dark:bg-[#080808]">{children}</div>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer" className="mt-auto bg-white dark:bg-[#080808]">
        <Footer />
      </div>
    </div>
  );
};

export default GhubaHeaderLayout;
