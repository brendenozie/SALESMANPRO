import React, { useState, useEffect } from "react";
import Home from "../../components/MainPage/Home";
import FlashDeals from "../../components/flashDeals/FlashDeals";
import TopCate from "../../components/top/TopCate";
import NewArrivals from "../../components/newarrivals/NewArrivals";
import Discount from "../../components/discount/Discount";
import Shop from "../../components/shops/Shop";
import Annocument from "../../components/annocument/Annocument";
import Wrapper from "../../components/wrapper/Wrapper";
import Header from "../../components/shop/header/Header";
import Footer from "../../components/shop/footer/Footer";
import Cart from "../../components/cart";
import { useStateContext } from '../../contexts/ContextProvider';

const Pages = () => {
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
  const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
  

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/shop/categories');
        if (!response.ok) throw new Error("Failed to fetch categories.");
        const data = await response.json();
        setCategories(data);
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
        for (const category of categories) {
          const response = await fetch(`/api/shop/productsByCategory?categoryId=${category.id}`);
          if (!response.ok) throw new Error(`Failed to fetch products for category ${category.name}.`);
          const data = await response.json();
          products[category.name] = data;
        }
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
  }, [categories]);

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
        <Home CartItem={CartItem} />
        {flashDeals.products && <FlashDeals productItems={flashDeals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
        {categories && <TopCate categories={categories} />}
        {newArrivals.products && <NewArrivals productItems={newArrivals.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart} />}
        {discounts.products && <Discount productItems={discounts.products} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart}/>}
        {/* productsByCategory["Shop"] &&  */}
        {<Shop shopItems={productsByCategory["Shop"] || []} addToCart={addToCart} decreaseQuantity={decreaseQuantity} removeFromCart={removeFromCart}/>}
        <Annocument />
        <Wrapper />
        <Footer />
        <Cart /> 
      </div>
    </>
  );
};

export default Pages;