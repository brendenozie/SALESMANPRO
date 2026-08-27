// hooks/useAddresses.ts
"use client";
import useSWR from "swr";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useAddresses() {
  const { data, error, mutate } = useSWR("/api/site/addresses", fetcher);
  return { addresses: data || [], loading: !error && !data, error, mutate };
}
