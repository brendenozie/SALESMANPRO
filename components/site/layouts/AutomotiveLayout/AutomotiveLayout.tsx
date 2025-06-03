"use client"

import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Image from "next/image";
import Link from "next/link";
import { StoreForm } from "../../../../types/typings";

interface AutomotiveLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}


const AutomotiveLayout: React.FC<AutomotiveLayoutProps> = (
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
      <Header storeFormData={params.storeFormData} />

      <section className="container">{children}</section>

      <Footer storeFormData={params.storeFormData} />
    </>
  );
};

export default AutomotiveLayout;
