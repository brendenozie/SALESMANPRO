import { PlusIcon, StarIcon } from '@heroicons/react/24/solid';
import React from 'react';
import { MarketplaceListingForm } from '@/types/typings';

interface ProductCardProps {
  product: MarketplaceListingForm;
  primary: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, primary }) => {
  const { title, images, finalPrice,  } = product;
  const originalPrice=0.0;
  const rating = 4.5;
  const reviews = 149;

  const discount =
    originalPrice && originalPrice > finalPrice
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : null;

  return (
    <div className="relative flex flex-col bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[12px] font-semibold px-2 py-1 rounded-full shadow">
          -{discount}%
        </div>
      )}

      {/* Product Image */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        <img
          src={images[0]}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        {/* Title */}
        <h3 className="text-md font-semibold text-gray-800 line-clamp-2 h-12">
          {title}
        </h3>

        {/* Price */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg font-bold text-green-600">
            ${finalPrice.toFixed(2)}
          </span>
          {originalPrice && originalPrice > finalPrice && (
            <span className="text-sm line-through text-gray-400">
              ${originalPrice}
              {/* .toFixed(2) */}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-yellow-500 text-sm">
          <StarIcon className="w-4 h-4" />
          <span>{rating}</span>
          <span className="text-gray-400">({reviews})</span>
        </div>

        {/* Add to Cart Button */}
        <button
          className="mt-4 flex items-center justify-center gap-2 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors duration-200 w-full"
          style={{ backgroundColor: primary }}
        >
          <PlusIcon className="w-5 h-5" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
