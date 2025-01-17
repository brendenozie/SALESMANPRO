import { uploadImage } from "@/types/typings";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader

type Props = {
  images: any;
};

const CarouselCard = ({ images }: Props) => {
  return (
    <>
      <Carousel
        className="pt-5"
        showStatus={false}
        autoPlay
        infiniteLoop
        emulateTouch
        interval={7000}
      >
        {images && JSON.parse(images).map((item: { url: string | undefined; status: string | undefined; }) => (
          <div className="h-[400px] w-full md:h-[500px]">
            <img className="object-cover" src={item.url} alt={item.status} />
          </div>
        ))}
      </Carousel>
    </>
  );
};

export default CarouselCard;
