// pages/products/[slug].tsx
import { useState } from "react";
import { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Image from "next/image";
import Header from "../../../../components/site/header/Header";
import Footer from "../../../../components/site/footer/Footer";

// Type definitions
interface Product { id: string; name: string; price: number; imageUrl: string; slug: string; }
interface Store { name: string; logoUrl: string; bannerUrl: string; category: string; description: string; contactEmail: string; contactPhone: string; address: string; products: Product[]; StoreCategory: StoreCategoryUI[]; }
interface Promo { id: string; title: string; subtitle: string; imageUrl: string; }
interface Category { id: string; name: string; imageUrl: string; }
interface StoreCategoryUI { id: string; name: string; imageUrl: string; slug: string; icon?: string }


// Mock data fetchers (replace with real API calls)
async function fetchAllProducts(): Promise<Product[]> {
  // ...
  return [];
}
async function fetchProductBySlug(slug: string): Promise<Product | null> {
  // ...
  return null;
}
async function fetchRelatedProducts(categorySlug: string, excludeId: string): Promise<Product[]> {
  // ...
  return [];
}

export const getStaticPaths: GetStaticPaths = async () => {
  const products = await fetchAllProducts();
  const paths = products.map((p) => ({ params: { slug: p.slug } }));
  return { paths, fallback: "blocking" };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slug = params?.slug as string;
  const product = await fetchProductBySlug(slug);
  if (!product) return { notFound: true };
  const related = await fetchRelatedProducts(product.categorySlug, product.id);
  return {
    props: { product, related },
    revalidate: 60,
  };
};

export default function ProductDetailPage({ product, related }: { product: Product; related: Product[]; }) {
  const [mainImage, setMainImage] = useState(product.imageUrls[0]);

  return (
    <>
      <Head>
        <title>{product.name} | MyStore</title>
        <meta name="description" content={product.description.slice(0, 160)} />
        <meta property="og:title" content={product.name} />
        <meta property="og:description" content={product.description.slice(0, 160)} />
        <meta property="og:image" content={product.imageUrls[0]} />
      </Head>

      <main className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="w-full h-[400px] relative rounded-lg overflow-hidden shadow">
              <Image
                src={mainImage}
                alt={product.name}
                fill
                className="object-cover"
                loader={({ src }) => src}
              />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {product.imageUrls.map((url) => (
                <button
                  key={url}
                  onClick={() => setMainImage(url)}
                  className={
                    `relative h-20 w-full rounded overflow-hidden border-2 ${
                      mainImage === url ? 'border-green-600' : 'border-transparent'
                    }`
                  }
                >
                  <Image
                    src={url}
                    alt={`${product.name} thumbnail`}
                    fill
                    className="object-cover"
                    loader={({ src }) => src}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
              {product.name}
            </h1>
            <div className="flex items-center space-x-2">
              <span className="text-xl font-semibold text-green-600">
                ${product.price.toFixed(2)}
              </span>
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={
                      `h-5 w-5 ${
                        i < Math.round(product.rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`
                    }
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">({product.rating.toFixed(1)})</span>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              {product.description}
            </p>
            <div className="flex items-center space-x-4">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition">
                Add to Cart
              </button>
              <button className="border border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 rounded-lg text-sm font-medium transition">
                Buy Now
              </button>
            </div>
            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Category:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">{product.categoryName}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Availability:</h4>
                <p className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <Section title="Related Products">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Section>
        )}
      </main>
    </>
  );
}
