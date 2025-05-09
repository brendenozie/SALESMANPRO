import React, { useState, ChangeEvent, FormEvent, useEffect, useMemo, useRef } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import dynamic from "next/dynamic";
import { useRouter } from 'next/router';
import debounce from "lodash.debounce";
import {
  MapPinIcon,
  ChevronDownIcon,
  InboxIcon,
  PlusIcon,
  CheckIcon,
  TrashIcon,
  ChevronUpIcon, 
  PaintBrushIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";



const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(m => m.Circle), { ssr: false });

interface CategoryOption { id: string; name: string; }

interface GeoLocation { lat: number; lng: number; }
interface OpeningHours { [key: string]: string; } // e.g. { mon: "9–5", tue: "..." }

interface SocialLinkOption { channel: string; url: string; }
interface PolicyOption { type: string; title?: string; content: string; }
interface FAQOption { question: string; answer: string; order?: number; }
interface TestimonialOption { author: string; quote: string; avatarUrl?: string; rating?: number; order?: number; }
interface BannerOption { imageUrl: string; headline?: string; subline?: string; ctaText?: string; ctaLink?: string; order?: number; }
interface PromotionOption { code?: string; title: string; description?: string; startsAt?: string; endsAt?: string; bannerUrl?: string; }

interface SEOOption { title?: string; description?: string; keywords?: string[]; canonical?: string; }
interface AnalyticsConfigOption { googleTag?: string; facebookTag?: string; }
interface PaymentSettingsOption {  mpesaShortcode?: string; mpesaConsumerKey?: string; mpesaConsumerSecret?: string; mpesaCallbackUrl?: string; }
interface ShippingSettingsOption { carrierName?: string; trackingUrl?: string; }

interface StoreForm {
  id?: string;
  name: string;
  slug: string;
  domain?: string;
  tagline?: string;
  description?: string;
  category: string;               // main category ID or slug
  currency?: string;
  locale?: string;
  logoUrl?: string;
  bannerUrl?: string;
  heroSlides?: BannerOption[];
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  geoLocation?: GeoLocation;
  openingHours?: OpeningHours;
  socialLinks?: SocialLinkOption[];
  policies?: PolicyOption[];
  faqs?: FAQOption[];
  testimonials?: TestimonialOption[];
  banners?: BannerOption[];
  promotions?: PromotionOption[];
  themeSettings?: Record<string, any>;
  seo?: SEOOption;
  analyticsConfig?: AnalyticsConfigOption;
  paymentSettings?: PaymentSettingsOption;
  shippingSettings?: ShippingSettingsOption;
  storeCategories?: CategoryOption[]; // relation to StoreCategory
  createdAt?: string;
  updatedAt?: string;
}

interface CompanyFormProps {
  initialData?: Partial<StoreForm>;
  onSubmit: (data: StoreForm) => void;
}

interface CreateStorePageProps {
  availableCategories: CategoryOption[];
}

export default function CreateStorePage({ availableCategories }: CreateStorePageProps) {

  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 15;

  const [form, setForm] = useState<StoreForm>({
    id: '',
    name: '',
    slug: '',
    domain: '',
    tagline: '',
    description: '',
    category: '',
    currency: 'KES',
    locale: 'en-US',
    logoUrl: '',
    bannerUrl: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    geoLocation: { lat: 0, lng: 0 },
    openingHours: { mon: '', tue: '', wed: '', thu: '', fri: '', sat: '', sun: '' },
    socialLinks: [],
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    promotions: [],
    themeSettings: {},
    seo: {},
    analyticsConfig: {},
    paymentSettings: {},
    shippingSettings: {},
    storeCategories: [],
  });

  // Auto-generate slug
  useEffect(() => {
    if (form.name) {
      const slug = form.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
      setForm(f => ({ ...f, slug }));
    }
  }, [form.name]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value } as any));
  };

  // Array helpers
  const handleArrayChange = <T,>(key: keyof StoreForm, idx: number, field: keyof T, value: any) => {
    setForm(f => {
      const arr = (f[key] as unknown as T[]).slice();
      arr[idx] = { ...arr[idx], [field]: value } as any;
      return { ...f, [key]: arr } as any;
    });
  };
  const addArrayItem = <T,>(key: keyof StoreForm, emptyItem: T) => {
    setForm(f => ({ ...f, [key]: [...(f[key] as T[]), emptyItem] } as any));
  };
  const removeArrayItem = (key: keyof StoreForm, idx: number) => {
    setForm(f => {
      const arr = (f[key] as any[]).filter((_, i) => i !== idx);
      return { ...f, [key]: arr } as any;
    });
  };

  // Toggle categories
  const handleCategoryToggle = (cat: CategoryOption) => {
    setForm(f => {
      const exists = f.storeCategories?.some(c => c.id === cat.id);
      const newCats = exists
        ? f.storeCategories!.filter(c => c.id !== cat.id)
        : [...(f.storeCategories || []), cat];
      return { ...f, storeCategories: newCats };
    });
  };

  const next = () => setStep(s => Math.min(s + 1, totalSteps));
  const prev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) router.push('/stores');
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (<BasicInfo form={form} handleChange={handleChange} />  );
      case 2:
        return (<CategoryAccordion availableCategories={availableCategories} form={form} handleCategoryToggle={handleCategoryToggle} />   );
      case 3:
        return (<BannerLogoAccordion form={form} handleChange={handleChange} handleUpload={} handleRemove={}/> );
      case 4:
        return (<ContactLocationAccordion form={form} handleChange={handleChange} /> ); 
      case 5 : 
        return (<SocialLinksAccordion form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />   );
      case 6 : 
        return (<PoliciesAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 7 : 
        return (<FAQsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 8 : 
        return (<TestimonialsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 9 :
        return (<HeroSlidesAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 10 :
        return (<PromotionsAccordion  form={form} handleArrayChange={handleArrayChange} addArrayItem={addArrayItem} removeArrayItem={removeArrayItem} />);
      case 11 :
        return (<ThemeSettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 12 :
        return (<SeoSettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 13 :
        return (<SettingsAccordion  form={form} setForm={handleArrayChange}/>);
      case 14 :
        return (<PaymentAccordion  form={form} setForm={handleArrayChange}/>);
      case 15 :
        return (<ShippingAccordion  form={form} setForm={handleArrayChange}/>);
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-3xl">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {renderStep()}

          <div className="flex justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={prev}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Previous
              </button>
            ) : <div />}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={next}
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Create Store
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/shop/categories`);
  const cats = await res.json();
  const options = cats.categories.map((c: any) => ({ id: c.id, name: c.name }));
  return { props: { availableCategories: options } };
};

interface BasicInfoProps {
  form: {
    name: string;
    slug: string;
    tagline: string;
    domain: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfo: React.FC<BasicInfoProps> = ({ form, handleChange }: any) => (  
  <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Basic Info</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
            <span title="Friendly, readable name displayed in headings." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="My Awesome App"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
            Slug
            <span title="URL-friendly identifier, lowercase, no spaces." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="slug"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            placeholder="my-awesome-app"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Tagline */}
        <div className="sm:col-span-2">
          <label htmlFor="tagline" className="block text-sm font-medium text-gray-700">
            Tagline
            <span title="A brief, catchy description (2–3 words)." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="tagline"
            name="tagline"
            value={form.tagline}
            onChange={handleChange}
            placeholder="Empower Your Workflow"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Domain */}
        <div className="sm:col-span-2">
          <label htmlFor="domain" className="block text-sm font-medium text-gray-700">
            Domain
            <span title="Your custom domain or subdomain." className="ml-1 cursor-help">?</span>
          </label>
          <input
            id="domain"
            name="domain"
            value={form.domain}
            onChange={handleChange}
            placeholder="app.example.com"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </div>
);

interface Category {
  id: string | number;
  name: string;
}

interface BasicForm {
  storeCategories?: Category[];
}

interface CategoryAccordionProps {
  availableCategories: Category[];
  form: BasicForm;
  handleCategoryToggle: (category: Category) => void;
}

const CategoryAccordion: React.FC<CategoryAccordionProps> = ({ availableCategories, form, handleCategoryToggle }) => {
  const [search, setSearch] = useState('');

  // Filter categories based on search
  const filtered = useMemo(
    () => availableCategories.filter(cat => cat.name.toLowerCase().includes(search.toLowerCase())),
    [search, availableCategories]
  );

  const selectedCount = form.storeCategories?.length || 0;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Categories</h2>
        <span className="text-sm font-medium text-indigo-600">{selectedCount} selected</span>
      </div>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {filtered.map(cat => {
          const isSelected = form.storeCategories?.some(c => c.id === cat.id);
          return (
            <button
              key={cat.id}
              onClick={() => handleCategoryToggle(cat)}
              className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-all duration-200 focus:outline-none
                ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200'}`}
            >
              {isSelected && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="text-sm font-medium">{cat.name}</span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="mt-4 text-center text-gray-500">No categories match "{search}".</p>
      )}
    </div>
  );
};

