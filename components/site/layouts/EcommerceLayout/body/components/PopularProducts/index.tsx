import React from 'react';

const products = [
  {
    id: 1,
    label: 'Sale',
    category: 'Snack & Munchies',
    name: "Haldiram's Sev Bhujia",
    rating: 4.5,
    reviews: 149,
    price: 18,
    originalPrice: 24,
    image: '/images/sev-bhujia.jpg',
  },
  {
    id: 2,
    label: '14%',
    category: 'Bakery & Biscuits',
    name: 'NutriChoice Digestive',
    rating: 4.5,
    reviews: 25,
    price: 24,
    originalPrice: null,
    image: '/images/nutri-choice.jpg',
  },
  {
    id: 3,
    label: null,
    category: 'Bakery & Biscuits',
    name: 'Cadbury 5 Star Chocolate',
    rating: 5,
    reviews: 469,
    price: 32,
    originalPrice: 35,
    image: '/images/5-star.jpg',
  },
  {
    id: 4,
    label: 'Hot',
    category: 'Snack & Munchies',
    name: 'Onion Flavour Potato',
    rating: 3.5,
    reviews: 456,
    price: 3,
    originalPrice: 5,
    image: '/images/onion-potato.jpg',
  },
];

const ProductCard = ({ product } : any) => (
  <div className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center">
    {product.label && <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">{product.label}</div>}
    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover mt-2" />
    <div className="text-sm text-gray-500">{product.category}</div>
    <h3 className="text-lg font-semibold">{product.name}</h3>
    <div className="text-yellow-500 text-sm">⭐ {product.rating} ({product.reviews})</div>
    <div className="text-green-600 font-bold">${product.price} {product.originalPrice && <span className="text-gray-400 line-through">${product.originalPrice}</span>}</div>
    <button className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">+ Add</button>
  </div>
);

export default function PopularProducts() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
