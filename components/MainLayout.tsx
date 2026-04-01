import React, { PropsWithChildren } from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast"; // Assuming you're using react-hot-toast for notifications
import Script from "next/script";

const MainLayout = (props: PropsWithChildren) => {
  return (
    <div className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
      <Head>
        <title>SalesmanPro - Your Management Solution</title>
        <meta name="description" content="SalesmanPro is the ultimate platform for professionals to streamline their workflow, boost productivity, and close deals faster." />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {props.children}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Toast Notifications */}
      <Toaster position="bottom-right" />
      {/* <!-- Google tag (gtag.js) --> */}
      {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JQJSSHQD25"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JQJSSHQD25');
          `}
        </Script>
    </div>
  );
};

export default MainLayout;