import React from "react"
import Sdata from "./Sdata"
import Slider from "react-slick"
import "slick-carousel/slick/slick.css"
import "slick-carousel/slick/slick-theme.css"

const SlideCard = () => {
  const settings = {
    dots: true,
    infinite: true,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    appendDots: (dots) => {
      return <ul style={{ margin: "0px" }}>{dots}</ul>
    },
  }
  return (
    <>
      <Slider {...settings}>
        {Sdata.map((value, index) => {
          return (
            <>
              <div className="flex flex-col md:flex-row items-center justify-between bg-gray-100 p-6 rounded-lg shadow-md" key={index}>
              <div className="md:w-1/2 text-center md:text-left">
                <h1 className="text-2xl font-bold text-gray-800">{value.title}</h1>
                <p className="text-gray-600 mt-2">{value.desc}</p>
                <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
                  Visit Collections
                </button>
              </div>
              <div className="md:w-1/2 flex justify-center mt-4 md:mt-0">
                <img src={value.cover} alt={value.title} className="w-full max-w-xs md:max-w-md rounded-lg" />
              </div>
            </div>

            </>
          )
        })}
      </Slider>
    </>
  )
}

export default SlideCard
