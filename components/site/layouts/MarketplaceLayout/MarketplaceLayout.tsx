"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface MarketplaceLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MarketplaceHeaderLayout({ params, children }: MarketplaceLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    setCategories(storeFormData.StoreCategory.slice(0, 6));
    setFeatured(storeFormData.products.slice(0, 8));
    setPromotions(storeFormData.promotions.slice(0, 4));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
  }, [storeFormData]);

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Child Content (Category/Product Pages) */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}
