"use client";

import React, { useState } from "react";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useStoreContext } from "@/contexts/StoreContext";
import { ServiceItem } from "@/app/admin/[slug]/services/AdminServicesClient";
import { useRouter } from "next/navigation";
import BookingForm from "../BookingForm";

const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality||75}`;

export default function ServicesSection() {
  const { storeFormData } = useStoreContext();
  const router = useRouter();
  const [selected, setSelected] = useState<ServiceItem | null>(null);

  if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading services...</p>
      </div>
    );
  }

  const { marketplaceListings } = storeFormData;

  return (
    <>
      <section className="bg-gray-50 py-16 px-6">
        <h2 className="text-center text-3xl md:text-4xl font-semibold mb-12">
          Our Premium Services
        </h2>
        <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
          {marketplaceListings.map((svc:any) => (
            <div
              key={svc.id}
              className="bg-white rounded-2xl shadow hover:shadow-lg transition p-6 flex flex-col"
            >
              <div className="aspect-[4/3] w-full mb-4 overflow-hidden rounded-lg">
                <Image
                  src={svc.images[0] || "/placeholder.png"}
                  loader={loader}
                  alt={svc.name || svc.title}
                  width={400}
                  height={300}
                  className="object-cover w-full h-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">{svc.name || svc.title}</h3>
              <p className="text-gray-600 flex-1">
                {(svc.description || "").slice(0, 80)}…
              </p>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-lg font-bold">${(svc.finalPrice||0).toFixed(2)}</p>
                <button
                  onClick={() => setSelected(svc)}
                  className="flex items-center gap-1 text-indigo-600 hover:underline"
                >
                  Book Now
                  <ArrowUpRightIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* backdrop */}
          <div
            className="fixed inset-0 bg-black opacity-50"
            onClick={() => setSelected(null)}
          />

          <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 mx-auto z-60 shadow-xl">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setSelected(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="md:w-1/2">
                <Image
                  src={selected.images[0] || "/placeholder.png"}
                  loader={loader}
                  alt={`${selected.name}` || `${selected.title}`}
                  width={500}
                  height={350}
                  className="object-cover rounded-lg w-full h-full"
                />
              </div>
              <div className="md:w-1/2 space-y-4">
                <h2 className="text-2xl font-bold">{selected.name || selected.title}</h2>
                <p className="text-gray-700">{selected.description}</p>
                <p className="text-lg font-semibold">
                  Price: ${ (selected.finalPrice||0).toFixed(2) }
                </p>

                <BookingForm
                  listingId={selected.id}
                  onComplete={(orderId) => {
                    setSelected(null);
                    router.push(`/site/service-provider/service-provider/checkout?orderId=${orderId}`);  // <— go to checkout
                  }}
                  // onComplete={() => {
                  //   setSelected(null);
                  //   router.push("/my-orders");
                  // }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
