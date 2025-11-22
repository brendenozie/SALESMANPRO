// components/automarket/CarCard.tsx
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { BeakerIcon, CalendarIcon, CogIcon, HeartIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { WrenchIcon } from '@heroicons/react/24/solid';

const loader = ({ src }: { src: string }) => src;

export default function CarCard({ car }: { car: any }) {
  const [hover, setHover] = useState(false);

  const img = (Array.isArray(car.images) && car.images[0]) ? car.images[0] : '/placeholder-car.png';

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        <Image src={img} loader={loader} alt={`${car.make} ${car.model}`} fill style={{ objectFit: 'cover' }} className={`transition-transform duration-700 ease-out ${hover ? 'scale-105' : 'scale-100'}`} />

        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/50 to-transparent p-4 flex justify-between items-start">
          <div className="flex gap-2">
            {Array.isArray(car.badges) && car.badges.map((b: string, i: number) => (
              <span key={i} className="bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded border border-white/20 uppercase tracking-wide">
                {b}
              </span>
            ))}
          </div>

          <Link href={`/cars/${car.slug || car.id}`} onClick={(e) => e} className="relative z-10">
            <button className="bg-white p-2 rounded-full shadow-lg hover:bg-rose-50 hover:text-rose-500 transition-colors">
              <HeartIcon className={hover ? "text-rose-500 w-5 h-5 fill-rose-500" : "text-gray-400"} />
            </button>
          </Link>
        </div>

        <div className={`absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-sm p-4 translate-y-full transition-transform duration-300 ${hover ? 'translate-y-0' : ''} flex justify-between text-xs font-medium text-gray-600`}>
          {car.specs && Object.entries(car.specs).slice(0,4).map(([k, v]) => (
            <div key={k} className="text-center">
              <span className="block text-gray-400 uppercase text-[10px]">{k}</span>
              <span className="text-slate-900">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-4">
          <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{car.year} • {car.type}</div>
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors truncate">{car.make} {car.model}</h3>
          <div className="flex items-center gap-1 text-slate-500 text-sm mt-1">
            <MapPinIcon className="w-4 h-4" />
            <span>{car.location}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6 py-4 border-t border-b border-gray-100">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CogIcon className="w-4 h-4 text-slate-400" />
            <span>{Number(car.mileage || 0).toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <WrenchIcon className="w-4 h-4 text-slate-400" />
            <span>{car.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <BeakerIcon className="w-4 h-4 text-slate-400" />
            <span>{car.fuel}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <CalendarIcon className="w-4 h-4 text-slate-400" />
            <span>One Owner</span>
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400 font-medium">Cash Price</p>
            <p className="text-2xl font-bold text-slate-900">${Number(car.price || 0).toLocaleString()}</p>
          </div>

          <Link href={`/cars/${car.slug || car.id}`} className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors">
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}
