"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface FinanceLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function FinanceHeaderLayout({ params, children }: FinanceLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Simulate financial services and FAQs
    setServices(store.products.slice(0, 6));
    setTestimonials(store.testimonials.slice(0, 3));
    setFaqs(store.faqs.slice(0, 4));
  }, [store]);

  return (
    <>
      <Header  />
      {/* store={store} */}

      {/* Child Content */}
      <section className="container">{children}</section>

      <Footer store={store} />
    </>
  );
}
