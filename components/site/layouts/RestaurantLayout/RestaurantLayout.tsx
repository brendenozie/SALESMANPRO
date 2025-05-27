"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface RestaurantLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function RestaurantHeaderLayout({ params, children }: RestaurantLayoutProps) {
  const { store } = params;

  return (
    <>
      <Header store={store} />


      {/* Main Content Area */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}