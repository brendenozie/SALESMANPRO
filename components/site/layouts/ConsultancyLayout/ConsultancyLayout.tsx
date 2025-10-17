"use client"

import React, { ReactNode, useState } from "react";
import { useStateContext } from "@/contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { StoreForm } from "@/types/typings";

interface ConsultancyLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}


const ConsultancyLayout: React.FC<ConsultancyLayoutProps> = (
  {
    params,
    children,
  }: {
    params: { storeFormData: StoreForm };
    children: ReactNode;
  }
) => {
  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const primary = params.storeFormData?.themeSettings?.primaryColor || "#f97316";
  const secondary = params.storeFormData?.themeSettings?.secondaryColor || "#3b82f6";

  return (
    <>
      <Header storeFormData={params.storeFormData as any} />

      <section className="container">{children}</section>

      <Footer storeFormData={params.storeFormData} />
    </>
  );
};

export default ConsultancyLayout;
