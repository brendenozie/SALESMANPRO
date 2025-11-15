"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface EventsLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function EventsHeaderLayout({ params, children }: EventsLayoutProps) {
  
  return (
    <>
      <Header />
      {/* Child Content / Event Details */}
      <section >{children}</section>
      <Footer  />
    </>
  );
}
