"use client";

import React, { ReactNode, } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DirectoryLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function DirectoryHeaderLayout({ params, children }: DirectoryLayoutProps) {
  const { storeFormData } = params;
  return (
    <>
      <Header/>
        <section className="container">{children}</section>
      <Footer storeFormData={storeFormData} />
    </>
  );
}
