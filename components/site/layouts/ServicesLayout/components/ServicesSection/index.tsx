import { useStoreContext } from '@/contexts/StoreContext';
import { ArrowUpRightIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import React from 'react';

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const services = [
  {
    title: 'Regular Home Cleaning',
    image: '/services/regular-home.jpg',
    bg: 'bg-teal-900 text-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
  {
    title: 'Deep Cleaning',
    image: '/services/deep-cleaning.jpg',
    bg: 'bg-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
  {
    title: 'Move-In/Out Cleaning',
    image: '/services/move-out.jpg',
    bg: 'bg-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
  {
    title: 'Post-Construction Cleaning',
    image: '/services/post-construction.jpg',
    bg: 'bg-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
  {
    title: 'Commercial Cleaning',
    image: '/services/commercial.jpg',
    bg: 'bg-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
  {
    title: 'Specialized Cleaning',
    image: '/services/specialized.jpg',
    bg: 'bg-white',
    description: 'Conducting all cleaning tasks with professionalism, including arriving on time.',
  },
];

export default function ServicesSection() {
  const { storeFormData } = useStoreContext();

   // If there's any chance `storeFormData` is not yet loaded, guard early:
   if (!storeFormData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const {
    slug,
    marketplaceListings,     // assume you added this field to Prisma/StoreForm
  } = storeFormData;

  return (
    <section className="bg-white py-16 px-6">
      <h2 className="text-center text-3xl md:text-4xl font-semibold mb-12">
        We Take Pride for Our Services
      </h2>

      <div className="grid gap-8 md:grid-cols-3 max-w-7xl mx-auto">
        {/* Featured Services */}
      {marketplaceListings && marketplaceListings.length > 0 && (
        marketplaceListings.map((service, index) => (
          <div
          key={index}
          className={`relative rounded-2xl p-4 shadow-md transition-all `}
          // ${service.bg}
        >
          <div className="absolute top-4 right-4">
            <button
              className={`p-2 rounded-full transition bg-orange-400 text-white
                // $ {
              //   service.bg === 'bg-white'
              //     ? 'bg-orange-100 text-orange-500'
              //     : 'bg-orange-400 text-white'
              // }
              `}
            >
              <ArrowUpRightIcon className="w-4 h-4" />
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-2">{service.name || service.title }</h3>
          <p className="text-sm mb-4 opacity-80">{service.description || "Conducting all cleaning tasks with professionalism, including arriving on time."}</p>
          <div className="rounded-xl overflow-hidden aspect-[4/3]">
            <Image
              src={service.images[0]}
              loader={loader}
              alt={service.title || service.name }
              width={400}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
          </div>
        ))
      )}
        {services.map((service, index) => (
          <div
            key={index}
            className={`relative rounded-2xl p-4 shadow-md transition-all ${service.bg}`}
          >
            <div className="absolute top-4 right-4">
              <button
                className={`p-2 rounded-full transition ${
                  service.bg === 'bg-white'
                    ? 'bg-orange-100 text-orange-500'
                    : 'bg-orange-400 text-white'
                }`}
              >
                <ArrowUpRightIcon className="w-4 h-4" />
              </button>
            </div>

            <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
            <p className="text-sm mb-4 opacity-80">{service.description}</p>
            <div className="rounded-xl overflow-hidden aspect-[4/3]">
              <Image
                src={service.image}
                loader={loader}
                alt={service.title}
                width={400}
                height={300}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
