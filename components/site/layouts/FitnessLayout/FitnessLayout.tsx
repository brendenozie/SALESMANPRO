"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface FitnessLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function FitnessHeaderLayout({ params, children }: FitnessLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [classes, setClasses] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Use products for classes, categories for trainers
    setClasses(storeFormData.products.slice(0, 6));
    setTrainers(storeFormData.StoreCategory.slice(0, 4));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 4));
  }, [storeFormData]);

  return (
    <>
      <Header  />

      {/* Child Content */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}