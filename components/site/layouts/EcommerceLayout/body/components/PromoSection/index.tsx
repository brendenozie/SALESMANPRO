import { useStoreContext } from '@/contexts/StoreContext';
import React from 'react';

interface PromoItem {
  bannerUrl?: string;
  title: string;
  description: string;
  ctaText?: string;
  ctaLink?: string;
}

interface PromotionsSectionProps {
  promotions: PromoItem[];
}

export default function PromoSection({ promotions }: PromotionsSectionProps) {

  const { storeFormData } = useStoreContext();
    const { themeSettings = {} } = storeFormData || {};

    const primary = themeSettings.primaryColor || '#10B981';
    const secondary = themeSettings.secondaryColor || '#3B82F6';
  
    if (!promotions || promotions.length === 0) return null;

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 gap-6">
          {promotions.map((item, index) => (
            <div key={index} className="relative bg-white rounded-lg shadow-md p-6">
              <img src={item.bannerUrl} alt={item.title} className="w-full h-48 object-cover rounded-md" />
              {/* <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-md text-sm"> */}
                {/* {item.discount} */}
              {/* </div> */}
              <h3 className="mt-4 text-xl font-semibold text-gray-800">{item.title}</h3>
              <button className={`mt-3 bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-800`}
                style={{ background: primary }}>
                Shop Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
