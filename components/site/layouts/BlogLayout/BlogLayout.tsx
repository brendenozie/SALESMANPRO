"use client"
import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";
import Link from "next/link";
import Image from "next/image";
import { StoreForm } from "../../../../types/typings";

interface BlogLayoutProps {
  params: { storeFormData: StoreForm };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const BlogLayout: React.FC<BlogLayoutProps> = (
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

  const primary = params.storeFormData?.themeSettings?.primaryColor || "#f97316";    // fallback: orange
  const secondary = params.storeFormData?.themeSettings?.secondaryColor || "#3b82f6"; // fallback: blue

  return (
    <>
      <Header storeFormData={params.storeFormData} />      

      {/* Child Content (post detail) */}
      <section className="container">{children} </section>

      <Footer storeFormData={params.storeFormData} />
    </>
  );
};

export default BlogLayout;
