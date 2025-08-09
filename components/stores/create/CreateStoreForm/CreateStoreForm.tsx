"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useMemo,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  StoreForm,
  Handlers,
  StepConfig,
  GeoLocation,
  RawCategory,
  Location,
  SubObj,
  ParentCategory,
  SelectedCategory,
  Promotion,
  HeroSlide,
  CompanyLocationType,
  StoreCategory,
  Subcategory,
} from "@/types/typings";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import {
  storeSteps,
  pricingSteps,
  websiteSteps,
  locationsSteps,
  paymentSteps,
} from "@/constant/STORE_SITE_STEPS";

import { getCategoryDefaultData } from "@/lib/defaultStoreData";

const SITE_CATEGORIES_WITH_PRICING = [
  "service provider",
  "booking & appointments",
  "portfolio & personal branding",
];

const SITE_CATEGORIES_WITH_LOCATIONS = [
  "real estate",
  "automotive",
  "travel & tourism",
];

export interface SelectedLocation {
  id: string;
  name: string;
  children: SelectedLocation[];
}

type Props = {
  availableCategories: StoreCategory[];
  availableLocations: Location[];
  initialData?: Partial<StoreForm> & { id: string };
};


// Helper to build a selected tree from CompanyLocation[] and all Locations
const buildSelectedLocationTree = (
  selectedCompanyLocations: CompanyLocationType[],
  allLocationsMap: Map<string, Location>,
  parentId: string | null = null
): SelectedLocation[] => {
  const children: SelectedLocation[] = [];
  const directChildrenLocations = Array.from(allLocationsMap.values()).filter(loc => loc.parentId === parentId);

  const selectedLocMap = new Map(selectedCompanyLocations.map(cl => [cl.locationId, cl]));

  for (const loc of directChildrenLocations) {
    const isLocSelected = selectedLocMap.has(loc.id);
    const childSelectedNodes = buildSelectedLocationTree(selectedCompanyLocations, allLocationsMap, loc.id);

    if (isLocSelected || childSelectedNodes.length > 0) {
      children.push({
        id: loc.id,
        name: loc.name,
        children: childSelectedNodes,
      });
    }
  }
  return children;
};

// Helper to flatten CompanyLocation[] into a Set of location IDs
const flattenCompanyLocationsToIds = (companyLocations: CompanyLocationType[]): Set<string> => {
  const ids = new Set<string>();
  // Add defensive check for companyLocations being undefined/null
  if (!companyLocations) return ids; 
  companyLocations.forEach(cl => ids.add(cl.locationId));
  return ids;
};

// Helper to get all descendant IDs of a given location
const getAllDescendantIds = (location: Location, allLocationsMap: Map<string, Location>): string[] => {
    const ids: string[] = [location.id];
    const queue: string[] = [location.id];
    let head = 0;

    while (head < queue.length) {
        const currentId = queue[head++];
        const children = Array.from(allLocationsMap.values()).filter(loc => loc.parentId === currentId);
        children.forEach(child => {
            ids.push(child.id);
            queue.push(child.id);
        });
    }
    return ids;
};

// --- END MOCK DATA AND HELPER FUNCTIONS ---


