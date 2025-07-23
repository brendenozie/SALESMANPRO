"use client";

import React, {
  useState,
  useEffect,
  ChangeEvent,
  FormEvent,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
// UPDATE: Ensure your typings file includes all the new interfaces
import {
  StoreForm,
  Handlers,
  StepConfig,
  GeoLocation,
  RawCategory,
  SubObj,
  ParentCategory,
  SelectedCategory,
  Promotion,
  HeroSlide,
  // Add new types if they are in this file
  PageSection, 
  AppPromo,
  Collection
} from "../../../../types/typings";
import { CheckCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import {
  storeSteps,
  pricingSteps,
  websiteSteps,
  paymentSteps,
} from "@/constant/STORE_SITE_STEPS";

const SITE_CATEGORIES_WITH_PRICING = [
  "service provider",
  "booking & appointments",
  "portfolio & personal branding",
];

type Props = {
  availableCategories: RawCategory[];
  initialData?: Partial<StoreForm> & { id: string };
};

export default function CreateStoreForm({
  availableCategories,
  initialData,
}: Props) {
  const { data: session } = useSession();
  const router = useRouter();

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
    appPromos: [],    // For the app promotion section
    collections: [],  // For product collections
    events: [],       // For company/school events
    announcements: [],// For site announcements
    
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

    // This would be populated in a different form, but needs to be in the type
    marketplaceListings: [], 
  };

  const [form, setForm] = useState<StoreForm>(
    // `initialData` fields overwrite defaults
    initialData ? { ...defaultForm, ...initialData } : defaultForm
  );

  // ... (the rest of your component's state and logic remains the same)
  // ─────────────────────────────────────────────────────────────────────
  // 1) File state (logo, banner, hero slides, promotion slides)
  // ─────────────────────────────────────────────────────────────────────

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [productImageFiles, setProductImageFiles] = useState<(File | null)[]>(
    () => form.heroSlides.map(() => null)
  );

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
          badgeText: ""
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
        { title: "", description: "", startsAt: "", endsAt: "", bannerUrl: "", ctaLink: "", ctaText: ""},
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

  const [stepIndex, setStepIndex] = useState(0);

  const mappedCategories: ParentCategory[] = availableCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    icon: cat.icon,
    items: cat.subcategories.map((sub, index) => ({
      id: `${sub.name.slice(0, 2) + index}`,
      name: sub.name,
      slug: sub.slug,
    })),
    allBrands: cat.allBrands ? cat.allBrands : [],
  }));

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
  useEffect(() => {
    if (initialData) return; // ← skip in edit mode
    const saved = localStorage.getItem("storeForm");
    if (saved) setForm(JSON.parse(saved));
  }, [initialData]);

  useEffect(() => {
    if (initialData) return;
    localStorage.setItem("storeForm", JSON.stringify(form));
  }, [form, initialData]);

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;

    if (name.startsWith("openingHours.")) {
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
      setForm((f: any) => ({
        ...f,
        [name]: type === "checkbox" ? checked : value,
      }));
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

  // 1) onToggleParent
  const onToggleParent = (parent: ParentCategory) => {
    setForm((prev) => {
      const existingIndex = prev.storeCategories.findIndex(
        (sc) => sc.id === parent.id
      );

      // A) Parent not currently selected → add ALL children
      if (existingIndex === -1) {
        return {
          ...prev,
          storeCategories: [
            ...prev.storeCategories,
            {
              id: parent.id,
              name: parent.name,
              icon: parent.icon,
              items: parent.items.map((child) => ({
                id: child.id,
                name: child.name,
                slug: child.slug,
              })),
              allBrands: parent.allBrands && parent.allBrands,
            },
          ],
        };
      }

      const existingEntry = prev.storeCategories[existingIndex];
      const currentlySelectedCount = existingEntry.items.length;
      const totalItemsCount = parent.items.length;
      const totalBrandsCount = parent.allBrands && parent.allBrands.length;

      // B) Parent is “partial” (some but not all) → select all
      if (currentlySelectedCount < totalItemsCount) {
        const allItems = parent.items.map((child) => ({
          id: child.id,
          name: child.name,
          // icon: child.icon,
          slug: child.slug,
        }));

        const allBrands = parent.allBrands && parent.allBrands;

        const updatedItems = prev.storeCategories.map((sc) =>
          sc.id === parent.id ? { ...sc, items: allItems } : sc
        );

        const updatedBrands = prev.storeCategories.map((sc) =>
          sc.id === parent.id ? { ...sc, brands: allBrands } : sc
        );
        return {
          ...prev,
          storeCategories: {
            ...prev.storeCategories,
            ...updatedItems,
            ...updatedBrands,
          },
        };
      }

      // C) Parent was fully selected → remove it completely
      const filtered = prev.storeCategories.filter((sc) => sc.id !== parent.id);
      return { ...prev, storeCategories: filtered };
    });
  };

  // 2) onToggleSub
  const onToggleSub = (parentId: string, item: SubObj) => {
    setForm((prev) => {
      const parentEntry = prev.storeCategories.find((sc) => sc.id === parentId);
  
      if (!parentEntry) {
        // Parent not in storeCategories → add it with one sub
        const parentData = mappedCategories.find((cat) => cat.id === parentId);
        return {
          ...prev,
          storeCategories: [
            ...prev.storeCategories,
            {
              id: parentId,
              name: parentData?.name ?? "",
              icon: parentData?.icon ?? "",
              allBrands: parentData?.allBrands ?? [],
              items: [item],
            },
          ],
        };
      }
  
      // Parent exists → toggle item
      const alreadyExists = parentEntry.items.some(
        (existingItem) => existingItem.id === item.id
      );
  
      const newItems = alreadyExists
        ? parentEntry.items.filter((existingItem) => existingItem.id !== item.id)
        : [...parentEntry.items, item];
  
      if (newItems.length === 0) {
        // No more items, remove entire parent
        return {
          ...prev,
          storeCategories: prev.storeCategories.filter((sc) => sc.id !== parentId),
        };
      }
  
      const updated = prev.storeCategories.map((sc) =>
        sc.id === parentId ? { ...sc, items: newItems } : sc
      );
  
      return { ...prev, storeCategories: updated };
    });
  };
  

  // 2) onToggleBrand
  const onToggleBrand = (parentId: string, brand: string) => {
    setForm((prev) => {

      const parentEntry = prev.storeCategories.find((sc) => sc.id === parentId);
  
      if (!parentEntry) {
        const parentData = mappedCategories.find((cat) => cat.id === parentId);
        return {
          ...prev,
          storeCategories: [
            ...prev.storeCategories,
            {
              id: parentId,
              name: parentData?.name ?? "",
              icon: parentData?.icon ?? "",
              allBrands: parentData?.allBrands ?? [],
              items: [],
              brands: [brand],
            },
          ],
        };
      }
  
      const existingBrands = parentEntry.allBrands ?? [];
      const alreadyExists = existingBrands.includes(brand);
      const newBrands = alreadyExists
        ? existingBrands.filter((b) => b !== brand)
        : [...existingBrands, brand];
  
      const updated = prev.storeCategories.map((sc) =>
        sc.id === parentId ? { ...sc, allBrands: newBrands } : sc
      );
  
      return { ...prev, storeCategories: updated };
    });
  };
  
  // 3) onBulkToggle
  const onBulkToggle = (ids: string[]) => {
    setForm((prev) => {
      // If ids is empty → clear everything
      if (ids.length === 0) {
        return { ...prev, storeCategories: [] };
      }

      // Build a set of only “child IDs,” ignoring any parent IDs
      const childIdSet = new Set<string>();
      for (const id of ids) {
        // Skip if this id matches a parent
        const isParent = mappedCategories.some((p) => p.id === id);
        if (!isParent) {
          childIdSet.add(id);
        }
      }

      // Now group those child IDs by parent
      const nextStoreCategories: SelectedCategory[] = [];
      for (const parent of mappedCategories) {
        // Which of this parent’s children appear in childIdSet?
        const matchedItemsKids = parent.items.filter((item) =>
          childIdSet.has(item.id)
        );
        if (matchedItemsKids.length === 0) {
          // None of this parent’s children selected → skip
          continue;
        }

        // If ALL children are selected (matchedKids.length === parent.children.length)
        // then we consider this a “full” select. Otherwise it’s “partial.”
        const allKidsSelected = matchedItemsKids.length === parent.items.length;

        const itemsToUse = allKidsSelected
          ? parent.items.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))
          : matchedItemsKids.map((c) => ({
              id: c.id,
              name: c.name,
              slug: c.slug,
            }));

        // Which of this parent’s children appear in childIdSet?
        const matchedBrandsKids = parent.allBrands && parent.allBrands.filter((brand) =>
          childIdSet.has(brand)
        );
        if (matchedBrandsKids?.length === 0) {
          // None of this parent’s children selected → skip
          continue;
        }

        // If ALL children are selected (matchedKids.length === parent.children.length)
        // then we consider this a “full” select. Otherwise it’s “partial.”
        const allBrandsSelected = matchedBrandsKids?.length === parent.allBrands?.length;

        const brandsToUse = allBrandsSelected ? parent.allBrands : matchedBrandsKids;

        nextStoreCategories.push({
          id: parent.id,
          name: parent.name,
          icon: parent.icon,
          items: itemsToUse,
          allBrands: brandsToUse,
        });
      }

      return { ...prev, storeCategories: nextStoreCategories };
    });
  };

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
              badgeText: ""
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
              badgeText: ""
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
        allSteps[stepIndex].render(form, handlers, mappedCategories)
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
                {/* {renderReviewContent(s.key, form)} */}
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

        {/* Step Info */}
        <header className="mb-4 text-center">
          <h1 className="text-2xl font-bold">{currentTitle}</h1>
        </header>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto bg-white p-6 shadow-md rounded-lg max-w-4xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={stepIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
            >
              <form onSubmit={handleSubmit}>{StepContent}</form>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="max-w-4xl w-full mx-auto pt-6 flex justify-between items-center">
          <button
            type="button"
            onClick={prev}
            disabled={stepIndex === 0}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md disabled:opacity-50"
          >
            Back
          </button>

          {stepIndex === totalSteps - 1 ? (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-md disabled:bg-green-300"
            >
              {isSubmitting ? "Submitting..." : "Finish & Submit"}
            </button>
          ) : (
            <button
              type="button"
              onClick={next}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md"
            >
              Next
            </button>
          )}
        </div>
      </main>
    </div>
  );
}