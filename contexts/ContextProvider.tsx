"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import ProgressBar from "@badrap/bar-of-progress";
import { useSession } from "next-auth/react";
import { Router } from "next/router";
import { toast } from "react-hot-toast";

const StateContext = createContext<AppContextType | undefined>(undefined);

interface CartItem {
  id: string;
  title?: string;
  finalPrice: number;
  quantity: number;
  [key: string]: any; // allows extra fields
}

interface ClickState {
  chat: boolean;
  cart: boolean;
  userProfile: boolean;
  notification: boolean;
}

interface AppContextType {
  user: any;
  cart: CartItem[];
  addToCart: (product: CartItem) => void;
  removeFromCart: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  clearCart: () => void;

  currentColor: string;
  isDarkMode: boolean;
  activeMenu: boolean;
  screenSize: number | undefined;

  setScreenSize: (size: number | undefined) => void;
  handleClick: (clicked: keyof ClickState) => void;

  isClicked: ClickState;
  initialState: ClickState;

  setIsClicked: (value: ClickState) => void;
  setActiveMenu: (value: boolean) => void;
  setCurrentColor: (value: string) => void;
  setIsDarkMode: (value: boolean) => void;
  setMode: (mode: string) => void;
  setColor: (color: string) => void;

  themeSettings: boolean;
  setThemeSettings: (value: boolean) => void;

  isLoading: boolean;
  cartSubtotal: number;

  isOpen: boolean;
  setIsOpen: (value: boolean) => void;

  onClose: boolean;
  setOnClose: (value: boolean) => void;

  onUpdate: any;
  setOnUpdate: (value: any) => void;

  isCartOpen: boolean;
  setIsCartOpen: (value: boolean) => void;
}



const initialState: ClickState = {
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

interface ProviderProps {
  children: ReactNode;
}


export const ContextProvider = ({ children }: ProviderProps) => {
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);

  const [screenSize, setScreenSize] = useState<number | undefined>(undefined);
  const [currentColor, setCurrentColor] = useState<string>("#03C9D7");

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("themeMode") === "Dark";
    }
    return false;
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [themeSettings, setThemeSettings] = useState<boolean>(false);

  const [activeMenu, setActiveMenu] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return JSON.parse(localStorage.getItem("activeMenu") || "true");
    }
    return true;
  });

  const [isClicked, setIsClicked] = useState<ClickState>(initialState);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("cart") || "[]");
      } catch {
        return [];
      }
    }
    return [];
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [onClose, setOnClose] = useState<boolean>(false);
  const [onUpdate, setOnUpdate] = useState<any>(null);

  useEffect(() => {
    setUser(session?.user || null);
  }, [session]);

  // router loading indicator
  useEffect(() => {
    const start = () => setIsLoading(true);
    const end = () => setIsLoading(false);

    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);

    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);

  // persist cart + menu
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("activeMenu", JSON.stringify(activeMenu));
    }
  }, [cart, activeMenu]);

  // dark/light mode toggle
  useEffect(() => {
    if (isDarkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  }, [isDarkMode]);

  // CART FUNCTIONS
  const addToCart = (product: CartItem) => {
    setCart((prevCart) => {
      const exists = prevCart.find((item) => item.id === product.id);

      if (exists) {
        toast.success("Increased quantity!");
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      toast.success("Added to cart!");
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    toast.error("Removed from cart!");
  };

  const decreaseQuantity = (id: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
    toast("Decreased quantity.", { icon: "ℹ️" });
  };

  const clearCart = () => {
    setCart([]);
    toast("Cart cleared.", { icon: "ℹ️" });
  };

  // THEME CONTROLS
  const setMode = (mode: string) => {
    setIsDarkMode(mode === "Dark");
    localStorage.setItem("themeMode", mode);
  };

  const setColor = (color: string) => {
    setCurrentColor(color);
    localStorage.setItem("colorMode", color);
  };

  const handleClick = (clicked: keyof ClickState) =>
    setIsClicked({ ...initialState, [clicked]: true });

  const cartSubtotal = useMemo(
    () => cart.reduce((total, item) => total + item.finalPrice * item.quantity, 0),
    [cart]
  );

  const value: AppContextType = {
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

    isOpen,
    setIsOpen,

    onClose,
    setOnClose,

    onUpdate,
    setOnUpdate,

    isCartOpen,
    setIsCartOpen,
  };

  return (
  <StateContext.Provider value={value}>
    {children}
  </StateContext.Provider>
);

};


export const useStateContext = () => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error("useStateContext must be used inside ContextProvider");
  }
  return context;
};

