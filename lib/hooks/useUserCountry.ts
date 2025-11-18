// hooks/useUserCountry.ts
'use client';

const getUserCountry = async () => {
  try {
    const res = await fetch("/api/country");
    const data = await res.json();
    return data.country || "Unknown";
  } catch (e) {
    console.error("Proxy failed:", e);
    return "Unknown";
  }
};

const convertKEStoUSD = async (kesAmount: number): Promise<number> => {
  try {
    const res = await fetch("/api/usd");
    const data = await res.json();

    if (!data?.usd) return kesAmount;

    return kesAmount * data.usd;
  } catch {
    return kesAmount;
  }
};

export { convertKEStoUSD, getUserCountry };