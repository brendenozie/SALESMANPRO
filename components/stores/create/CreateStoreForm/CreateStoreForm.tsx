"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Accordion components
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
import { AwardsAccordion } from '../AwardsAccordion/AwardsAccordion';
import { MetricsAccordion } from '../MetricsAccordion/MetricsAccordion';
import { StatsAccordion } from '../StatsAccordion/StatsAccordion';
import { StoreForm, Handlers, StepConfig, GeoLocation, CategoryOption } from '../../../../types/typings';

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
          selectedCategories={f.storeCategories}          // CategoryOption[]
          onToggleCategory={h.onToggleCategory}           // CategoryOption => void
          onBulkToggle={h.onBulkToggleCategories}         // string[] => void
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
        <ContactAccordion {...f} openingHours={f.openingHours} onChange={h.handleChange} onToggleDay={h.onToggleDay}/>
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

type Props = {
  availableCategories: CategoryOption[];
  initialData?: Partial<StoreForm> & { id: string };
};

export default function CreateStoreForm({ availableCategories, initialData }: Props) {
  const { data: session } = useSession();
  const router = useRouter();

  const defaultForm: StoreForm = {
    name: '', slug: '', domain: '', tagline: '', description: '', category: 'E-commerce',
    logoUrl: 'https://logourl.com', bannerUrl: 'https://bannerurl.com', contactEmail: '', contactPhone: '', address: '',
    geoLocation: { lat: 0, lng: 0 }, openingHours: { mon: { open: '', close: '' }, tue: { open: '', close: '' }, wed: { open: '', close: '' }, thu: { open: '', close: '' }, fri: { open: '', close: '' }, sat: { open: '', close: '' }, sun: { open: '', close: '' } },
    socialLinks: [], policies: [], faqs: [], testimonials: [], heroSlides: [], promotions: [],
    themeSettings: {}, seo: {}, analyticsConfig: {}, paymentSettings: {}, shippingSettings: {},
    storeCategories: [],
    awards: [],
    metrics: [],
    stats: [],
  };

  // const [form, setForm] = useState<StoreForm>(initialForm);
  const [form, setForm] = useState<StoreForm>(
    // `initialData` fields overwrite defaults
    initialData
      ? { ...defaultForm, ...initialData }
      : defaultForm
  );

  const totalSteps = steps.length + 1;
  const [stepIndex, setStepIndex] = useState(0);

  // Auto-generate slug/domain from name
  useEffect(() => {
    if (initialData) return;
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const domain = slug ? `${slug}.yourdomain.com` : '';
    setForm((prev) => ({ ...prev, slug, domain }));
  }, [form.name, initialData]);

  // Slug & domain generator
  useEffect(() => {
    if (initialData) return;
    if (!form.name) return;
    const slug = form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    setForm(f => ({ ...f, slug, domain: `https://www.${slug}.ghuba.shop` }));
  }, [form.name, initialData]);

  // LocalStorage
  useEffect(() => {
    if (initialData) return;            // ← skip in edit mode
    const saved = localStorage.getItem('storeForm')
    if (saved) setForm(JSON.parse(saved))
  }, [initialData])
  

  useEffect(() => {
    if (initialData) return;
    localStorage.setItem('storeForm', JSON.stringify(form))
  }, [form, initialData])
  
  // Navigation guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Handlers

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    if (name.startsWith("openingHours.")) {
      // name is like "openingHours.mon.open" or "openingHours.tue.close"
      const [, dayKey, field] = name.split("."); 
      setForm((f : any) => ({
        ...f,
        openingHours: {
          ...f.openingHours,
          [dayKey]: {
            ...f.openingHours[dayKey],
            [field]: value,
          },
        },
      }));
    } else {
      // everything else stays the same
      setForm(f => ({ ...f, [name]: value }));
    }
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

  const onToggleDay = (key: string) => {
    setForm(f => {
      const day = f.openingHours[key] || { open: '', close: '' };
      const isClosed = !day.open && !day.close;
      const updated = isClosed
        ? { open: '09:00', close: '17:00' }
        : { open: '', close: '' };
  
      return {
        ...f,
        openingHours: {
          ...f.openingHours,
          [key]: updated,
        },
      };
    });
  }
  

  // Toggle a single CategoryOption
  const onToggleCategory = (cat: CategoryOption) => {
    setForm(f => {
      const exists = f.storeCategories.some(c => c.id === cat.id);
      const updated = exists
        ? f.storeCategories.filter(c => c.id !== cat.id)
        : [...f.storeCategories, cat];
      return { ...f, storeCategories: updated };
    });
  };

  // Bulk‐toggle by ID array: convert IDs → full CategoryOption objects
  const onBulkToggleCategories = (ids: string[]) => {
    setForm(f => {
      // find matching CategoryOption objects in our available list
      const chosen = availableCategories.filter(c => ids.includes(c.id));
      return { ...f, storeCategories: chosen };
    });
  };


  const setAddress = (address: string, geoLocation: GeoLocation) => {
    setForm(f => ({ ...f, address, geoLocation }));
  };

  const onChangeSettings = (updated: Partial<StoreForm>) => {
    setForm(f => ({ ...f, ...updated }));
  };

  const handlers: Handlers = { handleChange, onUpdateArray, onAddArray, onRemoveArray, onToggleCategory, setAddress, onChangeSettings, onBulkToggleCategories, onToggleDay };

  const next = () => setStepIndex(i => Math.min(i + 1, totalSteps - 1));
  const prev = () => setStepIndex(i => Math.max(i - 1, 0));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
  
    const isEdit = Boolean(initialData?.id);
    const url    = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/stores/${initialData!.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/stores`;
    const method = isEdit ? "PUT" : "POST";
  
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId: session.user.id }),
    });
  
    if (res.ok) {
      router.push("/stores");
    } else {
      console.error("Save failed", await res.text());
      // show an error toast/message
    }
  };
  

  // Helper to render review info for each step

  const ReviewSection = ({ title, children }:any) => (
    <div className="bg-white shadow-sm rounded-lg p-4 space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">{title}</h3>
      <div>{children}</div>
    </div>
  );

  const EmptyState = ({ message }:any) => (
    <em className="text-gray-400 italic">{message}</em>
  );

  const renderList = (items:any, renderItem:any, emptyMessage = 'No items') => (
    items && items.length > 0 ? (
      <ul className="list-disc list-inside space-y-1">
        {items.map(renderItem)}
      </ul>
    ) : (
      <EmptyState message={emptyMessage} />
    )
  );

  const renderJSON = (data:any, emptyMessage = 'No data') => (
    data && Object.keys(data).length > 0 ? (
      <pre className="bg-gray-50 text-xs p-3 rounded overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
    ) : (
      <EmptyState message={emptyMessage} />
    )
  );

const renderReviewContent = (stepKey:any, form:any) => {
  switch (stepKey) {
    case 'basic':
      return (
        <ReviewSection title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div><strong>Name:</strong> {form.name || <EmptyState message="Not set" />}</div>
            <div><strong>Slug:</strong> {form.slug || <EmptyState message="Not set" />}</div>
            <div><strong>Domain:</strong> {form.domain || <EmptyState message="Not set" />}</div>
            <div><strong>Tagline:</strong> {form.tagline || <EmptyState message="Not set" />}</div>
            <div className="sm:col-span-2"><strong>Description:</strong> {form.description || <EmptyState message="Not set" />}</div>
          </div>
        </ReviewSection>
      );

    case 'categories':
      return (
        <ReviewSection title="Categories">
          {renderList(form.storeCategories, (cat:any) => <li key={cat.id}>{cat.name}</li>, 'No categories')}
        </ReviewSection>
      );

    case 'branding':
      return (
        <ReviewSection title="Branding">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Logo</p>
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo" className="h-16 w-16 object-cover rounded-md shadow" />
              ) : <EmptyState message="Not uploaded" />}
            </div>
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Banner</p>
              {form.bannerUrl ? (
                <img src={form.bannerUrl} alt="Banner" className="h-16 w-32 object-cover rounded-md shadow" />
              ) : <EmptyState message="Not uploaded" />}
            </div>
          </div>
        </ReviewSection>
      );

    case 'touchpoints':
      return (
        <ReviewSection title="Contact & Hours">
          <div className="space-y-2 text-sm">
            <div><strong>Email:</strong> {form.contactEmail || <EmptyState message="Not set" />}</div>
            <div><strong>Phone:</strong> {form.contactPhone || <EmptyState message="Not set" />}</div>
            <div>
              <strong>Opening Hours:</strong>
              {Object.keys(form.openingHours || {}).length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {Object.entries(form.openingHours).map(([day, hrs]) => {
                    const { open, close } = hrs as { open: string; close: string };
                    const display =
                      open && close
                        ? `${open} – ${close}`
                        : 'Closed';
                    // Capitalize day label (Monday, Tuesday, etc.)
                    const label =
                      day.charAt(0).toUpperCase() + day.slice(1);
                    return (
                      <li key={day}>
                        <span className="font-medium">{label}:</span>{' '}
                        {display}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState message="Not set" />
              )}
            </div>

          </div>
        </ReviewSection>
      );

    case 'location':
      return (
        <ReviewSection title="Location">
          <div className="space-y-1 text-sm">
            <div><strong>Address:</strong> {form.address || <EmptyState message="Not set" />}</div>
            {form.geoLocation ? (
              <div><strong>Coordinates:</strong> {form.geoLocation.lat}, {form.geoLocation.lng}</div>
            ) : null}
          </div>
        </ReviewSection>
      );

      case 'social':
        return (
          <ReviewSection title="Social Links">
            {
              renderList(
                form.socialLinks,
                (link:any, i:any) => (
                  <li key={i}>
                    <strong>{link.channel}:</strong>{' '}
                    <a
                      href={link.url}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {link.url}
                    </a>
                  </li>
                ),
                'No social links'
              )
              
            }
          </ReviewSection>
        );

      case 'content':
        return (
          <ReviewSection title="Policies & Content">
            {renderList(
              form.policies,
              (policy:any, i:any) => (
                <li key={i}>
                  <strong>{policy.type}:</strong> {policy.content}
                </li>
              ),
              'No policies'
            )}
          </ReviewSection>
        );
      
      case 'awards':
        return (
          <ReviewSection title="Awards">
            {renderList(
              form.awards,
              (award:any, i:any) => <li key={i}>{award.name}</li>,
              'No awards'
            )}
          </ReviewSection>
        );
      
      case 'metrics':
        return (
          <ReviewSection title="Metrics">
            {renderList(
              form.metrics,
              (m:any, i:any) => (
                <li key={i}>
                  <strong>{m.label}:</strong> {m.value}
                </li>
              ),
              'No metrics'
            )}
          </ReviewSection>
        );
      
      case 'stats':
        return (
          <ReviewSection title="Statistics">
            {renderList(
              form.stats,
              (s:any, i:any) => (
                <li key={i}>
                  <strong>{s.label}:</strong> {s.value}
                </li>
              ),
              'No statistics'
            )}
          </ReviewSection>
        );
      
      case 'faqs':
        return (
          <ReviewSection title="FAQs">
            {form.faqs && form.faqs.length > 0 ? (
              form.faqs.map((faq:any, i:any) => (
                <div key={i} className="space-y-1 text-sm">
                  <p className="font-semibold">Q: {faq.question}</p>
                  <p className="ml-4">A: {faq.answer}</p>
                </div>
              ))
            ) : (
              <EmptyState message="No FAQs" />
            )}
          </ReviewSection>
        );
      
      case 'testimonials':
        return (
          <ReviewSection title="Testimonials">
            {form.testimonials && form.testimonials.length > 0 ? (
              form.testimonials.map((t:any, i:any) => (
                <blockquote
                  key={i}
                  className="border-l-2 pl-4 italic text-gray-600"
                >
                  “{t.quote}” — {t.author}
                </blockquote>
              ))
            ) : (
              <EmptyState message="No testimonials" />
            )}
          </ReviewSection>
        );
      
      case 'marketing':
        return (
          <ReviewSection title="Hero Slides">
            {renderList(
              form.heroSlides,
              (slide:any, i:any) => <li key={i}>{slide.headline || 'Untitled slide'}</li>,
              'No slides'
            )}
          </ReviewSection>
        );
      
      case 'promotions':
        return (
          <ReviewSection title="Promotions">
            {renderList(
              form.promotions,
              (promo:any, i:any) => <li key={i}>{promo.title}</li>,
              'No promotions'
            )}
          </ReviewSection>
        );
      

    case 'seo':
      return (
        <ReviewSection title="SEO Settings">
          {renderJSON(form.seo, 'No SEO settings')}
        </ReviewSection>
      );

    case 'theme':
      return (
        <ReviewSection title="Theme Settings">
          {renderJSON(form.themeSettings, 'No theme settings')}
        </ReviewSection>
      );

    case 'analytics':
      return (
        <ReviewSection title="Analytics Config">
          {renderJSON(form.analyticsConfig, 'No analytics config')}
        </ReviewSection>
      );

    case 'payment':
      return (
        <ReviewSection title="Payment Settings">
          {renderJSON(form.paymentSettings, 'No payment settings')}
        </ReviewSection>
      );

    case 'shipping':
      return (
        <ReviewSection title="Shipping Settings">
          {renderJSON(form.shippingSettings, 'No shipping settings')}
        </ReviewSection>
      );

    default:
      return <p className="text-sm text-gray-500">No data available for this section.</p>;
  }
};



// Render step or review
const StepContent = stepIndex < steps.length
? steps[stepIndex].render(form, handlers, availableCategories)
: (
  <div className="space-y-6">
    <h2 className="text-2xl font-semibold">Review Your Store</h2>
    {steps.map((s, i) => (
      <div
        key={s.key}
        className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
        onClick={() => setStepIndex(i)}
      >
        <h3 className="font-medium mb-2 flex justify-between items-center">
          <span>{s.title}</span>
          <span className="text-xs text-indigo-500">Edit ➔</span>
        </h3>
        <div className="text-gray-700">
          {renderReviewContent(s.key, form)}
        </div>
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