export default function CreateStoreForm({
  availableCategories,
  availableLocations,
  initialData,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [stepIndex, setStepIndex] = useState(0);

  console.log(availableCategories);
  
  // UPDATE: The defaultForm object is now initialized with all the fields
  // from the new, expanded StoreForm interface.
  const defaultForm: StoreForm = {
    id: "",
    name: "",
    slug: "",
    domain: "",
    hasWebsite: false,
    tagline: "",
    description: "",
    category: "E-commerce",
    logoUrl: "",
    bannerUrl: "",
    contactEmail: session?.user?.email || "",
    contactPhone: "",
    address: "",
    geoLocation: { lat: 0, lng: 0 },
    openingHours: {
      mon: { open: "09:00", close: "17:00" },
      tue: { open: "09:00", close: "17:00" },
      wed: { open: "09:00", close: "17:00" },
      thu: { open: "09:00", close: "17:00" },
      fri: { open: "09:00", close: "17:00" },
      sat: { open: "", close: "" },
      sun: { open: "", close: "" },
    },
    // --- Core Relational Data ---
    socialLinks: [],
    policies: [],
    faqs: [],
    testimonials: [],
    heroSlides: [],
    promotions: [],
    storeCategories: [],

    // --- NEW: Added missing core fields ---
    currency: 'USD',
    locale: 'en-US',
    companyCategoryId: undefined,

    // --- NEW: Added missing relational arrays ---
    pageSections: [], // For modular page content
    appPromos: [], // For the app promotion section
    collections: [], // For product collections
    events: [], // For company/school events
    announcements: [], // For site announcements


    // --- JSON fields ---
    awards: [],
    metrics: [],
    stats: [],
    pricingTiers: [
      {
        name: "Basic",
        price: 0,
        features: [],
        description: "A great starting point.",
        duration: "monthly"
      }
    ],

    // --- Settings Objects ---
    themeSettings: {},
    seo: {},
    analyticsConfig: {},
    paymentSettings: {},
    shippingSettings: {},
    blogs: [],

    // This would be populated in a different form, but needs to be in the type
    marketplaceListings: [],
    writers: [],
    agents: [],
    doctors: [],
    podcasts: [],
    companyLocations: [],
    courses: [],

    services:[]

  };

  // const [form, setForm] = useState<StoreForm>(
  //   // `initialData` fields overwrite defaults
  //   initialData ? { ...defaultForm, ...initialData } : defaultForm
  // );

  const [form, setForm] = useState<StoreForm>(() => {
    const initialForm = initialData ? { ...defaultForm, ...initialData } : defaultForm;
    // FIX: Ensure companyLocations is always an array, even if initialData provides null/undefined
    initialForm.companyLocations = initialData?.companyLocations || [];
    return initialForm;
  });

    // NEW: State for all available locations
  // const [allAvailableLocations, setAllAvailableLocations] = useState<Location[]>([]);
  // NEW: State for selected location IDs (flat set for efficient lookup)
  const [currentSelectedLocationIds, setCurrentSelectedLocationIds] = useState<Set<string>>(() =>
    initialData?.companyLocations ? flattenCompanyLocationsToIds(initialData.companyLocations) : new Set()
  );

  // ADD THIS useEffect hook to handle category changes
  const [categoryChanged, setCategoryChanged] = useState(false);

  useEffect(() => {
    // Don't run on initial load or in edit mode
    if (!categoryChanged || initialData) return;

    // Get the sample data for the newly selected category
    const sampleData = getCategoryDefaultData(form.category);

    // Merge the sample data into the form state
    // This preserves basic info like 'name' and 'slug' while updating
    // content arrays like 'faqs', 'heroSlides', etc.
    setForm(prevForm => ({
      ...prevForm,
      ...sampleData,
    }));

    // Reset the flag
    setCategoryChanged(false);

  }, [form.category, categoryChanged, initialData,stepIndex]);

  // ─────────────────────────────────────────────────────────────────────
  // 1) File state (logo, banner, hero slides, promotion slides)
  // ─────────────────────────────────────────────────────────────────────

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<(File | null)[]>(
    () => form.heroSlides.map(() => null)
  );

    // Memoize the selected locations in the hierarchical structure for display
  const selectedLocationsForDisplay: SelectedLocation[] = useMemo(() => {
      const allLocationsMap = new Map(availableLocations.map(loc => [loc.id, loc]));
      return buildSelectedLocationTree(form.companyLocations, allLocationsMap);
    }, [form.companyLocations, availableLocations]);
  

  // Track one File per hero slide. Initialize from existing heroSlides length
  const [heroSlideFiles, setHeroSlideFiles] = useState<(File | null)[]>(() =>
    form.heroSlides.map(() => null)
  );

  // Track one File per promotion. Initialize from existing promotions length
  const [promotionSlideFiles, setPromotionSlideFiles] = useState<
    (File | null)[]
  >(() => form.promotions.map(() => null));

  // When initialData changes (edit mode), clear out these File states
  useEffect(() => {
    if (!initialData) return;
    setLogoFile(null);
    setBannerFile(null);
    setHeroSlideFiles(initialData.heroSlides?.map(() => null) || []);
    setPromotionSlideFiles(initialData.promotions?.map(() => null) || []);
  }, [initialData]);

  // Whenever form.heroSlides grows/shrinks, sync heroSlideFiles length
  useEffect(() => {
    if (form.heroSlides.length > heroSlideFiles.length) {
      setHeroSlideFiles((prev) => [
        ...prev,
        ...Array(form.heroSlides.length - prev.length).fill(null),
      ]);
    }
    if (form.heroSlides.length < heroSlideFiles.length) {
      setHeroSlideFiles((prev) => prev.slice(0, form.heroSlides.length));
    }
  }, [form.heroSlides.length]);

  useEffect(() => {
    if (form.heroSlides.length > productImageFiles.length) {
      setProductImageFiles((prev) => [
        ...prev,
        ...Array(form.heroSlides.length - prev.length).fill(null),
      ]);
    }
    if (form.heroSlides.length < productImageFiles.length) {
      setProductImageFiles((prev) => prev.slice(0, form.heroSlides.length));
    }
  }, [form.heroSlides.length]);

  const allSteps = useMemo<StepConfig[]>(() => {
    // 1) always start with your store steps
    const list = [...storeSteps];

    // 2) if they've opted for a website, add payment steps...
    if (form.hasWebsite) {
      // 3) ...and, for certain categories, add pricing
      const cat = form.category?.toLowerCase().trim() || "";

      if (SITE_CATEGORIES_WITH_PRICING.includes(cat)) {
        list.push(...pricingSteps);
      }

      list.push(...websiteSteps);

      if (SITE_CATEGORIES_WITH_LOCATIONS.includes(cat)) {
        list.push(...locationsSteps);
      }

      list.push(...paymentSteps);
    }

    return list;
  }, [form.hasWebsite, form.category]);

  // Whenever form.promotions grows/shrinks, sync promotionSlideFiles length

  useEffect(() => {
    if (form.promotions.length > promotionSlideFiles.length) {
      setPromotionSlideFiles((prev) => [
        ...prev,
        ...Array(form.promotions.length - prev.length).fill(null),
      ]);
    }
    if (form.promotions.length < promotionSlideFiles.length) {
      setPromotionSlideFiles((prev) => prev.slice(0, form.promotions.length));
    }
  }, [form.promotions.length]);

  // ─────────────────────────────────────────────────────────────────────
  // 2) Handlers for “Logo / Banner” Accordion
  // ─────────────────────────────────────────────────────────────────────

  const handleMediaUpload = (field: "logoUrl" | "bannerUrl", file: File) => {
    if (field === "logoUrl") {
      setLogoFile(file);
    } else {
      setBannerFile(file);
    }
    // Immediately generate a preview URL
    const previewURL = URL.createObjectURL(file);
    setForm((prev) => ({
      ...prev,
      [field]: previewURL,
    }));
  };

  const handleMediaRemove = (field: "logoUrl" | "bannerUrl") => {
    if (field === "logoUrl") {
      setLogoFile(null);
    } else {
      setBannerFile(null);
    }
    setForm((prev) => ({
      ...prev,
      [field]: "",
    }));
  };

  // ─────────────────────────────────────────────────────────────────────
  // 3) Handlers for “Hero Slides” Accordion
  // ─────────────────────────────────────────────────────────────────────

  const onAddHeroSlide = () => {
    setForm((prev) => ({
      ...prev,
      heroSlides: [
        ...prev.heroSlides,
        {
          imageUrl: "",
          productImageUrl: "",
          headline: "",
          subline: "",
          ctaText: "",
          ctaLink: "",
        },
      ],
    }));
  };

  const onRemoveHeroSlide = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      heroSlides: prev.heroSlides.filter((_, i) => i !== idx),
    }));
  };

  const onUpdateHeroSlide = (
    index: number,
    field: keyof HeroSlide,
    value: string
  ) => {
    setForm((prev) => {
      const slides = [...prev.heroSlides];
      slides[index] = { ...slides[index], [field]: value };
      return { ...prev, heroSlides: slides };
    });
  };

  const handleSlideImageUpload = (
    index: number,
    file: File,
    field: keyof HeroSlide
  ) => {
    // store the file if needed
    if (field === "imageUrl") {
      setHeroSlideFiles((prev) => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });
    } else if (field === "productImageUrl") {
      setProductImageFiles((prev) => {
        const copy = [...prev];
        copy[index] = file;
        return copy;
      });
    }

    // generate preview URL
    const previewURL = URL.createObjectURL(file);

    // update the form state
    setForm((prev) => {
      const slides = [...prev.heroSlides];
      slides[index] = { ...slides[index], [field]: previewURL };
      return { ...prev, heroSlides: slides };
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  // 4) Handlers for “Promotions” Accordion
  // ─────────────────────────────────────────────────────────────────────

  const onAddPromotion = () => {
    setForm((prev) => ({
      ...prev,
      promotions: [
        ...prev.promotions,
        { title: "", description: "", startsAt: "", endsAt: "", bannerUrl: "" },
      ],
    }));
  };

  const onRemovePromotion = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      promotions: prev.promotions.filter((_, i) => i !== idx),
    }));
  };

  const onUpdatePromotion = (
    index: number,
    field: keyof Promotion,
    value: string
  ) => {
    setForm((prev) => {
      const promos = [...prev.promotions];
      promos[index] = { ...promos[index], [field]: value };
      return { ...prev, promotions: promos };
    });
  };

  const onPromotionImageUpload = (index: number, file: File) => {
    setPromotionSlideFiles((prev) => {
      const copy = [...prev];
      copy[index] = file;
      return copy;
    });
    const previewURL = URL.createObjectURL(file);
    setForm((prev) => {
      const promos = [...prev.promotions];
      promos[index] = { ...promos[index], bannerUrl: previewURL };
      return { ...prev, promotions: promos };
    });
  };

  // ─────────────────────────────────────────────────────────────────────
  // 5) Generic form handlers (arrays, opening hours, etc.)
  // ─────────────────────────────────────────────────────────────────────

  const totalSteps = allSteps.length + 1;

  // const mappedCategories: StoreCategory[] = availableCategories.map((cat) => ({
  //   id: cat.id,
  //   name: cat.name,
  //   icon: cat.icon,
  //   items: cat.subcategories.map((sub, index) => ({
  //     id: `${sub.name.slice(0, 2) + index}`,
  //     name: sub.name,
  //     slug: sub.slug,
  //   })),
  //   allBrands: cat.allBrands ? cat.allBrands : [],
  // }));

  // Auto-generate slug/domain from name
  useEffect(() => {
    if (initialData) return;
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    const domain = slug ? `${slug}.yourdomain.com` : "";
    setForm((prev) => ({ ...prev, slug, domain }));
  }, [form.name, initialData]);

  // Slug & domain generator
  useEffect(() => {
    if (initialData) return;
    if (!form.name) return;
    const slug = form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setForm((f) => ({ ...f, slug, domain: `https://www.${slug}.ghuba.shop` }));
  }, [form.name, initialData]);

  // LocalStorage
  // useEffect(() => {
  //   if (initialData) return; // ← skip in edit mode
  //   const saved = localStorage.getItem("storeForm");
    
  //   if (saved) setForm(JSON.parse(saved));
  // }, [initialData]);

  // LocalStorage
  useEffect(() => {
    if (initialData) return;
    const saved = localStorage.getItem("storeForm");
    if (saved) {
      try {
        const parsedForm: StoreForm = JSON.parse(saved);
        setForm(parsedForm);
        // Restore selected locations from companyLocations
        if (parsedForm.companyLocations) {
            setCurrentSelectedLocationIds(flattenCompanyLocationsToIds(parsedForm.companyLocations));
        }
      } catch (e) {
        console.error("Failed to parse stored form data:", e);
        localStorage.removeItem("storeForm");
      }
    }
  }, [initialData]);

  // useEffect(() => {
  //   if (initialData) return;
  //   localStorage.setItem("storeForm", JSON.stringify(form));
  // }, [form, initialData]);

    useEffect(() => {
    if (initialData) return;
    // Ensure companyLocations is always updated from selectedLocationsForDisplay
    // We need to convert SelectedLocation[] back to CompanyLocationType[] for storage
    const companyLocationsToSave: CompanyLocationType[] = [];
    const collectCompanyLocations = (selectedLocs: SelectedLocation[]) => {
        selectedLocs.forEach(selectedLoc => {
            companyLocationsToSave.push({
                companyId: form.id || 'temp-company-id', // Use actual company ID or a temp one
                locationId: selectedLoc.id,
                visible: true, // Defaulting to true, adjust if you have UI for this
                sortOrder: 0, // Defaulting to 0, adjust if you have UI for this
            });
            if (selectedLoc.children) {
                collectCompanyLocations(selectedLoc.children);
            }
        });
    };
    collectCompanyLocations(selectedLocationsForDisplay);

    const formToSave = {
        ...form,
        companyLocations: companyLocationsToSave,
    };
    localStorage.setItem("storeForm", JSON.stringify(formToSave));
  }, [form, initialData, selectedLocationsForDisplay]);// Add selectedLocationsForDisplay as dependency


  // Navigation guard
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  // Handlers

  const handleChange = (
  e: ChangeEvent<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  >
) => {
  const { name, type, value } = e.target;

  // when category changes, flag it:
  if (name === "category") {
    setCategoryChanged(true);
  }
  
  if (type === "checkbox") {
    // cast only inside the checkbox branch
    const checked = (e.target as HTMLInputElement).checked;
    setForm(f => ({ ...f, [name]: checked }));
    return;
  }

  if (name.startsWith("openingHours.")) {
    // …handle openingHours logic
     const [, dayKey, field] = name.split(".");
      setForm((f: any) => ({
        ...f,
        openingHours: {
          ...f.openingHours,
          [dayKey]: {
            ...f.openingHours[dayKey],
            [field]: value,
          },
        },
      }));
  } else {
    setForm(f => ({ ...f, [name]: value }));
  }
  };

  const onUpdateArray = <T,>(
    key: keyof StoreForm,
    idx: number,
    field: keyof T,
    value: any
  ) => {
    setForm((f) => {
      const arr = [...(f[key] as any)];
      arr[idx] = { ...arr[idx], [field]: value };
      return { ...f, [key]: arr };
    });
  };

  const onAddArray = <T,>(key: keyof StoreForm, item: T) => {
    setForm((f) => ({ ...f, [key]: [...(f[key] as any), item] }));
  };

  const onRemoveArray = (key: keyof StoreForm, idx: number) => {
    setForm((f) => ({
      ...f,
      [key]: (f[key] as any).filter((_: any, i: number) => i !== idx),
    }));
  };

  const onToggleDay = (key: string) => {
    setForm((f) => {
      const day = f.openingHours[key] || { open: "", close: "" };
      const isClosed = !day.open && !day.close;
      const updated = isClosed
        ? { open: "09:00", close: "17:00" }
        : { open: "", close: "" };

      return {
        ...f,
        openingHours: {
          ...f.openingHours,
          [key]: updated,
        },
      };
    });
  };

  //............................
