import React from "react";
import Image from "next/image";

import {StarIcon } from "@heroicons/react/24/solid";

interface revProps {
  name: string;
  job: string;
  company: string;
  comment: string | JSX.Element | any;
  image: string;
  headline: string;
}

const loaderProp =({ src  } :any) => {
  return src;
}

const Revcard = ({
  name,
  job,
  company,
  comment,
  image,
  headline,
}: revProps) => {
  return (
    <div className="w-full flex flex-col gap-y-2">
      <div className="flex items-center gap-x-4">
        <Image
          src={image}
          alt=""
          width={50}
          height={50}
          className="rounded-full"
          loader={loaderProp}
        />
        <div className="flex flex-col text-gray-700">
          <h3 className="font-semibold text-sm">{name}</h3>
          <p className="text-xs font-light">{job}</p>
          <p className="text-xs font-light">{company}</p>
        </div>
      </div>
      <hr />
      <div className="flex flex-col gap-y-2 text-gray-700">
        <h3 className="font-bold text-lg">{headline}</h3>
        <div className="flex items-center gap-x-1">
          <StarIcon color="#eab308" className="h-4"/>
          <StarIcon color="#eab308" className="h-4"/>
          <StarIcon color="#eab308" className="h-4"/>
          <StarIcon color="#eab308" className="h-4"/>
          <StarIcon color="#eab308" className="h-4"/>
        </div>
        <div className=" max-h-[10rem] overflow-hidden">
          {typeof comment === "string" ? (
            <p className="text-sm font-light">{comment}</p>
          ) : (
            <Image
              src={comment}
              alt=""
              width={400}
              height={200}
              loader={loaderProp}
              className="object-cover object-start"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Revcard;
