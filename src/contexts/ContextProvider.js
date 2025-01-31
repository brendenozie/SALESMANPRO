"use client"; // Ensures this code runs only on the client side in Next.js

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";

const StateContext = createContext();

const initialState = {
  chat: false,
  cart: false,
  userProfile: false,
  notification: false,
};

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [currentMode, setCurrentMode] = useState("Light");
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(true);
  const [isClicked, setIsClicked] = useState(initialState);
  const [cart, setCart] = useState([]);

  // Load theme from localStorage (only on client side)
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode");
    const savedColor = localStorage.getItem("colorMode");

    if (savedMode) setCurrentMode(savedMode);
    if (savedColor) setCurrentColor(savedColor);
  }, []);

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

  const setMode = (e) => {
    setCurrentMode(e.target.value);
    if (typeof window !== "undefined") {
      localStorage.setItem("themeMode", e.target.value);
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
      currentColor,
      currentMode,
      activeMenu,
      screenSize,
      setScreenSize,
      handleClick,
      isClicked,
      initialState,
      setIsClicked,
      setActiveMenu,
      setCurrentColor,
      setCurrentMode,
      setMode,
      setColor,
      themeSettings,
      setThemeSettings,
    }),
    [cart, currentColor, currentMode, activeMenu, screenSize, isClicked, themeSettings]
  );

  return <StateContext.Provider value={contextValue}>{children}</StateContext.Provider>;
};

export const useStateContext = () => useContext(StateContext);
