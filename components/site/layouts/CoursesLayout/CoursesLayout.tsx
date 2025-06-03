"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface CoursesLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function CoursesHeaderLayout({ params, children }: CoursesLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    setFeaturedCourses(storeFormData.products.slice(0, 6));
    setCategories(storeFormData.StoreCategory);
    setFaqs(storeFormData.faqs.slice(0, 4));
  }, [storeFormData]);

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Child Content (Course Details) */}
      <section className="container">{children}</section>

      <Footer storeFormData={storeFormData} />
    </>
  );
}
