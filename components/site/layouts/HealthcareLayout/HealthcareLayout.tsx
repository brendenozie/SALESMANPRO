
import React, { ReactNode } from "react";

import Header from "./header/Header";
import Footer from "./footer/Footer";

interface HealthcareLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function HealthcareHeaderLayout({
  params,
  children,
}: HealthcareLayoutProps) {

  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>
      <main >{children}</main>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer />
      </div>
    </>
  );
}
