
import React, { ReactNode, useState } from "react";
import { StoreForm } from "@/types/typings";
import Footer from "./footer/Footer";
import Header from "./header/Header";

interface GhubaHeaderLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const GhubaHeaderLayout: React.FC<GhubaHeaderLayoutProps> = (
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

export default GhubaHeaderLayout;
