import React from "react";
import Revcard from "@/components/Revcard";
import myImage from "@/../public/21.jpg";
import Link from "next/link";

const Testi = () => {
  return (
<>
    <section
      id="review"
      data-testid="review"
      className="flex flex-col xl:container"
    >
      <div className="min-h-[8rem]"></div>
      <div className="flex flex-wrap justify-center gap-y-10 min-h-[80vh] md:min-h-[50vh] gap-x-2">
        <div className="flex flex-col justify-center items-center gap-y-6 2xl:w-[47%] order-2">
        <section className="my-8 bg-gray-100 text-gray-900">
            <div className="container flex flex-col items-center p-4 mx-auto space-y-6 md:p-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className="w-16 h-16 dark:text-violet-400">
                <polygon points="328.375 384 332.073 458.999 256.211 406.28 179.924 459.049 183.625 384 151.586 384 146.064 496 182.756 496 256.169 445.22 329.242 496 365.936 496 360.414 384 328.375 384"></polygon>
                <path d="M415.409,154.914l-2.194-48.054L372.7,80.933,346.768,40.414l-48.055-2.2L256,16.093,213.287,38.219l-48.055,2.2L139.3,80.933,98.785,106.86l-2.194,48.054L74.464,197.628l22.127,42.715,2.2,48.053L139.3,314.323l25.928,40.52,48.055,2.195L256,379.164l42.713-22.126,48.055-2.195,25.928-40.52L413.214,288.4l2.195-48.053,22.127-42.715Zm-31.646,76.949L382,270.377l-32.475,20.78-20.78,32.475-38.515,1.76L256,343.125l-34.234-17.733-38.515-1.76-20.78-32.475L130,270.377l-1.759-38.514L110.5,197.628,128.237,163.4,130,124.88,162.471,104.1l20.78-32.474,38.515-1.76L256,52.132l34.234,17.733,38.515,1.76,20.78,32.474L382,124.88l1.759,38.515L401.5,197.628Z"></path>
              </svg>
              <p className="px-6 py-2 text-1xl font-semibold text-center sm:font-bold sm:text-3xl md:text-2xl lg:max-w-2xl xl:max-w-2xl dark:text-gray-900">"This trip was incredible, from day one our tour guide was amazing .. caring and very knowledgeable.. the actual tour was also incredible.. thanks everyone who made this possible, unforgettable experience!"</p>
              <div className="flex justify-center space-x-3">
                <img src="/avatar.jpg" alt="" className="w-20 h-20 bg-center bg-cover rounded-md dark:bg-gray-500 dark:bg-gray-700" />
                <div>
                  <p className="leadi">Leroy Jenkins</p>
                  <p className="text-sm leadi dark:text-gray-300"></p>
                  <Link className="flex items-center py-2 space-x-1 text-sm dark:text-violet-400" href="/">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="flex justify-center w-full:w-[47%] order-1 h-[30rem] items-center bg-[#fefefe]">
          <div className="relative h-[20rem] w-[20rem] lg:w-[29rem]">
            <div className="w-full p-5 card-shadow max-w-[20rem] lg:max-w-[25rem] bg-white z-30 absolute top-0 right-0">
              <Revcard
                name="David Johns"
                job="Graphic Designer"
                company="Apple Company"
                comment={myImage}
                image="/pp2.jpg"
                headline="It's a breathtaking journey"
              />
            </div>
            <div className="w-full p-5 card-shadow max-w-[21rem] lg:max-w-[25rem] bg-white absolute z-10 -top-[15%] ">
              <Revcard
                name="Renka Nawasena"
                job="Software Developer"
                company="Google Company"
                comment="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium
              placeat quibusdam odio nesciunt! Debitis, ducimus blanditiis! Nulla
              veniam quae adipisci."
                image="/pp1.jpg"
                headline="Wish i discover sooner"
              />
            </div>
            <div className="w-full p-5 card-shadow max-w-[21rem] lg:max-w-[25rem] bg-white absolute z-20 top-[45%] left-[5%]">
              <Revcard
                name="Alexander William"
                job="Mechanical Engineer"
                company="Chevron Company"
                comment="Lorem, ipsum dolor sit amet consectetur adipisicing elit. Laudantium
                placeat quibusdam odio nesciunt! Debitis, ducimus blanditiis! Nulla
                veniam quae adipisci."
                image="/pp2.jpg"
                headline="Worth to try!"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="min-h-[3rem]"></div>
    </section>

    </>
  );
};

export default Testi;
