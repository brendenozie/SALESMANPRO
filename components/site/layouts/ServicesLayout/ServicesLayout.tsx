"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface ServicesLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function ServicesHeaderLayout({ params, children }: ServicesLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [featuredServices, setFeaturedServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(storeFormData.StoreCategory.slice(0, 6));
    setFeaturedServices(storeFormData.products.slice(0, 6));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 3));
  }, [storeFormData]);

  const handleInquiry = (serviceId: string) => {
    router.push(`/${storeFormData.slug}/service/${serviceId}`);
  };

  const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
    `${src}?w=${width}&q=${quality || 75}`;

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Main Content Area */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}