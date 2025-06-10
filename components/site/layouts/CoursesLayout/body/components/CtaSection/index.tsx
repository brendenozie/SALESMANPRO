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
    <section className="bg-gray-800 text-white rounded-2xl p-8 text-center">
      {/* Subscribe Section */}
      <h2 className="text-2xl font-semibold mb-4">Get the news in front line by subscribe our latest updates</h2>
      <div className="flex justify-center">
        <input
          type="email"
          placeholder="Enter your email..."
          className="w-full max-w-md p-3 rounded-l-xl text-gray-800"
        />
        <button className="px-6 bg-red-500 text-white rounded-r-xl hover:bg-red-600 transition">
          Subscribe Now
        </button>
      </div>
    </section>
  );
}
