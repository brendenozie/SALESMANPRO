"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface RestaurantLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function RestaurantHeaderLayout({ params, children }: RestaurantLayoutProps) {
  

  return (
    <>
      <div id="section-header" data-editor-section="header" data-editor-component="Header">
        <Header/>
      </div>
      {/* Main Content Area */}
      <section >{children}</section>
      <div id="section-footer" data-editor-section="footer" data-editor-component="Footer">
        <Footer/>
      </div>
    </>
  );
}