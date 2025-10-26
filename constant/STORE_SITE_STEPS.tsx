// Accordion components
import BasicInfo from '../components/stores/create/BasicInfo/BasicInfo';
import StoreProfileInfo from '@/components/stores/create/StoreProfileInfo/StoreProfileInfo';
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
import { StepConfig } from '@/types/typings';
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
    key: 'storeProfile',
    title: 'Store Profile',
    render: (f, h) => <StoreProfileInfo {...f} handleChange={h.handleChange} handleArrayChange={h.handleArrayChange}  
    addItem={h.addItem} removeItem={h.removeItem}/>,
  },
  {
    key: 'categories',
    title: 'Categories',
    render: (f, h, cats,allLocs, selectedLocationsForDisplay,  selectedCategoriesArray,
        dispatch) => (
      <CategoryAccordion
        category={f.category}
        availableCategories={cats}
        selectedCategories={selectedCategoriesArray}
        onApply={() => console.log(f.StoreCategory)} 
        dispatch={dispatch}      />
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
      <PaymentAccordion
        paymentSettings={{
          id: f.paymentSettings?.id ?? '',
          stripeKey: f.paymentSettings?.stripeKey ?? null,
          paypalKey: f.paymentSettings?.paypalKey ?? null,
          mpesaShortcode: f.paymentSettings?.mpesaShortcode ?? null,
          mpesaConsumerKey: f.paymentSettings?.mpesaConsumerKey ?? null,
          mpesaConsumerSecret: f.paymentSettings?.mpesaConsumerSecret ?? null,
          mpesaCallbackUrl: f.paymentSettings?.mpesaCallbackUrl ?? null,
          isStripeEnabled: f.paymentSettings?.isStripeEnabled ?? false,
          isPaypalEnabled: f.paymentSettings?.isPaypalEnabled ?? false,
          isMpesaEnabled: f.paymentSettings?.isMpesaEnabled ?? false,
          isPaystackEnabled: f.paymentSettings?.isPaystackEnabled ?? false,
          paystackPublicKey: f.paymentSettings?.paystackPublicKey ?? null,
          paystackSecretKey: f.paymentSettings?.paystackSecretKey ?? null,
        }}
        onChange={(upd) =>
          h.onChangeSettings({
            paymentSettings: {
              id: upd.id ?? '',
              stripeKey: upd.stripeKey ?? null,
              paypalKey: upd.paypalKey ?? null,
              mpesaShortcode: upd.mpesaShortcode ?? null,
              mpesaConsumerKey: upd.mpesaConsumerKey ?? null,
              mpesaConsumerSecret: upd.mpesaConsumerSecret ?? null,
              mpesaCallbackUrl: upd.mpesaCallbackUrl ?? null,
              isStripeEnabled: upd.isStripeEnabled ?? false,
              isPaypalEnabled: upd.isPaypalEnabled ?? false,
              isMpesaEnabled: upd.isMpesaEnabled ?? false,
              isPaystackEnabled: upd.isPaystackEnabled ?? false,
              paystackPublicKey: upd.paystackPublicKey ?? null,
              paystackSecretKey: upd.paystackSecretKey ?? null,
            }
          })
        }
      />
    ),
  },
  {
    key: 'shipping',
    title: 'Shipping',
    render: (f, h) => (
      <ShippingAccordion
        shippingSettings={
          f.shippingSettings
            ? {
                id: f.shippingSettings.id ?? '',
                carrierName: f.shippingSettings.carrierName ?? null,
                trackingUrl: f.shippingSettings.trackingUrl ?? null,
                regions:
                  Array.isArray(f.shippingSettings.regions)
                    ? f.shippingSettings.regions.filter((r): r is string => typeof r === 'string')
                    : typeof f.shippingSettings.regions === 'string'
                    ? [f.shippingSettings.regions]
                    : [],
                enablePickup: f.shippingSettings.enablePickup ?? null,
                pickupInstructions: f.shippingSettings.pickupInstructions ?? null,
              }
            : {
                id: '',
                carrierName: null,
                trackingUrl: null,
                regions: [],
                enablePickup: null,
                pickupInstructions: null,
              }
        }
        onChange={(upd) =>
          h.onChangeSettings({
            shippingSettings: {
              id: upd.id ?? '',
              carrierName: upd.carrierName ?? null,
              trackingUrl: upd.trackingUrl ?? null,
              regions: upd.regions ?? [],
              enablePickup: upd.enablePickup ?? null,
              pickupInstructions: upd.pickupInstructions ?? null,
            }
          })
        }
      />
    ),
  }
];

