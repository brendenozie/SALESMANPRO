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

  return (
    <>
      <Header/>      
      <section className="container">{children} </section>
      <Footer />
    </>
  );
};

export default BlogLayout;