// Assuming 'setForm' is a state setter (e.g., from React's useState)
// and 'availableCategories' is a global or prop array of all possible categories.

// import { StoreCategory, Subcategory } from "@/types/typings"; // Ensure these types are correctly imported

// Utility function to get a deep clone of a category for immutability
const cloneCategory = (category: StoreCategory) => ({
  ...category,
  subcategories: category.subcategories ? [...category.subcategories] : [],
  allBrands: category.allBrands ? [...category.allBrands] : [],
});

// ✅ 1) Toggle parent
const onToggleParent = (parent: StoreCategory) => {
  setForm((prev: { storeCategories: StoreCategory[] }) => {
    const existingParentIndex = prev.storeCategories.findIndex(
      (sc) => sc.id === parent.id
    );

    // Get the correct IDs for subcategories from the parent object
    const totalSubcategories = parent.subcategories.map(child => ({
      id: child._id?.$oid || child.id,
      name: child.name,
      slug: child.slug,
    }));

    // If the parent is not currently in the selected list (meaning it's not selected at all)
    if (existingParentIndex === -1) {
      // Add the parent with all its subcategories and all its brands
      return {
        ...prev,
        storeCategories: [
          ...prev.storeCategories,
          {
            ...cloneCategory(parent),
            subcategories: totalSubcategories,
            allBrands: parent.allBrands ? [...parent.allBrands] : [],
          },
        ],
      };
    }

    // The parent already exists in the selected list.
    const existingEntry = prev.storeCategories[existingParentIndex];
    const totalSubcategoryCount = totalSubcategories.length;
    const selectedSubcategoryCount = existingEntry.subcategories.length;

    const totalBrands = parent.allBrands?.length || 0;
    const selectedBrandCount = existingEntry.allBrands?.length || 0;

    // A parent is fully selected if all its subcategories AND all its brands are selected.
    const isFullySelected =
      selectedSubcategoryCount === totalSubcategoryCount &&
      selectedBrandCount === totalBrands;

    if (!isFullySelected) {
      // If it's not fully selected (either partially selected or not selected at all),
      // select all subcategories and all brands for this parent.
      const updatedParent = {
        ...cloneCategory(parent),
        subcategories: totalSubcategories,
        allBrands: parent.allBrands ? [...parent.allBrands] : [],
      };

      const updatedStoreCategories = prev.storeCategories.map((sc) =>
        sc.id === parent.id ? updatedParent : sc
      );

      return { ...prev, storeCategories: updatedStoreCategories };
    } else {
      // If it's fully selected, remove the entire parent category.
      const filteredStoreCategories = prev.storeCategories.filter(
        (sc) => sc.id !== parent.id
      );
      return { ...prev, storeCategories: filteredStoreCategories };
    }
  });
};

