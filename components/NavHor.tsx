import Link from "next/link";
import React, { useState, useEffect } from "react";

type linkProps = {
  title?: string;
  href?: string;
  reference: string;
};

const NavHor = ({ title, href, reference }: linkProps) => {
  const [dark, setDark] = useState(false);
  const navbarDark = () => {
    if (window.scrollY > 10 && window.scrollY < window.innerHeight - 80) {
      setDark(false);
    } else if (window.scrollY >= window.innerHeight - 80) {
      setDark(true);
    } else {
      setDark(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", navbarDark);
    return () => {
      window.removeEventListener("scroll", navbarDark);
    };
  }, []);
  return (
    <li className="group">
      <Link
        href={`${href}`}
        className={`px-3 mx-2 py-1 xl:mx-3 hover:text-opacity-80 text-gray-700 `}
      >
        {title}
      </Link>
    </li>
  );
};

export default NavHor;
