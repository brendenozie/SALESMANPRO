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
      <Header/>
      {/* Main Content Area */}
      <section className="container">{children}</section>
      <Footer/>
    </>
  );
}