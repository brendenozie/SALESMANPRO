
"use client";

import React, { ReactNode, useEffect } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface CompanyPortfolioLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function CompanyPortfolioLayout({ params, children }: CompanyPortfolioLayoutProps) {
  useEffect(() => {
    // Lock html and body background to zinc-950 (#09090b) so rapid scrolling and rubber-banding overscroll never flash white
    const prevBodyBg = document.body.style.backgroundColor;
    const prevHtmlBg = document.documentElement.style.backgroundColor;
    const prevColor = document.body.style.color;

    document.documentElement.classList.add("dark");
    document.documentElement.style.backgroundColor = "#09090b";
    document.body.style.backgroundColor = "#09090b";
    document.body.style.color = "#f4f4f5";

    return () => {
      document.documentElement.style.backgroundColor = prevHtmlBg;
      document.body.style.backgroundColor = prevBodyBg;
      document.body.style.color = prevColor;
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 flex flex-col selection:bg-amber-500 selection:text-black">
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>

      {/* Child Content */}
      <main className="flex-1 w-full bg-zinc-950">{children}</main>

      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer" className="mt-auto bg-zinc-950">
        <Footer />
      </div>
    </div>
  );
}