"use client";

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { useStateContext } from '@/contexts/ContextProvider';
import { StoreForm } from '@/types/typings';
import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";

// Intercepting dynamic loads to catch exact client-side mounting events
const DynamicBannerSlider = dynamic(() => import('./components/BannerSlider/BannerSlider').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="h-[400px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />, 
  ssr: false 
});

const DynamicFlashDeals = dynamic(() => import('./components/flashDeals/FlashDeals').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
  ssr: false 
});

const DynamicTopCate = dynamic(() => import('./components/top').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />, 
  ssr: false 
});

const DynamicNewArrivals = dynamic(() => import('./components/newarrivals').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
  ssr: false 
});

const DynamicDiscount = dynamic(() => import('./components/discount').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
  ssr: false 
});

const DynamicShop = dynamic(() => import('./components/shops').then(m => (props: any) => {
  useEffect(() => { props.onMount?.(); }, []);
  return <m.default {...props} />;
}), { 
  loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
  ssr: false 
});

// Bottom components don't need interceptors since they wait at the end of the line
const DynamicAnnocument = dynamic(() => import('./components/annocument/Annocument'), { ssr: false });
const DynamicWrapper = dynamic(() => import('./components/wrapper/Wrapper'), { ssr: false });

const HomePage = ({ pageData, ghubaData, companyId }: { pageData: StoreForm , ghubaData?: any , companyId: string }) => {
  // 1. Pull server-injected data synchronously (No API fetching needed!)
  // const ghubaData = .ghubaData || {};
  const categories = ghubaData.categories || [];
  const sections = ghubaData.sections || {};

  const featuredCategory = ghubaData.featuredCategory ?? categories.find((c: any) => c.isFeatured) ?? categories[0] ?? null;
  const flashDeals = sections.flashDeals || [];
  const newArrivals = sections.newArrivals || [];
  const discounts = sections.discounts || [];
  const featuredCategoryProducts = sections.featuredCategoryProducts || [];

  // Track exactly which dynamic chunks have completed rendering in the DOM
  const [mountedComponents, setMountedComponents] = useState<Record<string, boolean>>({});
  const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

  // Determine exactly which components are expected to display based on the API data payload
  const expectedKeys: string[] = [];
  if (categories?.length > 0) expectedKeys.push("banner", "topCate");
  if (flashDeals?.length > 0) expectedKeys.push("flashDeals");
  if (newArrivals?.length > 0) expectedKeys.push("newArrivals");
  if (discounts?.length > 0) expectedKeys.push("discounts");
  if (featuredCategory && featuredCategoryProducts.length > 0) expectedKeys.push("shop");

  // Bottom components can only show when every expected component has mounted
  const allTopComponentsReady = expectedKeys.length > 0 && expectedKeys.every(key => mountedComponents[key]);

  const handleComponentMount = (key: string) => {
    setMountedComponents(prev => ({ ...prev, [key]: true }));
  };

  // 2. Primary Display Zones (Skeletons are now handled natively by next/dynamic 'loading' option)
  return (
    <>
      {categories?.length > 0 && (
        <DynamicBannerSlider 
          categories={categories} 
          onMount={() => handleComponentMount("banner")} 
        />
      )}
      
      {flashDeals?.length > 0 && (
        <DynamicFlashDeals
          productItems={flashDeals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
          onMount={() => handleComponentMount("flashDeals")}
        />
      )}
      
      {categories?.length > 0 && (
        <DynamicTopCate 
          categories={categories} 
          onMount={() => handleComponentMount("topCate")} 
        />
      )}
      
      {newArrivals?.length > 0 && (
        <DynamicNewArrivals
          productItems={newArrivals}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
          onMount={() => handleComponentMount("newArrivals")}
        />
      )}
      
      {discounts?.length > 0 && (
        <DynamicDiscount
          productItems={discounts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
          onMount={() => handleComponentMount("discounts")}
        />
      )}
      
      {featuredCategory && featuredCategoryProducts.length > 0 && (
        <DynamicShop
          category={featuredCategory}
          shopItems={featuredCategoryProducts}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
          onMount={() => handleComponentMount("shop")}
        />
      )}
      
      {/* 3. Subordinated Bottom Components Gate */}
      {allTopComponentsReady && (
        <>
          <DynamicAnnocument />
          <DynamicWrapper />
        </>
      )}
    </>
  );
};

export default HomePage;
// "use client";

// import React, { useState, useEffect } from "react";
// import dynamic from 'next/dynamic';
// import { useStateContext } from '@/contexts/ContextProvider';
// import { StoreForm } from '@/types/typings';
// import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";

// // Intercepting dynamic loads to catch exact client-side mounting events
// const DynamicBannerSlider = dynamic(() => import('./components/BannerSlider/BannerSlider').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="h-[400px] bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />, 
//   ssr: false 
// });

// const DynamicFlashDeals = dynamic(() => import('./components/flashDeals/FlashDeals').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
//   ssr: false 
// });

// const DynamicTopCate = dynamic(() => import('./components/top').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="h-40 bg-zinc-100 dark:bg-zinc-800 rounded-xl animate-pulse" />, 
//   ssr: false 
// });

// const DynamicNewArrivals = dynamic(() => import('./components/newarrivals').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
//   ssr: false 
// });

// const DynamicDiscount = dynamic(() => import('./components/discount').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
//   ssr: false 
// });

// const DynamicShop = dynamic(() => import('./components/shops').then(m => (props: any) => {
//   useEffect(() => { props.onMount?.(); }, []);
//   return <m.default {...props} />;
// }), { 
//   loading: () => <div className="py-10"><SkeletonGrid count={4} /></div>, 
//   ssr: false 
// });

// // Bottom components don't need interceptors since they wait at the end of the line
// const DynamicAnnocument = dynamic(() => import('./components/annocument/Annocument'), { ssr: false });
// const DynamicWrapper = dynamic(() => import('./components/wrapper/Wrapper'), { ssr: false });

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// const HomePage = ({ pageData, companyId }: { pageData: StoreForm, companyId: string }) => {
//   const [homeData, setHomeData] = useState<any>({
//     categories: [],
//     flashDeals: [],
//     newArrivals: [],
//     discounts: [],
//     featured: [],
//     featuredCategory: null,
//     productsByCategory: {},
//     featuredCategoryProducts: []
//   });
  
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
  
//   // Track exactly which dynamic chunks have completed rendering in the DOM
//   const [mountedComponents, setMountedComponents] = useState<Record<string, boolean>>({});

//   const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

//   useEffect(() => {
//     const fetchHomepage = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${apiBaseUrl}/shop/homepage`);

//         if (!response.ok) {
//           throw new Error("Failed to load homepage");
//         }

//         const data = await response.json();
//         const featuredCat = data.featuredCategory ?? data.categories.find((c: any) => c.isFeatured) ?? data.categories[0];

//         setHomeData({
//           categories: data.categories ?? [],
//           flashDeals: data.sections?.flashDeals ?? [],
//           newArrivals: data.sections?.newArrivals ?? [],
//           discounts: data.sections?.discounts ?? [],
//           featured: data.sections?.featured ?? [],
//           featuredCategory: featuredCat,
//           productsByCategory: { [featuredCat?.name ?? "featured"]: data.sections?.featuredCategoryProducts ?? [] },
//           featuredCategoryProducts: data.sections?.featuredCategoryProducts ?? []
//         });

//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHomepage();
//   }, []);

//   if (error) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <p className="text-xl font-semibold text-red-500">Error: {error}</p>
//       </div>
//     );
//   }

//   const { categories, flashDeals, newArrivals, discounts, featuredCategory, featuredCategoryProducts } = homeData;

//   // Determine exactly which components are expected to display based on the API data payload
//   const expectedKeys: string[] = [];
//   if (categories?.length > 0) {
//     expectedKeys.push("banner", "topCate");
//   }
//   if (flashDeals?.length > 0) expectedKeys.push("flashDeals");
//   if (newArrivals?.length > 0) expectedKeys.push("newArrivals");
//   if (discounts?.length > 0) expectedKeys.push("discounts");
//   if (featuredCategory && featuredCategoryProducts.length > 0) expectedKeys.push("shop");

//   // Bottom components can only show when loading is finished AND every expected component has mounted
//   const allTopComponentsReady = !loading && expectedKeys.every(key => mountedComponents[key]);

//   const handleComponentMount = (key: string) => {
//     setMountedComponents(prev => ({ ...prev, [key]: true }));
//   };

//   return (
//     <>
//       {/* 1. Base API Skeleton Layout Safeguard */}
//       {loading && (
//         <div className="container mx-auto px-6 py-8 space-y-16 max-w-7xl animate-pulse">
//           <div className="w-full h-[400px] bg-gray-200 dark:bg-zinc-800 rounded-3xl" />
//           <div className="space-y-4">
//             <div className="h-6 w-48 bg-gray-200 dark:bg-zinc-800 rounded-md" />
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-64 bg-gray-200 dark:bg-zinc-800 rounded-2xl" />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 2. Primary Display Zones */}
//       {!loading && (
//         <>
//           {categories?.length > 0 && (
//             <DynamicBannerSlider 
//               categories={categories} 
//               onMount={() => handleComponentMount("banner")} 
//             />
//           )}
          
//           {flashDeals?.length > 0 && (
//             <DynamicFlashDeals
//               productItems={flashDeals}
//               addToCart={addToCart}
//               decreaseQuantity={decreaseQuantity}
//               removeFromCart={removeFromCart}
//               onMount={() => handleComponentMount("flashDeals")}
//             />
//           )}
          
//           {categories?.length > 0 && (
//             <DynamicTopCate 
//               categories={categories} 
//               onMount={() => handleComponentMount("topCate")} 
//             />
//           )}
          
//           {newArrivals?.length > 0 && (
//             <DynamicNewArrivals
//               productItems={newArrivals}
//               addToCart={addToCart}
//               decreaseQuantity={decreaseQuantity}
//               removeFromCart={removeFromCart}
//               onMount={() => handleComponentMount("newArrivals")}
//             />
//           )}
          
//           {discounts?.length > 0 && (
//             <DynamicDiscount
//               productItems={discounts}
//               addToCart={addToCart}
//               decreaseQuantity={decreaseQuantity}
//               removeFromCart={removeFromCart}
//               onMount={() => handleComponentMount("discounts")}
//             />
//           )}
          
//           {featuredCategory && featuredCategoryProducts.length > 0 && (
//             <DynamicShop
//               category={featuredCategory}
//               shopItems={featuredCategoryProducts}
//               addToCart={addToCart}
//               decreaseQuantity={decreaseQuantity}
//               removeFromCart={removeFromCart}
//               onMount={() => handleComponentMount("shop")}
//             />
//           )}
//         </>
//       )}
      
//       {/* 3. Subordinated Bottom Components Gate */}
//       {allTopComponentsReady && (
//         <>
//           <DynamicAnnocument />
//           <DynamicWrapper />
//         </>
//       )}
//     </>
//   );
// };

// export default HomePage;
// "use client";

// import React, { useState, useEffect } from "react";

// import dynamic from 'next/dynamic';
// import useSWR from 'swr';

// // import FlashDeals from "";
// // import TopCate from "";
// // import NewArrivals from "./components/newarrivals";
// // import Discount from "./components/discount";
// // import Annocument from "./components/annocument/Annocument";
// import Wrapper from "./components/wrapper/Wrapper";
// import { useStateContext } from '@/contexts/ContextProvider';
// // import Shop from "./components/shops";
// import { StoreForm } from '@/types/typings';

// const DynamicBannerSlider = dynamic(() => import('./components/BannerSlider/BannerSlider'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicFlashDeals = dynamic(() => import('./components/flashDeals/FlashDeals'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicTopCate = dynamic(() => import('./components/top'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicNewArrivals = dynamic(() => import('./components/newarrivals'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicDiscount = dynamic(() => import('./components/discount'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicAnnocument = dynamic(() => import('./components/annocument/Annocument'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicWrapper = dynamic(() => import('./components/wrapper/Wrapper'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});
// const DynamicShop = dynamic(() => import('./components/shops'), { loading: () => <div className="py-20 bg-gray-50 dark:bg-gray-900"><SkeletonGrid count={8} /></div>, ssr: false,});

// import { SkeletonGrid } from "./components/SkeletonGrid/SkeletonGrid";
// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// const HomePage = ({ pageData, companyId }: { pageData: StoreForm, companyId: string }) => {
//   // Consolidate state to significantly improve React rendering performance
//   const [homeData, setHomeData] = useState<any>({
//     categories: [],
//     flashDeals: [],
//     newArrivals: [],
//     discounts: [],
//     featured: [],
//     featuredCategory: null,
//     productsByCategory: {},
//     featuredCategoryProducts: []
//   });
  
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   const { addToCart, decreaseQuantity, removeFromCart } = useStateContext();

//   useEffect(() => {
//     const fetchHomepage = async () => {
//       try {
//         setLoading(true);
//         const response = await fetch(`${apiBaseUrl}/shop/homepage`);

//         if (!response.ok) {
//           throw new Error("Failed to load homepage");
//         }

//         const data = await response.json();
//         const featuredCat =  data.featuredCategory ??  data.categories.find((c: any) => c.isFeatured) ??  data.categories[0];

//         setHomeData({
//           categories: data.categories ?? [],

//           flashDeals: data.sections?.flashDeals ?? [],

//           newArrivals: data.sections?.newArrivals ?? [],

//           discounts: data.sections?.discounts ?? [],

//           featured: data.sections?.featured ?? [],

//           featuredCategory: featuredCat,

//           productsByCategory: {[featuredCat?.name ?? "featured"]: data.sections?.featuredCategoryProducts ?? [], },

//           featuredCategoryProducts: data.sections?.featuredCategoryProducts ?? []
//         });

//       } catch (err: any) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchHomepage();
//   }, []);

//   // if (loading) {
//   //   return (
//   //     <div className="flex h-screen items-center justify-center">
//   //       {/* Replace with your preferred loading spinner or skeleton */}
//   //       <p className="text-xl font-semibold text-gray-500">Loading store...</p>
//   //     </div>
//   //   );
//   // }

//   if (error) {
//     return (
//       <div className="flex h-screen items-center justify-center">
//         <p className="text-xl font-semibold text-red-500">Error: {error}</p>
//       </div>
//     );
//   }

//   const { categories, flashDeals, newArrivals, discounts, featuredCategory, productsByCategory, featuredCategoryProducts } = homeData;

//   return (
//     <>
//       {categories?.length > 0 && <DynamicBannerSlider categories={categories} />}
      
//       {flashDeals?.length > 0 && (
//         <DynamicFlashDeals
//           productItems={flashDeals}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
      
//       {categories?.length > 0 && <DynamicTopCate categories={categories} />}
      
//       {newArrivals?.length > 0 && (
//         <DynamicNewArrivals
//           productItems={newArrivals}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
      
//       {discounts?.length > 0 && (
//         <DynamicDiscount
//           productItems={discounts}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
      
//       {featuredCategory && featuredCategoryProducts.length > 0 && (
//         <DynamicShop
//           category={featuredCategory}
//           shopItems={featuredCategoryProducts}
//           addToCart={addToCart}
//           decreaseQuantity={decreaseQuantity}
//           removeFromCart={removeFromCart}
//         />
//       )}
      
//       <DynamicAnnocument />
//       <DynamicWrapper />
//     </>
//   );
// };

// export default HomePage;
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
