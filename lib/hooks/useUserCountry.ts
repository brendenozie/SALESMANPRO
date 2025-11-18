// hooks/useUserCountry.ts
'use client';

import { useState, useEffect } from 'react';

// export default function useUserCountry() {
//   const [country, setCountry] = useState<string | null>(null);

//   useEffect(() => {
//     async function detectCountry() {
//       try {
//         const res = await fetch("https://ipapi.co/json/");
//         const data = await res.json();
//         setCountry(data.country_code);
//       } catch (err) {
//         console.error("Country detection failed", err);
//         setCountry("KE"); // fallback to Kenya
//       }
//     }

//     detectCountry();
//   }, []);

//   return country;
// }

const getUserCountry = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/");
    const data = await res.json();
    return data.country_name || "Unknown";
  } catch (e) {
    console.error("IP lookup failed:", e);
    return "Unknown";
  }
};



const convertKEStoUSD = async (kesAmount: number): Promise<number> => {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/KES");
    const data = await res.json();

    if (!data?.rates?.USD) return kesAmount; // fallback KES if API fails

    return kesAmount * data.rates.USD;
  } catch (e) {
    console.error("Conversion failed:", e);
    return kesAmount;
  }
};
export { convertKEStoUSD, getUserCountry };