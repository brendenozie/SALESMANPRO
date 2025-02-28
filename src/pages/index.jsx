import React, { useState, useEffect } from "react";
import Home from "../components/MainPage/Home";
import FlashDeals from "../components/flashDeals/FlashDeals";
import TopCate from "../components/top/TopCate";
import NewArrivals from "../components/newarrivals/NewArrivals";
import Discount from "../components/discount/Discount";
import Shop from "../components/shops/Shop";
import Annocument from "../components/annocument/Annocument";
import Wrapper from "../components/wrapper/Wrapper";
import Header from "../components/shop/header/Header";
import Footer from "../components/shop/footer/Footer";
import Cart from "../components/cart";
import SignInModal from "../components/SignInModal";
import { useStateContext } from '../contexts/ContextProvider';
import LocationModal from "../components/locationManager";

const ShopPages = () => {
  const [categories, setCategories] = useState([]);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [offers, setOffers] = useState([]);
  const [flashDeals, setFlashDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [CartItem, setCartItem] = useState([]);
  const [featuredCategories, setFeaturedCategories] = useState({});
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
  const [isModalOpen, setModalOpen] = useState(true);
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories');
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data.categories);
        setFeaturedCategories(data.categories[2]);
      } catch (err) {
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
        const products = {};
        // for (const category of categories) {
          const response = await fetch(`/api/shop/productsByCategory?categoryId=${featuredCategories.id}`);
          if (!response.ok) throw new Error(`Failed to fetch products for category ${featuredCategories.name}.`);
          const data = await response.json();
          products[featuredCategories.name] = data;
        // }
        setProductsByCategory(products);
      } catch (err) {
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
    const fetchProductsByFlag = async (flag, setState) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/shop/productsByFlag?flag=${flag}`);
        if (!response.ok) throw new Error(`Failed to fetch products for flag ${flag}.`);
        const data = await response.json();
        setState(data);
      } catch (err) {
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
      <div className="container bg-gradient-to-br from-gray-50 to-gray-100">
        <Header CartItem={CartItem} />
        {categories && <Home CartItem={CartItem} categories={categories}  />}
        {flashDeals.products && <FlashDeals productItems={flashDeals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
        {categories && <TopCate categories={categories} />}
        {newArrivals.products && <NewArrivals productItems={newArrivals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
        {discounts.products && <Discount productItems={discounts.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart}/>}
        {featuredCategories && productsByCategory[featuredCategories.name] &&<Shop category={featuredCategories} shopItems={productsByCategory[featuredCategories.name] || []} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart}/>}
        <Annocument />
        <Wrapper />
        <Footer />
        <Cart /> 
        <LocationModal />
        {isModalOpen && <SignInModal isOpen={isModalOpen} onClose={(modalState) => setModalOpen(modalState)} />}
      </div>
    </>
  );
};

export default ShopPages;