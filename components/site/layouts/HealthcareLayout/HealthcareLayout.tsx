"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface HealthcareLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function HealthcareHeaderLayout({ params, children }: HealthcareLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setServices(storeFormData.products.slice(0, 6));
    setDoctors(storeFormData.StoreCategory.slice(0, 4));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 4));
  }, [storeFormData]);

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Child Content */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}