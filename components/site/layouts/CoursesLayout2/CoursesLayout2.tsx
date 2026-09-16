import React, { ReactNode } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface CoursesLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function CoursesHeaderLayout({ params, children }: CoursesLayoutProps) {
  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header />
      </div>
      {/* Child Content (Course Details) */}
      <section>{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer />
      </div>
    </>
  );
}