export const pricingSteps: StepConfig[] = [
  {
    key: 'pricingtiers',
    title: 'Pricing Tiers',
    render: (formData, handlers) => {
      // Provide a setFormData function matching (name: string, value: any) => void
      const setPricingTiersFormData = (name: string, value: any) => {
        if (name === 'pricingTiers') {
          handlers.onChangeSettings({ pricingTiers: value });
        }
      };

      return (
        <ProductPricingAndTiers
          pricingTiers={formData.pricingTiers}
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
        coreValues={f.CoreValues} // ← you also need to pass this in!
        handleUpdateCoreValue={(i, field, v) =>
          h.onUpdateArray('CoreValues', i, field, v)
        }
        handleAddCoreValue={() =>
          h.onAddArray('CoreValues', {
            title: '',
            description: '',
            icon: '',
          })
        }
        handleRemoveCoreValue={(i) => h.onRemoveArray('CoreValues', i)}
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
        onUpdatePromotion={(
          index,
          field,
          value
        ) => h.onUpdatePromotion(index, field, value !== null ? String(value) : '')}
        onAddPromotion={h.onAddPromotion}
        onRemovePromotion={h.onRemovePromotion}
        onImageUpload={h.onPromotionImageUpload}
        onAddPerk={h.onAddPerk}
        onUpdatePerk={h.onUpdatePerk}
        onRemovePerk={h.onRemovePerk}
        onAddTrustLogo={h.onAddTrustLogo}
        onUpdateTrustLogo={h.onUpdateTrustLogo}
        onRemoveTrustLogo={h.onRemoveTrustLogo}
      />
    ),
    
  },
  {
    key: 'seo',
    title: 'SEO Settings',
    render: (f, h) => (
      <SeoSettingsAccordion
        seo={{
          ...f.seo,
          id: f.seo?.id ?? '',
          title: f.seo?.title ?? null,
          description: f.seo?.description ?? null,
          keywords: f.seo?.keywords ?? [],
        }}
        onChange={(upd) =>
          h.onChangeSettings({
            seo: {
              ...upd,
              id: upd.id ?? '',
              title: upd.title ?? null,
              description: upd.description ?? null,
              keywords: upd.keywords ?? [],
            }
          })
        }
      />
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
      <SettingsAccordion
        analyticsConfig={{
          id: f.analyticsConfig?.id ?? '',
          googleTag: f.analyticsConfig?.googleTag ?? null,
          facebookTag: f.analyticsConfig?.facebookTag ?? null,
          hotjarSiteId: f.analyticsConfig?.hotjarSiteId ?? null,
          isActive: f.analyticsConfig?.isActive ?? false,
        }}
        onChange={(upd) =>
          h.onChangeSettings({
            analyticsConfig: {
              id: upd.id ?? '',
              googleTag: upd.googleTag ?? null,
              facebookTag: upd.facebookTag ?? null,
              hotjarSiteId: upd.hotjarSiteId ?? null,
              isActive: upd.isActive ?? false,
            },
          })
        }
      />
    ),
  },
];

export const locationsSteps: StepConfig[] = [  
  {
    key: 'storeLocations', // NEW KEY
    title: 'Store Locations', // NEW TITLE
    render: (f, h, cats, allLocs, selectedLocationsForDisplay) => ( // NEW: allLocs parameter
      <LocationSelectionAccordion
        availableLocations={allLocs} // Pass all available locations
        selectedLocations={selectedLocationsForDisplay} // Pass currently selected locations
        onToggleLocation={h.onToggleLocation} // New handler
        onBulkToggle={h.onBulkToggleLocations} // New handler
        onApply={() => console.log(f.CompanyLocation)} // Example onApply
      />
    ),
  },
];
