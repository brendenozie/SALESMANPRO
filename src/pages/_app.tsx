import ProgressBar from "@badrap/bar-of-progress";
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import "../styles/globals.css";
import { useEffect } from "react";
import { ContextProvider  } from '../contexts/ContextProvider';

const progress = new ProgressBar({
  size: 4,
  color: "orange",
  className: "z-50",
  delay: 80,
});

Router.events.on("routeChangeStart", progress.start);
Router.events.on("routeChangeComplete", progress.finish);
Router.events.on("routeChangeError", progress.finish);

const MyApp = ({ Component, pageProps }: AppProps) => {
  // const { setCurrentColor, setCurrentMode, currentMode, activeMenu, currentColor, themeSettings, setThemeSettings } = useStateContext();

  // useEffect(() => {
  //   const currentThemeColor = localStorage.getItem('colorMode');
  //   const currentThemeMode = localStorage.getItem('themeMode');
  //   if (currentThemeColor && currentThemeMode) {
  //     setCurrentColor(currentThemeColor);
  //     setCurrentMode(currentThemeMode);
  //   }
  // }, []);
  
  return (

    // className={currentMode === 'Dark' ? 'dark' : ''}
    <SessionProvider session={pageProps.session}>
      <ContextProvider>
        <Component {...pageProps} />
      </ContextProvider>
    </SessionProvider>
    // {isClicked.cart && (<Cart />)}
  );
};

export default MyApp;
