"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";

interface HealthcareLayoutProps {
  params: { storeFormData: any };
  children: ReactNode;
}

export default function HealthcareHeaderLayout({
  params,
  children,
}: HealthcareLayoutProps) {
  const { storeFormData } = params;
  const router = useRouter();

  const [services, setServices] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    // Map to the correct fields from storeFormData
    // setServices(storeFormData.services?.slice(0, 6) || []);
    // setDoctors(storeFormData.doctors?.slice(0, 4) || []);
    // setTestimonials(storeFormData.testimonials?.slice(0, 3) || []);
    // setFaqs(storeFormData.faqs?.slice(0, 4) || []);
  }, [storeFormData]);

  return (
    <>
      <Header storeFormData={storeFormData} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">{children}</main>

      <Footer storeFormData={storeFormData} />
    </>
  );
}
