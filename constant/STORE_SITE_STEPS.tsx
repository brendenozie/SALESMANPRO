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
import LocationSelectionAccordion from '@/components/stores/create/LocationSelectionAccordion/LocationSelectionAccordion';
import { StepConfig } from '@/types/typings';

// Interfaces
export const storeSteps: StepConfig[] = [
  {
    key: 'businesscategory',
    title: 'Business Category',
    render: (f, h, siteCategories) => <CategorySelect {...f} handleChange={h.handleChange} siteCategories={siteCategories} />,
  },
  {
    key: 'basic',
    title: 'Basic Info',
    render: (f, h) => <BasicInfo 
      name={f.name}
      slug={f.slug}
      category={f.category}
      description={f.description}
      hasWebsite={f.hasWebsite}
      tagline={f.tagline}
      domain={f.domain}
      handleChange={h.handleChange} />,
  },
  {
    key: 'storeProfile',
    title: 'Store Profile',
    render: (f, h) => <StoreProfileInfo 
      partnerLogos={f.partnerLogos}
      founderImage={f.founderImage}
      founderName={f.founderName}
      founderQuote={f.founderQuote}
      sectionSubtitle={f.sectionSubtitle}
      sectionTitle={f.sectionTitle}
      sectionDescription={f.sectionDescription}
      handleChange={h.handleChange} handleArrayChange={h.handleArrayChange}
      addItem={h.addItem} 
      removeItem={h.removeItem} 
      onUpload={h.handleMediaUpload} 
      onRemove={h.handleMediaRemove}/>,
  },
  {
    key: 'categories',
    title: 'Categories',
    render: (f, h, site,cats,allLocs, selectedLocationsForDisplay,  selectedCategoriesArray, dispatch) => (
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
            paymentSettings={f.paymentSettings}
            // Pass the dedicated handler wrapped to normalize incoming PaymentSettings
            onChange={(upd) =>
              h.onUpdatePaymentSettings({
                id: upd.id ?? '',

                mpesaShortcode: upd.mpesaShortcode ?? null,
                mpesaConsumerKey: upd.mpesaConsumerKey ?? null,
                mpesaConsumerSecret: upd.mpesaConsumerSecret ?? null,
                mpesaCallbackUrl: upd.mpesaCallbackUrl ?? null,
                isStripeEnabled: upd.isStripeEnabled ?? false,
                isPaypalEnabled: upd.isPaypalEnabled ?? false,
                isMpesaEnabled: upd.isMpesaEnabled ?? false,
                isGhubaEnabled: upd.isGhubaEnabled ?? false,
                isPaystackEnabled: upd.isPaystackEnabled ?? false,
                paystackPublicKey: upd.paystackPublicKey ?? null,
                paystackSecretKey: upd.paystackSecretKey ?? null,
                ghubaMerchantId: upd.ghubaMerchantId ?? null,
                ghubaApiKey: upd.ghubaApiKey ?? null,

                stripePublishableKey: upd.stripePublishableKey ?? null,
                stripeSecretKey: upd.stripeSecretKey ?? null,

                paypalClientId: upd.paypalClientId ?? null,
                paypalClientSecret: upd.paypalClientSecret ?? null,
                mpesaPasskey: upd.mpesaPasskey ?? null,
                mpesaSecret_encrypted: upd.mpesaSecret_encrypted ?? null,
                mpesaSecret_iv: upd.mpesaSecret_iv ?? null,
                mpesaSecret_tag: upd.mpesaSecret_tag ?? null,
                stripeSecret_encrypted: upd.stripeSecret_encrypted ?? null,
                stripeSecret_iv: upd.stripeSecret_iv ?? null,
                stripeSecret_tag: upd.stripeSecret_tag ?? null,
                paypalSecret_encrypted: upd.paypalSecret_encrypted ?? null,
                paypalSecret_iv: upd.paypalSecret_iv ?? null,
                paypalSecret_tag: upd.paypalSecret_tag ?? null,
                paystackSecret_encrypted: upd.paystackSecret_encrypted ?? null,
                paystackSecret_iv: upd.paystackSecret_iv ?? null,
                paystackSecret_tag: upd.paystackSecret_tag ?? null,
                ghubaSecret_encrypted: upd.ghubaSecret_encrypted ?? null,
                ghubaSecret_iv: upd.ghubaSecret_iv ?? null,
                ghubaSecret_tag: upd.ghubaSecret_tag ?? null
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
                standardRate: f.shippingSettings.standardRate ?? null,
                expressRate: f.shippingSettings.expressRate ?? null,
              }
            : {
                id: '',
                carrierName: null,
                trackingUrl: null,
                regions: [],
                enablePickup: null,
                pickupInstructions: null,
                standardRate: null,
                expressRate: null,
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
              standardRate: upd.standardRate ?? null,
              expressRate: upd.expressRate ?? null
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
        videoUrl={f.videoUrl}
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
        slides={
          (Array.isArray(f.heroSlides) ? f.heroSlides : []).map((slide) => ({
            ...slide,
            stats:
              slide.stats && typeof slide.stats === 'object' && !Array.isArray(slide.stats)
                ? slide.stats
                : null,
          })) as any
        }
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
          companyId: f.analyticsConfig?.companyId ?? '',
          googleAnalyticsId: f.analyticsConfig?.googleAnalyticsId ?? null,
          googleAdsId: f.analyticsConfig?.googleAdsId ?? null,
          facebookPixelId: f.analyticsConfig?.facebookPixelId ?? null,
          tiktokPixelId: f.analyticsConfig?.tiktokPixelId ?? null,
          hotjarSiteId: f.analyticsConfig?.hotjarSiteId ?? null,
          isActive: f.analyticsConfig?.isActive ?? false,
        }}
        onChange={(upd) =>
          h.onChangeSettings({
            analyticsConfig: {
              id: upd.id ?? '',
              companyId: upd.companyId ?? '',
              googleAnalyticsId: upd.googleAnalyticsId ?? null,
              googleAdsId: upd.googleAdsId ?? null,
              facebookPixelId: upd.facebookPixelId ?? null,
              tiktokPixelId: upd.tiktokPixelId ?? null,
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
    render: (f, h,site, cats, allLocs, selectedLocationsForDisplay) => ( // NEW: allLocs parameter
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
