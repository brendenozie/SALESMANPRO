// app/site/[slug]/ServicesSite.tsx
import HeroSlider from '@/components/HeroSlider'
import ServiceFeatures from '@/components/site/ServiceFeatures/ServiceFeatures'
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection'
import Section from '@/components/site/Section/Section'
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners'
import ProductGrid from '@/components/site/productGrid/ProductGrid'

export default function DefaultSite({ store }:any) {
  return (
    <>
      <HeroSlider store={store} />

      <Section title=''>
        <ServiceFeatures store={store} />
      </Section>

      <Section title=''>
        <CategoryBanners categories={store.StoreCategory} />
      </Section>

      <Section title="Trending Products">
        <ProductGrid products={store.products} />
      </Section>

      <Section title="Top Selling">
        <ProductGrid products={store.products} />
      </Section>

      <Section title="All Products">
        <ProductGrid products={store.products} />
      </Section>

      <NewsletterSection />

      <Section title=''>
        {store.testimonials.map(({t, i}:any) => (
          <div
            key={i}
            className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md my-8"
          >
            <p className="text-lg">{t?.quote ?? "Awesome"}</p>
            <p className="text-sm text-gray-500">– {t?.author ?? "Unknown"}</p>
          </div>
        ))}
      </Section>
    </>
  )
}
