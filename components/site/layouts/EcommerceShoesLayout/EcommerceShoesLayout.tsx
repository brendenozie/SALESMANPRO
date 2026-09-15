import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import { StoreForm } from "@/types/typings";

interface EcommerceShoesHeaderLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const EcommerceShoesHeaderLayout: React.FC<EcommerceShoesHeaderLayoutProps> = (
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

export default EcommerceShoesHeaderLayout;
