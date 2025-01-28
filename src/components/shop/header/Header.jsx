import React, { useState } from "react";
import { Link } from "react-router-dom";

const Header = ({ CartItem }) => {
  const [MobileMenu, setMobileMenu] = useState(false);

  window.addEventListener("scroll", function () {
    const search = document.querySelector(".search");
    if (search) {
      search.classList.toggle("active", window.scrollY > 100);
    }
  });

  return (
    <>
      <section className="bg-[#0f3460] py-2 text-white">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <i className="fa fa-phone"></i>
            <label>+88012 3456 7894</label>
            <i className="fa fa-envelope"></i>
            <label>support@ui-lib.com</label>
          </div>
          <div className="flex items-center space-x-6">
            <label>Theme FAQ's</label>
            <label>Need Help?</label>
            <span>🏳️‍⚧️</span>
            <label>EN</label>
            <span>🏳️‍⚧️</span>
            <label>USD</label>
          </div>
        </div>
      </section>

      <section className="search py-5">
        <div className="container mx-auto flex justify-between items-center">
          <div className="logo w-1/5">
            <img src={logo} alt="logo" className="w-full" />
          </div>

          <div className="search-box flex items-center w-3/5 border-2 border-gray-200 rounded-full px-4">
            <i className="fa fa-search text-gray-400"></i>
            <input 
              type="text" 
              placeholder="Search and hit enter..." 
              className="w-full px-4 py-2 focus:outline-none"
            />
            <span className="border-l-2 border-gray-200 px-4 text-gray-400">All Category</span>
          </div>

          <div className="icon flex items-center w-1/5 justify-end space-x-4">
            <i className="fa fa-user icon-circle"></i>
            <div className="cart relative">
              <Link to="/cart">
                <i className="fa fa-shopping-bag icon-circle"></i>
                {CartItem.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {CartItem.length}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <header className="header bg-white shadow-md py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="categories flex items-center bg-gray-100 px-4 py-2 rounded-md">
            <i className="fa-solid fa-border-all text-xl mr-2"></i>
            <h4 className="font-medium text-gray-700">Categories <i className="fa fa-chevron-down"></i></h4>
          </div>

          <nav className="navlink flex items-center">
            <ul 
              className={`${MobileMenu ? "nav-links-MobileMenu" : "flex items-center space-x-8 capitalize"}`} 
              onClick={() => setMobileMenu(false)}
            >
              <li><Link to="/">Home</Link></li>
              <li><Link to="/pages">Pages</Link></li>
              <li><Link to="/user">User Account</Link></li>
              <li><Link to="/vendor">Vendor Account</Link></li>
              <li><Link to="/track">Track My Order</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>

            <button className="toggle ml-4 text-xl" onClick={() => setMobileMenu(!MobileMenu)}>
              {MobileMenu ? <i className="fas fa-times"></i> : <i className="fas fa-bars"></i>}
            </button>
          </nav>
        </div>
      </header>
    </>
  );
};

export default Header;