interface BannerLogoAccordionProps {
  form: {
    bannerUrl?: string;
    logoUrl?: string;
    description?: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleUpload: (field: 'bannerUrl' | 'logoUrl', file: File) => void;
  handleRemove: (field: 'bannerUrl' | 'logoUrl') => void;
}

const BannerLogoAccordion: React.FC<BannerLogoAccordionProps> = ({ form, handleChange, handleUpload, handleRemove }) => {
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Media & Description</h2>

      {/* Banner Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Banner Image</label>
        {form.bannerUrl ? (
          <div className="relative">
            <img src={form.bannerUrl} alt="Banner Preview" className="w-full h-48 object-cover rounded-md border" />
            <div className="absolute inset-0 flex justify-end p-2 space-x-2">
              <button
                onClick={() => bannerInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove('bannerUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => bannerInputRef.current?.click()}
            className="w-full border-dashed border-2 border-gray-300 rounded-lg py-6 text-center text-gray-500 hover:border-gray-400"
          >
            Upload Banner
          </button>
        )}
        <input
          ref={bannerInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload('bannerUrl', e.target.files[0])}
        />
      </div>

      {/* Logo Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Logo Image</label>
        {form.logoUrl ? (
          <div className="relative inline-block">
            <img src={form.logoUrl} alt="Logo Preview" className="w-24 h-24 object-contain rounded-md border" />
            <div className="absolute top-0 right-0 flex space-x-1">
              <button
                onClick={() => logoInputRef.current?.click()}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => handleRemove('logoUrl')}
                className="bg-white bg-opacity-75 rounded-full p-1 hover:bg-opacity-100 focus:outline-none text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => logoInputRef.current?.click()}
            className="border-dashed border-2 border-gray-300 rounded-lg p-4 text-center text-gray-500 hover:border-gray-400"
          >
            Upload Logo
          </button>
        )}
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => e.target.files?.[0] && handleUpload('logoUrl', e.target.files[0])}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
          <span title="A brief description of your store or app" className="ml-1 cursor-help">?</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={form.description || ''}
          onChange={handleChange}
          placeholder="Write a short description or tagline..."
          className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>
    </div>
  );
};


interface GeoLocation {
  lat: number;
  lng: number;
}

interface ContactLocationAccordionProps {
  form: {
    contactEmail: string;
    geoLocation: GeoLocation;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocationChange: (coord: Partial<GeoLocation>) => void;
}

// Draggable marker component
const DraggableMarker: React.FC<{
  position: [number, number];
  onChange: (lat: number, lng: number) => void;
}> = ({ position, onChange }) => {
  const markerRef = React.useRef<any>(null);

  // useMapEvents({
  //   dragend: () => {
  //     const marker = markerRef.current;
  //     if (marker) {
  //       const { lat, lng } = marker.getLatLng();
  //       onChange(lat, lng);
  //     }
  //   },
  // });



  return (
    <Marker
      // draggable
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (marker) {
            const { lat, lng } = marker.getLatLng();
            onChange(lat, lng);
          }
        },
      }}
      position={position}
      ref={markerRef}
    />
  );
};

export const ContactLocationAccordion: React.FC<ContactLocationAccordionProps> = ({
  form,
  handleChange,
  handleLocationChange,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);
  const [zoom, setZoom] = useState(6);
  const [address, setAddress] = useState("");
  const [radius, setRadius] = useState(500);
  const [dragging, setDragging] = useState(false);
  const [savedAddress, setSavedAddress] = useState(null);

  const position: [number, number] = [
    form.geoLocation.lat,
    form.geoLocation.lng,
  ];

  const MapUpdater = dynamic(
        () => import("react-leaflet").then((m) => ({
          default: function ({ onMapClick }) {
            const { useMap } = m;
            if (!useMap) return null;
            const map = useMap();
            useEffect(() => {
              map.setView(mapCenter, zoom);
            }, [mapCenter, zoom, map]);
            return null;
          },
        })),
        { ssr: false }
  );
    
  // Handle map drag movement
  // Dynamically import useMapEvents to ensure it only runs on the client
  const MapDragHandler = dynamic(() =>
    import("react-leaflet").then((m) => ({
      default: function ({ setMapCenter, setSelectedLocation, debouncedFetchAddress, setDragging }) {
        const { useMapEvents } = m;
        if (!useMapEvents) return null;
  
        useMapEvents({
          move: (e) => {
            setDragging(true);
            const center = e.target.getCenter();
            setMapCenter({ lat: center.lat, lng: center.lng });
          },
          moveend: (e) => {
            setDragging(false);
            const center = e.target.getCenter();
            setSelectedLocation({ lat: center.lat, lng: center.lng });
            debouncedFetchAddress(center.lat, center.lng);
          },
        });
  
        return null;
      },
    })),
    { ssr: false }
  );
  
  // Handle marker drag event
  const handleMarkerDragEnd = (event) => {
      const position = event.target.getLatLng();
      setSelectedLocation(position);
      setMapCenter(position);
      // debouncedFetchAddress(position.lat, position.lng);
  };

  const handleMapClick = (e) => {
      const { lat, lng } = e.latlng;
      setSelectedLocation({ lat, lng });
      setMapCenter({ lat, lng });
      // fetchAddress(lat, lng);
  };

  // Fetch address based on coordinates
  const fetchAddress = async (lat, lng) => {
        try {
          setLoading(true);
          const { data } = await axios.get(`${API_BASE}/reverse`, {
            params: { format: "json", lat, lon: lng },
          });
          setAddress(data.display_name || "Unknown Location");
          setSearchTerm(data.display_name || ""); // Update search input dynamically
          onAddressSelect({display_name : data.display_name,
                            lat:lat,
                            lng:lng}); // Pass address to parent
        } catch (error) {
          console.error("Error fetching address:", error);
        } finally {
          setLoading(false);
        }
  };

  // Debounced address fetching
  const debouncedFetchAddress = useMemo(() => debounce(fetchAddress, 500), []);
  useEffect(() => () => debouncedFetchAddress.cancel(), [debouncedFetchAddress]);

  const days = ['mon','tue','wed','thu','fri','sat','sun'];

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer p-4 rounded-lg bg-gray-100 hover:bg-gray-200 transition">
          <div className="flex items-center space-x-2">
            <MapPinIcon className="h-6 w-6 text-blue-500" />
            <span className="text-lg font-semibold text-gray-800">
              Contact & Location
            </span>
          </div>
          <ChevronDownIcon className="h-6 w-6 text-gray-500 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-4 space-y-6">
          {/* Contact Email */}
          <div>
            <label>Opening Hours</label>
            {days.map(d => (
              <input key={d} name={`openingHours.${d}`} placeholder={d} value={(form.openingHours ?? {})[d]} onChange={e => setForm(f => ({
        ...f, openingHours: { ...f.openingHours, [d]: e.target.value }
      }))} />))}</div>
          <div className="space-y-1">
            <label
              htmlFor="contactEmail"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <InboxIcon className="h-5 w-5 mr-2 text-gray-600" />
              Contact Email
              <span
                className="ml-1 text-gray-400 cursor-help"
                title="Primary contact email for inquiries"
              >
                ?
              </span>
            </label>
            <input
              id="contactEmail"
              name="contactEmail"
              type="email"
              value={form.contactEmail}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Geo Coordinates */}
          <div className="space-y-1">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <MapPinIcon className="h-5 w-5 mr-2 text-gray-600" />
              Coordinates
              <span
                className="ml-1 text-gray-400 cursor-help"
                title="Drag the pin on the map or enter lat/lng manually"
              >
                ?
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="number"
                step="any"
                name="lat"
                value={form.geoLocation.lat}
                onChange={(e) =>
                  handleLocationChange({ lat: parseFloat(e.target.value) })
                }
                placeholder="Latitude"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                step="any"
                name="lng"
                value={form.geoLocation.lng}
                onChange={(e) =>
                  handleLocationChange({ lng: parseFloat(e.target.value) })
                }
                placeholder="Longitude"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="h-48 mt-4 rounded-lg overflow-hidden">
              <MapContainer center={[mapCenter.lat, mapCenter.lng]} zoom={zoom} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <MapUpdater onMapClick={handleMapClick}/>
                        <MapDragHandler 
                          setMapCenter={setMapCenter} 
                          setSelectedLocation={setSelectedLocation} 
                          debouncedFetchAddress={debouncedFetchAddress} 
                          setDragging={setDragging} 
                        />
                        {selectedLocation && (
                          <>
                            <Marker position={[selectedLocation.lat, selectedLocation.lng]} draggable eventHandlers={{ dragend: handleMarkerDragEnd }}>
                              <Popup>{address}</Popup>
                            </Marker>
                            {selectedLocation && (
                                <div
                                  className="absolute z-[1000] pointer-events-none"
                                  style={{
                                    top: "50%",
                                    left: "50%",
                                    transform: `translate(-50%, -100%)`, // Adjust position
                                  }}
                                >
                                  {<MapPinIcon className="w-8 h-8 text-red-500 animate-bounce" />}
                                </div>
                              )} 
                            <Circle center={[selectedLocation.lat, selectedLocation.lng]} radius={radius} fillOpacity={0.1} />
                          </>
                        )}
                      </MapContainer>
            </div>
          </div>
        </div>
      </details>
    </div>
  );
};

