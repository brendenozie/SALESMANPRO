// Accordion components
import BasicInfo from '../components/stores/create/BasicInfo/BasicInfo';
import CategoryAccordion from '../components/stores/create/CategoryAccordion/CategoryAccordion';
import BannerLogoAccordion from '../components/stores/create/BannerLogoAccordion/BannerLogoAccordion';
import ContactAccordion from '../components/stores/create/ContactAccordion/ContactAccordion';
import LocationAccordion from '../components/stores/create/LocationAccordion/LocationAccordion';
import SocialLinksAccordion from '../components/stores/create/SocialLinksAccordion/SocialLinksAccordion';
import PoliciesAccordion from '../components/stores/create/PoliciesAccordion/PoliciesAccordion';
import FAQsAccordion from '../components/stores/create/FAQsAccordion/FAQsAccordion';
import TestimonialsAccordion from '../components/stores/create/TestimonialsAccordion/TestimonialsAccordion';
import HeroSlidesAccordion from '../components/stores/create/HeroSlidesAccordion/HeroSlidesAccordion';
import PromotionsAccordion from '../components/stores/create/PromotionsAccordion/PromotionsAccordion';
import ThemeSettingsAccordion from '../components/stores/create/ThemeSettingsAccordion/ThemeSettingsAccordion';
import SeoSettingsAccordion from '../components/stores/create/SeoSettingsAccordion/SeoSettingsAccordion';
import SettingsAccordion from '../components/stores/create/SettingsAccordion/SettingsAccordion';
import PaymentAccordion from '../components/stores/create/PaymentAccordion/PaymentAccordion';
import ShippingAccordion from '../components/stores/create/ShippingAccordion/ShippingAccordion';
import { AwardsAccordion } from '../components/stores/create/AwardsAccordion/AwardsAccordion';
import { MetricsAccordion } from '../components/stores/create/MetricsAccordion/MetricsAccordion';
import { StatsAccordion } from '../components/stores/create/StatsAccordion/StatsAccordion';
import ProductPricingAndTiers  from '../components/stores/create/PricingTiers/PricingTiers';
import CategorySelect from '../components/stores/create/CategorySelect/CategorySelect';
import { StoreForm, Handlers, StepConfig, GeoLocation, 
          RawCategory, SubObj, ParentCategory, 
          SelectedCategory, Promotion, 
          HeroSlide } from '@/types/typings';
import LocationSelectionAccordion from '@/components/stores/create/LocationSelectionAccordion/LocationSelectionAccordion';

// Interfaces
export const storeSteps: StepConfig[] = [
  {
    key: 'businesscategory',
    title: 'Business Category',
    render: (f, h) => <CategorySelect {...f} handleChange={h.handleChange} />,
  },
  {
    key: 'basic',
    title: 'Basic Info',
    render: (f, h) => <BasicInfo {...f} handleChange={h.handleChange} />,
  },
  {
    key: 'categories',
    title: 'Categories',
    render: (f, h, cats) => (
      <CategoryAccordion
        category={f.category}
        availableCategories={cats}
        selectedCategories={f.storeCategories}
        onToggleParent={h.onToggleParent}
        onToggleSub={h.onToggleSub}
        onToggleBrand={h.onToggleBrand}
        onBulkToggle={h.onBulkToggle}
        onApply={() => console.log(f.storeCategories)}
      />
    ),
  },  
  {
    key: 'touchpoints',
    title: 'Customer Touchpoints',
    render: (f, h) => (
      <ContactAccordion
        {...f}
        openingHours={f.openingHours}
        onChange={h.handleChange}
        onToggleDay={h.onToggleDay}
      />
    ),
  },
];

export const paymentSteps: StepConfig[] = [
  {
    key: 'payment',
    title: 'Payment',
    render: (f, h) => (
      <PaymentAccordion paymentSettings={f.paymentSettings} onChange={(upd) => h.onChangeSettings({ paymentSettings: upd })} />
    ),
  },
  {
    key: 'shipping',
    title: 'Shipping',
    render: (f, h) => (
      <ShippingAccordion shippingSettings={f.shippingSettings} onChange={(upd) => h.onChangeSettings({ shippingSettings: upd })} />
    ),
  }
];

export const pricingSteps: StepConfig[] = [
  {
    key: 'pricingtiers',
    title: 'Pricing Tiers',
    render: (formData, handlers) => {
      // Create a wrapper function that ProductPricingAndTiers expects
      const setPricingTiersFormData: React.Dispatch<React.SetStateAction<StoreForm>> = (update) => {
        if (typeof update === 'function') {
          handlers.onChangeSettings({ pricingTiers: (update as any).pricingTiers });
        } else {
          handlers.onChangeSettings({ pricingTiers: (update as any).pricingTiers });
        }
      };

      return (
        <ProductPricingAndTiers
          formData={{
            ...formData,
            pricingTiers: formData.pricingTiers || [],
          }}
          setFormData={setPricingTiersFormData}
        />
      );
    },
  },
];

