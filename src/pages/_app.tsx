import type { AppProps } from "next/app";
import { ContextProvider,  } from '../contexts/ContextProvider';
import { SessionProvider, } from "next-auth/react";
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";
// _app.js or a global stylesheet
import 'leaflet/dist/leaflet.css';


export default function MyApp({ Component, pageProps }: AppProps) {
  return (    
    <SessionProvider>
      <ContextProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <Component {...pageProps} />
      </ContextProvider>
    </SessionProvider>
  );
}

