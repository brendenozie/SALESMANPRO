"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DirectoryLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DirectoryHeaderLayout({ params, children }: DirectoryLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCategories(storeFormData.StoreCategory.slice(0, 6));
    setListings(storeFormData.products.slice(0, 8));
    setFaqs(storeFormData.faqs.slice(0, 3));
  }, [storeFormData]);

  const handleSearch = () => {
    router.push(`/${storeFormData.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Child Content */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}