export const websiteSteps: StepConfig[] = [
  {
    key: 'branding',
    title: 'Branding',
    render: (f, h) => (
      <BannerLogoAccordion
        logoUrl={f.logoUrl}
        bannerUrl={f.bannerUrl}
        onUpload={h.handleMediaUpload}
        onRemove={h.handleMediaRemove}
      />
    ),
  },
  {
    key: 'location',
    title: 'Location',
    render: (f, h) => (
      <LocationAccordion address={f.address} onAddressSelect={h.setAddress} />
    ),
  },
  {
    key: 'social',
    title: 'Social Links',
    render: (f, h) => (
      <SocialLinksAccordion
        socialLinks={f.socialLinks}
        onUpdateLink={(i, field, v) => h.onUpdateArray('socialLinks', i, field, v)}
        onAddLink={() => h.onAddArray('socialLinks', { channel: '', url: '' })}
        onRemoveLink={(i) => h.onRemoveArray('socialLinks', i)}
      />
    ),
  },
  {
    key: 'content',
    title: 'Policies',
    render: (f, h) => (
      <PoliciesAccordion
        policies={f.policies}
        onUpdatePolicy={(i, field, v) => h.onUpdateArray('policies', i, field, v)}
        onAddPolicy={() => h.onAddArray('policies', { type: '', content: '' })}
        onRemovePolicy={(i) => h.onRemoveArray('policies', i)}
      />
    ),
  },
  {
    key: 'awards',
    title: 'Awards',
    render: (f, h) => (
      <AwardsAccordion
        awards={f.awards}
        onAdd={() => h.onAddArray('awards', { name: '', iconUrl: '' })}
        onUpdate={(i, field, v) => h.onUpdateArray('awards', i, field, v)}
        onRemove={(i) => h.onRemoveArray('awards', i)}
      />
    ),
  },
  {
    key: 'metrics',
    title: 'Metrics',
    render: (f, h) => (
      <MetricsAccordion
        metrics={f.metrics}
        onAdd={() => h.onAddArray('metrics', { label: '', value: 0 })}
        onUpdate={(i, field, v) => h.onUpdateArray('metrics', i, field, v)}
        onRemove={(i) => h.onRemoveArray('metrics', i)}
      />
    ),
  },
  {
    key: 'stats',
    title: 'Stats',
    render: (f, h) => (
      <StatsAccordion
        stats={f.stats}
        onAdd={() => h.onAddArray('stats', { label: '', value: '' })}
        onUpdate={(i, field, v) => h.onUpdateArray('stats', i, field, v)}
        onRemove={(i) => h.onRemoveArray('stats', i)}
      />
    ),
  },
  {
    key: 'faqs',
    title: 'FAQs',
    render: (f, h) => (
      <FAQsAccordion
        faqs={f.faqs}
        onUpdateFAQ={(i, field, v) => h.onUpdateArray('faqs', i, field, v)}
        onAddFAQ={() => h.onAddArray('faqs', { question: '', answer: '' })}
        onRemoveFAQ={(i) => h.onRemoveArray('faqs', i)}
      />
    ),
  },
  {
    key: 'testimonials',
    title: 'Testimonials',
    render: (f, h) => (
      <TestimonialsAccordion
        testimonials={f.testimonials}
        onUpdateTestimonial={(i, field, v) => h.onUpdateArray('testimonials', i, field, v)}
        onAddTestimonial={() => h.onAddArray('testimonials', { author: '', quote: '' })}
        onRemoveTestimonial={(i) => h.onRemoveArray('testimonials', i)}
      />
    ),
  },
  {
    key: 'marketing',
    title: 'Hero Slides',
    render: (f, h) => (
      <HeroSlidesAccordion
        slides={f.heroSlides}
        onUpdateSlide={h.onUpdateHeroSlide}
        onAddSlide={h.onAddHeroSlide}
        onRemoveSlide={h.onRemoveHeroSlide}
        onImageUpload={h.handleSlideImageUpload}
      />
    ),
  },
  {
    key: 'promotions',
    title: 'Promotions',
    render: (f, h) => (
      <PromotionsAccordion
        promotions={f.promotions}
        onUpdatePromotion={h.onUpdatePromotion}
        onAddPromotion={h.onAddPromotion}
        onRemovePromotion={h.onRemovePromotion}
        onImageUpload={h.onPromotionImageUpload}
      />
    ),
  },
  {
    key: 'seo',
    title: 'SEO Settings',
    render: (f, h) => (
      <SeoSettingsAccordion seo={f.seo} onChange={(upd) => h.onChangeSettings({ seo: upd })} />
    ),
  },
  {
    key: 'theme',
    title: 'Theme Settings',
    render: (f, h) => (
      <ThemeSettingsAccordion themeSettings={f.themeSettings} onChange={(upd) => h.onChangeSettings({ themeSettings: upd })} />
    ),
  },  
  {
    key: 'analytics',
    title: 'Analytics',
    render: (f, h) => (
      <SettingsAccordion analyticsConfig={f.analyticsConfig} onChange={(upd) => h.onChangeSettings({ analyticsConfig: upd })} />
    ),
  },
];
``
export const locationsSteps: StepConfig[] = [  
  {
    key: 'storeLocations', // NEW KEY
    title: 'Store Locations', // NEW TITLE
    render: (f, h, cats, allLocs) => ( // NEW: allLocs parameter
      <LocationSelectionAccordion
        availableLocations={allLocs} // Pass all available locations
        selectedLocations={f.locations} // Pass currently selected locations
        onToggleLocation={h.onToggleLocation} // New handler
        onBulkToggle={h.onBulkToggleLocations} // New handler
        onApply={() => console.log(f.locations)} // Example onApply
      />
    ),
  },
];

