import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

import BasicInfo from '@/components/BasicInfo/BasicInfo';
import CategoryAccordion from '@/components/CategoryAccordion/CategoryAccordion';
import BannerLogoAccordion from '@/components/BannerLogoAccordion/BannerLogoAccordion';
import ContactAccordion from '@/components/ContactAccordion/ContactAccordion';
import LocationAccordion from '@/components/LocationAccordion/LocationAccordion';
import SocialLinksAccordion from '@/components/SocialLinksAccordion/SocialLinksAccordion';
import PoliciesAccordion from '@/components/PoliciesAccordion/PoliciesAccordion';
import FAQsAccordion from '@/components/FAQsAccordion/FAQsAccordion';
import TestimonialsAccordion from '@/components/TestimonialsAccordion/TestimonialsAccordion';
import HeroSlidesAccordion from '@/components/HeroSlidesAccordion/HeroSlidesAccordion';
import PromotionsAccordion from '@/components/PromotionsAccordion/PromotionsAccordion';
import ThemeSettingsAccordion from '@/components/ThemeSettingsAccordion/ThemeSettingsAccordion';
import SeoSettingsAccordion from '@/components/SeoSettingsAccordion/SeoSettingsAccordion';
import SettingsAccordion from '@/components/SettingsAccordion/SettingsAccordion';
import PaymentAccordion from '@/components/PaymentAccordion/PaymentAccordion';
import ShippingAccordion from '@/components/ShippingAccordion/ShippingAccordion';

interface CategoryOption { id: string; name: string; }
interface GeoLocation { lat: number; lng: number; }
interface OpeningHours { [key: string]: string; } // e.g. { mon: "9–5", tue: "..." }

interface SocialLinkOption { channel: string; url: string; }
interface PolicyOption { type: string; title?: string; content: string; }
interface FAQOption { question: string; answer: string; order?: number; }
interface TestimonialOption { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number; }
interface BannerOption { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number; }
interface PromotionOption { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string; }

interface SEOOption { title?: string; description?: string; keywords?: string[]; canonical?: string; }
interface AnalyticsConfigOption { googleTag?: string; facebookTag?: string; }
interface PaymentSettingsOption {  mpesaShortcode?: string; mpesaConsumerKey?: string; mpesaConsumerSecret?: string; mpesaCallbackUrl?: string; }
interface ShippingSettingsOption { carrierName?: string; trackingUrl?: string; }
interface StoreForm {
  id?: string;
  name: string;
  slug: string;
  domain?: string;
  tagline?: string;
  description?: string;
  category: string;               // main category ID or slug
  currency?: string;
  locale?: string;
  logoUrl?: string;
  bannerUrl?: string;
  heroSlides?: BannerOption[];
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: GeoLocation;
  openingHours?: OpeningHours;
  socialLinks?: SocialLinkOption[];
  policies?: PolicyOption[];
  faqs?: FAQOption[];
  testimonials?: TestimonialOption[];
  banners?: BannerOption[];
  promotions?: PromotionOption[];
  themeSettings?: Record<string, any>;
  seo?: SEOOption;
  analyticsConfig?: AnalyticsConfigOption;
  paymentSettings?: PaymentSettingsOption;
  shippingSettings?: ShippingSettingsOption;
  storeCategories?: CategoryOption[]; // relation to StoreCategory
  createdAt?: string;
  updatedAt?: string;
}
interface CreateStorePageProps {
  availableCategories: CategoryOption[];
}

export interface SocialLink {
  channel: string;
  url: string;
}

export interface Policy {
  type: string;
  title?: string;
  content: string;
}

export interface FAQ {
  question: string;
  answer: string;
  order?: number;
}

export interface Testimonial {
  author: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  order?: number;
}

export interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}

export interface Promotion {
  title: string;
  description: string;
  startsAt?: string;
  endsAt?: string;
  bannerUrl?: string;
  order?: number;
}