// ---

// ✅ 2) Toggle subcategory
const onToggleSub = (parentId: string, subcategory: any) => {
  setForm((prev: { storeCategories: StoreCategory[] }) => {
    const parentEntry = prev.storeCategories.find((sc) => sc.id === parentId);
    const parentData = availableCategories.find((cat) => cat.id === parentId);

    if (!parentData) {
      return prev;
    }

    // Get the correct ID from the subcategory object
    const subId = subcategory._id?.$oid || subcategory.id;

    // Case 1: Parent is not yet in the form state
    if (!parentEntry) {
      return {
        ...prev,
        storeCategories: [
          ...prev.storeCategories,
          {
            ...cloneCategory(parentData),
            subcategories: [
              {
                id: subId,
                name: subcategory.name,
                slug: subcategory.slug,
              }
            ],
            allBrands: [],
          },
        ],
      };
    }

    // Case 2: Parent is already in the form state
    const isCurrentlySelected = parentEntry.subcategories.some(
      (s) => s.id === subId
    );

    let updatedSubcategories;
    if (isCurrentlySelected) {
      updatedSubcategories = parentEntry.subcategories.filter(
        (s) => s.id !== subId
      );
    } else {
      updatedSubcategories = [
        ...parentEntry.subcategories,
        {
          id: subId,
          name: subcategory.name,
          slug: subcategory.slug,
        },
      ];
    }

    if (updatedSubcategories.length === 0 && (parentEntry.allBrands?.length || 0) === 0) {
      return {
        ...prev,
        storeCategories: prev.storeCategories.filter((sc) => sc.id !== parentId),
      };
    }

    return {
      ...prev,
      storeCategories: prev.storeCategories.map((sc) =>
        sc.id === parentId ? { ...sc, subcategories: updatedSubcategories } : sc
      ),
    };
  });
};

// ---

