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
interface PaymentSettingsOption { stripeKey?: string; paypalKey?: string; }
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

  // Basic field change
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

  // Submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    router.push('/stores');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        {/* Progress */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {['Basic', 'Categories', 'Media', 'Contact', 'Advanced'][step - 1]} Info
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 1. Basic */}
          {step === 1 && (
            <div className="grid gap-4">
              {['name', 'tagline', 'category'].map(field => (
                <div key={field}>
                  <label className="block text-sm font-medium capitalize">{field}</label>
                  <input
                    name={field}
                    value={(form as any)[field]}
                    onChange={handleChange}
                    required={field === 'name' || field === 'category'}
                    className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* 2. Categories */}
          {step === 2 && (
            <div>
              <p className="block text-sm font-medium">Select Categories</p>
              <div className="mt-2 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {availableCategories.map(cat => (
                  <label
                    key={cat.id}
                    className="flex items-center p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={form.storeCategories?.some(c => c.id === cat.id)}
                      onChange={() => handleCategoryToggle(cat)}
                    />
                    <span className="text-gray-700">{cat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* 3. Media */}
          {step === 3 && (
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
          )}

          {/* 4. Contact & Location */}
          {step === 4 && (
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
          )}

          {/* 5. Advanced */}
          {step === 5 && (
            <div className="space-y-6">
              {/* Social Links */}
              <div>
                <p className="block text-sm font-medium">Social Links</p>
                {(form.socialLinks || []).map((s, i) => (
                  <div key={i} className="flex space-x-2 items-center mb-2">
                    <input
                      placeholder="Channel"
                      value={s.channel}
                      onChange={e =>
                        handleArrayChange<SocialLinkOption>('socialLinks', i, 'channel', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="URL"
                      value={s.url}
                      onChange={e =>
                        handleArrayChange<SocialLinkOption>('socialLinks', i, 'url', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('socialLinks', i)}
                      className="text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem<SocialLinkOption>('socialLinks', { channel: '', url: '' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Social
                </button>
              </div>

              {/* Policies */}
              <div>
                <p className="block text-sm font-medium">Policies</p>
                {(form.policies || []).map((p, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-2">
                    <input
                      placeholder="Type"
                      value={p.type}
                      onChange={e => handleArrayChange<PolicyOption>('policies', i, 'type', e.target.value)}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Title"
                      value={p.title || ''}
                      onChange={e =>
                        handleArrayChange<PolicyOption>('policies', i, 'title', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Content"
                      value={p.content}
                      onChange={e => handleArrayChange<PolicyOption>('policies', i, 'content', e.target.value)}
                      rows={2}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('policies', i)}
                      className="text-red-500 text-left"
                    >
                      × Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem<PolicyOption>('policies', { type: '', title: '', content: '' })}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Policy
                </button>
              </div>

              {/* FAQs */}
              <div>
                <p className="block text-sm font-medium">FAQs</p>
                {(form.faqs || []).map((f, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-2">
                    <input
                      placeholder="Question"
                      value={f.question}
                      onChange={e => handleArrayChange<FAQOption>('faqs', i, 'question', e.target.value)}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Answer"
                      value={f.answer}
                      onChange={e => handleArrayChange<FAQOption>('faqs', i, 'answer', e.target.value)}
                      rows={2}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('faqs', i)}
                      className="text-red-500 text-left"
                    >
                      × Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem<FAQOption>('faqs', { question: '', answer: '', order: (form.faqs ?? []).length })
                  }
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add FAQ
                </button>
              </div>

              {/* Testimonials */}
              <div>
                <p className="block text-sm font-medium">Testimonials</p>
                {(form.testimonials || []).map((t, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-2">
                    <input
                      placeholder="Author"
                      value={t.author}
                      onChange={e =>
                        handleArrayChange<TestimonialOption>('testimonials', i, 'author', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Quote"
                      value={t.quote}
                      onChange={e =>
                        handleArrayChange<TestimonialOption>('testimonials', i, 'quote', e.target.value)
                      }
                      rows={2}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Avatar URL"
                      value={t.avatarUrl || ''}
                      onChange={e =>
                        handleArrayChange<TestimonialOption>('testimonials', i, 'avatarUrl', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Rating"
                      type="number"
                      value={t.rating || ''}
                      onChange={e =>
                        handleArrayChange<TestimonialOption>(
                          'testimonials',
                          i,
                          'rating',
                          parseInt(e.target.value, 10)
                        )
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('testimonials', i)}
                      className="text-red-500 text-left"
                    >
                      × Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem<TestimonialOption>('testimonials', {
                      author: '',
                      quote: '',
                      avatarUrl: '',
                      rating: 0,
                      order: form.testimonials?.length || 0,
                    })
                  }
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Testimonial
                </button>
              </div>

              {/* Hero Slides */}
              <div>
                <p className="block text-sm font-medium">Hero Slides</p>
                {(form.heroSlides || []).map((h, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-2">
                    <input
                      placeholder="Image URL"
                      value={h.imageUrl}
                      onChange={e =>
                        handleArrayChange<BannerOption>('heroSlides', i, 'imageUrl', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Headline"
                      value={h.headline || ''}
                      onChange={e =>
                        handleArrayChange<BannerOption>('heroSlides', i, 'headline', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Subline"
                      value={h.subline || ''}
                      onChange={e =>
                        handleArrayChange<BannerOption>('heroSlides', i, 'subline', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="CTA Text"
                      value={h.ctaText || ''}
                      onChange={e =>
                        handleArrayChange<BannerOption>('heroSlides', i, 'ctaText', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="CTA Link"
                      value={h.ctaLink || ''}
                      onChange={e =>
                        handleArrayChange<BannerOption>('heroSlides', i, 'ctaLink', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('heroSlides', i)}
                      className="text-red-500 text-left"
                    >
                      × Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem<BannerOption>('heroSlides', {
                      imageUrl: '',
                      headline: '',
                      subline: '',
                      ctaText: '',
                      ctaLink: '',
                      order: form.heroSlides?.length ?? 0,
                    })
                  }
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Slide
                </button>
              </div>

              {/* Promotions */}
              <div>
                <p className="block text-sm font-medium">Promotions</p>
                {(form.promotions || []).map((p, i) => (
                  <div key={i} className="flex flex-col gap-2 mb-2">
                    <input
                      placeholder="Code"
                      value={p.code || ''}
                      onChange={e =>
                        handleArrayChange<PromotionOption>('promotions', i, 'code', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      placeholder="Title"
                      value={p.title}
                      onChange={e => handleArrayChange<PromotionOption>('promotions', i, 'title', e.target.value)}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <textarea
                      placeholder="Description"
                      value={p.description || ''}
                      onChange={e =>
                        handleArrayChange<PromotionOption>('promotions', i, 'description', e.target.value)
                      }
                      rows={2}
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex space-x-2">
                      <input
                        type="datetime-local"
                        value={p.startsAt || ''}
                        onChange={e =>
                          handleArrayChange<PromotionOption>('promotions', i, 'startsAt', e.target.value)
                        }
                        className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 flex-1"
                      />
                      <input
                        type="datetime-local"
                        value={p.endsAt || ''}
                        onChange={e =>
                          handleArrayChange<PromotionOption>('promotions', i, 'endsAt', e.target.value)
                        }
                        className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 flex-1"
                      />
                    </div>
                    <input
                      placeholder="Banner URL"
                      value={p.bannerUrl || ''}
                      onChange={e =>
                        handleArrayChange<PromotionOption>('promotions', i, 'bannerUrl', e.target.value)
                      }
                      className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('promotions', i)}
                      className="text-red-500 text-left"
                    >
                      × Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    addArrayItem<PromotionOption>('promotions', {
                      code: '',
                      title: '',
                      description: '',
                      startsAt: '',
                      endsAt: '',
                      bannerUrl: '',
                    })
                  }
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Add Promotion
                </button>
              </div>

              {/* Config JSON */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium">Theme Settings (JSON)</label>
                  <textarea
                    rows={3}
                    value={JSON.stringify(form.themeSettings, null, 2)}
                    onChange={e => setForm(f => ({ ...f, themeSettings: JSON.parse(e.target.value) }))}
                    className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">SEO Settings (JSON)</label>
                  <textarea
                    rows={3}
                    value={JSON.stringify(form.seo, null, 2)}
                    onChange={e => setForm(f => ({ ...f, seo: JSON.parse(e.target.value) }))}
                    className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Analytics Config (JSON)</label>
                  <textarea
                    rows={2}
                    value={JSON.stringify(form.analyticsConfig, null, 2)}
                    onChange={e =>
                      setForm(f => ({ ...f, analyticsConfig: JSON.parse(e.target.value) }))
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Payment Settings (JSON)</label>
                  <textarea
                    rows={2}
                    value={JSON.stringify(form.paymentSettings, null, 2)}
                    onChange={e =>
                      setForm(f => ({ ...f, paymentSettings: JSON.parse(e.target.value) }))
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Shipping Settings (JSON)</label>
                  <textarea
                    rows={2}
                    value={JSON.stringify(form.shippingSettings, null, 2)}
                    onChange={e =>
                      setForm(f => ({ ...f, shippingSettings: JSON.parse(e.target.value) }))
                    }
                    className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(s => s + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
