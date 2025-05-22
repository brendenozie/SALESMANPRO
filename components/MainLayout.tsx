import React, { PropsWithChildren, useState } from "react";
import Head from "next/head";
import Drawer from "./Drawer";
import Footer from "./Footer";
import Header from "./Header";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Pic from "./Pic";

const MainLayout = (props: PropsWithChildren) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gradient-to-br from-white via-gray-100 to-gray-200  text-black flex flex-col min-h-screen">
      <Head>
        <title>SalesMan</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-6 lg:px-12 py-12">
        {props.children}
      </main>

      {/* Decorative Section */}
      <section className=" rounded-lg p-8 shadow-lg lg:mx-4">
        <Pic />
      </section>

      {/* Footer */}
      <Footer />

      {/* Drawer */}
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
        <ul className="space-y-4 text-lg">
          <li>
            <Link href="/favorites" className="drawer-item hover:text-blue-400 transition-colors">
                List of Favorites
            </Link>
          </li>
          <li>
            <Link href="/bookings" className="drawer-item hover:text-blue-400 transition-colors">
                Your Bookings
            </Link>
          </li>
          <li>
            <button
              onClick={() => signOut()}
              className="drawer-item hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          </li>
        </ul>
      </Drawer>
    </div>
  );
};

export default MainLayout;
