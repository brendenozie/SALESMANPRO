'use client';

import { memo, useCallback, useState } from 'react';
import GhubaProductCard from '@/components/site/layouts/GhubaLayout/body/components/GhubaProductCard';
import { useStateContext } from '@/contexts/ContextProvider';

const MemoizedProductCard = memo(({ product, isPriority }: any) => {
  const { addToCart } = useStateContext();
  const [isLiked, setIsLiked] = useState(product.isLiked || false);

  const handleToggleLike = useCallback(async (e: React.MouseEvent) => {
    e?.preventDefault();
    setIsLiked((prev: boolean) => !prev);
    
    try {
      // Intentionally left open for actual endpoint
    } catch (err) {
      setIsLiked((prev: boolean) => !prev); 
      console.error("Failed to update wishlist");
    }
  }, []);

  const handleAddToCart = useCallback(() => {
    addToCart(product);
  }, [addToCart, product]);

  return (
    <div className="group transform transition-all duration-300 hover:-translate-y-1 h-full">
      <GhubaProductCard 
        product={product} 
        isLiked={isLiked}
        toggleLike={handleToggleLike} 
        addToCart={handleAddToCart} 
        priority={isPriority} 
      />
    </div>
  );
}, (prevProps, nextProps) => prevProps.product.id === nextProps.product.id);

MemoizedProductCard.displayName = "MemoizedProductCard";
export default MemoizedProductCard;