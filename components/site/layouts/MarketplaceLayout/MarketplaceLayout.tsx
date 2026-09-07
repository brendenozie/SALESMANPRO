"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface MarketplaceLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MarketplaceHeaderLayout({ params, children }: MarketplaceLayoutProps) {
  
  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>

      {/* Child Content (Category/Product Pages) */}
      <section >{children}</section>

      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer storeFormData={params.storeFormData} />
      </div>
    </>
  );
}
