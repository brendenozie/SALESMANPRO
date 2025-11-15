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
      <Header/>
      <section >{children}</section>      
      <Footer />
    </>
  );
}
