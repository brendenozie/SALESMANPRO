"use client";

import React, { useState, useEffect } from "react";
import BannerSlider from "./components/BannerSlider/BannerSlider";
import FlashDeals from "./components/flashDeals/FlashDeals";
import TopCate from "./components/top/TopCate";
import NewArrivals from "./components/newarrivals/NewArrivals";
import Discount from "./components/discount/Discount";
import Annocument from "./components/annocument/Annocument";
import Wrapper from "./components/wrapper/Wrapper";
import { useStateContext } from '@/contexts/ContextProvider';
import Shop from "@/components/site/layouts/GhubaLayout/body/components/shops/Shop";
// import PricingTable from "../../components/pricingTable";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000/api";

const HomePage = () => {
  const [categories, setCategories] = useState<any>([]);
  const [productsByCategory, setProductsByCategory] = useState<any>({});
  const [offers, setOffers] = useState<any>([]);
  const [flashDeals, setFlashDeals] = useState<any>([]);
  const [newArrivals, setNewArrivals] = useState<any>([]);
  const [discounts, setDiscounts] = useState<any>([]);
  const [featured, setFeatured] = useState<any>([]);
  const [loading, setLoading] = useState<any>(false);
  const [error, setError] = useState<any>(null);
  const [CartItem, setCartItem] = useState<any>([]);
  const [featuredCategories, setFeaturedCategories] = useState<any>({});
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
  const [isModalOpen, setModalOpen] = useState<any>(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/shop/categories`);
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories);
        setFeaturedCategories(data.categories[2]);
      } catch (err:any) {
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
        const products: { [key: string]: any } = {};
        const response = await fetch(`${apiBaseUrl}/shop/productsByCategory?categoryId=${featuredCategories.id}`);
        if (!response.ok) throw new Error(`Failed to fetch products for category ${featuredCategories.name}.`);
        const data = await response.json();
        products[String(featuredCategories.name)] = data;
        setProductsByCategory(products);
        
        console.log(products);
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchProductsByCategory();
    }
  }, [featuredCategories]);

  useEffect(() => {
    const fetchProductsByFlag = async (flag: string, setState: any) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBaseUrl}/shop/productsByFlag?flag=${flag}`);
        if (!response.ok) throw new Error(`Failed to fetch products for flag ${flag}.`);
        const responsedata = await response.json();
        setState(responsedata.data);
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsByFlag("isOnOffer", setOffers);
    fetchProductsByFlag("isFlashDeal", setFlashDeals);
    fetchProductsByFlag("isNewArrival", setNewArrivals);
    fetchProductsByFlag("isDiscounted", setDiscounts);
    fetchProductsByFlag("isFeatured", setFeatured);
  }, []);

  return (
    <>
      {categories && <BannerSlider categories={categories} />}
      {flashDeals && (
        <FlashDeals
          productItems={flashDeals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      {categories.length > 0 && <TopCate categories={categories} />}
      {newArrivals && (
        <NewArrivals
          productItems={newArrivals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      {discounts && (
        <Discount
          productItems={discounts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      {featuredCategories &&
        productsByCategory[featuredCategories.name] && (
          <Shop
            category={featuredCategories}
            shopItems={productsByCategory[featuredCategories.name]}
            addToCart={addToCart}
            decreaseQuantity={decreaseQuantity}
            removeFromCart={removeFromCart}
          />
        )}
      <Annocument />
      <Wrapper />
      
    </>
  );
};

export default HomePage;