export default function CreateStorePage({ availableCategories }: CreateStorePageProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 16;

  const [form, setForm] = useState({
    name: '',
    slug: '',
    domain: '',
    tagline: '',
    description: '',
    category: '',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone:'',
    address: '',
    geoLocation: { lat: 0, lng: 0 } as GeoLocation,
    openingHours: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' } as OpeningHours,
    socialLinks: [] as SocialLink[],
    policies: [] as Policy[],
    faqs: [] as FAQ[],
    testimonials: [] as Testimonial[],
    heroSlides: [] as HeroSlide[],
    promotions: [] as Promotion[],
    themeSettings: {},
    seo: {},
    analyticsConfig: {},
    paymentSettings: {},
    shippingSettings: {},
    storeCategories: [] as CategoryOption[],
  });

  useEffect(() => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleArrayChange = <T,>(
    key: keyof typeof form,
    idx: number,
    field: keyof T,
    value: any
  ) => {
    setForm(f => {
      const arr = ([...((f[key] as unknown) as T[])]);
      arr[idx] = { ...arr[idx], [field]: value } as T;
      return { ...f, [key]: arr };
    });
  };
  const addArrayItem = <T,>(key: keyof typeof form, item: T) => {
    setForm(f => ({ ...f, [key]: ([...((f[key] as unknown) as T[]), item]) }));
  };
  const removeArrayItem = (key: keyof typeof form, idx: number) => {
    setForm(f => ({ ...f, [key]: ((f[key] as unknown) as any[]).filter((_, i) => i !== idx) }));
  };

  const handleCategoryToggle = (cat: CategoryOption) => {
    setForm(f => {
      const exists = f.storeCategories.some(c => c.id === cat.id);
      const storeCategories = exists
        ? f.storeCategories.filter(c => c.id !== cat.id)
        : [...f.storeCategories, cat];
      return { ...f, storeCategories };
    });
  };

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // if (!session) return;

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify({ ...form, }),//userId: session.user.id }),
    });

    if (res.ok) {
      router.push('/stores');
    } else {
      console.error('Failed to create store');
    }
  };

  // 1) Remove all your existing visibilitychange & beforeunload effects
  //    (you can delete the two useEffect blocks that reference them).

  // 2) Keep just one on-mount loader:
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('storeForm');
      if (saved) setForm(JSON.parse(saved));
    } catch (err) {
      console.warn('Couldn’t parse saved form', err);
    }
  }, []);

  // 3) Add a single saver that runs on *any* form change:
  useEffect(() => {
    // Debounce if you like, but JSON.stringify is usually fast enough
    window.localStorage.setItem('storeForm', JSON.stringify(form));
  }, [form]);

  // 4) (Optional) If you really want a “dirty page” prompt, keep one beforeunload:
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);


  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <BasicInfo
            name={form.name}
            slug={form.slug}
            category={form.category}
            description={form.description}
            tagline={form.tagline}
            domain={form.domain}
            handleChange={handleChange}
          />
        );
      case 2:
        return (
          <CategoryAccordion
            availableCategories={availableCategories}
            selectedCategories={form.storeCategories}
            onToggleCategory={handleCategoryToggle}
          />
        );
      case 3:
        return (
          <BannerLogoAccordion
            logoUrl={form.logoUrl}
            bannerUrl={form.bannerUrl}
            onUpload={(field, file) => setForm(f => ({ ...f, [field]: URL.createObjectURL(file) }))}
            onRemove={field => setForm(f => ({ ...f, [field]: '' }))}
          />
        );
      case 4:
        return (
          <ContactAccordion
            openingHours={form.openingHours}
            contactEmail={form.contactEmail}
            contactPhone={form.contactPhone}
            onChange={handleChange}
          />
        );
      case 5:
        return (
          <LocationAccordion
            address={form.address}
            onAddressSelect={(address, geoLocation) => setForm(f => ({ ...f, address, geoLocation }))}
          />
        );
      case 6:
        return (
          <SocialLinksAccordion
            socialLinks={form.socialLinks}
            onUpdateLink={(i, field, v) => handleArrayChange<SocialLink>('socialLinks', i, field, v)}
            onAddLink={() => addArrayItem<SocialLink>('socialLinks', { channel: '', url: '' })}
            onRemoveLink={i => removeArrayItem('socialLinks', i)}
          />
        );
      case 7:
        return (
          <PoliciesAccordion
            policies={form.policies}
            onUpdatePolicy={(i, field, v) => handleArrayChange<Policy>('policies', i, field, v)}
            onAddPolicy={() => addArrayItem<Policy>('policies', { type: '', content: '' })}
            onRemovePolicy={i => removeArrayItem('policies', i)}
          />
        );
      case 8:
        return (
          <FAQsAccordion
            faqs={form.faqs}
            onUpdateFAQ={(i, field, v) => handleArrayChange<FAQ>('faqs', i, field, v)}
            onAddFAQ={() => addArrayItem<FAQ>('faqs', { question: '', answer: '' })}
            onRemoveFAQ={i => removeArrayItem('faqs', i)}
          />
        );
      case 9:
        return (
          <TestimonialsAccordion
            testimonials={form.testimonials}
            onUpdateTestimonial={(i, field, v) => handleArrayChange<Testimonial>('testimonials', i, field, v)}
            onAddTestimonial={() => addArrayItem<Testimonial>('testimonials', { author: '', quote: '' })}
            onRemoveTestimonial={i => removeArrayItem('testimonials', i)}
          />
        );
      case 10:
        return (
          <HeroSlidesAccordion
            slides={form.heroSlides}
            onUpdateSlide={(i, field, v) => handleArrayChange<HeroSlide>('heroSlides', i, field, v)}
            onAddSlide={() => addArrayItem<HeroSlide>('heroSlides', { imageUrl: '', headline: '' })}
            onRemoveSlide={i => removeArrayItem('heroSlides', i)}
            onImageUpload={(i, file) => {
              const url = URL.createObjectURL(file);
              handleArrayChange<HeroSlide>('heroSlides', i, 'imageUrl', url);
            }}
          />
        );
      case 11:
        return (
          <PromotionsAccordion
            promotions={form.promotions}
            onUpdatePromotion={(i, field, v) => handleArrayChange<Promotion>('promotions', i, field, v)}
            onAddPromotion={() => addArrayItem<Promotion>('promotions', { title: '', description: '' })}
            onRemovePromotion={i => removeArrayItem('promotions', i)}
          />
        );
      case 12:
        return (
          <ThemeSettingsAccordion
            themeSettings={form.themeSettings}
            onChange={updated => setForm(f => ({ ...f, themeSettings: updated }))}
          />
        );
      case 13:
        return (
          <SeoSettingsAccordion
            seo={form.seo}
            onChange={updated => setForm(f => ({ ...f, seo: updated }))}
          />
        );
      case 14:
        return (
          <SettingsAccordion
            analyticsConfig={form.analyticsConfig}
            onChange={updated => setForm(f => ({ ...f, analyticsConfig: updated }))}
          />
        );
      case 15:
        return (
          <PaymentAccordion
            paymentSettings={form.paymentSettings}
            onChange={updated => setForm(f => ({ ...f, paymentSettings: updated }))}
          />
        );
      case 16:
        return (
          <ShippingAccordion
            shippingSettings={form.shippingSettings}
            onChange={updated => setForm(f => ({ ...f, shippingSettings: updated }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <div className="space-y-6">
          {renderStep()}
          <div className="flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={prev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
                Previous
              </button>
            ) : <div />}
            {step < totalSteps ? (
              <button type="button" onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                Next
              </button>
            ) : (
              <button onClick={handleSubmit} className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Create Store
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/categories`);
  const { categories } = await res.json();
  const availableCategories = categories.map((c: any) => ({ id: c.id, name: c.name }));
  return { props: { availableCategories } };
};
