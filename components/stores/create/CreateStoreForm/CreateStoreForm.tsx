/*
  File: app/stores/create/CreateStoreForm.tsx
  Client component with full form logic and stepper
*/

"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Import all accordion components
import BasicInfo from '../BasicInfo/BasicInfo';
import CategoryAccordion from '../CategoryAccordion/CategoryAccordion';
import BannerLogoAccordion from '../BannerLogoAccordion/BannerLogoAccordion';
import ContactAccordion from '../ContactAccordion/ContactAccordion';
import LocationAccordion from '../LocationAccordion/LocationAccordion';
import SocialLinksAccordion from '../SocialLinksAccordion/SocialLinksAccordion';
import PoliciesAccordion from '../PoliciesAccordion/PoliciesAccordion';
import FAQsAccordion from '../FAQsAccordion/FAQsAccordion';
import TestimonialsAccordion from '../TestimonialsAccordion/TestimonialsAccordion';
import HeroSlidesAccordion from '../HeroSlidesAccordion/HeroSlidesAccordion';
import PromotionsAccordion from '../PromotionsAccordion/PromotionsAccordion';
import ThemeSettingsAccordion from '../ThemeSettingsAccordion/ThemeSettingsAccordion';
import SeoSettingsAccordion from '../SeoSettingsAccordion/SeoSettingsAccordion';
import SettingsAccordion from '../SettingsAccordion/SettingsAccordion';
import PaymentAccordion from '../PaymentAccordion/PaymentAccordion';
import ShippingAccordion from '../ShippingAccordion/ShippingAccordion';

// Interfaces
interface CategoryOption { id: string; name: string; }
interface GeoLocation { lat: number; lng: number; }
interface OpeningHours { [key: string]: string; }

export interface SocialLink { channel: string; url: string; }
export interface Policy { type: string; title?: string; content: string; }
export interface FAQ { question: string; answer: string; order?: number; }
export interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number; }
export interface HeroSlide { imageUrl: string; headline: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number; }
export interface Promotion { title: string; description: string; startsAt?: string; endsAt?: string; bannerUrl?: string; order?: number; }

interface CreateStoreFormProps { availableCategories: CategoryOption[]; }

type StoreForm = {
  name: string;
  slug: string;
  domain: string;
  tagline: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  geoLocation: GeoLocation;
  openingHours: OpeningHours;
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: HeroSlide[];
  promotions: Promotion[];
  themeSettings: Record<string, any>;
  seo: Record<string, any>;
  analyticsConfig: Record<string, any>;
  paymentSettings: Record<string, any>;
  shippingSettings: Record<string, any>;
  storeCategories: CategoryOption[];
};

