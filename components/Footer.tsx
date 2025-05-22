import React from "react";
import Github from "../assets/github.png";
import Instagram from "../assets/instagram.png";
import LinkedIn from "../assets/linkedin.png";
import Logo from '../assets/fit1.png'

const Footer = () => {
  return (
    <div className="relative">
  {/* Horizontal Line Divider */}
  <hr className="rounded-sm bg-gray-500 opacity-50 mx-auto w-full mb-8" />
  
  {/* Content Section */}
  <div className="px-4 py-8 flex flex-col gap-16 items-center justify-center h-auto">
    {/* Social Media Icons */}
    <div className="flex gap-8 sm:gap-16">
      <img src={Github.src} className="w-8 h-8 cursor-pointer hover:scale-110 transition-all" alt="Github" />
      <img src={Instagram.src} className="w-8 h-8 cursor-pointer hover:scale-110 transition-all" alt="Instagram" />
      <img src={LinkedIn.src} className="w-8 h-8 cursor-pointer hover:scale-110 transition-all" alt="LinkedIn" />
    </div>

    {/* Logo Section */}
    <div className="w-32 sm:w-40">
      <img src={Logo.src} alt="Company Logo" className="object-contain" />
    </div>
  </div>

  {/* Background Decorative Blurs */}
  <div className="absolute bottom-0 right-[15%] w-[26rem] h-[12rem] bg-[#f43434] rounded-full opacity-40 blur-[150px]"></div>
  <div className="absolute bottom-0 left-[15%] w-[26rem] h-[12rem] bg-[rgb(255,115,0)] rounded-full opacity-40 blur-[150px]"></div>
</div>

  );
};

export default Footer;
