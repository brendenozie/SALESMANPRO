"use client";

import React, { ReactNode, } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface BookingsLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function BookingsHeaderLayout({ params, children }: BookingsLayoutProps) {
  const { storeFormData } = params;

  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer/>
      </div>
    </>
  );
}
