"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface FinanceLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function FinanceHeaderLayout({ params, children }: FinanceLayoutProps) {

  return (
    <>
      <Header />

      {/* Child Content */}
      <section className="container">{children}</section>

      <Footer/>
    </>
  );
}
