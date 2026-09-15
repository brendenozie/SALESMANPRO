
import React, { ReactNode } from "react";
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
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header storeFormData={params.storeFormData as any} />
      </div>
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer storeFormData={params.storeFormData} />
      </div>
    </>
  );
};

export default PublicSpeakingLayout;
