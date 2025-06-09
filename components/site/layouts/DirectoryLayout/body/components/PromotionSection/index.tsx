import React from 'react';

const banners = [
  {
    id: 'summer',
    label: 'FEATURED COLLECTION',
    title: 'CLEARANCE SUMMER',
    imgSrc: '/images/handbag.jpg',
    bgClass: 'bg-yellow-100',
    imgPosition: 'right', // can be 'left' or 'right'
  },
  {
    id: 'winter',
    label: 'FEATURED COLLECTION',
    title: 'CLEARANCE WINTER',
    imgSrc: '/images/hoodie.jpg',
    bgClass: 'bg-pink-100',
    imgPosition: 'left',
  },
];

export default function PromotionSection() {
  return (
    <section className="container mx-auto px-6 py-12">
      <div className="grid gap-6 md:grid-cols-2">
        {banners.map(({ id, label, title, imgSrc, bgClass, imgPosition }) => (
          <div
            key={id}
            className={`
              relative flex items-center rounded-2xl overflow-hidden ${bgClass}
              h-64
              ${imgPosition === 'right' ? 'flex-row' : 'flex-row-reverse'}
            `}
          >
            {/* Text block */}
            <div className="w-1/2 p-8">
              <p className="text-sm font-medium tracking-widest text-gray-600">
                {label}
              </p>
              <h2 className="mt-2 text-3xl font-bold">{title}</h2>
              <button className="mt-6 inline-block border-2 border-black px-6 py-2 text-sm font-medium hover:bg-black hover:text-white transition">
                SHOP NOW
              </button>
            </div>

            {/* Image */}
            <div className="w-1/2 h-full">
              <img
                src={imgSrc}
                alt={title}
                className="object-cover h-full w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
