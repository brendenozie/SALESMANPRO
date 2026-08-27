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
      <Header/>
      <section >{children}</section>
      <Footer/>
    </>
  );
}