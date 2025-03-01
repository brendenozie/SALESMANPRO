"use client"; // Ensures this code runs only on the client side in Next.js

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import ProgressBar from "@badrap/bar-of-progress";
import {useSession } from "next-auth/react";
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
   const { data: session } = useSession(); // Get user session
  const [screenSize, setScreenSize] = useState(undefined);
  const [currentColor, setCurrentColor] = useState("#03C9D7");
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") === "Dark"
    }
    return false;
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState(false);
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("activeMenu")) ?? true;
    }
    return true;
  });
  const [location, setLocation] = useState(null);
  const [locationName, setLocationName] = useState("Detecting location...");
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

  const [isOpen, setIsOpen] = useState(false); 
  const [onClose, setOnClose] = useState(false);
  const [onUpdate, setOnUpdate] = useState();
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    setUser(session?.user || null);
  }, [session]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchLocationName(latitude, longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationName("Location access denied.");
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setLocationName("Geolocation not supported.");
    }
  }, []);


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
  
  const fetchLocationName = async (lat, lon) => {
    try {
      const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
      const data = await response.json();
      setLocationName(data.city || data.locality || "Unknown location");
    } catch (error) {
      console.error("Error fetching location name:", error);
    }
  };

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
    toast("Decreased quantity.", { icon: "ℹ️" });
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
    return cart.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
  }, [cart]);

  const contextValue = useMemo(
    () => ({
      user, 
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
      location,
      isOpen, 
      setIsOpen,
      onClose,
      setOnClose,
      onUpdate, 
      setOnUpdate,
      setLocation,
      locationName,
      setLocationName,
      isCartOpen,
      setIsCartOpen
    }),
    [user, cart, currentColor, isCartOpen, isDarkMode, activeMenu, isOpen, onClose , onUpdate, screenSize, isClicked, themeSettings, location,locationName, isLoading, cartSubtotal]
  );

  return (
      <StateContext.Provider value={contextValue}>{children}</StateContext.Provider>
  );
};

export const useStateContext = () => useContext(StateContext);