// ✅ 3) Toggle brand
const onToggleBrand = (parentId: string, brand: string) => {
  setForm((prev: { storeCategories: StoreCategory[] }) => {
    const parentEntry = prev.storeCategories.find((sc) => sc.id === parentId);
    const parentData = availableCategories.find((cat) => cat.id === parentId);

    if (!parentData) {
      // If parent data (from availableCategories) is not found, cannot proceed.
      console.warn(`Parent category with ID ${parentId} not found in availableCategories.`);
      return prev;
    }

    // Case 1: The parent category is NOT currently in the form state.
    // This means we're adding the first brand for this parent.
    if (!parentEntry) {
      return {
        ...prev,
        storeCategories: [
          ...prev.storeCategories,
          {
            id: parentData.id,
            name: parentData.name ?? "",
            icon: parentData.icon ?? "",
            companyId: parentData.companyId,
            categoryId: parentData.categoryId,
            displayName: parentData.displayName,
            sortOrder: parentData.sortOrder,
            visible: parentData.visible,
            subcategories: [], // Start with no subcategories selected
            allBrands: [brand], // Add ONLY the clicked brand
          },
        ],
      };
    }

    // Case 2: The parent category IS already in the form state.
    const isCurrentlySelected = parentEntry.allBrands?.includes(brand);

    let updatedBrands: string[];
    if (isCurrentlySelected) {
      // If the brand is currently selected, remove it.
      updatedBrands = (parentEntry.allBrands || []).filter((b: string) => b !== brand);
    } else {
      // If the brand is NOT currently selected, add it.
      updatedBrands = [...(parentEntry.allBrands || []), brand];
    }

    // Check if the parent category should be removed if it has no selected items or brands.
    if (updatedBrands.length === 0 && (parentEntry.subcategories?.length || 0) === 0) {
      return {
        ...prev,
        storeCategories: prev.storeCategories.filter((sc) => sc.id !== parentId),
      };
    }

    // Update the existing parent entry with the new brands list.
    return {
      ...prev,
      storeCategories: prev.storeCategories.map((sc) =>
        sc.id === parentId ? { ...sc, allBrands: updatedBrands } : sc
      ),
    };
  });
};

// ---

