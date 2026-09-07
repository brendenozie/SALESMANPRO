"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface SaaSLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}


export default function SaaSLayout({ params, children }: SaaSLayoutProps) {
  
  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer/>
      </div>
    </>
  );
}