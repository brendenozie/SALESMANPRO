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
  const { storeFormData } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(storeFormData.StoreCategory.slice(0, 6));
    setFeatured(storeFormData.products.slice(0, 6));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 3));
  }, [storeFormData]);

  const navigateTo = (path: string) => router.push(`/${storeFormData.slug}/${path}`);

  return (
    <>
      {/* Sticky Transparent Header */}
      <Header storeFormData={storeFormData}/>

      {/* Content */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}