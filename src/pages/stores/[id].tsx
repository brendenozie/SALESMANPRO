import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import prisma from "@/server/db/prismadb";

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

interface StoreData {
  name: string;
  slug: string;
  description?: string;
  category: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  socialLinks: Record<string,string>;
  policies: Record<string,string>;
  shippingZones: string[];
}

interface Props {
  initialData: StoreData;
}

export default function StoreDetails({ initialData }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    category: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    socialLinks: JSON.stringify({ twitter: "", instagram: "", facebook: "" }, null, 2),
    policies:    JSON.stringify({ shipping: "", returns: "", terms: "" }, null, 2),
    shippingZones: JSON.stringify([], null, 2),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || "",
        category: initialData.category,
        contactEmail: initialData.contactEmail,
        contactPhone: initialData.contactPhone || "",
        address: initialData.address || "",
        socialLinks: JSON.stringify(initialData.socialLinks || {}, null, 2),
        policies:    JSON.stringify(initialData.policies    || {}, null, 2),
        shippingZones: JSON.stringify(initialData.shippingZones || [], null, 2),
      });
    }
  }, [initialData]);

  const handleChange = (e: ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const { id, value } = e.target;
    setForm(f => ({ ...f, [id]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      socialLinks:  JSON.parse(form.socialLinks),
      policies:     JSON.parse(form.policies),
      shippingZones:JSON.parse(form.shippingZones),
    };
    const res = await fetch(`/api/stores/${initialData.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.reload();
    } else {
      alert("Failed to save changes");
    }
  };

  if (!session) return null; // or a loading state

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <nav className="w-64 bg-white border-r p-6">
        <ul className="space-y-4 text-gray-700">
          <li><a href="/dashboard" className="hover:text-blue-600">Dashboard</a></li>
          <li><a href="/stores"    className="hover:text-blue-600 font-semibold">Your Store</a></li>
          <li><a href="/orders"    className="hover:text-blue-600">Orders</a></li>
          {/* …other links */}
        </ul>
      </nav>

      {/* Main */}
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Store Details
          </h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name & Slug */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Store Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                  Slug (URL)
                </label>
                <input
                  id="slug"
                  type="text"
                  value={form.slug}
                  disabled
                  className="mt-1 block w-full border bg-gray-100 rounded-md px-3 py-2"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category & Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  value={form.category}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
                  Contact Email
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Phone & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  id="contactPhone"
                  type="text"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
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
            </div>

            {/* JSON fields */}
            <div>
              <label htmlFor="socialLinks" className="block text-sm font-medium text-gray-700">
                Social Links (JSON)
              </label>
              <textarea
                id="socialLinks"
                rows={4}
                value={form.socialLinks}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="policies" className="block text-sm font-medium text-gray-700">
                Policies (JSON)
              </label>
              <textarea
                id="policies"
                rows={4}
                value={form.policies}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label htmlFor="shippingZones" className="block text-sm font-medium text-gray-700">
                Shipping Zones (JSON array)
              </label>
              <textarea
                id="shippingZones"
                rows={2}
                value={form.shippingZones}
                onChange={handleChange}
                className="mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {/* Submit */}
            <div className="text-center">
              <button
                type="submit"
                className="inline-flex items-center px-10 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

// pages/stores/[slug].tsx


// pages/stores/[id].tsx

// pages/stores/[id].tsx

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  // 1) Session guard
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: "/auth", permanent: false } };
  }

  // 2) Extract & validate idParam
  const idParam = context.params?.id;
  if (
    typeof idParam !== "string" 
    // !ObjectId.isValid(idParam)      // ← makes sure it's a 24-hex ObjectId
  ) {
    return { notFound: true };
  }

  // 3) Fetch by ObjectId
  const store = await prisma.company.findUnique({
    where: { id: idParam },
  });

  // 4) Ownership & existence check
  if (!store || !session.user || store.userId !== session.user.id) {
    return { notFound: true };
  }

  // 5) Serialize for JSON
  const initialData = {
    ...store,
    createdAt: store.createdAt.toISOString(),
    updatedAt: store.updatedAt.toISOString(),
    socialLinks:   store.socialLinks   ?? {},
    policies:      store.policies      ?? {},
    shippingZones: store.shippingZones ?? [],
  };

  return { props: { initialData } };
};


// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   // 1) Protect the page
//   const session = await getSession(context);
//   if (!session) {
//     return { redirect: { destination: "/auth", permanent: false } };
//   }

//   // 2) Extract & validate `id`
//   const idParam = context.params?.id;
 
//   if (!idParam || typeof idParam !== "string") {
//     return { notFound: true };
//   }

//   // 3) Fetch by `id`
//   const store = await prisma.company.findUnique({
//     where: { id: idParam },
//   });

//   // 4) 404 if not found or not owned by this user
//   if (!store || !session.user || store.userId !== session.user.id) {
//     return { notFound: true };
//   }

//   // 5) Serialize JSON-able fields
//   const initialData = {
//     ...store,
//     createdAt: store.createdAt.toISOString(),
//     updatedAt: store.updatedAt.toISOString(),
//     socialLinks:   store.socialLinks   ?? {},
//     policies:      store.policies      ?? {},
//     shippingZones: store.shippingZones ?? [],
//   };

//   return {
//     props: { initialData },
//   };
// };


// export const getServerSideProps = async (context: GetServerSidePropsContext) => {
//   // 1) Protect the page
//   const session = await getSession(context);
//   if (!session) {
//     return { redirect: { destination: "/auth", permanent: false } };
//   }

//   // 2) Read the id and fetch the store from Prisma
//   const { id } = context.query;
//   if (!id || typeof id !== "string") {
//     return { notFound: true };
//   }

//   const store = await prisma.company.findFirst({
//     where: { id },
//     include: {
//       user: true,
//     },
//   });
//   if (!store) {
//     return { notFound: true };
//   }

//   // 3) If there's no store (or it's not owned by this user), 404
  // if (!store || !session.user || store.userId !== session.user.id) {
  //   return { notFound: true };
  // }

//   // 4) Serialize dates & JSON columns
//   const initialData = {
//     ...store,
//     createdAt: store.createdAt.toISOString(),
//     updatedAt: store.updatedAt.toISOString(),
//     socialLinks: store.socialLinks ?? {},
//     policies: store.policies ?? {},
//     shippingZones: store.shippingZones ?? [],
//   };

//   return {
//     props: {
//       initialData,
//     },
//   };
// };
