// In a separate file (e.g. siteLayoutMap.ts)
import dynamic from 'next/dynamic';

// Fallback UI while loading:
const LoadingPlaceholder = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Loading…</p>
    </div>
  );
};

// (1) Dynamically import each layout component. 
//     `ssr: false` if you only want client‐side rendering; omit if SSR is okay.
const AutomotiveSite  = dynamic(() => import('@/components/site/layouts/AutomotiveLayout/body/AutomotiveSite'), { loading: () => <LoadingPlaceholder /> });
const BookingsSite    = dynamic(() => import('@/components/site/layouts/BookingsLayout/body/BookingsSite'),     { loading: () => <LoadingPlaceholder /> });
const CoursesSite     = dynamic(() => import('@/components/site/layouts/CoursesLayout/body/CoursesSite'),       { loading: () => <LoadingPlaceholder /> });
const DirectorySite   = dynamic(() => import('@/components/site/layouts/DirectoryLayout/body/DirectorySite'),   { loading: () => <LoadingPlaceholder /> });
const EcommerceSite   = dynamic(() => import('@/components/site/layouts/EcommerceLayout/body/EcommerceSite'),   { loading: () => <LoadingPlaceholder /> });
const EventsSite      = dynamic(() => import('@/components/site/layouts/EventsLayout/body/EventsSite'),         { loading: () => <LoadingPlaceholder /> });
const FinanceSite     = dynamic(() => import('@/components/site/layouts/FinanceLayout/body/FinanceSite'),       { loading: () => <LoadingPlaceholder /> });
const FitnessSite     = dynamic(() => import('@/components/site/layouts/FitnessLayout/body/FitnessSite'),       { loading: () => <LoadingPlaceholder /> });
const MarketplaceSite = dynamic(() => import('@/components/site/layouts/MarketplaceLayout/body/MarketPlaceSite'),{ loading: () => <LoadingPlaceholder /> });
const MediaSite       = dynamic(() => import('@/components/site/layouts/MediaLayout/body/MediaSite'),           { loading: () => <LoadingPlaceholder /> });
const RealEstateSite  = dynamic(() => import('@/components/site/layouts/RealEstateLayout/body/RealEstateSite'), { loading: () => <LoadingPlaceholder /> });
const RestaurantSite  = dynamic(() => import('@/components/site/layouts/RestaurantLayout/body/RestaurentSite'),  { loading: () => <LoadingPlaceholder /> });
const TravelSite      = dynamic(() => import('@/components/site/layouts/TravelLayout/body/TravelSite'),           { loading: () => <LoadingPlaceholder /> });
const HealthCareSite  = dynamic(() => import('@/components/site/layouts/HealthcareLayout/body/HealthCareSite'), { loading: () => <LoadingPlaceholder /> });
const NonProfitSite   = dynamic(() => import('@/components/site/layouts/NonprofitLayout/body/NonProfitSite'),   { loading: () => <LoadingPlaceholder /> });
const BlogSite        = dynamic(() => import('@/components/site/layouts/BlogLayout/body/BlogSite'),             { loading: () => <LoadingPlaceholder /> });
const DefaultSite     = dynamic(() => import('@/components/site/layouts/DefaultLayout/body/DefaultSite'),       { loading: () => <LoadingPlaceholder /> });
const PortfolioSite   = dynamic(() => import('@/components/site/layouts/PortfolioLayout/body/PortfolioSite'),   { loading: () => <LoadingPlaceholder /> });
const ServiceSite     = dynamic(() => import('@/components/site/layouts/ServicesLayout/body/ServiceSite'),      { loading: () => <LoadingPlaceholder /> });
const SaaSSite        = dynamic(() => import('@/components/site/layouts/SaaSLayout/body/SaaSSite'),            { loading: () => <LoadingPlaceholder /> });

type LayoutBodyComponent = React.ComponentType<{
  // params: { storeFormData: StoreForm };
  // children: ReactNode;
}>;

