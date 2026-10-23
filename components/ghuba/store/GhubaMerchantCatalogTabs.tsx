"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  MagnifyingGlassIcon, 
  ShoppingBagIcon, 
  BoltIcon, 
  CheckCircleIcon,
  SparklesIcon,
  TagIcon,
  FireIcon,
  PlayIcon,
  XMarkIcon
} from "@heroicons/react/24/solid";
import { FaWhatsapp } from "react-icons/fa";
import { StoreForm } from "@/types/typings";
import { useStateContext } from "@/contexts/ContextProvider";
import { resolveProductMedia } from "@/lib/product-media-resolver";

const WhatsAppIcon = FaWhatsapp as any;

interface GhubaMerchantCatalogTabsProps {
  pageData: StoreForm;
}

type TabType = "all" | "featured" | "new" | "instock";

export default function GhubaMerchantCatalogTabs({ pageData }: GhubaMerchantCatalogTabsProps) {
  const router = useRouter();
  const context = useStateContext?.() || {};
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const storeName = pageData.name || "Merchant";
  const rawPhone = pageData.contactPhone || "254706448146";
  const cleanPhone = rawPhone.replace(/\D/g, "");
  const formattedPhone = cleanPhone.startsWith("0") 
    ? `254${cleanPhone.slice(1)}` 
    : cleanPhone.startsWith("254") 
      ? cleanPhone 
      : `254${cleanPhone}`;

  // Normalized items from pageData with category fallbacks
  const catalogItems = useMemo(() => {
    const rawListings = (pageData.marketplaceListings || []) as any[];

    if (rawListings.length > 0) {
      return rawListings.map((item, idx) => {
        const media = resolveProductMedia(item);
        return {
          id: item.id || `item-${idx}`,
          title: item.title || item.name || "Genuine Product",
          price: Number(item.finalPrice || item.sellingPrice || 1500),
          originalPrice: item.sellingPrice && item.finalPrice && item.sellingPrice > item.finalPrice 
            ? Number(item.sellingPrice) 
            : null,
          category: item.category || (pageData.category !== "portal" ? pageData.category : "General"),
          image: media.thumbnailUrl || media.primaryImageUrl,
          blurDataUrl: media.blurDataUrl,
          hasVideo: media.hasVideo,
          description: item.description || "In stock at physical storefront. Verified Kenyan warranty.",
          isFeatured: !!item.isFeatured || idx < 3,
          isNew: idx < 4,
          inStock: item.isAvailable !== false,
        };
      });
    }

    // High-quality category-aligned merchant fallback items if store has no DB listings yet
    const cat = (pageData.category || "").toLowerCase();
    if (cat.includes("tech") || cat.includes("gadget") || cat.includes("electronic") || pageData.slug === "theduka") {
      return [
        {
          id: "duka-tech-1",
          title: "Samsung Galaxy S24 Ultra 512GB (Titanium Gray)",
          price: 154999,
          originalPrice: 169999,
          category: "Smartphones",
          image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80",
          description: "Brand new sealed in box. 24-Month official Samsung Kenya warranty.",
          isFeatured: true,
          isNew: true,
          inStock: true,
        },
        {
          id: "duka-tech-2",
          title: "Apple MacBook Pro M3 14-inch 16GB/512GB Space Black",
          price: 248000,
          originalPrice: 265000,
          category: "Laptops & Computers",
          image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80",
          description: "Official Apple distribution unit with AppleCare eligibility.",
          isFeatured: true,
          isNew: false,
          inStock: true,
        },
        {
          id: "duka-tech-3",
          title: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
          price: 43500,
          originalPrice: 48000,
          category: "Audio & Accessories",
          image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
          description: "Industry leading noise canceling with 30-hour battery life.",
          isFeatured: false,
          isNew: true,
          inStock: true,
        },
        {
          id: "duka-tech-4",
          title: "Apple Watch Series 9 GPS 45mm Midnight Aluminum",
          price: 58000,
          originalPrice: 64000,
          category: "Smartwatches",
          image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
          description: "Fast charging with S9 SiP and double tap gesture support.",
          isFeatured: false,
          isNew: false,
          inStock: true,
        },
      ];
    } else if (cat.includes("vehicle") || pageData.slug === "thevehicleshop") {
      return [
        {
          id: "veh-1",
          title: "Toyota Land Cruiser Prado TX-L 2018 (Pearl White)",
          price: 5850000,
          originalPrice: 6200000,
          category: "SUVs & 4x4",
          image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=600&auto=format&fit=crop&q=80",
          description: "Clean local registration, sunroof, leather seats, fully serviced.",
          isFeatured: true,
          isNew: true,
          inStock: true,
        },
        {
          id: "veh-2",
          title: "Subaru Forester 2.0i-L Eyesight 2017 (Dark Blue)",
          price: 2450000,
          originalPrice: 2600000,
          category: "Crossovers",
          image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&auto=format&fit=crop&q=80",
          description: "Accident free, AWD symmetrical drive, genuine mileage verified.",
          isFeatured: true,
          isNew: false,
          inStock: true,
        },
        {
          id: "veh-3",
          title: "Mercedes-Benz C200 AMG Line 2016 (Obsidian Black)",
          price: 3350000,
          originalPrice: 3500000,
          category: "Luxury Sedans",
          image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=600&auto=format&fit=crop&q=80",
          description: "Panoramic roof, ambient lighting, immaculate interior condition.",
          isFeatured: false,
          isNew: true,
          inStock: true,
        },
      ];
    } else {
      return [
        {
          id: "gen-1",
          title: "Premium Men's Italian Cut Wool Blazer (Navy Blue)",
          price: 12500,
          originalPrice: 15000,
          category: "Men's Apparel",
          image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80",
          description: "Tailored fit with breathable inner lining. Available in sizes 38-46.",
          isFeatured: true,
          isNew: true,
          inStock: true,
        },
        {
          id: "gen-2",
          title: "Genuine Leather Handcrafted Everyday Tote Bag",
          price: 8500,
          originalPrice: 9900,
          category: "Bags & Leather",
          image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=80",
          description: "Pure Kenyan cowhide leather with reinforced brass hardware.",
          isFeatured: true,
          isNew: false,
          inStock: true,
        },
        {
          id: "gen-3",
          title: "Classic Minimalist Chronograph Watch (Rose Gold)",
          price: 6800,
          originalPrice: 7500,
          category: "Accessories",
          image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80",
          description: "Japanese quartz movement with scratch-resistant sapphire crystal.",
          isFeatured: false,
          isNew: true,
          inStock: true,
        },
      ];
    }
  }, [pageData]);

  // Dynamic categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    catalogItems.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [catalogItems]);

  // Filtered items based on Tab, Category chip, and live search
  const filteredItems = useMemo(() => {
    return catalogItems.filter((item) => {
      if (activeTab === "featured" && !item.isFeatured) return false;
      if (activeTab === "new" && !item.isNew) return false;
      if (activeTab === "instock" && !item.inStock) return false;

      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [catalogItems, activeTab, selectedCategory, searchQuery]);

  // Cart Add Handler
  const handleAddToCart = (item: any) => {
    setAddingId(item.id);
    try {
      const cartItem = {
        id: item.id,
        name: item.title,
        title: item.title,
        finalPrice: item.price,
        sellingPrice: item.price,
        quantity: 1,
        image: item.image,
        seller: {
          name: storeName,
          slug: pageData.slug,
          phone: formattedPhone,
        },
      };

      if (typeof context?.addToCart === "function") {
        context.addToCart(cartItem as any);
      }

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("ghuba_cart");
        let currentCart = stored ? JSON.parse(stored) : [];
        const existingIdx = currentCart.findIndex((i: any) => i.id === cartItem.id);
        if (existingIdx > -1) {
          currentCart[existingIdx].quantity += 1;
        } else {
          currentCart.push(cartItem);
        }
        localStorage.setItem("ghuba_cart", JSON.stringify(currentCart));

        window.dispatchEvent(
          new CustomEvent("ghuba:cart:add", { detail: cartItem })
        );
      }

      toast.success(`Added "${item.title}" to Ghuba Cart!`, {
        icon: "🛒",
        duration: 3000,
      });
    } catch (err) {
      console.error("Failed adding to cart:", err);
    } finally {
      setTimeout(() => setAddingId(null), 600);
    }
  };

  const handleInstantBuy = (item: any) => {
    handleAddToCart(item);
    router.push("/ghuba/checkout");
  };

  return (
    <section className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      
      {/* Section Header & Live Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shadow-sm">
              Verified Stock
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-3 flex-wrap">
            <span>Store</span>
            <span className="text-amber-500 italic">Catalog & Inventory</span>
            <span className="text-xs font-bold text-zinc-400 normal-case bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800">
              {filteredItems.length} items available
            </span>
          </h2>
          <p className="mt-1.5 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">
            Browse live in-stock inventory directly from {storeName} with 100% M-Pesa Escrow protection.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
            <MagnifyingGlassIcon className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${storeName}...`}
            className="w-full py-3 pl-10 pr-9 text-xs font-semibold rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex items-center gap-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-6 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
            activeTab === "all"
              ? "bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 scale-105"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800"
          }`}
        >
          <span>All Items</span>
          <span className="text-[10px] opacity-80 px-1.5 py-0.5 rounded-full bg-black/10 dark:bg-white/10">{catalogItems.length}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("featured")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
            activeTab === "featured"
              ? "bg-amber-500 text-zinc-950 scale-105 shadow-amber-500/25"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800"
          }`}
        >
          <FireIcon className="w-4 h-4" />
          <span>Featured & Deals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("new")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
            activeTab === "new"
              ? "bg-emerald-600 text-white scale-105 shadow-emerald-600/25"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800"
          }`}
        >
          <SparklesIcon className="w-4 h-4" />
          <span>New Arrivals</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("instock")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shadow-sm ${
            activeTab === "instock"
              ? "bg-blue-600 text-white scale-105 shadow-blue-600/25"
              : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-800"
          }`}
        >
          <CheckCircleIcon className="w-4 h-4" />
          <span>In Stock Nairobi</span>
        </button>
      </div>

      {/* Category Filter Chips */}
      {categories.length > 1 && (
        <div className="flex items-center gap-2.5 mb-8 overflow-x-auto pb-2 scrollbar-none select-none">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5">
            <TagIcon className="w-4 h-4 text-amber-500" />
            <span>Category:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedCategory === "all"
                ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-black shadow-sm"
                : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
            }`}
          >
            All Categories
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-amber-500 text-zinc-950 font-black shadow-md shadow-amber-500/20"
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Products Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-20 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold mb-4">
            No items match your filter criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab("all");
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="px-6 py-3 rounded-2xl bg-amber-500 text-zinc-950 font-black text-xs uppercase tracking-wider hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const productWaMessage = encodeURIComponent(
              `Hello ${storeName}, I saw "${item.title}" for KES ${item.price.toLocaleString()} on your Ghuba store. Is it available for pickup/delivery today?`
            );

            return (
              <div
                key={item.id}
                className="group bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-zinc-900/10 dark:hover:shadow-black/60 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Product Image */}
                  <div className="relative h-56 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-90 contrast-105"
                      placeholder={item.blurDataUrl ? "blur" : "empty"}
                      blurDataURL={item.blurDataUrl}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    {/* Stock & Category Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-400 border border-white/10 shadow-sm">
                        {item.category}
                      </span>
                      {item.isFeatured && (
                        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500 text-zinc-950 shadow-md">
                          Featured Deal
                        </span>
                      )}
                      {item.hasVideo && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-indigo-600 text-white shadow backdrop-blur-md">
                          <PlayIcon className="w-2.5 h-2.5" />
                          Reel
                        </span>
                      )}
                    </div>

                    {item.inStock && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
                          <CheckCircleIcon className="w-3.5 h-3.5" />
                          In Stock CBD
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-5">
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white line-clamp-2 mb-2.5 group-hover:text-amber-500 transition-colors leading-snug">
                      {item.title}
                    </h3>

                    {/* Price in KES */}
                    <div className="flex items-baseline gap-2.5 mb-2.5">
                      <span className="text-lg font-black text-amber-500">
                        KES {item.price.toLocaleString()}
                      </span>
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-xs text-zinc-400 line-through font-medium">
                          KES {item.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Commerce Action Buttons */}
                <div className="p-5 pt-0 border-t border-zinc-100 dark:border-zinc-800/80 mt-auto flex flex-col gap-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddToCart(item)}
                      disabled={addingId === item.id}
                      className="py-2.5 px-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm"
                    >
                      <ShoppingBagIcon className="w-3.5 h-3.5 text-amber-500" />
                      <span>{addingId === item.id ? "Added ✓" : "Add to Cart"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInstantBuy(item)}
                      className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                    >
                      <BoltIcon className="w-3.5 h-3.5" />
                      <span>Buy Now</span>
                    </button>
                  </div>

                  {/* Direct WhatsApp Inquire */}
                  <a
                    href={`https://wa.me/${formattedPhone}?text=${productWaMessage}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-emerald-500/20 shadow-sm"
                  >
                    <FaWhatsapp className="w-4 h-4 text-emerald-500" />
                    <span>Inquire via WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}