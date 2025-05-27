"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface BookingsLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BookingsLayout({ params, children }: BookingsLayoutProps) {
  const { store } = params;

  return (
    <>
      <Header store={store} />
      
      {/* Child Content (Booking Form / Confirmation) */}
      <section className="container mx-auto px-6 py-12">{children}</section>

      <Footer store={store} />
    </>
  );
}
