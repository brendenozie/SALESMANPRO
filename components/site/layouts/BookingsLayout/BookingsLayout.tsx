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
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function BookingsLayout({ params, children }: BookingsLayoutProps) {
  const { storeFormData } = params;

  return (
    <>
      <Header storeFormData={storeFormData} />
      
      {/* Child Content (Booking Form / Confirmation) */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}