// ✅ 4) Bulk toggle
const onBulkToggle = (ids: string[]) => {
  setForm((prev: { storeCategories: StoreCategory[] }) => {
    // If no IDs are provided, clear all selected store categories.
    if (ids.length === 0) {
      return { ...prev, storeCategories: [] };
    }

    const nextStoreCategories: StoreCategory[] = [];
    const idSet = new Set(ids); // For efficient lookups

    for (const parent of availableCategories) {
      // Find subcategories of the current parent that are in the 'ids' list
      const matchedSubcategories = parent.subcategories.filter((item) =>
        idSet.has(item.id)
      );

      // Find brands of the current parent that are in the 'ids' list
      const matchedBrands =
        parent.allBrands?.filter((brand) => idSet.has(brand)) || [];

      // If neither subcategories nor brands are matched for this parent, skip it.
      if (matchedSubcategories.length === 0 && matchedBrands.length === 0) {
        continue;
      }

      // Add the parent to the nextStoreCategories with its matched subcategories and brands
      nextStoreCategories.push({
        id: parent.id,
        name: parent.name,
        icon: parent.icon,
        companyId: parent.companyId,
        categoryId: parent.categoryId,
        displayName: parent.displayName,
        sortOrder: parent.sortOrder,
        visible: parent.visible,
        subcategories: matchedSubcategories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })), // Ensure correct shape
        allBrands: matchedBrands,
      });
    }

    return { ...prev, storeCategories: nextStoreCategories };
  });
};





  //............................
 

    // NEW: Handlers for LocationSelectionAccordion
     const onToggleLocation = useCallback((location: Location, isSelected: boolean) => {
       setForm(prevForm => {
         const newCompanyLocations = [...prevForm.companyLocations];
         const allLocationsMap = new Map(availableLocations.map(loc => [loc.id, loc]));
         const idsToToggle = getAllDescendantIds(location, allLocationsMap);
   
         idsToToggle.forEach(locId => {
           const existingIndex = newCompanyLocations.findIndex(cl => cl.locationId === locId);
           if (isSelected) {
             if (existingIndex === -1) {
               newCompanyLocations.push({
                 companyId: prevForm.id || session?.user?.id || 'temp-company-id',
                 locationId: locId,
                 visible: true,
                 sortOrder: 0,
               });
             }
           } else {
             if (existingIndex !== -1) {
               newCompanyLocations.splice(existingIndex, 1);
             }
           }
         });
   
         return { ...prevForm, companyLocations: newCompanyLocations };
       });
     }, [availableLocations, session?.user?.id]);
   
     const onBulkToggleLocations = useCallback((locationIds: string[]) => {
       setForm(prevForm => {
         const newCompanyLocations: CompanyLocationType[] = [];
         const existingCompanyLocationMap = new Map(prevForm.companyLocations.map(cl => [cl.locationId, cl]));
   
         locationIds.forEach(locId => {
           if (!existingCompanyLocationMap.has(locId)) {
             newCompanyLocations.push({
               companyId: prevForm.id || session?.user?.id || 'temp-company-id',
               locationId: locId,
               visible: true,
               sortOrder: 0,
             });
           }
         });
   
         const finalCompanyLocations = locationIds.length === 0
           ? []
           : [
               ...prevForm.companyLocations.filter(cl => locationIds.includes(cl.locationId)),
               ...newCompanyLocations
             ];
   
         return { ...prevForm, companyLocations: finalCompanyLocations };
       });
     }, [session?.user?.id]);


  const setAddress = (address: string, geoLocation: GeoLocation) => {
    setForm((f) => ({ ...f, address, geoLocation }));
  };

  const onChangeSettings = (updated: Partial<StoreForm>) => {
    setForm((f) => ({ ...f, ...updated }));
  };

  const handlers: Handlers = {
    handleChange,
    onUpdateArray,
    onAddArray,
    onRemoveArray,

    setAddress,
    onChangeSettings,
    onBulkToggle,
    onToggleDay,

    onToggleParent,
    onToggleSub,
    onToggleBrand,

    onUpdateHeroSlide,
    onAddHeroSlide,

    onRemoveHeroSlide,
    handleSlideImageUpload,

    onUpdatePromotion,
    onAddPromotion,
    onRemovePromotion,

    onPromotionImageUpload,

    // Media (logo/banner)
    handleMediaUpload,
    handleMediaRemove,

    onToggleLocation,
    onBulkToggleLocations

  };

  const next = () => setStepIndex((i) => Math.min(i + 1, totalSteps - 1));
  const prev = () => setStepIndex((i) => Math.max(i - 1, 0));

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!session?.user?.id) return;

    setIsSubmitting(true);

    // 1) Prepare a local copy of form data (so we can mutate it without
    //    worrying about React batching or stale closures).
    const payload = { ...form };

    // 2) Build upload promises, but write each returned URL into `payload`
    const uploadPromises: Promise<void>[] = [];

    // 2.a) Logo
    if (logoFile) {
      const p = (async () => {
        const fd = new FormData();
        fd.append("type", "image");
        fd.append("file", logoFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          throw new Error("Logo upload failed");
        }
        const { url } = await res.json();
        // 2.a.i) Write it into our local payload
        payload.logoUrl = url;
        // 2.a.ii) Also update React state so the UI immediately reflects it
        setForm((prev) => ({ ...prev, logoUrl: url }));
      })();
      uploadPromises.push(p);
    }

    // 2.b) Banner
    if (bannerFile) {
      const p = (async () => {
        const fd = new FormData();
        fd.append("type", "image");
        fd.append("file", bannerFile);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          throw new Error("Banner upload failed");
        }
        const { url } = await res.json();
        payload.bannerUrl = url;
        setForm((prev) => ({ ...prev, bannerUrl: url }));
      })();
      uploadPromises.push(p);
    }

    // 2.c) Hero Slides
    heroSlideFiles.forEach((file, idx) => {
      if (file) {
        const p = (async () => {
          const fd = new FormData();
          fd.append("type", "image");
          fd.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            throw new Error(`Slide ${idx + 1} upload failed`);
          }
          const { url } = await res.json();
          // 2.c.i) Mutate local payload.heroSlides
          if (!payload.heroSlides) payload.heroSlides = [];
          // ensure there’s a slot for this index
          while (payload.heroSlides.length <= idx) {
            payload.heroSlides.push({
              ...payload.heroSlides[idx],
              imageUrl: "",
            });
          }
          payload.heroSlides[idx] = {
            ...payload.heroSlides[idx],
            imageUrl: url,
          };
          // 2.c.ii) Mirror into state so UI updates
          setForm((prev) => {
            const slides = [...prev.heroSlides];
            slides[idx] = { ...slides[idx], imageUrl: url };
            return { ...prev, heroSlides: slides };
          });
        })();
        uploadPromises.push(p);
      }
    });

    // 2.c.ii) Product images for Hero Slides
    productImageFiles.forEach((file, idx) => {
      if (file) {
        const p = (async () => {
          const fd = new FormData();
          fd.append("type", "image");
          fd.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            throw new Error(`Product image for slide ${idx + 1} upload failed`);
          }
          const { url } = await res.json();
          if (!payload.heroSlides) payload.heroSlides = [];
          while (payload.heroSlides.length <= idx) {
            payload.heroSlides.push({
              ...payload.heroSlides[idx],
              imageUrl: "",
              productImageUrl: "",
            });
          }
          payload.heroSlides[idx] = {
            ...payload.heroSlides[idx],
            productImageUrl: url,
          };
          setForm((prev) => {
            const slides = [...prev.heroSlides];
            slides[idx] = { ...slides[idx], productImageUrl: url };
            return { ...prev, heroSlides: slides };
          });
        })();
        uploadPromises.push(p);
      }
    });

    // 3.c) Hero Slides
    promotionSlideFiles.forEach((file, idx) => {
      if (file) {
        const p = (async () => {
          const fd = new FormData();
          fd.append("type", "image");
          fd.append("file", file);
          const res = await fetch("/api/upload", {
            method: "POST",
            body: fd,
          });
          if (!res.ok) {
            throw new Error(`Promotions Slide ${idx + 1} upload failed`);
          }
          const { url } = await res.json();
          // 2.c.i) Mutate local payload.heroSlides
          if (!payload.promotions) payload.promotions = [];
          // ensure there’s a slot for this index
          while (payload.promotions.length <= idx) {
            payload.promotions.push({
              ...payload.promotions[idx],
              bannerUrl: "",
            });
          }
          payload.promotions[idx] = {
            ...payload.promotions[idx],
            bannerUrl: url,
          };
          // 2.c.ii) Mirror into state so UI updates
          setForm((prev) => {
            const slides = [...prev.promotions];
            slides[idx] = { ...slides[idx], bannerUrl: url };
            return { ...prev, promotions: slides };
          });
        })();
        uploadPromises.push(p);
      }
    });

    // 4) Wait for all uploads to finish
    try {
      await Promise.all(uploadPromises);

      const isEdit = Boolean(initialData?.id);
      const apiUrl = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/stores/${initialData!.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/stores`;
      const method = isEdit ? "PUT" : "POST";

      // 4) Now payload contains the correct URLs (not the stale form)
      const toSend = {
        ...payload,
        userId: session.user.id,
      };

      const res = await fetch(apiUrl, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSend),
      });

      if (res.ok) {
        router.push("/stores");
      } else {
        console.error("Save failed", await res.text());
        // show an error toast/message
      }
    } catch (err: any) {
      console.error("Error uploading files or saving store:", err);
      alert(`Error: ${err.message}`);
    }
  };

  // Render step or review
  const StepContent =  stepIndex < allSteps.length ? ( 
        allSteps[stepIndex].render(form, handlers, availableCategories, availableLocations, selectedLocationsForDisplay)
      ) : (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Review Your Store</h2>
          {allSteps.map((s: any, i: any) => (
            <div
              key={s.key}
              className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => setStepIndex(i)}
            >
              <h3 className="font-medium mb-2 flex justify-between items-center">
                <span>{s.title}</span>
                <span className="text-xs text-indigo-500">Edit ➔</span>
              </h3>
              <div className="text-gray-700">
                {renderReviewContent(s.key, form)}
              </div>
            </div>
          ))}
        </div>
      );

  const currentTitle = stepIndex < allSteps.length ? allSteps[stepIndex].title : "Review & Submit";
  const percent = Math.min(((stepIndex + 1) / totalSteps) * 100, 100);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Mobile Top Bar with Step Info */}
      <div className="md:hidden bg-indigo-600 text-white py-2 px-4 flex justify-between items-center shadow-sm sticky top-0 z-30">
        <span className="font-medium text-sm">
          Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
        </span>
        <span className="text-xs truncate max-w-[60%]">{currentTitle}</span>
      </div>

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white shadow-lg p-4 sticky top-0 h-screen z-10">
        <h2 className="text-xl font-semibold mb-6 text-indigo-700">
          Setup Wizard
        </h2>
        <nav className="flex flex-col gap-4 overflow-y-auto">
          {allSteps.map((s, i) => {
            const completed = i < stepIndex;
            const active = i === stepIndex;
            return (
              <button
                key={s.key}
                onClick={() => setStepIndex(i)}
                className={`flex items-center gap-3 p-3 rounded-lg transition
              ${completed ? "bg-green-100 text-green-800" : ""}
              ${
                active
                  ? "bg-indigo-100 text-indigo-800 font-medium shadow-inner"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
              >
                <span
                  className={`w-8 h-8 flex items-center justify-center rounded-full text-sm
                ${
                  completed
                    ? "bg-green-600 text-white"
                    : active
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-200 text-indigo-700"
                }`}
                >
                  {completed ? <CheckCircleIcon className="w-4 h-4" /> : i + 1}
                </span>
                <span className="text-sm">{s.title}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setStepIndex(allSteps.length)}
            className={`flex items-center gap-3 p-3 rounded-lg transition
          ${
            stepIndex === allSteps.length
              ? "bg-green-100 text-green-800"
              : "hover:bg-gray-100 text-gray-700"
          }`}
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-full text-sm bg-green-200 text-green-700">
              ✔
            </span>
            <span className="text-sm">Review</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col px-2 sm:px-2 py-6 relative">
        {/* Progress Bar */}
        <div className="relative mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="absolute inset-0 flex justify-between items-center px-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <button
                key={i}
                onClick={() => setStepIndex(i)}
                className={`w-3 h-3 rounded-full focus:outline-none
              ${
                i <= stepIndex
                  ? "bg-indigo-600"
                  : "bg-white border border-gray-300"
              }`}
              />
            ))}
          </div>
        </div>

        {/* Step Info (Desktop only) */}
        <div className="hidden md:flex justify-between mb-2 text-sm text-gray-500">
          <span>
            Step {Math.min(stepIndex + 1, totalSteps)} of {totalSteps}
          </span>
          <span>{currentTitle}</span>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 flex-1 overflow-auto min-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              {StepContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Buttons (Sticky on Mobile) */}
        <div className="sticky bottom-0 bg-white border-t pt-3 mt-6 flex justify-between px-4 sm:px-6 py-3 md:static md:bg-transparent md:border-0 md:pt-6">
          <button
            type="button"
            disabled={stepIndex === 0}
            onClick={prev}
            className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 text-sm"
          >
            ← Back
          </button>

          {stepIndex < allSteps.length ? (
            <button
              type="button"
              onClick={next}
              className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 text-sm"
            >
              Continue →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 text-sm"
            >
              {isSubmitting ? "Uploading..." : "Submit Store"}
            </button>
          )}
        </div>
      </main>
    </div>
  );
}

