"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface DirectoryLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function DirectoryHeaderLayout({ params, children }: DirectoryLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [listings, setListings] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCategories(store.StoreCategory.slice(0, 6));
    setListings(store.products.slice(0, 8));
    setFaqs(store.faqs.slice(0, 3));
  }, [store]);

  const handleSearch = () => {
    router.push(`/${store.slug}/search?q=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <>
      <Header store={store} />

      {/* Child Content */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}
