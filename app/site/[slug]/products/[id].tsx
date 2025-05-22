import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import prisma from '../../../../server/db/prismadb';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { StarIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import Header from '../../../../components/site/header/Header';
import Footer from '../../../../components/site/footer/Footer';
import ProductGrid from '../../../../components/site/productGrid/ProductGrid';
import NewsletterSection from '../../../../components/site/NewsletterSection/NewsletterSection';
import Section from '../../../../components/site/Section/Section';
import { useStateContext } from '../../../../contexts/ContextProvider';
import { useStore } from '../../../../contexts/StoreContext';


// Type definitions
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }
interface SocialLink { channel: string; url: string }
interface Policy { type: string; title?: string; content: string }
interface FAQ { question: string; answer: string }
interface Testimonial { author: string; quote: string; avatarUrl?: string; rating?: number }
interface Banner { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string }
interface Promotion { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string }
interface Product { id: string; name: string; price: number; imageUrl: string; slug?: string }

interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category: string;
  logoUrl?: string;
  bannerUrl?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  // themeSettings
  StoreCategory: StoreCategoryUI[];
  socialLinks: SocialLink[];
  policies: Policy[];
  faqs: FAQ[];
  testimonials: Testimonial[];
  heroSlides: Banner[];
  promotions: Promotion[];
  products: Product[];
}

interface FooterProps {
  store: Store;
}

const loader = ({ src, width, quality }: { src: string; width: number; quality?: number }) => `${src}?w=${width}&q=${quality || 75}`;


interface ProductDetailProps {
  product: {
    id: string;
    title: string;
    description: string;
    finalPrice: number;
    rating?: number;
    images: { url: string }[];
    company: { slug: string };
  };
  related: {
    id: string;
    title: string;
    slug: string;
    finalPrice: number;
    images: { url: string }[];
  }[];
}

const ProductPage: React.FC<ProductDetailProps> = ({ product, related }) => {
  const { slug } = useRouter().query;
  const { addToCart, cart } = useStateContext();
  const [mainIndex, setMainIndex] = useState(0);
  const quantity = cart.find((c :any ) => c.id === product.id)?.quantity || 0;
  const store = useStore();

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Header store={store}/>
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <div>
          <div className="relative w-full h-[400px] rounded-lg overflow-hidden shadow-md">
            <Image
              loader={loader}
              src={product.images[mainIndex]?.url || '/placeholder.png'}
              alt={product.title}
              layout="fill"
              objectFit="cover"
            />
          </div>
          <div className="flex mt-4 space-x-2">
            {product.images.map((img, idx) => (
              <button key={idx} onClick={() => setMainIndex(idx)} className={idx === mainIndex ? 'ring-2 ring-blue-500 rounded' : ''}>
                <div className="relative w-20 h-20 rounded overflow-hidden">
                  <Image src={img.url} alt={`${product.title}-${idx}`} layout="fill" objectFit="cover" loader={loader}/>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold">{product.title}</h1>
          <div className="flex items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarIcon key={i} className={`h-5 w-5 ${product.rating && product.rating > i ? 'text-yellow-400' : 'text-gray-300'}`} />
            ))}
            <span className="ml-2 text-gray-600">({product.rating ?? 0})</span>
          </div>
          <p className="text-2xl font-semibold text-blue-600">${product.finalPrice.toFixed(2)}</p>
          <p className="leading-relaxed">{product.description}</p>

          {/* Quantity & Add to Cart */}
          <div className="flex items-center space-x-4">
            <button onClick={() => addToCart(product)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">Add to Cart</button>
            {quantity > 0 && (
              <div className="flex items-center space-x-2">
                <button onClick={() => addToCart(product)}><PlusIcon className="h-5 w-5" /></button>
                <span>{quantity}</span>
                <button onClick={() => quantity > 1 ? addToCart({ ...product, quantity: -1 } as any) : undefined}><MinusIcon className="h-5 w-5" /></button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <Section title="You might also like">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((r) => (
              <ProductGrid key={r.id} products={[{ id: r.id, name: r.title, slug: r.slug, price: r.finalPrice, imageUrl: r.images[0]?.url }]} />
            ))}
          </div>
        </Section>
      )}

      <NewsletterSection />
      <Footer store={store}/>
    </div>
  );
};


export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const slug = params?.slug as string;
  const productId = params?.productId as string;

  // Ensure company exists
  // const company = await prisma.company.findUnique({ where: { slug } });
  // if (!company) return { notFound: true };

  // Fetch product with images
  const product = await prisma.marketplaceListing.findFirst({
    where: { id: productId },//, companyId: company.id
    // include: { images: true },
  });
  if (!product) return { notFound: true };

  // Fetch related by same category
  const related = await prisma.marketplaceListing.findMany({
    where: {
      companyId: product.companyId,
      productCategoryId: product.productCategoryId,
      NOT: { id: product.id },
    },
    take: 4,
    // include: { images: true },
  });

  return {
    props: {
      product: {
        id: product.id,
        title: product.title,
        description: product.description ?? '',
        finalPrice: product.finalPrice,
        rating:  0,//product.rating ??
        images: product.images,
      },
      related: related.map((r) => ({
        id: r.id,
        title: r.title,
        slug: "r.slug",
        finalPrice: r.finalPrice,
        images: r.images,
      })),
    },
  };
};

// export const getServerSideProps: GetServerSideProps = async ({ params }) => {
//   const slug = params?.slug as string;
//   const productSlug = params?.productSlug as string;

//   const company = await prisma.company.findUnique({ where: { slug } });
//   if (!company) return { notFound: true };

//   const product = await prisma.marketplaceListing.findFirst({
//     where: { slug: productSlug, companyId: company.id },
//     // include: { images: true }
//   });
//   if (!product) return { notFound: true };

//   // Fetch related by same category
//   const related = await prisma.marketplaceListing.findMany({
//     where: { companyId: company.id, productCategoryId: product.productCategoryId, NOT: { id: product.id } },
//     take: 4,
//     // include: { images: true }
//   });

//   return {
//     props: {
//       product: {
//         id: product.id,
//         title: product.title,
//         description: product.description ?? '',
//         finalPrice: product.finalPrice,
//         rating: 0,//product.rating ?? 
//         images: product.images,
//         company: { slug: company.slug }
//       },
//       related: related.map(r => ({
//         id: r.id,
//         title: r.title,
//         slug: 0,//r.slug,
//         finalPrice: r.finalPrice,
//         images: r.images
//       }))
//     }
//   };
// };

export default ProductPage;
