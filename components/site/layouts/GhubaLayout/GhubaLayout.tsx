
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
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
        {children}
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer/>
      </div>
    </>
  );
};

export default GhubaHeaderLayout;
