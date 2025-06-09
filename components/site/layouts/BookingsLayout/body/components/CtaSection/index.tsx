import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

// Loader for next/image
const loader = ({ src, width, quality }: any) => `${src}?w=${width}&q=${quality || 75}`;

export default function CtaSection({
  title = "Experience Relaxation Like Never Before",
  subtitle = "Join us today to book your perfect massage session and unwind in style.",
  buttonLabel = "Get Started",
  buttonHref = "#booking",
  imageUrl = "/images/massage-oil.jpg",
}) {
  return (
    <section className="bg-[#fbeee6] py-16 px-4 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
        className="relative w-full max-w-6xl rounded-3xl overflow-hidden shadow-xl"
      >
        {/* Background Image */}
        <Image
          src={imageUrl}
          loader={loader}
          alt="Massage experience"
          layout="fill"
          objectFit="cover"
          className="z-0"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md z-10"></div>

        {/* Content */}
        <div className="relative z-20 px-8 py-12 sm:px-12 md:px-16 lg:px-20 text-white max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-lg mb-6">
            {subtitle}
          </p>
          <Link
            href={buttonHref}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-full shadow-md transition-all duration-300"
          >
            {buttonLabel}
            <svg
              className="ml-2 w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
