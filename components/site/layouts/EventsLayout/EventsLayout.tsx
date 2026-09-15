
import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface EventsLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}


export default function EventsHeaderLayout({ params, children }: EventsLayoutProps) {
  
  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>
      {/* Child Content / Event Details */}
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer  />
      </div>
    </>
  );
}
