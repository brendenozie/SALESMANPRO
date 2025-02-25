// pages/shop/index.tsx
import React, { useState, useEffect } from "react";
import Home from "../../components/MainPage/Home";
import FlashDeals from "../../components/flashDeals/FlashDeals";
import TopCate from "../../components/top/TopCate";
import NewArrivals from "../../components/newarrivals/NewArrivals";
import Discount from "../../components/discount/Discount";
import Shop from "../../components/shops/Shop";
import Annocument from "../../components/annocument/Annocument";
import Wrapper from "../../components/wrapper/Wrapper";
import SignInModal from "../../components/SignInModal";
import { useStateContext } from '../../contexts/ContextProvider';

const ShopIndexPage = () => {
  // Your state and effects here remain unchanged
  const [categories, setCategories] = useState<any>([]);
  const [productsByCategory, setProductsByCategory] = useState<any>({});
  const [flashDeals, setFlashDeals] = useState<any>([]);
  const [newArrivals, setNewArrivals] = useState<any>([]);
  const [discounts, setDiscounts] = useState<any>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [CartItem, setCartItem] = useState<any>([]);
  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();
  const [isModalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories');
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories);
        setFeaturedCategories(data.categories[2]);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      setError(null);
      try {
        const products : any = {};
        // Example: fetching products for a featured category
        const response = await fetch(`/api/shop/productsByCategory?categoryId=${featuredCategories.id}`);
        if (!response.ok) throw new Error(`Failed to fetch products for category ${featuredCategories.name}.`);
        const data = await response.json();
        products[featuredCategories.name] = data;
        setProductsByCategory(products);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchProductsByCategory();
    }
  }, [featuredCategories, categories]);

  useEffect(() => {
    const fetchProductsByFlag = async (flag: string, setState: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/shop/productsByFlag?flag=${flag}`);
        if (!response.ok) throw new Error(`Failed to fetch products for flag ${flag}.`);
        const data = await response.json();
        setState(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByFlag("isFlashDeal", setFlashDeals);
    fetchProductsByFlag("isNewArrival", setNewArrivals);
    fetchProductsByFlag("isDiscounted", setDiscounts);
  }, []);

  return (
    <>
      {categories && <Home categories={categories} />}
      {flashDeals.products && <FlashDeals productItems={flashDeals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
      {categories && <TopCate categories={categories} />}
      {newArrivals.products && <NewArrivals productItems={newArrivals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
      {discounts.products && <Discount productItems={discounts.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
      {featuredCategories && productsByCategory[featuredCategories.name] && (
        <Shop category={featuredCategories} shopItems={productsByCategory[featuredCategories.name] || []} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />
      )}
      <Annocument />
      <Wrapper />
      {isModalOpen && <SignInModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />}
    </>
  );
};

// Attach getLayout so Next.js knows how to wrap this page
ShopIndexPage.getLayout = function getLayout(page: React.ReactElement) {
  // Import the layout component you just created
  const ShopLayout = require('../../components/ShopLayout').default;
  return <ShopLayout>{page}</ShopLayout>;
};

export default ShopIndexPage;
