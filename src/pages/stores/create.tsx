import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

interface CategoryOption { id: string; name: string; }
interface StoreForm {
  name: string;
  slug: string;
  tagline: string;
  category: string;
  description: string;
  logoUrl: string;
  bannerUrl: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialLinks: string;
  policies: string;
  shippingZones: string;
  openingHours: string;
  geoLocation: string;
  themeSettings: string;
  seo: string;
  categories: CategoryOption[];
}

export default function CreateStorePage({ availableCategories }: { availableCategories: CategoryOption[] }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  const [form, setForm] = useState<StoreForm>({
    name: "",
    slug: "",
    tagline: "",
    category: "",
    description: "",
    logoUrl: "",
    bannerUrl: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    socialLinks: JSON.stringify({ twitter: "", instagram: "", facebook: "" }, null, 2),
    policies: JSON.stringify({ shipping: "", returns: "", terms: "" }, null, 2),
    shippingZones: JSON.stringify([], null, 2),
    openingHours: JSON.stringify({ mon: "", tue: "", wed: "", thu: "", fri: "", sat: "", sun: "" }, null, 2),
    geoLocation: JSON.stringify({ lat: 0, lng: 0 }, null, 2),
    themeSettings: JSON.stringify({ primaryColor: "#4F46E5", font: "Inter" }, null, 2),
    seo: JSON.stringify({ title: "", description: "", keywords: [] }, null, 2),
    categories: []
  });

  // Auto-generate slug
  useEffect(() => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        socialLinks: JSON.parse(form.socialLinks),
        policies: JSON.parse(form.policies),
        shippingZones: JSON.parse(form.shippingZones),
        openingHours: JSON.parse(form.openingHours),
        geoLocation: JSON.parse(form.geoLocation),
        themeSettings: JSON.parse(form.themeSettings),
        seo: JSON.parse(form.seo),
      };
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create store");
      const created = await res.json();
      router.push(`/stores/${created.id}`);
    } catch (err: any) {
      alert(err.message || "Error creating store");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600" style={{ width: `${(step/totalSteps)*100}%` }} />
          </div>
          <p className="text-sm text-gray-600 mt-2">Step {step} of {totalSteps}</p>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {step === 1 && 'Basic Info'}
          {step === 2 && 'Store Categories'}
          {step === 3 && 'Media & Description'}
          {step === 4 && 'Contact & Settings'}
          {step === 5 && 'Advanced & SEO'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium">Store Name</label>
                <input id="name" type="text" value={form.name} onChange={handleChange} required className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium">Slug (auto-generated)</label>
                <input id="slug" type="text" value={form.slug} disabled className="mt-1 w-full border bg-gray-100 rounded-md px-3 py-2" />
              </div>
              <div>
                <label htmlFor="tagline" className="block text-sm font-medium">Tagline</label>
                <input id="tagline" type="text" value={form.tagline} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="block text-sm font-medium">Select Categories</p>
              <div className="mt-2 max-h-60 overflow-y-auto border rounded p-2">
                {availableCategories.map(cat => (
                  <label key={cat.id} className="flex items-center p-2 hover:bg-gray-100">
                    <input type="checkbox" className="mr-2" checked={form.categories.some(c=>c.id===cat.id)} onChange={()=>{
                      setForm(f=>{
                        const exists = f.categories.find(c=>c.id===cat.id);
                        const newCats = exists?
                          f.categories.filter(c=>c.id!==cat.id):
                          [...f.categories,{id:cat.id,name:cat.name}];
                        return {...f,categories:newCats};
                      });
                    }} />
                    {cat.name}
                  </label>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label htmlFor="bannerUrl" className="block text-sm font-medium">Banner Image URL</label>
                <input id="bannerUrl" type="url" value={form.bannerUrl} onChange={handleChange} placeholder="https://..." className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium">Logo URL</label>
                <input id="logoUrl" type="url" value={form.logoUrl} onChange={handleChange} placeholder="https://..." className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium">Description</label>
                <textarea id="description" rows={4} value={form.description} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium">Contact Email</label>
                <input id="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} required className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium">Contact Phone</label>
                <input id="contactPhone" type="tel" value={form.contactPhone} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium">Address</label>
                <input id="address" type="text" value={form.address} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="openingHours" className="block text-sm font-medium">Opening Hours (JSON)</label>
                <textarea id="openingHours" rows={3} value={form.openingHours} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="geoLocation" className="block text-sm font-medium">Geo Location (JSON)</label>
                <textarea id="geoLocation" rows={2} value={form.geoLocation} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div>
                <label htmlFor="themeSettings" className="block text-sm font-medium">Theme Settings (JSON)</label>
                <textarea id="themeSettings" rows={3} value={form.themeSettings} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="seo" className="block text-sm font-medium">SEO Settings (JSON)</label>
                <textarea id="seo" rows={3} value={form.seo} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="policies" className="block text-sm font-medium">Policies (JSON)</label>
                <textarea id="policies" rows={3} value={form.policies} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="shippingZones" className="block text-sm font-medium">Shipping Zones (JSON)</label>
                <textarea id="shippingZones" rows={2} value={form.shippingZones} onChange={handleChange} className="mt-1 w-full border rounded-md px-3 py-2 font-mono text-sm focus:ring-2 focus:ring-blue-500" />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 && (
              <button type="button" onClick={handlePrev} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Previous</button>
            )}
            {step < totalSteps ? (
              <button type="button" onClick={handleNext} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Next</button>
            ) : (
              <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700">Create Store</button>
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
