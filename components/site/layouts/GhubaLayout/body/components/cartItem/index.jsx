"use client"
import React, {useState} from 'react';
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';
import load from "@/assets/load.png";
import Image from "next/image";

const loaderProp = ({ src, width, quality }) => {
  const params = [`w=${width || 800}`]; // Default width to 800 if not provided
  if (quality) {
    params.push(`q=${quality}`);
  }
  return `${src}?${params.join("&")}`;
};


const CartItem = ({ item, addToCart, decreaseQuantity, removeItem }) => {
  const [imageError, setImageError] = useState(false);
  return (
    <div className="flex items-center gap-4 border-b border-gray-300 dark:border-gray-700 py-4">
      {/* <Image className="h-20 w-20 object-cover rounded-lg" loader={loaderProp} src={item.image} alt={item.newName} width={80} height={80} /> */}
      <Image decoding="async"
            width={80}
            height={80}
            src={imageError ? load.src : item.image}
            alt={`Product image of ${item.title}`}
            className="h-20 w-20 object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
      <div className="flex-1">
        <p className="font-semibold text-gray-800 dark:text-gray-200">{item.title}</p>
        <p className="text-sm text-gray-500 w-20 h-8 overflow-clip dark:text-gray-400">{item.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <MinusIcon
            className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110 transition"
            onClick={() => decreaseQuantity(item.id)}
            aria-label="Decrease quantity"
          />
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-gray-200">
            {item.quantity}
          </span>
          <PlusIcon
            className="w-5 h-5 text-green-500 cursor-pointer hover:scale-110 transition"
            onClick={() => addToCart(item)}
            aria-label="Increase quantity"
          />
        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-bold text-gray-800 dark:text-gray-200">${(item.finalPrice * item.quantity).toFixed(2)}</p>
        <TrashIcon
          className="w-5 h-5 text-gray-400 hover:text-red-600 cursor-pointer mt-1 transition"
          onClick={() => removeItem(item.id)}
          aria-label="Remove item"
        />
      </div>
    </div>
  );
};

export default CartItem;


