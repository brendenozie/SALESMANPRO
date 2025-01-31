"use client"; // Ensures this code runs only on the client side in Next.js

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import ProgressBar from "@badrap/bar-of-progress";
import { SessionProvider } from "next-auth/react";
import { Router } from "next/router";
const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

const progress = new ProgressBar({
  size: 4,
  color: "orange",
  className: "z-50",
  delay: 80,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [cart, setCart] = useState([]);
  
  // Ensure localStorage is only accessed on the client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("colorMode");
      const savedMode = localStorage.getItem("themeMode");
      const savedCart = JSON.parse(localStorage.getItem("cart")) || [];

      if (savedColor) setCurrentColor(savedColor);
      if (savedMode) setIsDarkMode(savedMode === "Dark");
      setCart(savedCart);
    }
  }, []);

  // Persist cart in localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart]);

  // Add product to cart
  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === product.id);
      if (exists) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove product from cart
  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  // Clear entire cart
  const clearCart = () => setCart([]);

  const setMode = (mode) => {
    setIsDarkMode(mode === "Dark");
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", mode);
    }
  };

  const setColor = (color) => {
    setCurrentColor(color);
    if (typeof window !== "undefined") {
      localStorage.setItem("colorMode", color);
    }
  };

  const handleClick = (clicked) => setIsClicked({ ...initialState, [clicked]: true });

  // Optimize with useMemo to avoid unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      clearCart,
      currentColor,
      isDarkMode,
      activeMenu,
      screenSize,
      setScreenSize,
      handleClick,
      isClicked,
      initialState,
      setIsClicked,
      setActiveMenu,
      setCurrentColor,
      setIsDarkMode,
      setMode,
      setColor,
      themeSettings,
      setThemeSettings,
    }),
    [cart, currentColor, isDarkMode, activeMenu, screenSize, isClicked, themeSettings]
  );

  return (
    <SessionProvider>
      <StateContext.Provider value={contextValue}>{children}</StateContext.Provider>
    </SessionProvider>
  );
};

export const useStateContext = () => useContext(StateContext);

