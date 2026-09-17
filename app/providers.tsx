"use client";

import { ReactNode } from "react";
import { ContextProvider } from "@/contexts/ContextProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider, isServer } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SWRConfig } from "swr";

// 1. Create a query client with default options
function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Set staleTime above 0 to avoid refetching immediately on the client
        staleTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        refetchOnMount: false,
      },
    },
  });
}

// 2. Cache the client in the browser to prevent recreation on every render
let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

type Props = {
  children: ReactNode;
  session?: any;
  theme?: {
    primaryColor: string;
    secondaryColor: string;
  };
};

export default function Providers({ children, session, theme }: Props) {
  const defaultTheme = {
    primaryColor: theme?.primaryColor || "#f97316",
    secondaryColor: theme?.secondaryColor || "#3b82f6",
  };

  // 3. Initialize the query client instance
  const queryClient = getQueryClient();

  return (
    <SessionProvider session={session} refetchOnWindowFocus={false} refetchInterval={0}>
      {/* Wrap everything in SWRConfig to prevent focus/reconnect refetches */}
      <SWRConfig
        value={{
          revalidateOnFocus: false,
          revalidateOnReconnect: false,
          dedupingInterval: 60000,
        }}
      >
        {/* Wrap everything else in the QueryClientProvider */}
        <QueryClientProvider client={queryClient}>
          <ContextProvider>
            <ThemeProvider theme={defaultTheme}>
              <Toaster position="top-right" reverseOrder={false} />
              {children}
            </ThemeProvider>
          </ContextProvider>
          {/* React Query Devtools (Only visible in development) */}
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SWRConfig>
    </SessionProvider>
  );
}