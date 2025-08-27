// components/layouts/ShopLayout.tsx
import React from 'react';
import Header from './site/layouts/GhubaLayout/header/Header';
import Footer from './site/layouts/GhubaLayout/footer/Footer';
import Cart from "./site/layouts/GhubaLayout/body/components/cart";
// import SignInModal from "../../components/signInModal";
// import { useStateContext } from '../../contexts/ContextProvider';
import LocationModal from "./locationManager";

interface ShopLayoutProps {
  children: React.ReactNode;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ children }) => {
  return (
    <div className="container bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <main>{children}</main>
      <Footer />
      <Cart />
      <LocationModal /> 
    </div>
  );
};

export default ShopLayout;
