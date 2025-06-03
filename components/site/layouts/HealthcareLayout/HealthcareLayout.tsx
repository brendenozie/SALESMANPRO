"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
      <Header />

      {/* Main Content */}
      <main className="container">{children}</main>

      <Footer />
    </>
  );
}
