"use client";

import React, { useState, useEffect } from "react";
import BannerSlider from "./components/BannerSlider/BannerSlider";
import FlashDeals from "./components/flashDeals/FlashDeals";
import TopCate from "./components/top";
import NewArrivals from "./components/newarrivals";
import Discount from "./components/discount";
import Annocument from "./components/annocument/Annocument";
import Wrapper from "./components/wrapper/Wrapper";
import { useStateContext } from '@/contexts/ContextProvider';
import Shop from "./components/shops";
import { StoreForm } from '@/types/typings';

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

const HomePage = ({ pageData, companyId }: { pageData: StoreForm, companyId: string }) => {
  // Consolidate state to significantly improve React rendering performance
  const [homeData, setHomeData] = useState<any>({
    categories: [],
    flashDeals: [],
    newArrivals: [],
    discounts: [],
    featured: [],
    featuredCategory: null,
    productsByCategory: {},
    featuredCategoryProducts: []
  });
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  useEffect(() => {
    const fetchHomepage = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${apiBaseUrl}/shop/homepage`);

        if (!response.ok) {
          throw new Error("Failed to load homepage");
        }

        const data = await response.json();
        const featuredCat =  data.featuredCategory ??  data.categories.find((c: any) => c.isFeatured) ??  data.categories[0];

        setHomeData({
          categories: data.categories ?? [],

          flashDeals: data.sections?.flashDeals ?? [],

          newArrivals: data.sections?.newArrivals ?? [],

          discounts: data.sections?.discounts ?? [],

          featured: data.sections?.featured ?? [],

          featuredCategory: featuredCat,

          productsByCategory: {[featuredCat?.name ?? "featured"]: data.sections?.featuredCategoryProducts ?? [], },

          featuredCategoryProducts: data.sections?.featuredCategoryProducts ?? []
        });

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHomepage();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        {/* Replace with your preferred loading spinner or skeleton */}
        <p className="text-xl font-semibold text-gray-500">Loading store...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-semibold text-red-500">Error: {error}</p>
      </div>
    );
  }

  const { categories, flashDeals, newArrivals, discounts, featuredCategory, productsByCategory, featuredCategoryProducts } = homeData;

  return (
    <>
      {categories?.length > 0 && <BannerSlider categories={categories} />}
      
      {flashDeals?.length > 0 && (
        <FlashDeals
          productItems={flashDeals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {categories?.length > 0 && <TopCate categories={categories} />}
      
      {newArrivals?.length > 0 && (
        <NewArrivals
          productItems={newArrivals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {discounts?.length > 0 && (
        <Discount
          productItems={discounts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
        />
      )}
      
      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <Shop
          category={featuredCategory}
          shopItems={featuredCategoryProducts}
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
// "use client";

// import React, { useState, useEffect } from "react";
// import BannerSlider from "./components/BannerSlider/BannerSlider";
// import FlashDeals from "./components/flashDeals/FlashDeals";
// import TopCate from "./components/top";
// import NewArrivals from "./components/newarrivals";
// import Discount from "./components/discount";
// import Annocument from "./components/annocument/Annocument";
// import Wrapper from "./components/wrapper/Wrapper";
// import { useStateContext } from '@/contexts/ContextProvider';
// import Shop from "./components/shops";
// import { StoreForm } from '@/types/typings';
// // import PricingTable from "@/components/pricingTable";

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// const HomePage = ({ pageData, companyId }: { pageData: StoreForm, companyId: string }) => {
//   const [categories, setCategories] = useState<any>([]);
//   const [productsByCategory, setProductsByCategory] = useState<any>({});
//   const [offers, setOffers] = useState<any>([]);
//   const [flashDeals, setFlashDeals] = useState<any>([]);
//   const [newArrivals, setNewArrivals] = useState<any>([]);
//   const [discounts, setDiscounts] = useState<any>([]);
//   const [featured, setFeatured] = useState<any>([]);
//   const [loading, setLoading] = useState<any>(false);
//   const [error, setError] = useState<any>(null);
//   const [CartItem, setCartItem] = useState<any>([]);
//   const [featuredCategories, setFeaturedCategories] = useState<any>({});
//   const { cart, isCartOpen, setIsCartOpen, addToCart, decreaseQuantity, removeFromCart, clearCart } = useStateContext();
//   const [isModalOpen, setModalOpen] = useState<any>(true);

//   useEffect(() => {
//     const fetchHomepage = async () => {
//       try {
//         setLoading(true);

//           const response = await fetch(`${apiBaseUrl}/shop/homepage`);

//           if (!response.ok) {
//             throw new Error("Failed to load homepage");
//           }

//           const data = await response.json();

//           setCategories(data.categories);
//           setFlashDeals(data.flashDeals);
//           setNewArrivals(data.newArrivals);
//           setDiscounts(data.discounts);
//           setFeatured(data.featured);

//           const featuredCat = data.categories.find((c:any) => c.isFeatured) || data.categories[0];

//           setFeaturedCategories(featuredCat);

//           setProductsByCategory({
//             [featuredCat.name]: data.featuredCategoryProducts,
//           });

//         } catch (err:any) {
//           setError(err.message);
//         } finally {
//           setLoading(false);
//         }
//       };

//       fetchHomepage();
//     }, []);

//   // useEffect(() => {
//   //   const fetchCategories = async () => {
//   //     try {
//   //       const response = await fetch(`${apiBaseUrl}/shop/categories`);
//   //       if (!response.ok) throw new Error("Failed to fetch categories.");
//   //       const data = await response.json();
//   //       setCategories(data.categories);
//   //       setFeaturedCategories(data.categories.isFeatured ? data.categories.find((cat: any) => cat.isFeatured) : data.categories[0]);
//   //       console.log("Fetched Categories:", data.categories);  
//   //     } catch (err:any) {
//   //       setError(err.message);
//   //     }
//   //   };

//   //   fetchCategories();
//   // }, []);

//   // useEffect(() => {
//   //   const fetchProductsByCategory = async () => {
//   //     setLoading(true);
//   //     setError(null);
//   //     try {
//   //       const products: { [key: string]: any } = {};
//   //       const response = await fetch(`${apiBaseUrl}/shop/productsByCategory?categoryId=${featuredCategories.id}`);
//   //       if (!response.ok) throw new Error(`Failed to fetch products for category ${featuredCategories.name}.`);
//   //       const data = await response.json();

//   //       products[String(featuredCategories.name)] = data;
//   //       setProductsByCategory(products);
      
//   //     } catch (err:any) {
//   //       setError(err.message);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   if (categories.length > 0) {
//   //     fetchProductsByCategory();
//   //   }
//   // }, [featuredCategories]);

//   // useEffect(() => {
//   //   const fetchProductsByFlag = async (flag: string, setState: any) => {
//   //     setLoading(true);
//   //     setError(null);
//   //     try {
//   //       const response = await fetch(`${apiBaseUrl}/shop/productsByFlag?flag=${flag}`);
//   //       if (!response.ok) throw new Error(`Failed to fetch products for flag ${flag}.`);
//   //       const responsedata = await response.json();
//   //       setState(responsedata.data);
//   //     } catch (err:any) {
//   //       setError(err.message);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };

//   //   fetchProductsByFlag("isOnOffer", setOffers);
//   //   fetchProductsByFlag("isFlashDeal", setFlashDeals);
//   //   fetchProductsByFlag("isNewArrival", setNewArrivals);
//   //   fetchProductsByFlag("isDiscounted", setDiscounts);
//   //   fetchProductsByFlag("isFeatured", setFeatured);
//   // }, []);

//   return (
//     <>
//       {categories && <BannerSlider categories={categories} />}
//       {flashDeals && (
//         <FlashDeals
//           productItems={flashDeals}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
//       {categories.length > 0 && <TopCate categories={categories} />}
//       {newArrivals && (
//         <NewArrivals
//           productItems={newArrivals}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
//       {discounts && (
//         <Discount
//           productItems={discounts}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
//       {featuredCategories &&
//         productsByCategory[featuredCategories.name] && (
//           <Shop
//             category={featuredCategories}
//             shopItems={productsByCategory[featuredCategories.name]}
//             addToCart={addToCart}
//             decreaseQuantity={decreaseQuantity}
//             removeFromCart={removeFromCart}
//           />
//         )}
//       <Annocument />
//       <Wrapper />
      
//     </>
//   );
// };

// export default HomePage;
