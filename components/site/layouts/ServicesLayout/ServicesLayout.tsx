"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "@/types/typings";

interface ServicesLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

export default function ServicesHeaderLayout({ params, children }: ServicesLayoutProps) {
  const { storeFormData } = params;

  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header storeFormData={storeFormData} />
      </div>
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer storeFormData={storeFormData} />
      </div>
    </>
  );
}