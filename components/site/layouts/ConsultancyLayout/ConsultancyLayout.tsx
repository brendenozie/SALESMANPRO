"use client"

import React, { ReactNode, useState } from "react";
import { useStateContext } from "@/contexts/ContextProvider";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "@/types/typings";

interface ConsultancyLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const ConsultancyLayout: React.FC<ConsultancyLayoutProps> = (
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
      <Header storeFormData={params.storeFormData as any} />
      <section >{children}</section>
      <Footer storeFormData={params.storeFormData} />
    </>
  );
};

export default ConsultancyLayout;
