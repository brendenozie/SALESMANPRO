import type { AppProps } from "next/app";
import { ContextProvider, useStateContext  } from '../contexts/ContextProvider';
import "@/styles/globals.css";
import { Toaster } from "react-hot-toast";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ContextProvider>
      <Toaster position="top-right" reverseOrder={false} />
      <Component {...pageProps} />
    </ContextProvider>
  );
}

