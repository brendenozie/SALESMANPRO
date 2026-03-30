'use client';

import useSWR from 'swr';
import ProductCard from '../ProductCard';
import { SkeletonGrid } from '../SkeletonGrid/SkeletonGrid';
import { ArrowRightIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { createCachedFetcher } from '@/lib/swrCachedFetcher';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const PrevArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border border-gray-100 hover:bg-black hover:text-white transition-all duration-300"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-5 h-5" />
  </button>
);

const NextArrow = ({ onClick }: { onClick?: () => void }) => (
  <button 
    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 backdrop-blur-md p-3 rounded-full shadow-xl border border-gray-100 hover:bg-black hover:text-white transition-all duration-300"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-5 h-5" />
  </button>
);

export default function DailyBestSells({ id }: { id: string }) {
  const url = `${apiBaseUrl}/site/productsByFlag?companyId=${id}&flag=isOnOffer&limit=8`;
  const cacheKey = `products-${id}-isOnOffer`;
  const fetcher = createCachedFetcher(cacheKey);

  const { data, isLoading } = useSWR(url, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 30000,
  });

  const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    dots: true,
    infinite: true,
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    centerMode: true,
    centerPadding: '20px',
  };

  if (isLoading) return <SkeletonGrid count={4} />;
  if (!data?.data?.length) return null;

  return (
    <section className="py-20 bg-[#fcfcfc]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">Curated Selection</span>
            <h2 className="text-4xl md:text-5xl font-serif text-gray-900 mt-2">The Heritage Collection</h2>
          </div>
          <button 
            onClick={() => window.location.href = `/motorcycleecommerce/products`}
            className="group flex items-center gap-2 text-sm font-bold tracking-widest uppercase pb-1 border-b-2 border-black"
          >
            Explore All <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Carousel */}
        <div className="md:hidden relative"> 
          <Slider {...settings}>
            {data.data.map((product: any) => (
              <div key={product.id} className="px-2">
                <ProductCard product={product} />
              </div>
            ))}
          </Slider>
        </div>

        {/* Desktop Grid */}
        <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {data.data.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}