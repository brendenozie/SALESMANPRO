"use client";

import React, { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  
  const path = usePathname();
  // bail out on /login or any deeper login route
  if (path.startsWith('/site/educational-online-courses/courses/login')) return (<section className="container">{children}</section>);   
// bail out on /login or any deeper login route
if (path.startsWith('/site/educational-online-courses/courses/signup')) return (<section className="container">{children}</section>);   

  return (
    <>
      <Header/>
      {/* Child Content (Course Details) */}
      <section className="container">{children}</section>
      <Footer/>
    </>
  );
}
