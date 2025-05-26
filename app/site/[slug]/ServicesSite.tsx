// app/site/[slug]/ServicesSite.tsx
import HeroSlider from '@/components/HeroSlider'
import ServiceFeatures from '@/components/site/ServiceFeatures/ServiceFeatures'
import NewsletterSection from '@/components/site/NewsletterSection/NewsletterSection'

export default function ServicesSite({ store }:any) {
  return (
    <>
      <HeroSlider store={store} />
      <ServiceFeatures store={store} />
      <NewsletterSection />
    </>
  )
}
