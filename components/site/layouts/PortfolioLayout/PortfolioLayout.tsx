"use client"
import React, { ReactNode, useState } from "react";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useRouter } from "next/navigation";
import Header from "./header/Header";
import Footer from "./footer/Footer";

// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  themeSettings: any;
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface PortfolioLayoutProps {
  params: { store: Store };
  children: ReactNode;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const PortfolioLayout: React.FC<PortfolioLayoutProps> = (
  {
    params,
    children,
  }: {
    params: { store: Store };
    children: ReactNode;
  }
) => {

  const { cart } = useStateContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const router = useRouter();

  const primary = params.store?.themeSettings?.primaryColor || "#f97316";    // fallback: orange
  const secondary = params.store?.themeSettings?.secondaryColor || "#3b82f6"; // fallback: blue

  return (
    <>
      <Header store={params.store} />
        {children}
      <Footer store={params.store} />
    </>
  );
};

export default PortfolioLayout;
