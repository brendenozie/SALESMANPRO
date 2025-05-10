import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
import debounce from "lodash.debounce";
import {
  MapPinIcon,
  ChevronDownIcon,
  InboxIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ChevronUpIcon, 
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { PhoneIcon } from '@heroicons/react/24/solid';

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });
const useMapEvents = dynamic(() => import('react-leaflet').then(m => m.useMapEvents), { ssr: false });


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

interface CompanyFormProps {
  initialData?: Partial<StoreForm>;
  onSubmit: (data: StoreForm) => void;
}

interface CreateStorePageProps {
  availableCategories: CategoryOption[];
}

export default function CreateStorePage({ availableCategories }: CreateStorePageProps) {

  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 16;

  const [form, setForm] = useState<StoreForm>({
    id: '',
    name: '',
    slug: '',
    domain: '',
    tagline: '',
    description: '',
    category: '',
    currency: 'KES',
    locale: 'en-US',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    geoLocation: { lat: 0, lng: 0 },
    openingHours: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' },
    socialLinks: [],
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    promotions: [],
    themeSettings: {},
    seo: {},
    analyticsConfig: {},
    paymentSettings: {},
    shippingSettings: {},
    storeCategories: [],
  });

  // Auto-generate slug
  useEffect(() => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value } as any));
  };

  // Array helpers
  const handleArrayChange = <T,>(key: keyof StoreForm, idx: number, field: keyof T, value: any) => {
    setForm(f => {
      const arr = (f[key] as unknown as T[]).slice();
      arr[idx] = { ...arr[idx], [field]: value } as any;
      return { ...f, [key]: arr } as any;
    });
  };
  const addArrayItem = <T,>(key: keyof StoreForm, emptyItem: T) => {
    setForm(f => ({ ...f, [key]: [...(f[key] as T[]), emptyItem] } as any));
  };
  const removeArrayItem = (key: keyof StoreForm, idx: number) => {
    setForm(f => {
      const arr = (f[key] as any[]).filter((_, i) => i !== idx);
      return { ...f, [key]: arr } as any;
    });
  };

  // Toggle categories
  const handleCategoryToggle = (cat: CategoryOption) => {
    setForm(f => {
      const exists = f.storeCategories?.some(c => c.id === cat.id);
      const newCats = exists
        ? f.storeCategories!.filter(c => c.id !== cat.id)
        : [...(f.storeCategories || []), cat];
      return { ...f, storeCategories: newCats };
    });
  };

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push('/stores');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (<BasicInfo form={form} handleChange={handleChange} />  );
      case 2:
        return (<CategoryAccordion availableCategories={availableCategories} form={form} handleCategoryToggle={handleCategoryToggle} />   );
      case 3:
        return (<BannerLogoAccordion form={form} handleChange={handleChange} /> );//handleUpload={} handleRemove={}
      case 4:
        return (<ContactAccordion form={form} handleChange={handleChange} /> ); 
      case 5:
        return (<LocationAccordion form={form} handleChange={handleChange} /> ); 
      case 6 : 
        return (<SocialLinksAccordion form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />   );
      case 7 : 
        return (<PoliciesAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 8 : 
        return (<FAQsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 9 : 
        return (<TestimonialsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 10 :
        return (<HeroSlidesAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 11 :
        return (<PromotionsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 12 :
        return (<ThemeSettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 13 :
        return (<SeoSettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 14 :
        return (<SettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 15 :
        return (<PaymentAccordion  form={form} setForm={handleArrayChange}/>);
      case 16 :
        return (<ShippingAccordion  form={form} setForm={handleArrayChange}/>);
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prev}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={next}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Store
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/categories`);
  const cats = await res.json();
  const options = cats.categories.map((c: any) => ({ id: c.id, name: c.name }));
  return { props: { availableCategories: options } };
};






