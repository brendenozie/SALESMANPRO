"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Link from "next/link";

interface RealEstateLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function RealEstateHeaderLayout({ params, children }: RealEstateLayoutProps) {
  const { store } = params;
  

  return (
    <>
      <Header store={store} />
      {/* Main Content Area */}
      <section className="container">{children}</section>

      <Footer store={store} />
    </>
  );
}
