import React, { useState, useEffect } from "react";
import { GetServerSidePropsContext } from "next";
import { getSession, useSession } from "next-auth/react";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/router";

// Page to display & update store details
export default function StoreDetails({ initialData }) {
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
    policies: JSON.stringify({ shipping: "", returns: "", terms: "" }, null, 2),
    shippingZones: JSON.stringify([""], null, 2),
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        socialLinks: JSON.stringify(initialData.socialLinks || {}, null, 2),
        policies: JSON.stringify(initialData.policies || {}, null, 2),
        shippingZones: JSON.stringify(initialData.shippingZones || [], null, 2),
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((f) => ({ ...f, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      socialLinks: JSON.parse(form.socialLinks),
      policies: JSON.parse(form.policies),
      shippingZones: JSON.parse(form.shippingZones),
    };
    const res = await fetch(`/api/stores/${initialData.slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) router.reload();
  };

  return (
    <UserLayout>
      <div className="flex">
        <UserNav />
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
              Store Details
            </h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Store Name</Label>
                  <Input id="name" value={form.name} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="slug">Slug (URL)</Label>
                  <Input id="slug" value={form.slug} onChange={handleChange} disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={handleChange} rows={3} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" value={form.category} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input id="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input id="contactPhone" value={form.contactPhone} onChange={handleChange} />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" value={form.address} onChange={handleChange} />
                </div>
              </div>

              <div>
                <Label htmlFor="socialLinks">Social Links (JSON)</Label>
                <Textarea id="socialLinks" value={form.socialLinks} onChange={handleChange} rows={4} />
              </div>

              <div>
                <Label htmlFor="policies">Policies (JSON)</Label>
                <Textarea id="policies" value={form.policies} onChange={handleChange} rows={4} />
              </div>

              <div>
                <Label htmlFor="shippingZones">Shipping Zones (JSON array)</Label>
                <Textarea id="shippingZones" value={form.shippingZones} onChange={handleChange} rows={2} />
              </div>

              <div className="text-center">
                <Button type="submit" className="px-10 py-2">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </UserLayout>
  );
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  if (!session) {
    return { redirect: { destination: '/auth', permanent: false } };
  }
  const { slug } = context.params;
  // fetch store data from your API or DB
  const res = await fetch(`http://localhost:3000/api/stores/${slug}`, {
    headers: { Cookie: context.req.headers.cookie || '' },
  });
  const initialData = await res.json();

  return {
    props: { session, initialData },
  };
};
