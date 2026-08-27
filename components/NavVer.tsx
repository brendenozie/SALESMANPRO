import Link from "next/link";
import React, { useState, useEffect } from "react";

type linkProps = {
  title?: string;
  href?: string;
  reference: string;
};

const NavHor = ({ title, href, reference }: linkProps) => {
  return (
    <li className="group">
      <Link
        href={`${href}`}
        className={`px-2 text-[.95rem] hover:text-opacity-60 text-gray-800`} >
        {title}
      </Link>
    </li>
  );
};

export default NavHor;
