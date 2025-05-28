// app/site/layouts/EcommerceLayouts/body/EcommerceSite.tsx
import HeroSlider from '@/components/HeroSlider'
import CategoryBanners from '@/components/site/CategoryBanners/CategoryBanners'
import ProductGrid from '@/components/site/productGrid/ProductGrid'
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection'
import Section from '@/components/site/Section/Section'

export default function EcommerceSite({ store }:any) {
  return (
    <>
      <HeroSlider store={store} />

      <Section title="">
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

      <Section title="">
        {store.testimonials.map(({t, i}:any) => (
          <div
            key={i}
            className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md my-8"
          >
            <p className="text-lg">{t?.quote ?? ""}</p>
            <p className="text-sm text-gray-500">– {t?.author ?? ""}</p>
          </div>
        ))}
      </Section>
    </>
  )
}