// Helper to render review info for each step

const ReviewSection = ({ title, children }: any) => (
  <div className="bg-white shadow-sm rounded-lg p-4 space-y-2">
    <h3 className="text-sm font-semibold text-gray-700 border-b pb-1">
      {title}
    </h3>
    <div>{children}</div>
  </div>
);

const EmptyState = ({ message }: any) => (
  <em className="text-gray-400 italic">{message}</em>
);

const renderList = (items: any, renderItem: any, emptyMessage = "No items") =>
  items && items.length > 0 ? (
    <ul className="list-disc list-inside space-y-1">{items.map(renderItem)}</ul>
  ) : (
    <EmptyState message={emptyMessage} />
  );

const renderJSON = (data: any, emptyMessage = "No data") =>
  data && Object.keys(data).length > 0 ? (
    <pre className="bg-gray-50 text-xs p-3 rounded overflow-x-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  ) : (
    <EmptyState message={emptyMessage} />
  );

const renderReviewContent = (stepKey: any, form: any) => {
  switch (stepKey) {
    case "businesscategory":
      return (
        <ReviewSection title="Business Category">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong>{" "}
              {form.category || <EmptyState message="Not set" />}
            </div>
          </div>
        </ReviewSection>
      );

      
    case 'storeLocations': return <p>{form.companyLocations.map((l:any) => l.name).join(', ')}</p>; // New review content

    case "basic":
      return (
        <ReviewSection title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Name:</strong>{" "}
              {form.name || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Slug:</strong>{" "}
              {form.slug || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Domain:</strong>{" "}
              {form.domain || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Tagline:</strong>{" "}
              {form.tagline || <EmptyState message="Not set" />}
            </div>
            <div className="sm:col-span-2">
              <strong>Description:</strong>{" "}
              {form.description || <EmptyState message="Not set" />}
            </div>
          </div>
        </ReviewSection>
      );

    case "categories":
      return (
        <ReviewSection title="Categories">
          {renderList(
            form.storeCategories,
            (cat: any) => (
              <li key={cat.id}>{cat.name}</li>
            ),
            "No categories"
          )}
        </ReviewSection>
      );

    case "branding":
      return (
        <ReviewSection title="Branding">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Logo</p>
              {form.logoUrl ? (
                <img
                  src={form.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 object-cover rounded-md shadow"
                />
              ) : (
                <EmptyState message="Not uploaded" />
              )}
            </div>
            <div className="flex-shrink-0">
              <p className="font-medium mb-1">Banner</p>
              {form.bannerUrl ? (
                <img
                  src={form.bannerUrl}
                  alt="Banner"
                  className="h-16 w-32 object-cover rounded-md shadow"
                />
              ) : (
                <EmptyState message="Not uploaded" />
              )}
            </div>
          </div>
        </ReviewSection>
      );

    case "touchpoints":
      return (
        <ReviewSection title="Contact & Hours">
          <div className="space-y-2 text-sm">
            <div>
              <strong>Email:</strong>{" "}
              {form.contactEmail || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Phone:</strong>{" "}
              {form.contactPhone || <EmptyState message="Not set" />}
            </div>
            <div>
              <strong>Opening Hours:</strong>
              {Object.keys(form.openingHours || {}).length > 0 ? (
                <ul className="list-disc list-inside ml-4 mt-1">
                  {Object.entries(form.openingHours).map(([day, hrs]) => {
                    const { open, close } = hrs as {
                      open: string;
                      close: string;
                    };
                    const display =
                      open && close ? `${open} – ${close}` : "Closed";
                    // Capitalize day label (Monday, Tuesday, etc.)
                    const label = day.charAt(0).toUpperCase() + day.slice(1);
                    return (
                      <li key={day}>
                        <span className="font-medium">{label}:</span> {display}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <EmptyState message="Not set" />
              )}
            </div>
          </div>
        </ReviewSection>
      );

    case "location":
      return (
        <ReviewSection title="Location">
          <div className="space-y-1 text-sm">
            <div>
              <strong>Address:</strong>{" "}
              {form.address || <EmptyState message="Not set" />}
            </div>
            {form.geoLocation ? (
              <div>
                <strong>Coordinates:</strong> {form.geoLocation.lat},{" "}
                {form.geoLocation.lng}
              </div>
            ) : null}
          </div>
        </ReviewSection>
      );

    case "social":
      return (
        <ReviewSection title="Social Links">
          {renderList(
            form.socialLinks,
            (link: any, i: any) => (
              <li key={i}>
                <strong>{link.channel}:</strong>{" "}
                <a
                  href={link.url}
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.url}
                </a>
              </li>
            ),
            "No social links"
          )}
        </ReviewSection>
      );

    case "content":
      return (
        <ReviewSection title="Policies & Content">
          {renderList(
            form.policies,
            (policy: any, i: any) => (
              <li key={i}>
                <strong>{policy.type}:</strong> {policy.content}
              </li>
            ),
            "No policies"
          )}
        </ReviewSection>
      );

    case "awards":
      return (
        <ReviewSection title="Awards">
          {renderList(
            form.awards,
            (award: any, i: any) => (
              <li key={i}>{award.name}</li>
            ),
            "No awards"
          )}
        </ReviewSection>
      );

    case "metrics":
      return (
        <ReviewSection title="Metrics">
          {renderList(
            form.metrics,
            (m: any, i: any) => (
              <li key={i}>
                <strong>{m.label}:</strong> {m.value}
              </li>
            ),
            "No metrics"
          )}
        </ReviewSection>
      );

    case "stats":
      return (
        <ReviewSection title="Statistics">
          {renderList(
            form.stats,
            (s: any, i: any) => (
              <li key={i}>
                <strong>{s.label}:</strong> {s.value}
              </li>
            ),
            "No statistics"
          )}
        </ReviewSection>
      );

    case "faqs":
      return (
        <ReviewSection title="FAQs">
          {form.faqs && form.faqs.length > 0 ? (
            form.faqs.map((faq: any, i: any) => (
              <div key={i} className="space-y-1 text-sm">
                <p className="font-semibold">Q: {faq.question}</p>
                <p className="ml-4">A: {faq.answer}</p>
              </div>
            ))
          ) : (
            <EmptyState message="No FAQs" />
          )}
        </ReviewSection>
      );

    case "testimonials":
      return (
        <ReviewSection title="Testimonials">
          {form.testimonials && form.testimonials.length > 0 ? (
            form.testimonials.map((t: any, i: any) => (
              <blockquote
                key={i}
                className="border-l-2 pl-4 italic text-gray-600"
              >
                “{t.quote}” — {t.author}
              </blockquote>
            ))
          ) : (
            <EmptyState message="No testimonials" />
          )}
        </ReviewSection>
      );

    case "marketing":
      return (
        <ReviewSection title="Hero Slides">
          {renderList(
            form.heroSlides,
            (slide: any, i: any) => (
              <li key={i}>{slide.headline || "Untitled slide"}</li>
            ),
            "No slides"
          )}
        </ReviewSection>
      );

    case "promotions":
      return (
        <ReviewSection title="Promotions">
          {renderList(
            form.promotions,
            (promo: any, i: any) => (
              <li key={i}>{promo.title}</li>
            ),
            "No promotions"
          )}
        </ReviewSection>
      );

    case "seo":
      return (
        <ReviewSection title="SEO Settings">
          {renderJSON(form.seo, "No SEO settings")}
        </ReviewSection>
      );

    case "theme":
      return (
        <ReviewSection title="Theme Settings">
          {renderJSON(form.themeSettings, "No theme settings")}
        </ReviewSection>
      );

    case "analytics":
      return (
        <ReviewSection title="Analytics Config">
          {renderJSON(form.analyticsConfig, "No analytics config")}
        </ReviewSection>
      );

    case "payment":
      return (
        <ReviewSection title="Payment Settings">
          {renderJSON(form.paymentSettings, "No payment settings")}
        </ReviewSection>
      );

    case "shipping":
      return (
        <ReviewSection title="Shipping Settings">
          {renderJSON(form.shippingSettings, "No shipping settings")}
        </ReviewSection>
      );

    default:
      return (
        <p className="text-sm text-gray-500">
          No data available for this section.
        </p>
      );
  }
};
