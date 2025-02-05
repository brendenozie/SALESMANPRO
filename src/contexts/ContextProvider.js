"use client"; // Ensures this code runs only on the client side in Next.js

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import ProgressBar from "@badrap/bar-of-progress";
import { SessionProvider } from "next-auth/react";
import { Router } from "next/router";
import { toast } from "react-hot-toast";

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

export const ContextProvider = ({ children }) => {
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") === "Dark"
    }
    return false;
  });
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("activeMenu")) ?? true;
    }
    return true;
  });
  const [isClicked, setIsClicked] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);
  const [cart, setCart] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("cart")) || [];
      } catch (error) {
        console.error("Error parsing cart:", error);
      }
    }
    return [];
  });

  useEffect(() => {
    Router.events.on("routeChangeStart", () => setIsLoading(true));
    Router.events.on("routeChangeComplete", () => setIsLoading(false));
    Router.events.on("routeChangeError", () => setIsLoading(false));

    return () => {
      Router.events.off("routeChangeStart", () => setIsLoading(true));
      Router.events.off("routeChangeComplete", () => setIsLoading(false));
      Router.events.off("routeChangeError", () => setIsLoading(false));
    };
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("activeMenu", JSON.stringify(activeMenu));
    }
  }, [cart, activeMenu]);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark");
    } else {
      document.body.classList.remove("dark");
    }
  }, [isDarkMode]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === product.id);
      if (exists) {
        toast.success("Increased quantity!");
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      toast.success("Added to cart!");
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    toast.error("Removed from cart!");
  };

  const decreaseQuantity = (id) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === id
          ? { ...item, quantity: item.quantity > 1 ? item.quantity - 1 : 1 }
          : item
      )
    );
    toast.info("Decreased quantity.");
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared.");
  };

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

  const cartSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  const contextValue = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      decreaseQuantity,
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
      isLoading,
      cartSubtotal,
    }),
    [cart, currentColor, isDarkMode, activeMenu, screenSize, isClicked, themeSettings, isLoading, cartSubtotal]
  );

  return (
    <SessionProvider>
      <StateContext.Provider value={contextValue}>{children}</StateContext.Provider>
    </SessionProvider>
  );
};

export const useStateContext = () => useContext(StateContext);
