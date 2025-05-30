"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Accordion components
import BasicInfo from '../BasicInfo/BasicInfo';
import CategoryAccordion, { CategoryOption } from '../CategoryAccordion/CategoryAccordion';
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
import { AwardsAccordion } from '../AwardsAccordion/AwardsAccordion';
import { MetricsAccordion } from '../MetricsAccordion/MetricsAccordion';
import { StatsAccordion } from '../StatsAccordion/StatsAccordion';
import { StoreForm, Handlers, StepConfig, GeoLocation } from '../../../../types/typings';

// Interfaces
const steps: StepConfig[] = [
    {
      key: 'basic',
      title: 'Basic Info',
      render: (f, h) => (
        <BasicInfo {...f} handleChange={h.handleChange} />
      )
    },
    {
      key: 'categories',
      title: 'Categories',
      render: (f, h, cats) => (
        <CategoryAccordion
          availableCategories={cats}
          selectedCategories={f.storeCategories}
          onToggleCategory={h.onToggleCategory}
        />
      )
    },
    {
      key: 'branding',
      title: 'Branding',
      render: (f) => (
        <BannerLogoAccordion
          logoUrl={f.logoUrl}
          bannerUrl={f.bannerUrl}
          onUpload={() => {}}
          onRemove={() => {}}
        />
      )
    },
    {
      key: 'touchpoints',
      title: 'Customer Touchpoints',
      render: (f, h) => (
        <ContactAccordion {...f} openingHours={f.openingHours} onChange={h.handleChange} />
      )
    },
    {
      key: 'location',
      title: 'Location',
      render: (f, h) => (
        <LocationAccordion address={f.address} onAddressSelect={h.setAddress} />
      )
    },
    {
      key: 'social',
      title: 'Social Links',
      render: (f, h) => (
        <SocialLinksAccordion
          socialLinks={f.socialLinks}
          onUpdateLink={(i, field, v) => h.onUpdateArray('socialLinks', i, field, v)}
          onAddLink={() => h.onAddArray('socialLinks', { channel: '', url: '' })}
          onRemoveLink={(i) => h.onRemoveArray('socialLinks', i)}
        />
      )
    },
    {
      key: 'content', title: 'Policies', render: (f, h) => (
        <PoliciesAccordion
          policies={f.policies}
          onUpdatePolicy={(i, field, v) => h.onUpdateArray('policies', i, field, v)}
          onAddPolicy={() => h.onAddArray('policies', { type: '', content: '' })}
          onRemovePolicy={(i) => h.onRemoveArray('policies', i)}
        />
      )
    },
    {
      key: 'awards',
      title: 'Awards',
      render: (f, h) => (
        <AwardsAccordion
          awards={f.awards}
          onAdd={() => h.onAddArray('awards', { name: '', iconUrl: '' })}
          onUpdate={(i, field, v) => h.onUpdateArray('awards', i, field, v)}
          onRemove={(i) => h.onRemoveArray('awards', i)}
        />
      )
    },
    {
      key: 'metrics',
      title: 'Metrics',
      render: (f, h) => (
        <MetricsAccordion
          metrics={f.metrics}
          onAdd={() => h.onAddArray('metrics', { label: '', value: 0 })}
          onUpdate={(i, field, v) => h.onUpdateArray('metrics', i, field, v)}
          onRemove={(i) => h.onRemoveArray('metrics', i)}
        />
      )
    },
    {
      key: 'stats',
      title: 'Stats',
      render: (f, h) => (
        <StatsAccordion
          stats={f.stats}
          onAdd={() => h.onAddArray('stats', { label: '', value: '' })}
          onUpdate={(i, field, v) => h.onUpdateArray('stats', i, field, v)}
          onRemove={(i) => h.onRemoveArray('stats', i)}
        />
      )
    },    
    {
      key: 'faqs', title: 'FAQs', render: (f, h) => (
        <FAQsAccordion
          faqs={f.faqs}
          onUpdateFAQ={(i, field, v) => h.onUpdateArray('faqs', i, field, v)}
          onAddFAQ={() => h.onAddArray('faqs', { question: '', answer: '' })}
          onRemoveFAQ={(i) => h.onRemoveArray('faqs', i)}
        />
      )
    },
    {
      key: 'testimonials', title: 'Testimonials', render: (f, h) => (
        <TestimonialsAccordion
          testimonials={f.testimonials}
          onUpdateTestimonial={(i, field, v) => h.onUpdateArray('testimonials', i, field, v)}
          onAddTestimonial={() => h.onAddArray('testimonials', { author: '', quote: '' })}
          onRemoveTestimonial={(i) => h.onRemoveArray('testimonials', i)}
        />
      )
    },
    {
      key: 'marketing', title: 'Hero Slides', render: (f, h) => (
        <HeroSlidesAccordion
          slides={f.heroSlides}
          onUpdateSlide={(i, field, v) => h.onUpdateArray('heroSlides', i, field, v)}
          onAddSlide={() => h.onAddArray('heroSlides', { imageUrl: '', headline: '' })}
          onRemoveSlide={(i) => h.onRemoveArray('heroSlides', i)}
          onImageUpload={(i, file) => {/*...*/}}
        />
      )
    },
    {
      key: 'promotions', title: 'Promotions', render: (f, h) => (
        <PromotionsAccordion
          promotions={f.promotions}
          onUpdatePromotion={(i, field, v) => h.onUpdateArray('promotions', i, field, v)}
          onAddPromotion={() => h.onAddArray('promotions', { title: '', description: '' })}
          onRemovePromotion={(i) => h.onRemoveArray('promotions', i)}
        />
      )
    },
    {
      key: 'seo', title: 'SEO Settings', render: (f, h) => (
        <SeoSettingsAccordion seo={f.seo} onChange={(upd) => h.onChangeSettings({ seo: upd })} />
      )
    },
    {
      key: 'theme', title: 'Theme Settings', render: (f, h) => (
        <ThemeSettingsAccordion themeSettings={f.themeSettings} onChange={(upd) => h.onChangeSettings({ themeSettings: upd })} />
      )
    },
    {
      key: 'analytics', title: 'Analytics', render: (f, h) => (
        <SettingsAccordion analyticsConfig={f.analyticsConfig} onChange={(upd) => h.onChangeSettings({ analyticsConfig: upd })} />
      )
    },
    {
      key: 'payment', title: 'Payment', render: (f, h) => (
        <PaymentAccordion paymentSettings={f.paymentSettings} onChange={(upd) => h.onChangeSettings({ paymentSettings: upd })} />
      )
    },
    {
      key: 'shipping', title: 'Shipping', render: (f, h) => (
        <ShippingAccordion shippingSettings={f.shippingSettings} onChange={(upd) => h.onChangeSettings({ shippingSettings: upd })} />
      )
    }
];

