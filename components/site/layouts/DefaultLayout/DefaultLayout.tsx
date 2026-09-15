// components/site/layouts/DefaultHeaderLayout.tsx

import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DefaultHeaderLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}


export default function DefaultHeaderLayout({ params, children }: DefaultHeaderLayoutProps) {
  const { storeFormData } = params;
  

  return (
    <>
      {/* <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header storeFormData={storeFormData} />
      </div> */}

      {/* Main Content */}
      <section >{children}</section>

      {/* <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer storeFormData={storeFormData} />
      </div> */}
    </>
  );
}
