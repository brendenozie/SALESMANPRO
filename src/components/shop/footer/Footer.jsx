import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-[#0f3460] to-[#1a3b5d] py-20 text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 px-8">
        <div className="space-y-8">
          <h1 className="text-5xl font-extrabold italic text-[#e94560]">Bonik</h1>
          <p className="text-sm font-light opacity-90 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.
          </p>
          <div className="flex space-x-4">
            <button className="flex items-center bg-[#1b3a5b] hover:bg-[#e94560] py-3 px-5 rounded-md transition duration-300">
              <i className="fa-brands fa-google-play text-lg mr-2"></i>
              <span className="text-sm">Google Play</span>
            </button>
            <button className="flex items-center bg-[#1b3a5b] hover:bg-[#e94560] py-3 px-5 rounded-md transition duration-300">
              <i className="fa-brands fa-app-store-ios text-lg mr-2"></i>
              <span className="text-sm">App Store</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#e94560] border-b border-[#e94560] pb-2">About Us</h2>
          <ul className="space-y-4">
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Careers</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Our Stores</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Our Cares</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Terms & Conditions</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Privacy Policy</li>
          </ul>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#e94560] border-b border-[#e94560] pb-2">Customer Care</h2>
          <ul className="space-y-4">
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Help Center</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">How to Buy</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Track Your Order</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Corporate & Bulk Purchasing</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Returns & Refunds</li>
          </ul>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-[#e94560] border-b border-[#e94560] pb-2">Contact Us</h2>
          <ul className="space-y-4">
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">70 Washington Square South, New York, NY 10012, United States</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Email: uilib.help@gmail.com</li>
            <li className="opacity-80 hover:opacity-100 hover:text-[#e94560] transition duration-300">Phone: +1 1123 456 780</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-[#1b3a5b] mt-12 pt-6 text-center text-sm opacity-70">
        © 2025 Bonik. All Rights Reserved.
      </div>
    </footer>
  );
};

export default Footer;
