import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useStateContext } from "../../../../../contexts/ContextProvider";
import { motion } from "framer-motion";

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) =>
  `${src}?w=${width}&q=${quality || 75}`;

const store = {
  name: "AceTech Solutions",
  slug: "acetech",
  description: "Empowering your business with modern technology and innovative solutions.",
  bannerUrl: "/banner.jpg",
  categories: [
    { id: 1, name: "Web Development", slug: "web-dev", icon: "/icons/web.svg" },
    { id: 2, name: "Mobile Apps", slug: "mobile-apps", icon: "/icons/mobile.svg" },
    { id: 3, name: "UI/UX Design", slug: "ui-ux", icon: "/icons/design.svg" },
    { id: 4, name: "SEO Services", slug: "seo", icon: "/icons/seo.svg" },
    { id: 5, name: "Cloud Hosting", slug: "cloud", icon: "/icons/cloud.svg" },
    { id: 6, name: "Consulting", slug: "consulting", icon: "/icons/consulting.svg" },
  ],
  featuredServices: [
    {
      id: 1,
      name: "Custom Website Development",
      subtitle: "Tailored web solutions for your business",
      imageUrl: "/services/web.jpg",
    },
    {
      id: 2,
      name: "iOS & Android App Development",
      subtitle: "Mobile apps that scale and perform",
      imageUrl: "/services/mobile.jpg",
    },
    {
      id: 3,
      name: "Brand Identity & UX Design",
      subtitle: "Create an experience users love",
      imageUrl: "/services/design.jpg",
    },
  ],
  testimonials: [
    { quote: "AceTech helped transform our digital presence. Highly recommended!", author: "John Doe" },
    { quote: "Professional and efficient team with excellent results.", author: "Jane Smith" },
  ],
  faqs: [
    { question: "How long does a typical project take?", answer: "Most projects are completed within 4-8 weeks depending on complexity." },
    { question: "Do you offer support after launch?", answer: "Yes, we offer maintenance and support plans." },
  ],
};

export default function ServiceSite({ children,  slug }: any) {
  const { setInquiryServiceId } = useStateContext();
  const router = useRouter();

  const handleInquiry = (serviceId: string) => {
    setInquiryServiceId(serviceId);
    router.push(`/${slug}/contact`);
  };

  if (!store) return null;

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[65vh] flex items-center bg-gradient-to-br from-blue-700 via-indigo-600 to-purple-700 text-white overflow-hidden">
        {store.bannerUrl && (
          <Image
            src={store.bannerUrl}
            alt="Hero"
            fill
            className="object-cover opacity-30"
            loader={loader}
          />
        )}
        <div className="relative z-10 container mx-auto px-6">
          <h1 className="text-5xl font-extrabold mb-4 drop-shadow-xl">{store.name}</h1>
          <p className="text-xl max-w-2xl mb-6 leading-relaxed">{store.description}</p>
          <Link
            href={`/${store.slug}/contact`}
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-6 rounded-xl shadow hover:bg-gray-100 transition"
          >
            Get in Touch
          </Link>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Explore Our Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {store.categories?.map((cat: any) => (
              <Link
                key={cat.id}
                href={`/${store.slug}/service-category/${cat.slug}`}
                className="group flex flex-col items-center text-center bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 hover:border-blue-500"
              >
                <div className="w-16 h-16 mb-3">
                  <Image
                    src={cat.icon || cat.imageUrl}
                    alt={cat.name}
                    width={64}
                    height={64}
                    className="object-cover rounded-full"
                    loader={loader}
                  />
                </div>
                <span className="text-gray-700 font-medium group-hover:text-blue-600 transition">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Featured Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {store.featuredServices?.map((svc: any) => (
              <motion.div
                key={svc.id}
                whileHover={{ scale: 1.03 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all"
              >
                <div className="relative h-52">
                  <Image src={svc.imageUrl} alt={svc.name} fill className="object-cover" loader={loader} />
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-semibold text-gray-900">{svc.name}</h3>
                  <p className="mt-2 text-gray-600">{svc.subtitle || svc.name}</p>
                  <button
                    onClick={() => handleInquiry(svc.id)}
                    className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {store.testimonials.length > 0 && (
        <section className="py-20 bg-white text-center">
          <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold text-gray-800 mb-12">What Clients Say</h2>
            <div className="space-y-10 max-w-3xl mx-auto">
              {store.testimonials.map((t: any, i: number) => (
                <blockquote key={i} className="text-lg italic text-gray-700">
                  “{t.quote}”
                  <br />
                  <span className="mt-2 block font-semibold text-gray-900">— {t.author}</span>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="container mx-auto">{children}</div>

      {/* FAQs */}
      {store.faqs?.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-6 max-w-3xl">
            <h2 className="text-4xl font-bold text-center text-gray-800 mb-10">Frequently Asked Questions</h2>
            <div className="space-y-6">
              {store.faqs.map((q: any, i: number) => (
                <details key={i} className="bg-white rounded-xl shadow p-6">
                  <summary className="cursor-pointer text-lg font-semibold text-gray-800">{q.question}</summary>
                  <p className="mt-3 text-gray-600">{q.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