export default function CreateStoreForm({ availableCategories }: CreateStoreFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const totalSteps = 16;
  const [step, setStep] = useState(1);

  const initialForm: StoreForm = {
    name: '', slug: '', domain: '', tagline: '', description: '', category: 'E-commerce',
    logoUrl: '', bannerUrl: '', contactEmail: '', contactPhone: '', address: '',
    geoLocation: { lat: 0, lng: 0 },
    openingHours: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' },
    socialLinks: [], policies: [], faqs: [], testimonials: [], heroSlides: [], promotions: [],
    themeSettings: {}, seo: {}, analyticsConfig: {}, paymentSettings: {}, shippingSettings: {},
    storeCategories: []
  };

  const [form, setForm] = useState<StoreForm>(initialForm);

  // Auto-generate slug
  useEffect(() => {
    if (form.name) {
      const slug = form.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      const domain = form.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug, domain }));
    }
  }, [form.name]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('storeForm');
      if (saved) setForm(JSON.parse(saved));
    } catch (err) {
      console.warn('Couldn\'t parse saved form', err);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    window.localStorage.setItem('storeForm', JSON.stringify(form));
  }, [form]);

  // Dirty prompt
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Generic change handler
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Array handlers
  const handleArrayChange = <T,>(key: keyof StoreForm, idx: number, field: keyof T, value: any) => {
    setForm(f => {
      const arr = [...(f[key] as any)];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });
  };
  const addArrayItem = <T,>(key: keyof StoreForm, item: T) => {
    setForm(f => ({ ...f, [key]: [...(f[key] as any), item] }));
  };
  const removeArrayItem = (key: keyof StoreForm, idx: number) => {
    setForm(f => ({ ...f, [key]: (f[key] as any).filter((_: any, i: number) => i !== idx) }));
  };

  // Category toggle
  const handleCategoryToggle = (cat: CategoryOption) => {
    setForm(f => {
      const exists = f.storeCategories.some(c => c.id === cat.id);
      const storeCategories = exists
        ? f.storeCategories.filter(c => c.id !== cat.id)
        : [...f.storeCategories, cat];
      return { ...f, storeCategories };
    });
  };

  // Navigation
  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  // Submit handler
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/stores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, userId: session.user.id }) }
    );
    if (res.ok) router.push('/stores');
    else console.error('Failed to create store');
  };

  // Render step
  const renderStep = () => {
    switch (step) {
      case 1: return <BasicInfo {...{ name: form.name, slug: form.slug, category: form.category, description: form.description, tagline: form.tagline, domain: form.domain, handleChange }} />;
      case 2: return <CategoryAccordion availableCategories={availableCategories} selectedCategories={form.storeCategories} onToggleCategory={handleCategoryToggle} />;
      case 3: return <BannerLogoAccordion logoUrl={form.logoUrl} bannerUrl={form.bannerUrl} onUpload={(field, file) => setForm(f => ({ ...f, [field]: URL.createObjectURL(file) }))} onRemove={field => setForm(f => ({ ...f, [field]: '' }))} />;
      case 4: return <ContactAccordion openingHours={form.openingHours} contactEmail={form.contactEmail} contactPhone={form.contactPhone} onChange={handleChange} />;
      case 5: return <LocationAccordion address={form.address} onAddressSelect={(address, geoLocation) => setForm(f => ({ ...f, address, geoLocation }))} />;
      case 6: return <SocialLinksAccordion socialLinks={form.socialLinks} onUpdateLink={(i, field, v) => handleArrayChange<SocialLink>('socialLinks', i, field, v)} onAddLink={() => addArrayItem<SocialLink>('socialLinks',{ channel: '', url: '' })} onRemoveLink={i => removeArrayItem('socialLinks', i)} />;
      case 7: return <PoliciesAccordion policies={form.policies} onUpdatePolicy={(i, field, v) => handleArrayChange<Policy>('policies', i, field, v)} onAddPolicy={() => addArrayItem<Policy>('policies',{ type: '', content: '' })} onRemovePolicy={i => removeArrayItem('policies', i)} />;
      case 8: return <FAQsAccordion faqs={form.faqs} onUpdateFAQ={(i, field, v) => handleArrayChange<FAQ>('faqs', i, field, v)} onAddFAQ={() => addArrayItem<FAQ>('faqs',{ question: '', answer: '' })} onRemoveFAQ={i => removeArrayItem('faqs', i)} />;
      case 9: return <TestimonialsAccordion testimonials={form.testimonials} onUpdateTestimonial={(i, field, v) => handleArrayChange<Testimonial>('testimonials', i, field, v)} onAddTestimonial={() => addArrayItem<Testimonial>('testimonials',{ author: '', quote: '' })} onRemoveTestimonial={i => removeArrayItem('testimonials', i)} />;
      case 10: return <HeroSlidesAccordion slides={form.heroSlides} onUpdateSlide={(i, field, v) => handleArrayChange<HeroSlide>('heroSlides', i, field, v)} onAddSlide={() => addArrayItem<HeroSlide>('heroSlides',{ imageUrl: '', headline: '' })} onRemoveSlide={i => removeArrayItem('heroSlides', i)} onImageUpload={(i, file) => { const url = URL.createObjectURL(file); handleArrayChange<HeroSlide>('heroSlides', i, 'imageUrl', url); }} />;
      case 11: return <PromotionsAccordion promotions={form.promotions} onUpdatePromotion={(i, field, v) => handleArrayChange<Promotion>('promotions', i, field, v)} onAddPromotion={() => addArrayItem<Promotion>('promotions',{ title: '', description: '' })} onRemovePromotion={i => removeArrayItem('promotions', i)} />;
      case 12: return <ThemeSettingsAccordion themeSettings={form.themeSettings} onChange={updated => setForm(f => ({ ...f, themeSettings: updated }))} />;
      case 13: return <SeoSettingsAccordion seo={form.seo} onChange={updated => setForm(f => ({ ...f, seo: updated }))} />;
      case 14: return <SettingsAccordion analyticsConfig={form.analyticsConfig} onChange={updated => setForm(f => ({ ...f, analyticsConfig: updated }))} />;
      case 15: return <PaymentAccordion paymentSettings={form.paymentSettings} onChange={updated => setForm(f => ({ ...f, paymentSettings: updated }))} />;
      case 16: return <ShippingAccordion shippingSettings={form.shippingSettings} onChange={updated => setForm(f => ({ ...f, shippingSettings: updated }))} />;
      default: return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-indigo-600 transition-all" style={{ width: `${(step / totalSteps) * 100}%` }} />
        </div>
        <div className="space-y-6">
          {renderStep()}
          <div className="flex justify-between">
            {step > 1 ? (
              <button type="button" onClick={prev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Previous</button>
            ) : <div />}
            {step < totalSteps ? (
              <button type="button" onClick={next} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Next</button>
            ) : (
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create Store</button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
