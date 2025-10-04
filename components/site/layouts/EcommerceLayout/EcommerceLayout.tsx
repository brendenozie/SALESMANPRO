"use client"
import React, { ReactNode, useState } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "@/types/typings";

interface EcommerceHeaderLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const EcommerceHeaderLayout: React.FC<EcommerceHeaderLayoutProps> = (
  {
    params,
    children,
  }: {
    params: { storeFormData: StoreForm };
    children: ReactNode;
  }
) => {

  return (
    <>
      <Header/>
        {children}
      <Footer/>
    </>
  );
};

export default EcommerceHeaderLayout;
