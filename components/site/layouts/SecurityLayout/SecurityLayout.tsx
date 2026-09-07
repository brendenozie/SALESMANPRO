"use client";

import React, { ReactNode,} from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface PortfolioLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}


export default function PortfolioHeaderLayout({ params, children }: PortfolioLayoutProps) {
 
  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
      <section >{children}</section>      
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer />
      </div>
    </>
  );
}
