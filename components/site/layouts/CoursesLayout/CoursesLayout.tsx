"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface CoursesLayoutProps {
  params: { store: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CoursesHeaderLayout({ params, children }: CoursesLayoutProps) {
  const { store } = params;
  const router = useRouter();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setFeaturedCourses(store.products.slice(0, 6));
    setCategories(store.StoreCategory);
    setFaqs(store.faqs.slice(0, 4));
  }, [store]);

  return (
    <>
      <Header store={store} />


      {/* Child Content (Course Details) */}
      <section className="container mx-auto px-6 py-12 bg-white">{children}</section>

      <Footer store={store} />
    </>
  );
}