interface SocialLink {
  channel: string;
  url: string;
}

interface SocialLinksAccordionProps {
  form: {
    socialLinks?: SocialLink[];
  };
  handleArrayChange: (field: 'socialLinks', index: number, key: keyof SocialLink, value: string) => void;
  addArrayItem: (field: 'socialLinks', item: SocialLink) => void;
  removeArrayItem: (field: 'socialLinks', index: number) => void;
}

const SocialLinksAccordion: React.FC<SocialLinksAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const links = form.socialLinks || [];
  const isValid = links.every(link => link.channel && link.url);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('socialLinks', { channel: '', url: '' })}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Social Links</span>
        <span className="text-xl">{links.length > 0 ? '✅' : '+'}</span>
      </button>
      {links.length > 0 && (
        <div className="p-6 space-y-4">
          {links.map((s, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-6 gap-4 items-center">
              <input
                placeholder="Channel (e.g. Twitter)"
                value={s.channel}
                onChange={e => handleArrayChange('socialLinks', i, 'channel', e.target.value)}
                className="sm:col-span-2 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <input
                placeholder="URL"
                value={s.url}
                onChange={e => handleArrayChange('socialLinks', i, 'url', e.target.value)}
                className="sm:col-span-3 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('socialLinks', i)}
                className="sm:col-span-1 text-red-500 font-bold text-xl focus:outline-none"
                title="Remove link"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('socialLinks', { channel: '', url: '' })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Link
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add links to your social media profiles. You can add multiple links.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>Twitter</code>, <code>Facebook</code>, <code>Instagram</code>
          </p>
        </div>
      )}
    </div>
  );
};

interface Policy {
  type: string;
  content: string;
}

interface PoliciesAccordionProps {
  form: {
    policies?: Policy[];
  };
  handleArrayChange: (field: 'policies', index: number, key: keyof Policy, value: string) => void;
  addArrayItem: (field: 'policies', item: Policy) => void;
  removeArrayItem: (field: 'policies', index: number) => void;
}

const PoliciesAccordion: React.FC<PoliciesAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const policies = form.policies || [];
  const isValid = policies.every(p => p.type && p.content);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('policies', { type: '', content: '' })}
        disabled={!isValid}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Policies</span>
        <span className="text-xl">{policies.length > 0 ? '✅' : '+'}</span>
      </button>

      {policies.length > 0 && (
        <div className="p-6 space-y-6">
          {policies.map((p, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Type (e.g. Refunds)"
                value={p.type}
                onChange={e => handleArrayChange('policies', i, 'type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Content"
                value={p.content}
                onChange={e => handleArrayChange('policies', i, 'content', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('policies', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove Policy"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('policies', { type: '', content: '' })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Policy
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add your store policies. You can add multiple policies.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>Refund Policy</code>, <code>Shipping Policy</code>, <code>Privacy Policy</code>
          </p>

        </div>
      )}
    </div>
  );
};

interface FAQ {
  question: string;
  answer: string;
  order?: number;
}

interface FAQsAccordionProps {
  form: {
    faqs?: FAQ[];
  };
  handleArrayChange: (field: 'faqs', index: number, key: keyof FAQ, value: string) => void;
  addArrayItem: (field: 'faqs', item: FAQ) => void;
  removeArrayItem: (field: 'faqs', index: number) => void;
}

const FAQsAccordion: React.FC<FAQsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const faqs = form.faqs || [];
  const allFilled = faqs.every(f => f.question && f.answer);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('faqs', { question: '', answer: '', order: faqs.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>FAQs</span>
        <span className="text-xl">{faqs.length > 0 ? '✅' : '+'}</span>
      </button>

      {faqs.length > 0 && (
        <div className="p-6 space-y-6">
          {faqs.map((f, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Question"
                value={f.question}
                onChange={e => handleArrayChange('faqs', i, 'question', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Answer"
                value={f.answer}
                onChange={e => handleArrayChange('faqs', i, 'answer', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('faqs', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove FAQ"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('faqs', { question: '', answer: '', order: faqs.length })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another FAQ
          </button>
        </div>
      )}
    </div>
  );
};

interface Testimonial {
  author: string;
  quote: string;
  avatarUrl?: string;
  rating?: number;
  order?: number;
}

interface TestimonialsAccordionProps {
  form: {
    testimonials?: Testimonial[];
  };
  handleArrayChange: (field: 'testimonials', index: number, key: keyof Testimonial, value: string | number) => void;
  addArrayItem: (field: 'testimonials', item: Testimonial) => void;
  removeArrayItem: (field: 'testimonials', index: number) => void;
}

const TestimonialsAccordion: React.FC<TestimonialsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const testimonials = form.testimonials || [];
  const allFilled = testimonials.every(t => t.author && t.quote);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: testimonials.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Testimonials</span>
        <span className="text-xl">{testimonials.length > 0 ? '✅' : '+'}</span>
      </button>

      {testimonials.length > 0 && (
        <div className="p-6 space-y-6">
          {testimonials.map((t, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Author"
                value={t.author}
                onChange={e => handleArrayChange('testimonials', i, 'author', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Quote"
                value={t.quote}
                onChange={e => handleArrayChange('testimonials', i, 'quote', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('testimonials', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove Testimonial"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: testimonials.length })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Testimonial
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add testimonials from your customers. You can add multiple testimonials.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>"Great service!"</code>, <code>"Loved the product!"</code>
          </p>
        

        </div>
      )}
    </div>
  );
};

interface HeroSlide {
  imageUrl: string;
  headline: string;
  subline?: string;
  ctaText?: string;
  ctaLink?: string;
  order?: number;
}

interface HeroSlidesAccordionProps {
  form: { heroSlides?: HeroSlide[] };
  handleArrayChange: (
    field: "heroSlides",
    index: number,
    key: keyof HeroSlide,
    value: string
  ) => void;
  addArrayItem: (field: "heroSlides", item: HeroSlide) => void;
  removeArrayItem: (field: "heroSlides", index: number) => void;
  handleImageUpload?: (
    field: "heroSlides",
    index: number,
    file: File
  ) => void;
}

export const HeroSlidesAccordion: React.FC<HeroSlidesAccordionProps> = ({
  form,
  handleArrayChange,
  addArrayItem,
  removeArrayItem,
  handleImageUpload,
}) => {
  const slides = form.heroSlides || [];
  const allFilled = slides.every((s) => s.imageUrl && s.headline);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer px-6 py-4 bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition">
          <span>Hero Slides</span>
          {slides.length > 0 ? <CheckIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
        </summary>

        <div className="p-6 space-y-6">
          {slides.map((s, i) => (
            <div key={i} className="space-y-4 border-b pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">Slide {i + 1}</h3>
                <button
                  type="button"
                  onClick={() => removeArrayItem("heroSlides", i)}
                  className="text-red-500 hover:text-red-700 focus:outline-none"
                  aria-label="Delete slide"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Image Upload & Preview */}
              <div className="flex flex-col sm:flex-row gap-4">
                <label className="flex flex-col items-center justify-center w-full sm:w-1/3 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 transition">
                  {s.imageUrl ? (
                    <img
                      src={s.imageUrl}
                      alt={`Slide ${i + 1}`}
                      className="object-cover h-full w-full rounded-md"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-400">
                      <PhotoIcon className="h-8 w-8 mb-2" />
                      <span>Upload Image</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (handleImageUpload) {
                          handleImageUpload("heroSlides", i, file);
                        } else {
                          const url = URL.createObjectURL(file);
                          handleArrayChange("heroSlides", i, "imageUrl", url);
                        }
                      }
                    }}
                  />
                </label>

                {/* Text Fields */}
                <div className="flex-1 space-y-3">
                  <input
                    placeholder="Headline"
                    value={s.headline}
                    onChange={(e) =>
                      handleArrayChange(
                        "heroSlides",
                        i,
                        "headline",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                  <input
                    placeholder="Subline (optional)"
                    value={s.subline || ""}
                    onChange={(e) =>
                      handleArrayChange(
                        "heroSlides",
                        i,
                        "subline",
                        e.target.value
                      )
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      placeholder="CTA Text (optional)"
                      value={s.ctaText || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "heroSlides",
                          i,
                          "ctaText",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      placeholder="CTA Link (optional)"
                      value={s.ctaLink || ""}
                      onChange={(e) =>
                        handleArrayChange(
                          "heroSlides",
                          i,
                          "ctaLink",
                          e.target.value
                        )
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Slide Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={() =>
                addArrayItem("heroSlides", {
                  imageUrl: "",
                  headline: "",
                  subline: "",
                  ctaText: "",
                  ctaLink: "",
                  order: slides.length,
                })
              }
              disabled={!allFilled}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Slide</span>
            </button>
          </div>
        </div>
      </details>
    </div>
  );
};


interface Promotion {
  title: string;
  details: string;
  order?: number;
}

interface PromotionsAccordionProps {
  form: {
    promotions?: Promotion[];
  };
  handleArrayChange: (field: 'promotions', index: number, key: keyof Promotion, value: string) => void;
  addArrayItem: (field: 'promotions', item: Promotion) => void;
  removeArrayItem: (field: 'promotions', index: number) => void;
}

const PromotionsAccordion: React.FC<PromotionsAccordionProps> = ({ form, handleArrayChange, addArrayItem, removeArrayItem }) => {
  const promotions = form.promotions || [];
  const allFilled = promotions.every(p => p.title && p.details);

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <button
        type="button"
        onClick={() => addArrayItem('promotions', { title: '', details: '', order: promotions.length })}
        disabled={!allFilled}
        className="w-full text-left px-6 py-4 bg-indigo-600 text-white font-medium flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        <span>Promotions</span>
        <span className="text-xl">{promotions.length > 0 ? '✅' : '+'}</span>
      </button>

      {promotions.length > 0 && (
        <div className="p-6 space-y-6">
          {promotions.map((p, i) => (
            <div key={i} className="space-y-3">
              <input
                placeholder="Title"
                value={p.title}
                onChange={e => handleArrayChange('promotions', i, 'title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <textarea
                placeholder="Details"
                value={p.details}
                onChange={e => handleArrayChange('promotions', i, 'details', e.target.value)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              />
              <button
                type="button"
                onClick={() => removeArrayItem('promotions', i)}
                className="text-red-500 font-medium focus:outline-none"
                title="Remove Promotion"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem('promotions', { title: '', details: '', order: promotions.length })}
            className="mt-4 w-full text-center text-indigo-600 font-medium hover:underline focus:outline-none"
          >
            Add Another Promotion
          </button>
          <p className="text-sm text-gray-500 mt-2">
            Add promotional messages or announcements. You can add multiple promotions.
          </p>
          <p className="text-sm text-gray-500">
            Example: <code>Free Shipping on Orders Over $50</code>, <code>20% Off Your First Order</code>
          </p>
        </div>
      )}
    </div>
  );
};

interface ThemeSettings {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

interface ThemeSettingsAccordionProps {
  form: {
    themeSettings?: ThemeSettings;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const ThemeSettingsAccordion: React.FC<ThemeSettingsAccordionProps> = ({ form, setForm }) => {
  const [open, setOpen] = useState(true);
  const { primaryColor = '#4f46e5', secondaryColor = '#facc15', fontFamily = 'Inter, sans-serif' } = form.themeSettings || {};

  const updateTheme = (key: keyof ThemeSettings, value: string) => {
    setForm((f: any) => ({
      ...f,
      themeSettings: { ...f.themeSettings, [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(prev => !prev)}
      >
        <h2 className="flex items-center text-2xl font-bold text-gray-800">
          <PaintBrushIcon className="h-6 w-6 mr-2 text-indigo-600" />
          Theme Settings
        </h2>
        {open ? (
          <ChevronUpIcon className="h-6 w-6 text-gray-500" />
        ) : (
          <ChevronDownIcon className="h-6 w-6 text-gray-500" />
        )}
      </div>

      {open && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="primaryColor" className="block text-xs font-medium text-gray-600">
              Primary Color
            </label>
            <input
              id="primaryColor"
              type="color"
              value={primaryColor}
              onChange={e => updateTheme('primaryColor', e.target.value)}
              className="mt-1 w-full h-10 p-0 border-0 focus:outline-none" 
            />
          </div>
          <div>
            <label htmlFor="secondaryColor" className="block text-xs font-medium text-gray-600">
              Secondary Color
            </label>
            <input
              id="secondaryColor"
              type="color"
              value={secondaryColor}
              onChange={e => updateTheme('secondaryColor', e.target.value)}
              className="mt-1 w-full h-10 p-0 border-0 focus:outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fontFamily" className="block text-xs font-medium text-gray-600">
              Font Family
            </label>
            <input
              id="fontFamily"
              type="text"
              value={fontFamily}
              onChange={e => updateTheme('fontFamily', e.target.value)}
              placeholder="Inter, sans-serif"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Live Preview */}
      <div
        className="mt-6 p-6 rounded-lg border border-gray-200 transition-shadow hover:shadow-md"
        style={{
          backgroundColor: secondaryColor,
          fontFamily: fontFamily
        }}
      >
        <h3 className="text-xl font-bold" style={{ color: primaryColor }}>
          Sample Heading
        </h3>
        <p className="mt-2 text-sm text-gray-700">
          This is a live preview of your current theme selection.
        </p>
        <button
          className="mt-4 px-4 py-2 rounded-lg font-medium transition-transform transform hover:scale-105"
          style={{ backgroundColor: primaryColor, color: '#ffffff' }}
        >
          Preview Button
        </button>
      </div>
    </div>
  );
};

interface SEOSettings {
  title?: string;
  description?: string;
  keywords?: string[];
}

interface SeoSettingsAccordionProps {
  form: {
    seo?: SEOSettings;
    analyticsConfig?: AnalyticsConfig;
    paymentSettings?: PaymentSettings;
    shippingSettings?: ShippingSettings;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const SeoSettingsAccordion: React.FC<SeoSettingsAccordionProps> = ({ form, setForm }) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>SEO & Config</span>
        <span className="text-xl">🔧</span>
      </h2>

      {/* SEO Settings */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">SEO Settings</h3>
        <div className="space-y-4">
          <div>
            <label htmlFor="seoTitle" className="block text-xs font-medium text-gray-600">Page Title</label>
            <input
              id="seoTitle"
              type="text"
              value={form.seo?.title || ''}
              onChange={e => updateSection('seo', 'title', e.target.value)}
              placeholder="My Awesome Store"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-xs font-medium text-gray-600">Meta Description</label>
            <textarea
              id="metaDescription"
              rows={2}
              value={form.seo?.description || ''}
              onChange={e => updateSection('seo', 'description', e.target.value)}
              placeholder="Best deals on fashion, electronics, and more."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
          <div>
            <label htmlFor="keywords" className="block text-xs font-medium text-gray-600">Keywords (comma-separated)</label>
            <input
              id="keywords"
              type="text"
              value={form.seo?.keywords?.join(', ') || ''}
              onChange={e => updateSection('seo', 'keywords', e.target.value.split(',').map(k => k.trim()))}
              placeholder="ecommerce, fashion, electronics"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
    </div>
  );
};


interface AnalyticsConfig {
  googleTag?: string;
  facebookTag?: string;
}

interface SettingsAccordionProps {
  form: {
    analyticsConfig?: AnalyticsConfig;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const SettingsAccordion: React.FC<SettingsAccordionProps> = ({ form, setForm }) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>System Settings</span>
        <span className="text-xl">⚙️</span>
      </h2>

      {/* Analytics Config */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Analytics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="googleTag" className="block text-xs font-medium text-gray-600">Google Tag ID</label>
            <input
              id="googleTag"
              type="text"
              value={form.analyticsConfig?.googleTag || ''}
              onChange={e => updateSection('analyticsConfig', 'googleTag', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="facebookTag" className="block text-xs font-medium text-gray-600">Facebook Pixel ID</label>
            <input
              id="facebookTag"
              type="text"
              value={form.analyticsConfig?.facebookTag || ''}
              onChange={e => updateSection('analyticsConfig', 'facebookTag', e.target.value)}
              placeholder="1234567890"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>
      
    </div>
  );
};

interface PaymentSettings {
  mpesaShortcode?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaCallbackUrl?: string;
}

interface PaymentAccordionProps {
  form: {
    paymentSettings?: PaymentSettings;
    shippingSettings?: ShippingSettings;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

const PaymentAccordion: React.FC<PaymentAccordionProps> = ({ form, setForm }) => {
  const updateSection = <K extends string>(section: string, key: K, value: any) => {
    setForm((f: any) => ({
      ...f,
      [section]: { ...f[section], [key]: value }
    }));
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>Payments</span>
        <span className="text-xl">💳</span>
      </h2>

      {/* Payment Settings */}
      <section className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">M‑Pesa (Daraja API)</h3>
        <fieldset className="border border-gray-200 rounded-lg p-4 space-y-4">
          <legend className="text-sm font-medium text-gray-600 px-2">Credentials</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="mpesaShortcode" className="block text-xs font-medium text-gray-600">Business Shortcode</label>
              <input
                id="mpesaShortcode"
                type="text"
                value={form.paymentSettings?.mpesaShortcode || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaShortcode', e.target.value)}
                placeholder="123456"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="mpesaConsumerKey" className="block text-xs font-medium text-gray-600">Consumer Key</label>
              <input
                id="mpesaConsumerKey"
                type="text"
                value={form.paymentSettings?.mpesaConsumerKey || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaConsumerKey', e.target.value)}
                placeholder="Daraja Key"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mpesaConsumerSecret" className="block text-xs font-medium text-gray-600">Consumer Secret</label>
              <input
                id="mpesaConsumerSecret"
                type="text"
                value={form.paymentSettings?.mpesaConsumerSecret || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaConsumerSecret', e.target.value)}
                placeholder="Daraja Secret"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="mpesaCallbackUrl" className="block text-xs font-medium text-gray-600">Callback URL</label>
              <input
                id="mpesaCallbackUrl"
                type="url"
                value={form.paymentSettings?.mpesaCallbackUrl || ''}
                onChange={e => updateSection('paymentSettings', 'mpesaCallbackUrl', e.target.value)}
                placeholder="https://yourdomain.com/callback"
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </fieldset>
      </section>

    </div>
  );
};

interface ShippingSettings {
  carrierName?: string;
  trackingUrl?: string;
  regions?: string[];
  enablePickup?: boolean;
  pickupInstructions?: string;
}

interface ShippingAccordionProps {
  form: {
    shippingSettings?: ShippingSettings;
  };
  setForm: React.Dispatch<React.SetStateAction<any>>;
}

export const ShippingAccordion: React.FC<ShippingAccordionProps> = ({ form, setForm }) => {
  const updateField = <K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) => {
    setForm((f: any) => ({
      ...f,
      shippingSettings: { ...f.shippingSettings, [key]: value }
    }));
  };

  const regionsValue = form.shippingSettings?.regions?.join(', ') || '';

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="flex justify-between items-center text-2xl font-bold text-gray-800 mb-4">
        <span>Shipping Settings</span>
        <span className="text-xl">🚚</span>
      </h2>
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label htmlFor="carrierName" className="block text-xs font-medium text-gray-600">Carrier Name</label>
            <input
              id="carrierName"
              type="text"
              value={form.shippingSettings?.carrierName || ''}
              onChange={e => updateField('carrierName', e.target.value)}
              placeholder="DHL, FedEx, etc."
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="trackingUrl" className="block text-xs font-medium text-gray-600">Tracking URL Template</label>
            <input
              id="trackingUrl"
              type="text"
              value={form.shippingSettings?.trackingUrl || ''}
              onChange={e => updateField('trackingUrl', e.target.value)}
              placeholder="https://tracking.example.com/track?code={tracking_number}"
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Shipping Regions */}
        <div>
          <label htmlFor="regions" className="block text-xs font-medium text-gray-600">Shipping Regions</label>
          <input
            id="regions"
            type="text"
            value={regionsValue}
            onChange={e => updateField('regions', e.target.value.split(',').map(r => r.trim()))}
            placeholder="e.g. US, EU, Asia"
            className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">Comma-separated list of regions you ship to.</p>
        </div>

        {/* Pickup Options */}
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="enablePickup"
              type="checkbox"
              checked={form.shippingSettings?.enablePickup || false}
              onChange={e => updateField('enablePickup', e.target.checked)}
              className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
            />
            <label htmlFor="enablePickup" className="ml-2 block text-sm font-medium text-gray-700">Enable Local Pickup</label>
          </div>
          {form.shippingSettings?.enablePickup && (
            <div>
              <label htmlFor="pickupInstructions" className="block text-xs font-medium text-gray-600">Pickup Instructions</label>
              <textarea
                id="pickupInstructions"
                rows={3}
                value={form.shippingSettings?.pickupInstructions || ''}
                onChange={e => updateField('pickupInstructions', e.target.value)}
                placeholder="Provide details for customers picking up orders locally..."
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const initialFormState = {
  name: '',
  description: '',
  categories: [],
  logoUrl: '',
  bannerUrl: '',
  socialLinks: [],
  policies: [],
  faqs: [],
  testimonials: [],
  heroSlides: [],
  promotions: [],
  themeSettings: {
    primaryColor: '#4f46e5',
    secondaryColor: '#facc15',
    fontFamily: 'Inter, sans-serif'
  },
  seo: {
    title: '',
    description: '',
    keywords: []
  },
  analyticsConfig: {
    googleTag: '',
    facebookTag: ''
  },
  paymentSettings: {
    mpesaShortcode: '',
    mpesaConsumerKey: '',
    mpesaConsumerSecret: '',
    mpesaCallbackUrl: ''
  },
  shippingSettings: {
    carrierName: '',
    trackingUrl: ''
  },
};















// const ThemeSettingsAccordion = ({ form, setForm }:any) => (
//             <details  className="border rounded">
//               <summary className="px-4 py-2 flex justify-between cursor-pointer">
//                 <span>Advanced Settings</span>
//                 <span>⚙️</span>
//               </summary>
//               <div className="p-4 space-y-6">
//                 {/* Theme Settings */}
//                 <div className="space-y-2">
//                   <h3 className="text-sm font-semibold">Theme Settings</h3>
//                   <div className="grid grid-cols-2 gap-4">
//                     <div>
//                       <label className="block text-xs">Primary Color</label>
//                       <input
//                         type="text"
//                         value={form.themeSettings?.primaryColor || ''}
//                         onChange={e =>
//                           setForm(f => ({
//                             ...f,
//                             themeSettings: { ...f.themeSettings, primaryColor: e.target.value }
//                           }))
//                         }
//                         placeholder="#4f46e5"
//                         className="w-full border rounded px-2 py-1 text-sm"
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs">Secondary Color</label>
//                       <input
//                         type="text"
//                         value={form.themeSettings?.secondaryColor || ''}
//                         onChange={e =>
//                           setForm(f => ({
//                             ...f,
//                             themeSettings: { ...f.themeSettings, secondaryColor: e.target.value }
//                           }))
//                         }
//                         placeholder="#facc15"
//                         className="w-full border rounded px-2 py-1 text-sm"
//                       />
//                     </div>
//                     <div className="col-span-2">
//                       <label className="block text-xs">Font Family</label>
//                       <input
//                         type="text"
//                         value={form.themeSettings?.fontFamily || ''}
//                         onChange={e =>
//                           setForm(f => ({
//                             ...f,
//                             themeSettings: { ...f.themeSettings, fontFamily: e.target.value }
//                           }))
//                         }
//                         placeholder="Inter, sans-serif"
//                         className="w-full border rounded px-2 py-1 text-sm"
//                       />
//                     </div>
//                   </div>
//                 </div>
//                 </div>
//             </details>
// );



// {/* SEO Settings */}
// <div className="space-y-2">
//   <h3 className="text-sm font-semibold">SEO Settings</h3>
//   <div className="space-y-2">
//     <div>
//       <label className="block text-xs">Page Title</label>
//       <input
//         type="text"
//         value={form.seo?.title || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             seo: { ...f.seo, title: e.target.value }
//           }))
//         }
//         placeholder="My Awesome Store"
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//     <div>
//       <label className="block text-xs">Meta Description</label>
//       <textarea
//         rows={2}
//         value={form.seo?.description || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             seo: { ...f.seo, description: e.target.value }
//           }))
//         }
//         placeholder="Best deals on fashion, electronics, and more."
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//     <div>
//       <label className="block text-xs">Keywords (comma-separated)</label>
//       <input
//         type="text"
//         value={form.seo?.keywords?.join(', ') || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             seo: { ...f.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
//           }))
//         }
//         placeholder="ecommerce, fashion, electronics"
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//   </div>
// </div>

// {/* Analytics Config */}
// <div className="space-y-2">
//   <h3 className="text-sm font-semibold">Analytics</h3>
//   <div className="space-y-2">
//     <div>
//       <label className="block text-xs">Google Tag ID</label>
//       <input
//         type="text"
//         value={form.analyticsConfig?.googleTag || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             analyticsConfig: { ...f.analyticsConfig, googleTag: e.target.value }
//           }))
//         }
//         placeholder="G-XXXXXXXXXX"
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//     <div>
//       <label className="block text-xs">Facebook Pixel ID</label>
//       <input
//         type="text"
//         value={form.analyticsConfig?.facebookTag || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             analyticsConfig: { ...f.analyticsConfig, facebookTag: e.target.value }
//           }))
//         }
//         placeholder="1234567890"
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//   </div>
// </div>

// {/* Payment Settings */}
// <div className="space-y-2">
//       <h3 className="text-sm font-semibold">Payment Settings</h3>
//       <div className="space-y-4">
//         {/* M-Pesa */}
//         <fieldset className="border rounded p-3">
//           <legend className="text-xs font-medium">M-Pesa (Daraja API)</legend>
//           <div className="space-y-2">
//             <div>
//               <label className="block text-xs">Business Shortcode</label>
//               <input
//                 type="text"
//                 value={form.paymentSettings?.mpesaShortcode || ''}
//                 onChange={e =>
//                   setForm(f => ({
//                     ...f,
//                     paymentSettings: { ...f.paymentSettings, mpesaShortcode: e.target.value }
//                   }))
//                 }
//                 placeholder="e.g. 123456"
//                 className="w-full border rounded px-2 py-1 text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs">API Consumer Key</label>
//               <input
//                 type="text"
//                 value={form.paymentSettings?.mpesaConsumerKey || ''}
//                 onChange={e =>
//                   setForm(f => ({
//                     ...f,
//                     paymentSettings: { ...f.paymentSettings, mpesaConsumerKey: e.target.value }
//                   }))
//                 }
//                 placeholder="Your Daraja Consumer Key"
//                 className="w-full border rounded px-2 py-1 text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs">API Consumer Secret</label>
//               <input
//                 type="text"
//                 value={form.paymentSettings?.mpesaConsumerSecret || ''}
//                 onChange={e =>
//                   setForm(f => ({
//                     ...f,
//                     paymentSettings: { ...f.paymentSettings, mpesaConsumerSecret: e.target.value }
//                   }))
//                 }
//                 placeholder="Your Daraja Consumer Secret"
//                 className="w-full border rounded px-2 py-1 text-sm"
//               />
//             </div>
//             <div>
//               <label className="block text-xs">Callback URL</label>
//               <input
//                 type="url"
//                 value={form.paymentSettings?.mpesaCallbackUrl || ''}
//                 onChange={e =>
//                   setForm(f => ({
//                     ...f,
//                     paymentSettings: { ...f.paymentSettings, mpesaCallbackUrl: e.target.value }
//                   }))
//                 }
//                 placeholder="https://yourdomain.com/api/mpesa/callback"
//                 className="w-full border rounded px-2 py-1 text-sm"
//               />
//             </div>
//           </div>
//         </fieldset>


//       </div>
//     </div>

// {/* Shipping Settings */}
// <div className="space-y-2">
//   <h3 className="text-sm font-semibold">Shipping Settings</h3>
//   <div className="space-y-2">
//     <div>
//       <label className="block text-xs">Carrier Name</label>
//       <input
//         type="text"
//         value={form.shippingSettings?.carrierName || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             shippingSettings: { ...f.shippingSettings, carrierName: e.target.value }
//           }))
//         }
//         placeholder="DHL, FedEx, etc."
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//     <div>
//       <label className="block text-xs">Tracking URL Template</label>
//       <input
//         type="text"
//         value={form.shippingSettings?.trackingUrl || ''}
//         onChange={e =>
//           setForm(f => ({
//             ...f,
//             shippingSettings: { ...f.shippingSettings, trackingUrl: e.target.value }
//           }))
//         }
//         placeholder="https://tracking.example.com/track?code={tracking_number}"
//         className="w-full border rounded px-2 py-1 text-sm"
//       />
//     </div>
//   </div>
// </div>



































{/* 5. Advanced Settings */}
      // case 5:
      //   return (
      //     <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
      //       <h2 className="text-lg font-semibold">Advanced Settings</h2>

      //       {/* Social Links Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>Social Links</span>
      //           <span>{(form.socialLinks?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.socialLinks || []).map((s, i) => (
      //             <div key={i} className="flex space-x-2 items-center">
      //               <input
      //                 placeholder="Channel (e.g. Twitter)"
      //                 value={s.channel}
      //                 onChange={e => handleArrayChange<SocialLinkOption>('socialLinks', i, 'channel', e.target.value)}
      //                 className="flex-1 border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <input
      //                 placeholder="URL"
      //                 value={s.url}
      //                 onChange={e => handleArrayChange<SocialLinkOption>('socialLinks', i, 'url', e.target.value)}
      //                 className="flex-2 border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('socialLinks', i)} className="text-red-500">×</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.socialLinks || []).some(s => !s.channel || !s.url)}
      //             onClick={() => addArrayItem<SocialLinkOption>('socialLinks', { channel: '', url: '' })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add Social Link
      //           </button>
      //         </div>
      //       </details>

      //       {/* Policies Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>Policies</span>
      //           <span>{(form.policies?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.policies || []).map((p, i) => (
      //             <div key={i} className="space-y-1">
      //               <input
      //                 placeholder="Type (e.g. Refunds)"
      //                 value={p.type}
      //                 onChange={e => handleArrayChange<PolicyOption>('policies', i, 'type', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <textarea
      //                 placeholder="Content"
      //                 value={p.content}
      //                 onChange={e => handleArrayChange<PolicyOption>('policies', i, 'content', e.target.value)}
      //                 rows={2}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('policies', i)} className="text-red-500">Remove</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.policies || []).some(p => !p.type || !p.content)}
      //             onClick={() => addArrayItem<PolicyOption>('policies', { type: '', content: '' })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add Policy
      //           </button>
      //         </div>
      //       </details>

      //       {/* FAQs Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>FAQs</span>
      //           <span>{(form.faqs?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.faqs || []).map((f, i) => (
      //             <div key={i} className="space-y-1">
      //               <input
      //                 placeholder="Question"
      //                 value={f.question}
      //                 onChange={e => handleArrayChange<FAQOption>('faqs', i, 'question', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <textarea
      //                 placeholder="Answer"
      //                 value={f.answer}
      //                 onChange={e => handleArrayChange<FAQOption>('faqs', i, 'answer', e.target.value)}
      //                 rows={2}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('faqs', i)} className="text-red-500">Remove</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.faqs || []).some(f => !f.question || !f.answer)}
      //             onClick={() => addArrayItem<FAQOption>('faqs', { question: '', answer: '', order: (form.faqs || []).length })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add FAQ
      //           </button>
      //         </div>
      //       </details>

      //       {/* Testimonials Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>Testimonials</span>
      //           <span>{(form.testimonials?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.testimonials || []).map((t, i) => (
      //             <div key={i} className="space-y-1">
      //               <input
      //                 placeholder="Author"
      //                 value={t.author}
      //                 onChange={e => handleArrayChange<TestimonialOption>('testimonials', i, 'author', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <textarea
      //                 placeholder="Quote"
      //                 value={t.quote}
      //                 onChange={e => handleArrayChange<TestimonialOption>('testimonials', i, 'quote', e.target.value)}
      //                 rows={2}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('testimonials', i)} className="text-red-500">Remove</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.testimonials || []).some(t => !t.author || !t.quote)}
      //             onClick={() => addArrayItem<TestimonialOption>('testimonials', { author: '', quote: '', avatarUrl: '', rating: 0, order: (form.testimonials || []).length })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add Testimonial
      //           </button>
      //         </div>
      //       </details>

      //       {/* Hero Slides Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>Hero Slides</span>
      //           <span>{(form.heroSlides?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.heroSlides || []).map((h, i) => (
      //             <div key={i} className="space-y-1">
      //               <input
      //                 placeholder="Image URL"
      //                 value={h.imageUrl}
      //                 onChange={e => handleArrayChange<BannerOption>('heroSlides', i, 'imageUrl', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <input
      //                 placeholder="Headline"
      //                 value={h.headline}
      //                 onChange={e => handleArrayChange<BannerOption>('heroSlides', i, 'headline', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('heroSlides', i)} className="text-red-500">Remove</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.heroSlides || []).some(h => !h.imageUrl || !h.headline)}
      //             onClick={() => addArrayItem<BannerOption>('heroSlides', { imageUrl: '', headline: '', subline: '', ctaText: '', ctaLink: '', order: (form.heroSlides || []).length })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add Hero Slide
      //           </button>
      //         </div>
      //       </details>

      //       {/* Promotions Accordion */}
      //       <details className="border rounded">
      //         <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //           <span>Promotions</span>
      //           <span>{(form.promotions?.length || 0) > 0 ? '✅' : '+'}</span>
      //         </summary>
      //         <div className="p-4 space-y-2">
      //           {(form.promotions || []).map((p, i) => (
      //             <div key={i} className="space-y-1">
      //               <input
      //                 placeholder="Code"
      //                 value={p.code}
      //                 onChange={e => handleArrayChange<PromotionOption>('promotions', i, 'code', e.target.value)}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <textarea
      //                 placeholder="Description"
      //                 value={p.description}
      //                 onChange={e => handleArrayChange<PromotionOption>('promotions', i, 'description', e.target.value)}
      //                 rows={2}
      //                 className="w-full border rounded px-2 py-1 focus:ring-indigo-400"
      //               />
      //               <button onClick={() => removeArrayItem('promotions', i)} className="text-red-500">Remove</button>
      //             </div>
      //           ))}
      //           <button
      //             disabled={(form.promotions || []).some(p => !p.code || !p.description)}
      //             onClick={() => addArrayItem<PromotionOption>('promotions', { title:'', code: '', description: '', startsAt: '', endsAt: '', bannerUrl: '' })}
      //             className="mt-2 px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      //           >
      //             Add Promotion
      //           </button>
      //         </div>
      //       </details>

      //       {/* JSON Config Accordion */}
      //       <details className="border rounded">
      //             <summary className="px-4 py-2 flex justify-between cursor-pointer">
      //               <span>Advanced Settings</span>
      //               <span>⚙️</span>
      //             </summary>
      //             <div className="p-4 space-y-6">
      //               {/* Theme Settings */}
      //               <div className="space-y-2">
      //                 <h3 className="text-sm font-semibold">Theme Settings</h3>
      //                 <div className="grid grid-cols-2 gap-4">
      //                   <div>
      //                     <label className="block text-xs">Primary Color</label>
      //                     <input
      //                       type="text"
      //                       value={form.themeSettings?.primaryColor || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           themeSettings: { ...f.themeSettings, primaryColor: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="#4f46e5"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div>
      //                     <label className="block text-xs">Secondary Color</label>
      //                     <input
      //                       type="text"
      //                       value={form.themeSettings?.secondaryColor || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           themeSettings: { ...f.themeSettings, secondaryColor: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="#facc15"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div className="col-span-2">
      //                     <label className="block text-xs">Font Family</label>
      //                     <input
      //                       type="text"
      //                       value={form.themeSettings?.fontFamily || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           themeSettings: { ...f.themeSettings, fontFamily: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="Inter, sans-serif"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                 </div>
      //               </div>

      //               {/* SEO Settings */}
      //               <div className="space-y-2">
      //                 <h3 className="text-sm font-semibold">SEO Settings</h3>
      //                 <div className="space-y-2">
      //                   <div>
      //                     <label className="block text-xs">Page Title</label>
      //                     <input
      //                       type="text"
      //                       value={form.seo?.title || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           seo: { ...f.seo, title: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="My Awesome Store"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div>
      //                     <label className="block text-xs">Meta Description</label>
      //                     <textarea
      //                       rows={2}
      //                       value={form.seo?.description || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           seo: { ...f.seo, description: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="Best deals on fashion, electronics, and more."
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div>
      //                     <label className="block text-xs">Keywords (comma-separated)</label>
      //                     <input
      //                       type="text"
      //                       value={form.seo?.keywords?.join(', ') || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           seo: { ...f.seo, keywords: e.target.value.split(',').map(k => k.trim()) }
      //                         }))
      //                       }
      //                       placeholder="ecommerce, fashion, electronics"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                 </div>
      //               </div>

      //               {/* Analytics Config */}
      //               <div className="space-y-2">
      //                 <h3 className="text-sm font-semibold">Analytics</h3>
      //                 <div className="space-y-2">
      //                   <div>
      //                     <label className="block text-xs">Google Tag ID</label>
      //                     <input
      //                       type="text"
      //                       value={form.analyticsConfig?.googleTag || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           analyticsConfig: { ...f.analyticsConfig, googleTag: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="G-XXXXXXXXXX"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div>
      //                     <label className="block text-xs">Facebook Pixel ID</label>
      //                     <input
      //                       type="text"
      //                       value={form.analyticsConfig?.facebookTag || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           analyticsConfig: { ...f.analyticsConfig, facebookTag: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="1234567890"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                 </div>
      //               </div>

      //               {/* Payment Settings */}
      //               <div className="space-y-2">
      //                     <h3 className="text-sm font-semibold">Payment Settings</h3>
      //                     <div className="space-y-4">
      //                       {/* M-Pesa */}
      //                       <fieldset className="border rounded p-3">
      //                         <legend className="text-xs font-medium">M-Pesa (Daraja API)</legend>
      //                         <div className="space-y-2">
      //                           <div>
      //                             <label className="block text-xs">Business Shortcode</label>
      //                             <input
      //                               type="text"
      //                               value={form.paymentSettings?.mpesaShortcode || ''}
      //                               onChange={e =>
      //                                 setForm(f => ({
      //                                   ...f,
      //                                   paymentSettings: { ...f.paymentSettings, mpesaShortcode: e.target.value }
      //                                 }))
      //                               }
      //                               placeholder="e.g. 123456"
      //                               className="w-full border rounded px-2 py-1 text-sm"
      //                             />
      //                           </div>
      //                           <div>
      //                             <label className="block text-xs">API Consumer Key</label>
      //                             <input
      //                               type="text"
      //                               value={form.paymentSettings?.mpesaConsumerKey || ''}
      //                               onChange={e =>
      //                                 setForm(f => ({
      //                                   ...f,
      //                                   paymentSettings: { ...f.paymentSettings, mpesaConsumerKey: e.target.value }
      //                                 }))
      //                               }
      //                               placeholder="Your Daraja Consumer Key"
      //                               className="w-full border rounded px-2 py-1 text-sm"
      //                             />
      //                           </div>
      //                           <div>
      //                             <label className="block text-xs">API Consumer Secret</label>
      //                             <input
      //                               type="text"
      //                               value={form.paymentSettings?.mpesaConsumerSecret || ''}
      //                               onChange={e =>
      //                                 setForm(f => ({
      //                                   ...f,
      //                                   paymentSettings: { ...f.paymentSettings, mpesaConsumerSecret: e.target.value }
      //                                 }))
      //                               }
      //                               placeholder="Your Daraja Consumer Secret"
      //                               className="w-full border rounded px-2 py-1 text-sm"
      //                             />
      //                           </div>
      //                           <div>
      //                             <label className="block text-xs">Callback URL</label>
      //                             <input
      //                               type="url"
      //                               value={form.paymentSettings?.mpesaCallbackUrl || ''}
      //                               onChange={e =>
      //                                 setForm(f => ({
      //                                   ...f,
      //                                   paymentSettings: { ...f.paymentSettings, mpesaCallbackUrl: e.target.value }
      //                                 }))
      //                               }
      //                               placeholder="https://yourdomain.com/api/mpesa/callback"
      //                               className="w-full border rounded px-2 py-1 text-sm"
      //                             />
      //                           </div>
      //                         </div>
      //                       </fieldset>


      //                     </div>
      //                   </div>

      //               {/* Shipping Settings */}
      //               <div className="space-y-2">
      //                 <h3 className="text-sm font-semibold">Shipping Settings</h3>
      //                 <div className="space-y-2">
      //                   <div>
      //                     <label className="block text-xs">Carrier Name</label>
      //                     <input
      //                       type="text"
      //                       value={form.shippingSettings?.carrierName || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           shippingSettings: { ...f.shippingSettings, carrierName: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="DHL, FedEx, etc."
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                   <div>
      //                     <label className="block text-xs">Tracking URL Template</label>
      //                     <input
      //                       type="text"
      //                       value={form.shippingSettings?.trackingUrl || ''}
      //                       onChange={e =>
      //                         setForm(f => ({
      //                           ...f,
      //                           shippingSettings: { ...f.shippingSettings, trackingUrl: e.target.value }
      //                         }))
      //                       }
      //                       placeholder="https://tracking.example.com/track?code={tracking_number}"
      //                       className="w-full border rounded px-2 py-1 text-sm"
      //                     />
      //                   </div>
      //                 </div>
      //               </div>
      //             </div>
      //           </details>
      //     </div>
          
      //     );