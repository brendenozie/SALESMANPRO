import React, { useRef } from 'react'
import {
  HeartIcon,
  ShoppingBagIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const products = [
  {
    id: 1,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product1.jpg',
  },
  {
    id: 2,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product2.jpg',
  },
  {
    id: 3,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product3.jpg',
  },
  {
    id: 4,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product4.jpg',
  },
  {
    id: 5,
    brand: 'LOUIS VUITTON',
    title: 'SMALL BAG PACK',
    category: 'Bags',
    price: '$50',
    img: '/images/product5.jpg',
  },
]

export default function NewArrivalsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: string) => {
    if (!containerRef.current) return
    const width = containerRef.current.clientWidth
    containerRef.current.scrollBy({
      left: direction === 'left' ? -width : width,
      behavior: 'smooth',
    })
  }

  return (
    <section className="relative px-6 py-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">NEW ARRIVALS</h2>
        <div className="space-x-4">
          <button
            onClick={() => scroll('left')}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronLeftIcon className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
          >
            <ChevronRightIcon className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto no-scrollbar"
      >
        {products.map((p) => (
          <div
            key={p.id}
            className="min-w-[200px] bg-white rounded-2xl shadow hover:shadow-lg transition relative"
          >
            <button className="absolute top-3 right-3 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition">
              <HeartIcon className="h-5 w-5 text-gray-500" />
            </button>

            <img
              src={p.img}
              alt={p.title}
              className="w-full h-40 object-cover rounded-t-2xl"
            />

            <div className="p-4">
              <p className="text-xs text-gray-500">{p.brand}</p>
              <h3 className="mt-1 font-medium">{p.title}</h3>
              <p className="text-sm text-gray-400">{p.category}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-semibold">{p.price}</span>
                <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
                  <ShoppingBagIcon className="h-5 w-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
