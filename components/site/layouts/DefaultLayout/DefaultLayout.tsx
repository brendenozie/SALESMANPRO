// components/site/layouts/DefaultHeaderLayout.tsx
"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DefaultHeaderLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DefaultHeaderLayout({ params, children }: DefaultHeaderLayoutProps) {
  const { store } = params;
  

  return (
    <>
      <Header store={store} />

      {/* Main Content */}
      <section className="container">{children}</section>

      <Footer store={store} />
    </>
  );
}