export default function CreateStoreForm({ availableCategories }: { availableCategories: CategoryOption[] }) {
  const { data: session } = useSession();
  const router = useRouter();

  const initialForm: StoreForm = {
    name: '', slug: '', domain: '', tagline: '', description: '', category: 'E-commerce',
    logoUrl: 'https://logourl.com', bannerUrl: 'https://bannerurl.com', contactEmail: '', contactPhone: '', address: '',
    geoLocation: { lat: 0, lng: 0 }, openingHours: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' },
    socialLinks: [], policies: [], faqs: [], testimonials: [], heroSlides: [], promotions: [],
    themeSettings: {}, seo: {}, analyticsConfig: {}, paymentSettings: {}, shippingSettings: {},
    storeCategories: [],
    awards: [],
    metrics: [],
    stats: [],
  };

  const [form, setForm] = useState<StoreForm>(initialForm);
  const totalSteps = steps.length + 1;
  const [stepIndex, setStepIndex] = useState(0);

  // Auto-generate slug/domain from name
  useEffect(() => {
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const domain = slug ? `${slug}.yourdomain.com` : '';
    setForm((prev) => ({ ...prev, slug, domain }));
  }, [form.name]);

  // Slug & domain generator
  useEffect(() => {
    if (!form.name) return;
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm(f => ({ ...f, slug, domain: `https://www.${slug}.ghuba.shop` }));
  }, [form.name]);

  // LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('storeForm'); if (saved) setForm(JSON.parse(saved));
  }, []);
  useEffect(() => { localStorage.setItem('storeForm', JSON.stringify(form)); }, [form]);

  // Navigation guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Handlers
  const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { name, value } = e.target; setForm(f => ({ ...f, [name]: value }));
  };

  const onUpdateArray = <T,>(key: keyof StoreForm, idx: number, field: keyof T, value: any) => {
    setForm(f => { const arr = [...(f[key] as any)]; arr[idx] = { ...arr[idx], [field]: value }; return { ...f, [key]: arr }; });
  };

  const onAddArray = <T,>(key: keyof StoreForm, item: T) => {
    setForm(f => ({ ...f, [key]: [...(f[key] as any), item] }));
  };

  const onRemoveArray = (key: keyof StoreForm, idx: number) => {
    setForm(f => ({ ...f, [key]: (f[key] as any).filter((_: any, i: number) => i !== idx) }));
  };

  const onToggleCategory = (cat: CategoryOption) => {
    setForm(f => ({ ...f,
      storeCategories: f.storeCategories.some(c => c.id === cat.id)
        ? f.storeCategories.filter(c => c.id !== cat.id)
        : [...f.storeCategories, cat]
    }));
  };

  const setAddress = (address: string, geoLocation: GeoLocation) => {
    setForm(f => ({ ...f, address, geoLocation }));
  };

  const onChangeSettings = (updated: Partial<StoreForm>) => {
    setForm(f => ({ ...f, ...updated }));
  };

  const handlers: Handlers = { handleChange, onUpdateArray, onAddArray, onRemoveArray, onToggleCategory, setAddress, onChangeSettings };

  const next = () => setStepIndex(i => Math.min(i + 1, totalSteps - 1));
  const prev = () => setStepIndex(i => Math.max(i - 1, 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault(); if (!session?.user?.id) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stores`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, userId: session.user.id })
    });
    if (res.ok) router.push('/stores');
  };

// Render step or review
const StepContent = stepIndex < steps.length
? steps[stepIndex].render(form, handlers, availableCategories)
: (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Review Your Store</h2>
      {steps.map((s, i) => (
        <div key={s.key} className="p-4 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => setStepIndex(i)}>
          <h3 className="font-medium">{s.title}</h3>
          <p className="text-sm text-gray-600">Click to edit</p>
        </div>
      ))}
    </div>
  );

  return <form onSubmit={handleSubmit} className="min-h-screen flex bg-gradient-to-br from-white via-indigo-50 to-white relative">
  {/* Sidebar */}
  <aside className="w-64 hidden md:flex flex-col bg-white shadow-lg p-4 sticky top-0 h-screen z-10">
    <h2 className="text-xl font-semibold mb-6 text-indigo-700">Setup Wizard</h2>
    <nav className="flex flex-col gap-2 overflow-y-auto">
      {steps.map((s, i) => (
        <button
          key={s.key}
          type="button"
          className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
            i === stepIndex ? 'bg-indigo-100 text-indigo-800 font-medium' : 'hover:bg-gray-100 text-gray-700'
          }`}
          onClick={() => setStepIndex(i)}
        >
          <span className="w-6 h-6 bg-indigo-200 text-indigo-700 rounded-full text-xs flex items-center justify-center">
            {i + 1}
          </span>
          {s.title}
        </button>
      ))}
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition ${
          stepIndex === steps.length ? 'bg-indigo-100 text-indigo-800 font-medium' : 'hover:bg-gray-100 text-gray-700'
        }`}
        onClick={() => setStepIndex(steps.length)}
      >
        <span className="w-6 h-6 bg-green-200 text-green-700 rounded-full text-xs flex items-center justify-center">
          ✔
        </span>
        Review
      </button>
    </nav>
  </aside>

  {/* Main content */}
  <main className="flex-1 flex flex-col px-4 sm:px-8 py-8 max-h-screen">
    {/* Step progress */}
    <div className="mb-6">
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-300"
          style={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
        />
      </div>
      <div className="flex justify-between mt-2 text-sm text-gray-500">
        <span>Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}</span>
        <span>{stepIndex < steps.length ? steps[stepIndex].title : 'Review & Submit'}</span>
      </div>
    </div>

    {/* Dynamic step content */}
    <div className="flex-1 max-h-screen overflow-auto">{StepContent}</div>

    {/* Navigation buttons */}
    <div className="mt-8 flex justify-between items-center border-t pt-4">
      <button
        type="button"
        disabled={stepIndex === 0}
        onClick={prev}
        className="px-5 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
      >
        ← Back
      </button>

      {stepIndex < steps.length ? (
        <button
          type="button"
          onClick={next}
          className="px-5 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Next →
        </button>
      ) : (
        <button
          onClick={handleSubmit}
          className="px-5 py-2 rounded-md bg-green-600 text-white hover:bg-green-700"
        >
          Submit Store
        </button>
      )}
    </div>
  </main>
</form>;
}
