"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface NonProfitLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function NonProfitHeaderLayout({ params, children }: NonProfitLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [programs, setPrograms] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setPrograms(storeFormData.products.slice(0, 4)); // use products for programs
    setStats([
      { label: "Projects Completed", value: 120 },
      { label: "Volunteers", value: 350 },
      { label: "Communities Helped", value: 45 },
    ]);
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 3));
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