// (2) Create a plain object that maps every normalized key to its component.
//     Keys should be fully lowercased (and stripped of spaces/punctuation if you prefer).
const categoryBodyLayoutMap: Record<string, LayoutBodyComponent>  = {
  // ecommerce
  'e-commerce':     EcommerceSite,
  'ecommerce':      EcommerceSite,

  // services
  'services':       ServiceSite,
  'service provider': ServiceSite,

  // bookings
  'bookings':       BookingsSite,
  'booking & appointments': BookingsSite,

  // real estate
  'real estate':    RealEstateSite,

  // portfolio
  'portfolio':             PortfolioSite,
  'portfolio & personal branding': PortfolioSite,

  // restaurant
  'restaurant':            RestaurantSite,
  'restaurant & food delivery': RestaurantSite,

  // blog
  'blog':                  BlogSite,
  'blog & content':        BlogSite,

  // directory
  'directory':             DirectorySite,
  'directory & listings':  DirectorySite,

  // courses / educational
  'courses':               CoursesSite,
  'educational':           CoursesSite,
  'educational & online courses': CoursesSite,

  // nonprofit
  'nonprofit':         NonProfitSite,
  'nonprofit & community': NonProfitSite,

  // events
  'event':             EventsSite,
  'event & ticketing': EventsSite,

  // healthcare
  'healthcare':        HealthCareSite,
  'healthcare & clinics': HealthCareSite,

  // saas
  'saas':                     SaaSSite,
  'saas & web apps':          SaaSSite,

  // automotive
  'automotive':       AutomotiveSite,

  // media
  'media':                  MediaSite,
  'media & entertainment':  MediaSite,

  // finance
  'finance':                FinanceSite,
  'finance & legal':        FinanceSite,

  // travel
  'travel':                 TravelSite,
  'travel & tourism':       TravelSite,

  // fitness
  'fitness':                FitnessSite,
  'fitness & wellness':     FitnessSite,

  // marketplace
  'marketplace':            MarketplaceSite,

  // fallback key (optional—you could omit and let `|| DefaultSite` catch it)
  'other':                  DefaultSite,
  'default':                  DefaultSite,
};


// const categoryLayoutMap: Record<string, LayoutComponent> = {
//     'ecommerce': EcommerceSite,
//     'e‐commerce': EcommerceLayout,
//     'services': ServicesLayout,
//     'service provider': ServicesLayout, 
//     'bookings':BookingsLayout,
//     'booking & appointments':BookingsLayout,      
//     'real estate': RealEstateLayout,    
//     'portfolio':PortfolioLayout,
//     'portfolio & personal branding':PortfolioLayout,     
//     'restaurant':RestaurantLayout,
//     'restaurant & food delivery':RestaurantLayout,
//     'blog':BlogLayout,
//     'blog & content':BlogLayout,
//     'directory':DirectoryLayout,
//     'directory & listings':DirectoryLayout,
//     'educational':CoursesLayout,
//     'educational & online courses':CoursesLayout,
//     'courses':CoursesLayout,
//     'nonprofit':NonprofitLayout,
//     'nonprofit & community':NonprofitLayout,
//     'event':EventsLayout,
//     'event & ticketing':EventsLayout,
//     'healthcare':HealthcareLayout,
//     'healthcare & clinics':HealthcareLayout,
//     'saas':SaaSLayout ,
//     'saas & web apps':SaaSLayout ,
//     'automotive':AutomotiveLayout ,
//     'media':MediaLayout ,
//     'media & entertainment':MediaLayout ,
//     'finance':FinanceLayout  ,
//     'finance & legal':FinanceLayout  ,
//     'travel':TravelLayout ,
//     'travel & tourism':TravelLayout ,
//     'fitness':FitnessLayout ,
//     'fitness & wellness':FitnessLayout ,
//     'marketplace':MarketplaceLayout ,
//     'other':DefaultLayout ,
//     'Other':DefaultLayout ,      
//     'default': DefaultLayout,
       
  
// };

export default categoryBodyLayoutMap;
