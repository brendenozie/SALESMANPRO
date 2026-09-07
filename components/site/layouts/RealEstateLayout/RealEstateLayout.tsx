"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Link from "next/link";

interface RealEstateLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateHeaderLayout({ params, children }: RealEstateLayoutProps) {
  const { storeFormData } = params;
  

  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
      {/* Main Content Area */}
      <section >{children}</section>

      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer/>
      </div>
    </>
  );
}
