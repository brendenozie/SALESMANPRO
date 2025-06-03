"use client";

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "../../../../types/typings";

interface ServicesLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

export default function ServicesHeaderLayout({ params, children }: ServicesLayoutProps) {
  const { storeFormData } = params;

  return (
    <>
      <Header storeFormData={storeFormData} />
      <section className="container">{children}</section>
      <Footer storeFormData={storeFormData} />
    </>
  );
}