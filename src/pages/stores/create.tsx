import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

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
  const totalSteps = 5;

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
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-lg font-semibold">Basic Info</h2>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Slug</label>
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Tagline</label>
                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Domain</label>
                <input
                  name="domain"
                  value={form.domain}
                  onChange={handleChange}
                  className="mt-1 w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-2">Select Categories</h2>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {availableCategories.map(cat => (
                <label key={cat.id} className="flex items-center p-2 border rounded hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={form.storeCategories?.some(c => c.id === cat.id)}
                    onChange={() => {
                      const exists = form.storeCategories?.some(c => c.id === cat.id);
                      const newCats = exists
                        ? form.storeCategories!.filter(c => c.id !== cat.id)
                        : [...(form.storeCategories || []), cat];
                      setForm(f => ({ ...f, storeCategories: newCats } as any));
                    }}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        );
      // Steps 3-4 follow similar structure...
      case 3:
        return (
            <div className="grid gap-4">
              {['bannerUrl', 'logoUrl', 'description'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">{field}</label>
                  {field === 'description' ? (
                    <textarea
                      name={field}
                      rows={4}
                      value={(form as any)[field]}
                      onChange={handleChange}
                      className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <input
                      name={field}
                      type={field.includes('Url') ? 'url' : 'text'}
                      value={(form as any)[field]}
                      onChange={handleChange}
                      className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
        )

      {/* 4. Contact & Location */}
      case 4:
        return (
            <div className="grid gap-4">
              <div>
                <label className="block text-sm font-medium">Contact Email</label>
                <input
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  required
                  className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium">Geo Lat</label>
                  <input
                    type="number"
                    step="any"
                    value={form.geoLocation?.lat}
                    onChange={e =>
                      setForm((f:any) => ({
                        ...f,
                        geoLocation: { ...f.geoLocation, lat: parseFloat(e.target.value) },
                      }))
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Geo Lng</label>
                  <input
                    type="number"
                    step="any"
                    value={form.geoLocation?.lng ?? 0}
                    onChange={e =>
                      setForm((f:any) => ({
                        ...f,
                        geoLocation: { ...f.geoLocation, lng: parseFloat(e.target.value) },
                      }))
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )
      {/* 5. Advanced Settings */}
      case 5:
        return (
          <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <h2 className="text-lg font-semibold">Advanced Settings</h2>

            {/* Social Links Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>Social Links</span>
                <span>{(form.socialLinks?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.socialLinks || []).map((s, i) => (
                  <div key={i} className="flex space-x-2 items-center">
                    <input
                      placeholder="Channel (e.g. Twitter)"
                      value={s.channel}
                      onChange={e => handleArrayChange<SocialLinkOption>('socialLinks', i, 'channel', e.target.value)}
                      className="flex-1 border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="URL"
                      value={s.url}
                      onChange={e => handleArrayChange<SocialLinkOption>('socialLinks', i, 'url', e.target.value)}
                      className="flex-2 border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('socialLinks', i)} className="text-red-500">×</button>
                  </div>
                ))}
                <button
                  disabled={(form.socialLinks || []).some(s => !s.channel || !s.url)}
                  onClick={() => addArrayItem<SocialLinkOption>('socialLinks', { channel: '', url: '' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add Social Link
                </button>
              </div>
            </details>

            {/* Policies Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>Policies</span>
                <span>{(form.policies?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.policies || []).map((p, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder="Type (e.g. Refunds)"
                      value={p.type}
                      onChange={e => handleArrayChange<PolicyOption>('policies', i, 'type', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <textarea
                      placeholder="Content"
                      value={p.content}
                      onChange={e => handleArrayChange<PolicyOption>('policies', i, 'content', e.target.value)}
                      rows={2}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('policies', i)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  disabled={(form.policies || []).some(p => !p.type || !p.content)}
                  onClick={() => addArrayItem<PolicyOption>('policies', { type: '', content: '' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add Policy
                </button>
              </div>
            </details>

            {/* FAQs Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>FAQs</span>
                <span>{(form.faqs?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.faqs || []).map((f, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder="Question"
                      value={f.question}
                      onChange={e => handleArrayChange<FAQOption>('faqs', i, 'question', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <textarea
                      placeholder="Answer"
                      value={f.answer}
                      onChange={e => handleArrayChange<FAQOption>('faqs', i, 'answer', e.target.value)}
                      rows={2}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('faqs', i)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  disabled={(form.faqs || []).some(f => !f.question || !f.answer)}
                  onClick={() => addArrayItem<FAQOption>('faqs', { question: '', answer: '', order: (form.faqs || []).length })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add FAQ
                </button>
              </div>
            </details>

            {/* Testimonials Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>Testimonials</span>
                <span>{(form.testimonials?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.testimonials || []).map((t, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder="Author"
                      value={t.author}
                      onChange={e => handleArrayChange<TestimonialOption>('testimonials', i, 'author', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <textarea
                      placeholder="Quote"
                      value={t.quote}
                      onChange={e => handleArrayChange<TestimonialOption>('testimonials', i, 'quote', e.target.value)}
                      rows={2}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('testimonials', i)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  disabled={(form.testimonials || []).some(t => !t.author || !t.quote)}
                  onClick={() => addArrayItem<TestimonialOption>('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: (form.testimonials || []).length })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add Testimonial
                </button>
              </div>
            </details>

            {/* Hero Slides Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>Hero Slides</span>
                <span>{(form.heroSlides?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.heroSlides || []).map((h, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder="Image URL"
                      value={h.imageUrl}
                      onChange={e => handleArrayChange<BannerOption>('heroSlides', i, 'imageUrl', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="Headline"
                      value={h.headline}
                      onChange={e => handleArrayChange<BannerOption>('heroSlides', i, 'headline', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('heroSlides', i)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  disabled={(form.heroSlides || []).some(h => !h.imageUrl || !h.headline)}
                  onClick={() => addArrayItem<BannerOption>('heroSlides', { imageUrl: '', headline: '', subline: '', ctaText: '', ctaLink: '', order: (form.heroSlides || []).length })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add Hero Slide
                </button>
              </div>
            </details>

            {/* Promotions Accordion */}
            <details className="border rounded">
              <summary className="px-4 py-2 flex justify-between cursor-pointer">
                <span>Promotions</span>
                <span>{(form.promotions?.length || 0) > 0 ? '✅' : '+'}</span>
              </summary>
              <div className="p-4 space-y-2">
                {(form.promotions || []).map((p, i) => (
                  <div key={i} className="space-y-1">
                    <input
                      placeholder="Code"
                      value={p.code}
                      onChange={e => handleArrayChange<PromotionOption>('promotions', i, 'code', e.target.value)}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <textarea
                      placeholder="Description"
                      value={p.description}
                      onChange={e => handleArrayChange<PromotionOption>('promotions', i, 'description', e.target.value)}
                      rows={2}
                      className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
                    />
                    <button onClick={() => removeArrayItem('promotions', i)} className="text-red-500">Remove</button>
                  </div>
                ))}
                <button
                  disabled={(form.promotions || []).some(p => !p.code || !p.description)}
                  onClick={() => addArrayItem<PromotionOption>('promotions', { title:'', code: '', description: '', startsAt: '', endsAt: '', bannerUrl: '' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                >
                  Add Promotion
                </button>
              </div>
            </details>

            {/* JSON Config Accordion */}
            <details className="border rounded">
                  <summary className="px-4 py-2 flex justify-between cursor-pointer">
                    <span>Advanced Settings</span>
                    <span>⚙️</span>
                  </summary>
                  <div className="p-4 space-y-6">
                    {/* Theme Settings */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Theme Settings</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs">Primary Color</label>
                          <input
                            type="text"
                            value={form.themeSettings?.primaryColor || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                themeSettings: { ...f.themeSettings, primaryColor: e.target.value }
                              }))
                            }
                            placeholder="#4f46e5"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs">Secondary Color</label>
                          <input
                            type="text"
                            value={form.themeSettings?.secondaryColor || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                themeSettings: { ...f.themeSettings, secondaryColor: e.target.value }
                              }))
                            }
                            placeholder="#facc15"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs">Font Family</label>
                          <input
                            type="text"
                            value={form.themeSettings?.fontFamily || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                themeSettings: { ...f.themeSettings, fontFamily: e.target.value }
                              }))
                            }
                            placeholder="Inter, sans-serif"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEO Settings */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">SEO Settings</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs">Page Title</label>
                          <input
                            type="text"
                            value={form.seo?.title || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                seo: { ...f.seo, title: e.target.value }
                              }))
                            }
                            placeholder="My Awesome Store"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs">Meta Description</label>
                          <textarea
                            rows={2}
                            value={form.seo?.description || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                seo: { ...f.seo, description: e.target.value }
                              }))
                            }
                            placeholder="Best deals on fashion, electronics, and more."
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs">Keywords (comma-separated)</label>
                          <input
                            type="text"
                            value={form.seo?.keywords?.join(', ') || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                seo: { ...f.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
                              }))
                            }
                            placeholder="ecommerce, fashion, electronics"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Analytics Config */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Analytics</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs">Google Tag ID</label>
                          <input
                            type="text"
                            value={form.analyticsConfig?.googleTag || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                analyticsConfig: { ...f.analyticsConfig, googleTag: e.target.value }
                              }))
                            }
                            placeholder="G-XXXXXXXXXX"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs">Facebook Pixel ID</label>
                          <input
                            type="text"
                            value={form.analyticsConfig?.facebookTag || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                analyticsConfig: { ...f.analyticsConfig, facebookTag: e.target.value }
                              }))
                            }
                            placeholder="1234567890"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Settings */}
                    <div className="space-y-2">
                          <h3 className="text-sm font-semibold">Payment Settings</h3>
                          <div className="space-y-4">
                            {/* M-Pesa */}
                            <fieldset className="border rounded p-3">
                              <legend className="text-xs font-medium">M-Pesa (Daraja API)</legend>
                              <div className="space-y-2">
                                <div>
                                  <label className="block text-xs">Business Shortcode</label>
                                  <input
                                    type="text"
                                    value={form.paymentSettings?.mpesaShortcode || ''}
                                    onChange={e =>
                                      setForm(f => ({
                                        ...f,
                                        paymentSettings: { ...f.paymentSettings, mpesaShortcode: e.target.value }
                                      }))
                                    }
                                    placeholder="e.g. 123456"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs">API Consumer Key</label>
                                  <input
                                    type="text"
                                    value={form.paymentSettings?.mpesaConsumerKey || ''}
                                    onChange={e =>
                                      setForm(f => ({
                                        ...f,
                                        paymentSettings: { ...f.paymentSettings, mpesaConsumerKey: e.target.value }
                                      }))
                                    }
                                    placeholder="Your Daraja Consumer Key"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs">API Consumer Secret</label>
                                  <input
                                    type="text"
                                    value={form.paymentSettings?.mpesaConsumerSecret || ''}
                                    onChange={e =>
                                      setForm(f => ({
                                        ...f,
                                        paymentSettings: { ...f.paymentSettings, mpesaConsumerSecret: e.target.value }
                                      }))
                                    }
                                    placeholder="Your Daraja Consumer Secret"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs">Callback URL</label>
                                  <input
                                    type="url"
                                    value={form.paymentSettings?.mpesaCallbackUrl || ''}
                                    onChange={e =>
                                      setForm(f => ({
                                        ...f,
                                        paymentSettings: { ...f.paymentSettings, mpesaCallbackUrl: e.target.value }
                                      }))
                                    }
                                    placeholder="https://yourdomain.com/api/mpesa/callback"
                                    className="w-full border rounded px-2 py-1 text-sm"
                                  />
                                </div>
                              </div>
                            </fieldset>


                          </div>
                        </div>

                    {/* Shipping Settings */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-semibold">Shipping Settings</h3>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs">Carrier Name</label>
                          <input
                            type="text"
                            value={form.shippingSettings?.carrierName || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                shippingSettings: { ...f.shippingSettings, carrierName: e.target.value }
                              }))
                            }
                            placeholder="DHL, FedEx, etc."
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs">Tracking URL Template</label>
                          <input
                            type="text"
                            value={form.shippingSettings?.trackingUrl || ''}
                            onChange={e =>
                              setForm(f => ({
                                ...f,
                                shippingSettings: { ...f.shippingSettings, trackingUrl: e.target.value }
                              }))
                            }
                            placeholder="https://tracking.example.com/track?code={tracking_number}"
                            className="w-full border rounded px-2 py-1 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </details>
          </div>
          
          );
      case 6 : 
       return ( <SocialLinksAccordion />   );

      case 7 : 
        return (<PoliciesAccordion />);

      case 8 : 
        return (<FAQsAccordion />);

      case 9 : 
        return (<TestimonialsAccordion />);
      case 10 :
        return (<HeroSlidesAccordion />);
      case 11 :
        return (<PromotionsAccordion />);
      
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




const SocialLinksAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>Social Links</span>
      <span>{(form.socialLinks?.length || 0) > 0 ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      {(form.socialLinks || []).map((s, i) => (
        <div key={i} className="flex space-x-2 items-center">
          <input
            placeholder="Channel (e.g. Twitter)"
            value={s.channel}
            onChange={e => handleArrayChange('socialLinks', i, 'channel', e.target.value)}
            className="flex-1 border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <input
            placeholder="URL"
            value={s.url}
            onChange={e => handleArrayChange('socialLinks', i, 'url', e.target.value)}
            className="flex-2 border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('socialLinks', i)} className="text-red-500">×</button>
        </div>
      ))}
      <button
        disabled={(form.socialLinks || []).some(s => !s.channel || !s.url)}
        onClick={() => addArrayItem('socialLinks', { channel: '', url: '' })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add Social Link
      </button>
    </div>
  </details>
);

const PoliciesAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>Policies</span>
      <span>{(form.policies?.length || 0) > 0 ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      {(form.policies || []).map((p, i) => (
        <div key={i} className="space-y-1">
          <input
            placeholder="Type (e.g. Refunds)"
            value={p.type}
            onChange={e => handleArrayChange('policies', i, 'type', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Content"
            value={p.content}
            onChange={e => handleArrayChange('policies', i, 'content', e.target.value)}
            rows={2}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('policies', i)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button
        disabled={(form.policies || []).some(p => !p.type || !p.content)}
        onClick={() => addArrayItem('policies', { type: '', content: '' })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add Policy
      </button>
    </div>
  </details>
);

const FAQsAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>FAQs</span>
      <span>{(form.faqs?.length || 0) > 0 ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      {(form.faqs || []).map((f, i) => (
        <div key={i} className="space-y-1">
          <input
            placeholder="Question"
            value={f.question}
            onChange={e => handleArrayChange('faqs', i, 'question', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Answer"
            value={f.answer}
            onChange={e => handleArrayChange('faqs', i, 'answer', e.target.value)}
            rows={2}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('faqs', i)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button
        disabled={(form.faqs || []).some(f => !f.question || !f.answer)}
        onClick={() => addArrayItem('faqs', { question: '', answer: '', order: (form.faqs || []).length })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add FAQ
      </button>
    </div>
  </details>
);

const TestimonialsAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>Testimonials</span>
      <span>{(form.testimonials?.length || 0) > 0 ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      {(form.testimonials || []).map((t, i) => (
        <div key={i} className="space-y-1">
          <input
            placeholder="Author"
            value={t.author}
            onChange={e => handleArrayChange('testimonials', i, 'author', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Quote"
            value={t.quote}
            onChange={e => handleArrayChange('testimonials', i, 'quote', e.target.value)}
            rows={2}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('testimonials', i)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button
        disabled={(form.testimonials || []).some(t => !t.author || !t.quote)}
        onClick={() => addArrayItem('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: (form.testimonials || []).length })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add Testimonial
      </button>
    </div>
  </details>
);

const HeroSlidesAccordion = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>Hero Slides</span>
      <span>{(form.heroSlides?.length || 0) > 0 ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      {(form.heroSlides || []).map((h, i) => (
        <div key={i} className="space-y-1">
          <input
            placeholder="Image URL"
            value={h.imageUrl}
            onChange={e => handleArrayChange('heroSlides', i, 'imageUrl', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <input
            placeholder="Headline"
            value={h.headline}
            onChange={e => handleArrayChange('heroSlides', i, 'headline', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('heroSlides', i)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button
        disabled={(form.heroSlides || []).some(h => !h.imageUrl || !h.headline)}
        onClick={() => addArrayItem('heroSlides', { imageUrl: '', headline: '', subline: '', ctaText: '', ctaLink: '', order: (form.heroSlides || []).length })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add Hero Slide
      </button>
    </div>
  </details>
);

        <div key={i} className="space-y-1">
          <input
            placeholder="Title"
            value={p.title}
            onChange={e => handleArrayChange('promotions', i, 'title', e.target.value)}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <textarea
            placeholder="Details"
            value={p.details}
            onChange={e => handleArrayChange('promotions', i, 'details', e.target.value)}
            rows={2}
            className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
          />
          <button onClick={() => removeArrayItem('promotions', i)} className="text-red-500">Remove</button>
        </div>
      ))}
      <button
        disabled={(form.promotions || []).some(p => !p.title || !p.details)}
        onClick={() => addArrayItem('promotions', { title: '', details: '', order: (form.promotions || []).length })}
        className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        Add Promotion
      </button>
    </div>
  </details>
);

const AdvancedJsonAccordion = ({ form, setForm }) => (
  <details className="border rounded">
    <summary className="px-4 py-2 flex justify-between cursor-pointer">
      <span>Advanced Config (JSON)</span>
      <span>{form.advancedJson ? '✅' : '+'}</span>
    </summary>
    <div className="p-4 space-y-2">
      <textarea
        placeholder="Paste or edit your JSON config here"
        value={form.advancedJson}
        onChange={e => {
          try {
            const parsed = JSON.parse(e.target.value);
            setForm(prev => ({ ...prev, advancedJson: e.target.value, parsedAdvancedJson: parsed }));
          } catch {
            setForm(prev => ({ ...prev, advancedJson: e.target.value }));
          }
        }}
        rows={8}
        className="w-full border rounded px-2 py-1 font-mono focus:ring-indigo-400"
      />
      <p className="text-sm text-gray-500">Ensure your JSON is valid. This will include theme, SEO, analytics, and payment configurations.</p>
    </div>
  </details>
);

// export {
//   SocialLinksAccordion,
//   PoliciesAccordion,
//   FAQsAccordion,
//   TestimonialsAccordion,
//   HeroSlidesAccordion,
//   PromotionsAccordion,
//   AdvancedJsonAccordion,
// };
