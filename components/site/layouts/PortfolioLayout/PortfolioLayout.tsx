"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface PortfolioLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

export default function PortfolioHeaderLayout({ params, children }: PortfolioLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Use products as projects
    setProjects(storeFormData.products.slice(0, 6));
    setTestimonials(storeFormData.testimonials.slice(0, 3));
    setFaqs(storeFormData.faqs.slice(0, 3));
  }, [storeFormData]);

  return (
    <>
      <Header
        name={`${storeFormData.name}`}
        logoUrl={storeFormData.logoUrl}
        primaryColor={storeFormData.primaryColor} 
        links={[
          { label: "Home", href: "/" },
          { label: "Projects", href: "#projects" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ]}
      />

      {/* Main Content Area */}
      <section className="container">{children}</section>
      
      <Footer storeFormData={storeFormData} />
    </>
  );
}
