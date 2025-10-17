"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface SaaSLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}


export default function SaaSLayout({ children }: SaaSLayoutProps) {
  
  return (
    <>
      <Header/>
      {/* Main Content Area */}
      <section className="container">{children}</section>
      <Footer/>
    </>
  );
}