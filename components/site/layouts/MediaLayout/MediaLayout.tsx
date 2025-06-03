"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface MediaLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function MediaHeaderLayout({ params, children }: MediaLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setFeaturedArticles(storeFormData.products.slice(0, 4)); // using products as articles
    setCategories(storeFormData.StoreCategory);
    setLatestVideos(storeFormData.heroSlides.slice(0, 4));
    setFaqs(storeFormData.faqs.slice(0, 3));
  }, [storeFormData]);

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Content Area */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}