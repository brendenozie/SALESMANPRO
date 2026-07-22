"use client";

import React, { useMemo, useEffect } from "react";
import useSWR, { preload } from "swr";
import { useSearchParams, useRouter } from "next/navigation";
import { createCachedFetcher } from "@/lib/swrCachedFetcher";
import AutomotiveFeatured from "./AutomotiveFeatured";
import { MarketListingForm } from "@/types/typings";

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const buildQuery = (
  companyId: string,
  params: URLSearchParams,
  transactionType: "SALE" | "RENT",
  cursor?: string
) => {
  const q = new URLSearchParams(params.toString());

  q.set("companyId", companyId);
  q.set("flag", "isFeatured");
  q.set("transactionType", transactionType);

  if (cursor) q.set("cursor", cursor);

  return `${apiBaseUrl}/site/productsByFlag?${q.toString()}`;
};

export default function AutomotiveFeaturedListingsWrapper({
  companyId,
}: {
  companyId: string;
}) {
  const router = useRouter();
  const params = useSearchParams();

  const transactionType =
    (params.get("transactionType") as "SALE" | "RENT") || "SALE";

  /* 🔁 Persist tab selection in URL */
  const setTransactionType = (type: "SALE" | "RENT") => {
    const next = new URLSearchParams(params.toString());
    next.set("transactionType", type);
    router.replace(`?${next.toString()}`, { scroll: false });
  };

  const url = useMemo(
    () => buildQuery(companyId, params, transactionType),
    [companyId, params, transactionType]
  );

  const swrKey = [
    "automotive-featured",
    companyId,
    transactionType,
    params.toString(),
  ].join(":");

  const fetcher = createCachedFetcher(swrKey);

  /* ⚡ Prefetch RENT listings (SWR-native) */
  useEffect(() => {
    if (transactionType === "SALE") {
      const rentUrl = buildQuery(companyId, params, "RENT");
      const rentKey = [
        "automotive-featured",
        companyId,
        "RENT",
        params.toString(),
      ].join(":");

      preload(rentUrl, createCachedFetcher(rentKey));
    }
  }, [transactionType, companyId, params]);

  const { data, error, isLoading } = useSWR(url, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 30_000,
  });

  const listings: MarketListingForm[] = data?.data ?? [];

  return (
    <AutomotiveFeatured
      listings={listings}
      error={error}
      isLoading={isLoading}
      slug={companyId}
      transactionType={transactionType}
      onTransactionChange={setTransactionType}
    />
  );
}