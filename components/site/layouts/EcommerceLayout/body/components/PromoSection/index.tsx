import React from 'react';

interface PromoItem {
  id: string;
  title: string;
  discount: string;
  image: string;
}

const promoItems: PromoItem[] = [
  { id: '1', title: 'Fruits & Vegetables', discount: 'Up to 30% Off', image: '/images/fruits.jpg' },
  { id: '2', title: 'Freshly Baked Buns', discount: 'Up to 25% Off', image: '/images/buns.jpg' },
];

export default function PromoSection() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-6">
          {promoItems.map((item) => (
            <div key={item.id} className="relative bg-white rounded-lg shadow-md p-6">
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover rounded-md" />
              <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm">
                {item.discount}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-800">{item.title}</h3>
              <button className="mt-3 bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800">
                Shop Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
