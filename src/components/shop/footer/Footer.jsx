import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#0f3460] py-20 text-white">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold italic text-[#e94560]">Bonik</h1>
          <p className="text-sm font-light opacity-50">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Auctor libero id et, in gravida. Sit diam duis mauris nulla cursus. Erat et lectus vel ut sollicitudin elit at amet.
          </p>
          <div className="flex space-x-4">
            <div className="flex items-center bg-[#0c2a4d] py-3 px-4 rounded-md">
              <i className="fa-brands fa-google-play text-lg mr-2"></i>
              <span className="text-sm">Google Play</span>
            </div>
            <div className="flex items-center bg-[#0c2a4d] py-3 px-4 rounded-md">
              <i className="fa-brands fa-app-store-ios text-lg mr-2"></i>
              <span className="text-sm">App Store</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">About Us</h2>
          <ul className="space-y-2">
            <li className="opacity-50">Careers</li>
            <li className="opacity-50">Our Stores</li>
            <li className="opacity-50">Our Cares</li>
            <li className="opacity-50">Terms & Conditions</li>
            <li className="opacity-50">Privacy Policy</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Customer Care</h2>
          <ul className="space-y-2">
            <li className="opacity-50">Help Center</li>
            <li className="opacity-50">How to Buy</li>
            <li className="opacity-50">Track Your Order</li>
            <li className="opacity-50">Corporate & Bulk Purchasing</li>
            <li className="opacity-50">Returns & Refunds</li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Contact Us</h2>
          <ul className="space-y-2">
            <li className="opacity-50">70 Washington Square South, New York, NY 10012, United States</li>
            <li className="opacity-50">Email: uilib.help@gmail.com</li>
            <li className="opacity-50">Phone: +1 1123 456 780</li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
