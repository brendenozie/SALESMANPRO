import { useStateContext } from '@/contexts/ContextProvider';
import { useStoreContext } from '@/contexts/StoreContext';
import { MarketplaceListingForm } from '@/types/typings';
import { ArrowRightCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

const ProductCard: React.FC<{ product: MarketplaceListingForm, primary : any }> = ({ product,primary }) => (
  <div className="relative bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 p-4 flex flex-col items-center">
    {/* {product.discountLabel && ( */}
      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
        54%
        {/* {product.discountLabel} */}
      </div>
    {/* )} */}
    <img
      src={product.images[0]}
      alt={product.title}
      className="w-full h-40 object-cover rounded-md mb-4"
    />
    <h3 className="text-lg font-semibold text-gray-800 text-center">
      {product.title}
    </h3>
    <div className="mt-2 text-green-600 font-bold">
      ${product.finalPrice.toFixed(2)}
      {product.finalPrice && (
        <span className="text-gray-400 line-through text-sm ml-2">
          ${product.finalPrice.toFixed(2)}
        </span>
      )}
    </div>
    <div className="mt-2 text-yellow-500 text-sm">
      ⭐ 4.5 (149)
      {/* {product.rating} ({product.reviews}) */}
    </div>
    <button 
    className="mt-4 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
    style={{background: `${primary}`}}>
      + Add
    </button>
  </div>
);


export default ProductCard; 