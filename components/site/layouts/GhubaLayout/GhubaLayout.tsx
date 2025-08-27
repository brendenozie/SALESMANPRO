"use client"
import React, { ReactNode, useState } from "react";
import { StoreForm } from "../../../../types/typings";
import Footer from "./body/footer/Footer";
import Header from "./body/header/Header";

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
