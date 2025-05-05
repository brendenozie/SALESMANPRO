import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";

const CATEGORIES = [
  "Tech Gadgets",
  "Vehicles",
  "Fashion",
  "Household",
  "Sports & Outdoors",
  "Beauty & Health",
  "Toys & Hobbies",
  "Other",
];

export default function CreateStorePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const [form, setForm] = useState({
    name: "",
    slug: "",
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
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (form.name) {
      setForm(f => ({
        ...f,
        slug: f.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }));
    }
  }, [form.name]);

  const handleChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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
      };
      const res = await fetch("/api/stores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",    
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create store");
      const created = await res.json();
      router.push(`/stores/${created.id}`);
    } catch (err: any) {
      alert(err.message || "Error creating store");
    }
  };

  // if (!session) return null;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-width"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Step {step} of {totalSteps}
          </p>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {step === 1 && 'Basic Info'}
          {step === 2 && 'Media & Description'}
          {step === 3 && 'Contact & Advanced'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Store Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug (auto-generated)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  disabled
                  className="mt-1 block w-full border bg-gray-100 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700"
                >
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {step === 2 && (
            <>  
              <div>
                <label
                  htmlFor="bannerUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Banner Image URL
                </label>
                <input
                  id="bannerUrl"
                  type="url"
                  value={form.bannerUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="logoUrl"
                  className="block text-sm font-medium text-gray-700"
                >
                  Logo Image URL
                </label>
                <input
                  id="logoUrl"
                  type="url"
                  value={form.logoUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                   value={form.description}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contactEmail"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Email
                  </label>
                  <input
                    id="contactEmail"
                    type="email"
                    value={form.contactEmail}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactPhone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Contact Phone
                  </label>
                  <input
                    id="contactPhone"
                    type="tel"
                    value={form.contactPhone}
                    onChange={handleChange}
                    className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700"
                >
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  value={form.address}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="socialLinks"
                  className="block text-sm font-medium text-gray-700"
                >
                  Social Links (JSON)
                </label>
                <textarea
                  id="socialLinks"
                  rows={3}
                  value={form.socialLinks}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="policies"
                  className="block text-sm font-medium text-gray-700"
                >
                  Policies (JSON)
                </label>
                <textarea
                  id="policies"
                  rows={3}
                  value={form.policies}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label
                  htmlFor="shippingZones"
                  className="block text-sm font-medium text-gray-700"
                >
                  Shipping Zones (JSON array)
                </label>
                <textarea
                  id="shippingZones"
                  rows={2}
                  value={form.shippingZones}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
              >
                Previous
              </button>
            ) : (
              <div />
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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

// export const getServerSideProps = async (
//   ctx: GetServerSidePropsContext
// ) => {
//   // const session = await getSession(ctx);
//   // if (!session) {
//   //   return { redirect: { destination: "/auth", permanent: false } };
//   // }
//   return { props: {} };
// };
