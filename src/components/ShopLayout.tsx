// components/layouts/ShopLayout.tsx
import React from 'react';
// import Header from '../../components/shop/header/Header';
// import Footer from '../../components/shop/footer/Footer';
// import Cart from '../../components/cart';
// import LocationModal from '../../components/locationManager';

interface ShopLayoutProps {
  children: React.ReactNode;
}

const ShopLayout: React.FC<ShopLayoutProps> = ({ children }) => {
  return (
    <div className="container bg-gradient-to-br from-gray-50 to-gray-100">
      {/* <Header /> */}
      <main>{children}</main>
      {/* <Footer />
      <Cart />
      <LocationModal /> */}
    </div>
  );
};

export default ShopLayout;
