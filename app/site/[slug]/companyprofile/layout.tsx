"use client";

import React, { useEffect } from "react";

export default function CompanyProfileSubpagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="w-full min-h-screen bg-zinc-950 text-zinc-100 selection:bg-amber-500 selection:text-black">
      {children}
    </div>
  );
}
