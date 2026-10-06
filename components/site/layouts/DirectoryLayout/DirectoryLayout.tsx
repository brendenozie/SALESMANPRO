
import React, { ReactNode } from "react";
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
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
        <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer />
      </div>
    </>
  );
}
