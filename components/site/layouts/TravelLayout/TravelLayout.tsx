"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface TravelLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function TravelLayout({ params, children }: TravelLayoutProps) {
  const { store } = params;
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 6));
    setFeatured(store.products.slice(0, 6));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const navigateTo = (path: string) => router.push(`/${store.slug}/${path}`);

  return (
    <>
      {/* Sticky Transparent Header */}
      <Header store={store}/>
      {/* className="fixed w-full z-50 bg-opacity-50 backdrop-blur"  */}


      {/* Content */}
      <section className="container mx-auto px-8 py-16 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}