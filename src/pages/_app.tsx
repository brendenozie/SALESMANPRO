import type { AppProps } from "next/app";
import { ContextProvider,  } from '@/contexts/ContextProvider';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { SessionProvider, } from "next-auth/react";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
import 'leaflet/dist/leaflet.css';


export default function MyApp({ Component, pageProps }: AppProps) {
  const theme = {
    primaryColor: pageProps.store?.themeSettings?.primaryColor || "#f97316",
    secondaryColor: pageProps.store?.themeSettings?.secondaryColor || "#3b82f6",
  };

  return (    
    <SessionProvider 
      session={pageProps.session}
      >
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <Toaster position="top-right" reverseOrder={false} />
          <Component {...pageProps} />
        </ThemeProvider>
      </ContextProvider>
    </SessionProvider>
  );
}

