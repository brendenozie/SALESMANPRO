"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface CompanyPortfolioLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CompanyPortfolioLayout({ params, children }: CompanyPortfolioLayoutProps) {
  
  return (
    <>
      <Header />

      {/* Child Content */}
      <section >{children}</section>

      <Footer/>
    </>
  );
}