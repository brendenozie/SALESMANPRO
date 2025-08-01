import React, { PropsWithChildren } from "react";
import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast"; // Assuming you're using react-hot-toast for notifications

const MainLayout = (props: PropsWithChildren) => {
  return (
    <div className="bg-gray-50 text-gray-900 flex flex-col min-h-screen">
      <Head>
        <title>SalesPro - Your Sales Management Solution</title>
        <meta name="description" content="SalesPro is the ultimate platform for sales professionals to streamline their workflow, boost productivity, and close deals faster." />
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
    </div>
  );
};

export default MainLayout;