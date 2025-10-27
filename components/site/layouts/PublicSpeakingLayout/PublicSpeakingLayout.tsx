"use client"

import React, { ReactNode, useState } from "react";
import { useStateContext } from "@/contexts/ContextProvider";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "@/types/typings";

interface PublicSpeakingLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const PublicSpeakingLayout: React.FC<PublicSpeakingLayoutProps> = (
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
      <section className="container">{children}</section>
      <Footer storeFormData={params.storeFormData} />
    </>
  );
};

export default PublicSpeakingLayout;
