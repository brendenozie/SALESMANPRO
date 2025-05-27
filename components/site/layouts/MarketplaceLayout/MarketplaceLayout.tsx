"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface MarketplaceLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MarketplaceHeaderLayout({ params, children }: MarketplaceLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 6));
    setFeatured(store.products.slice(0, 8));
    setPromotions(store.promotions.slice(0, 4));
    setTestimonials(store.testimonials.slice(0, 3));
  }, [store]);

  return (
    <>
      <Header store={store} />

      {/* Child Content (Category/Product Pages) */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}
