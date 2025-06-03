"use client";

import React, { ReactNode, } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DirectoryLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DirectoryHeaderLayout({ params, children }: DirectoryLayoutProps) {
  const { storeFormData } = params;
  return (
    <>
      <Header/>
      {/* Child Content */}
      <section className="container">{children}</section>
      <Footer storeFormData={storeFormData} />
    </>
  );
}
