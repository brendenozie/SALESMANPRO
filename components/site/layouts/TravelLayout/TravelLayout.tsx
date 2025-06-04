"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface TravelLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function TravelLayout({ params, children }: TravelLayoutProps) {

  return (
    <>
      <Header/>
      <section className="container">{children}</section>
      <Footer/>
    </>
  );
}