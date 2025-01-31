import type { AppProps } from "next/app";
import "../styles/globals.css";
import { ContextProvider  } from '../contexts/ContextProvider';


const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ContextProvider>
      <Component {...pageProps} />
    </ContextProvider>
  );
};

export default MyApp;
