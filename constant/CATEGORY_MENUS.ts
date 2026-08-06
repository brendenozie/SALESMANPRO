import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  PresentationChartBarIcon,
  WrenchScrewdriverIcon,
  HeartIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  FilmIcon,
  CreditCardIcon,
  MegaphoneIcon,
  TicketIcon,
  BanknotesIcon,
  ChartPieIcon,
  HandRaisedIcon,
  KeyIcon,
  ListBulletIcon,
  NewspaperIcon,
  PhotoIcon,
  PuzzlePieceIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  ShoppingBagIcon,
  TagIcon,
  UserCircleIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon,
  CubeTransparentIcon,
  ClipboardDocumentCheckIcon,
  DocumentChartBarIcon,
  LifebuoyIcon,
  ServerStackIcon,
  StarIcon,
  VideoCameraIcon,
  QuestionMarkCircleIcon,
  ShieldCheckIcon,
  PlayCircleIcon,
  ArrowUturnLeftIcon,
  BellIcon,
  CurrencyDollarIcon,
  PencilSquareIcon,
  TruckIcon,
  BookOpenIcon,
  EyeIcon,
  ArrowsRightLeftIcon,
  BoltIcon,
  CameraIcon,
  ClockIcon,
  CubeIcon,
  ExclamationTriangleIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

// Define hierarchy of tiers with weights for comparison
const TIER_WEIGHTS: Record<string, number> = {
  "Ghuba Engage": 0,
  "Ghuba Free": 1,
  "Ghuba Starter": 2,
  "Ghuba Basic": 3,
  "Ghuba Growth": 4,
  "Ghuba Pro": 5,  
  "Ghuba Trial": 6,
};

export interface SubMenuItem {
  label: string;
  href: string;
  minTier?: string;
  accessLevel?: string[];
  isLocked?: boolean;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon: any;
  minTier?: string;
  accessLevel?: string[];
  subItems?: SubMenuItem[];
  isLocked?: boolean;
}

// Helper to filter items based on Tier and Access Level
// Helper to map items and flag them as locked if access is denied
const evaluateMenuItemsAccess = (
  items: MenuItem[],
  currentTier: string,
  isSubscriptionActive: boolean,
  userAccessLevel?: string,
): MenuItem[] => {
  const currentWeight = TIER_WEIGHTS[currentTier] ?? 1; //[cite: 2]

  return items.map((item) => {
    // 1. Lock if subscription is inactive, or if the tier requirement isn't met
    let itemLocked = !isSubscriptionActive;

    if (item.minTier) {
      const requiredWeight = TIER_WEIGHTS[item.minTier] ?? 1; //[cite: 2]
      if (currentWeight < requiredWeight) {
        itemLocked = true;
      }
    }

    // 2. Evaluate sub-items using the same logic
    const updatedSubItems = item.subItems?.map((sub) => {
      let subLocked = !isSubscriptionActive;

      if (sub.minTier) {
        const requiredWeight = TIER_WEIGHTS[sub.minTier] ?? 1; //[cite: 2]
        if (currentWeight < requiredWeight) {
          subLocked = true;
        }
      }
      return { ...sub, isLocked: subLocked };
    });

    return {
      ...item,
      isLocked: itemLocked,
      ...(updatedSubItems ? { subItems: updatedSubItems } : {}),
    };
  });
};

// Helper function to check if a navigation item should be locked
const checkIsLocked = (minTier: string, currentTier: string, isSubscriptionActive: boolean): boolean => {
  if (!isSubscriptionActive) return true;
  const userWeight = TIER_WEIGHTS[currentTier] ?? -1;
  const requiredWeight = TIER_WEIGHTS[minTier] ?? Infinity;
  return userWeight < requiredWeight;
};


// Helper to inject dynamic adminSlug and assign Tier requirements
const commonEcommerce = (
  adminSlug: string,
  accessLevel: string,
  currentTier: string,
  isSubscriptionActive: boolean,
): MenuItem[] => {
  const rawItems: MenuItem[] = [
    {
      label: "Dashboard",
      href: `/admin/${adminSlug}`,
      icon: HomeIcon,
      minTier: "Ghuba Starter",
      isLocked: false,
    },
    {
      label: "POS",
      href: `/admin/${adminSlug}/storepos`,
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Basic",
      isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
    },
    {
      label: "Categories",
      href: `/admin/${adminSlug}/categories`,
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Starter",
      isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
    },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Starter",
      subItems: [
        {
          label: "Browse Catalog",
          href: `/admin/${adminSlug}/inventory`,
          minTier: "Ghuba Starter",
          isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
        },
        {
          label: "Market List",
          href: `/admin/${adminSlug}/mymarketplace`,
          minTier: "Ghuba Basic",
          isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
        },
      ],
    },
    {
      label: "Users",
      icon: UsersIcon,
      minTier: "Ghuba Basic",
      subItems: [
        {
          label: "Sales Agents",
          href: `/admin/${adminSlug}/agents`,
          minTier: "Ghuba Growth",
          isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
        },
        {
          label: "Clients",
          href: `/admin/${adminSlug}/consumers`,
          minTier: "Ghuba Basic",
          isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
        },
      ],
    },
    {
      label: "leads",
      icon: UsersIcon,
      minTier: "Ghuba Growth",
      subItems: [
        {
          label: "All Leads",
          href: `/admin/${adminSlug}/salesleads`,
          minTier: "Ghuba Growth",
          isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
        },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      minTier: "Ghuba Starter",
      subItems: [
        {
          label: "Agent Orders",
          href: `/admin/${adminSlug}/agentorders`,
          minTier: "Ghuba Growth",
          isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
        },
        {
          label: "Marketplace",
          href: `/admin/${adminSlug}/customerorders`,
          minTier: "Ghuba Basic",
          isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
        },
        {
          label: "Delivery",
          href: `/admin/${adminSlug}/deliveries`,
          minTier: "Ghuba Growth",
          isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
        },
        {
          label: "Payments",
          href: `/admin/${adminSlug}/companyPaymentsDashboard`,
          minTier: "Ghuba Starter",
          isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
        },
      ],
    },
    {
      label: "Transport",
      href: `/admin/${adminSlug}/transport`,
      icon: HomeIcon,
      minTier: "Ghuba Pro",
      subItems: [
        {
          label: "Vehicles",
          href: `/admin/${adminSlug}/store-transport-vehicles`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Routes",
          href: `/admin/${adminSlug}/store-transport-routes`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Drivers",
          href: `/admin/${adminSlug}/store-transport-drivers`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Schedules",
          href: `/admin/${adminSlug}/store-transport-schedules`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Maintenance Records",
          href: `/admin/${adminSlug}/store-transport-maintenance-records`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Fuel Logs",
          href: `/admin/${adminSlug}/store-transport-fuel-logs`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Incidents",
          href: `/admin/${adminSlug}/store-transport-incidents`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
        {
          label: "Reports",
          href: `/admin/${adminSlug}/store-transport-reports`,
          minTier: "Ghuba Pro",
          isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
        },
      ],
    },
    {
      label: "Reports",
      href: `/admin/${adminSlug}/revenuereport`,
      icon: ChartBarIcon,
      minTier: "Ghuba Starter",
      isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
    },
    {
      label: "Blogs",
      href: `/admin/${adminSlug}/blogs`,
      icon: DocumentTextIcon,
      minTier: "Ghuba Starter",
      isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
    },
    {
      label: "gallery",
      href: `/admin/${adminSlug}/gallery`,
      icon: PhotoIcon,
      minTier: "Ghuba Starter",
      isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
    },
    {
      label: "Messages",
      href: `/admin/${adminSlug}/messages`,
      icon: ChatBubbleBottomCenterTextIcon,
      minTier: "Ghuba Basic",
      isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
    },
    {
      label: "Settings",
      href: `/admin/${adminSlug}/settings`,
      icon: Cog6ToothIcon,
      minTier: "Ghuba Starter",
      isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
    },
  ];

  return evaluateMenuItemsAccess(
    rawItems,
    currentTier,
    isSubscriptionActive,
    accessLevel,
  );
};

export const getCategoryMenus = (
  adminSlug: string,
  accessLevel: string,
  currentTier: string = "Ghuba Starter",
  isSubscriptionActive: boolean = false,
) => {
  const filterTiers = (items: MenuItem[]) =>
    evaluateMenuItemsAccess(
      items,
      currentTier,
      isSubscriptionActive,
      accessLevel,
    );

  return {
    "E-commerce": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Agrovet Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Baby Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Bike Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Book Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Cake Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Directory & Listings": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Earphones Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Fashion Shop": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Flowers Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Furniture Shop": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Gaming Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Glasses Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Groceries Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Hardware Shop": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Honey Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Meat Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Motorcycle Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Peanuts Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Pets Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Shoes Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Watch Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    "Automotive Store": commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),
    Marketplace: commonEcommerce(
      adminSlug,
      accessLevel,
      currentTier,
      isSubscriptionActive,
    ),

    Ghuba: filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
      {
        label: "Categories",
        href: `/admin/${adminSlug}/cated`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Site Categories",
        href: `/admin/${adminSlug}/site-categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locat`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Sample Listings Generator",
        href: `/admin/${adminSlug}/samplelistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Bulk Csv Upload For listings",
        href: `/admin/${adminSlug}/bulkcsvlistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Sample Image Upload For listings",
        href: `/admin/${adminSlug}/sync-images`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Backup And Restore",
        href: `/admin/${adminSlug}/db-management`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Marketplace Listings",
        href: `/admin/${adminSlug}/marketplace-gh`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Basic",
        isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Basic",
        isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Basic",
        isLocked:checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive)
      },
    ]),

    "Service Provider": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
            isLocked: checkIsLocked(
              "Ghuba Basic",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/service-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    "Booking & Appointments": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
            isLocked: checkIsLocked(
              "Ghuba Basic",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    "Real Estate": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Agents",
        href: `/admin/${adminSlug}/properties-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Properties",
        href: `/admin/${adminSlug}/properties`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/properties-inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/properties-showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/properties-offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    "Healthcare & Clinics": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/health-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked(
          "Ghuba Basic",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Patients",
        href: `/admin/${adminSlug}/health-patients`,
        icon: UsersIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/health-appointments`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Doctors",
        href: `/admin/${adminSlug}/health-doctors`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Staff",
        href: `/admin/${adminSlug}/health-staff`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/health-services`,
        icon: HeartIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Prescriptions",
        href: `/admin/${adminSlug}/health-prescriptions`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/health-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Inventory",
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Browse Catalog",
            href: `/admin/${adminSlug}/inventory`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
          {
            label: "Market List",
            href: `/admin/${adminSlug}/mymarketplace`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/health-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/health-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
    ]),

    Barbershop: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/booking-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
            isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
    ]),

    Drycleaning: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/booking-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
            isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
    ]),

    "Portfolio & Personal Branding": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/portfolio-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
            isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/reports`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
    ]),

    "Blog & Content": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Writers",
        href: `/admin/${adminSlug}/writers`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Podcast",
        href: `/admin/${adminSlug}/podcast`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Basic",
        isLocked: checkIsLocked("Ghuba Basic", currentTier, isSubscriptionActive),
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
          },
        ],
      },
      {
        label: "Comments",
        href: `/admin/${adminSlug}/comments`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive),
      },
    ]),

    // "Directory & Listings": commonEcommerce(adminSlug),

    // OLD PAth
    // "Directory & Listings": [
    //   { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    //   { label: "Listings", href: `/admin/${adminSlug}/listings`, icon: BuildingOfficeIcon },
    //   { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    //   { label: "Reviews", href: `/admin/${adminSlug}/reviews`, icon: ChatBubbleBottomCenterTextIcon },
    // ],

    "Educational & Online Courses": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Management",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Academic Years",
            href: `/admin/${adminSlug}/academic-years`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Terms/Semesters", href: `/admin/${adminSlug}/terms` },
          {
            label: "Departments",
            href: `/admin/${adminSlug}/departments`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Academic Levels",
            href: `/admin/${adminSlug}/academic-levels`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Classrooms",
            href: `/admin/${adminSlug}/classrooms`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Teachers",
            href: `/admin/${adminSlug}/teachers`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Parents",
            href: `/admin/${adminSlug}/parents`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Students",
            href: `/admin/${adminSlug}/students`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Courses",
            href: `/admin/${adminSlug}/courses`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Course Materials",
            href: `/admin/${adminSlug}/course-materials`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "TimeTable",
            href: `/admin/${adminSlug}/lessons`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Assignments",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "All Assignments",
            href: `/admin/${adminSlug}/assignments`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Submissions", href: `/admin/${adminSlug}/assignments-submissions` },
        ],
      },
      {
        label: "Exams/Assessments",
        icon: AcademicCapIcon,
        subItems: [
          {
            label: "Exam Categories",
            href: `/admin/${adminSlug}/exam-categories`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Exams",
            href: `/admin/${adminSlug}/exams`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Results", href: `/admin/${adminSlug}/results` },
          {
            label: "Grades & Report Card",
            href: `/admin/${adminSlug}/grading-report-card`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Attendance",
        href: `/admin/${adminSlug}/attendance`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Events",
        icon: AcademicCapIcon,
        subItems: [
          {
            label: "All Events",
            href: `/admin/${adminSlug}/school-events`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/schoolAnnouncements`,
        icon: AcademicCapIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Library",
        href: `/admin/${adminSlug}/library`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Categories",
            href: `/admin/${adminSlug}/library-books-categories`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Books",
            href: `/admin/${adminSlug}/library-books`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Members",
            href: `/admin/${adminSlug}/library-members`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Issuance Records",
            href: `/admin/${adminSlug}/library-issuance-records`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Returns",
            href: `/admin/${adminSlug}/library-returns`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Fines",
            href: `/admin/${adminSlug}/library-fines`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Maintenance",
            href: `/admin/${adminSlug}/library-maintenance`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reservations",
            href: `/admin/${adminSlug}/library-reservations`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Suppliers Categories",
            href: `/admin/${adminSlug}/library-suppliers-categories`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Suppliers",
            href: `/admin/${adminSlug}/library-suppliers`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Acquisitions",
            href: `/admin/${adminSlug}/library-acquisitions`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Inventory",
            href: `/admin/${adminSlug}/library-inventory`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/library-reports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/transport-vehicles`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Hostel",
        href: `/admin/${adminSlug}/hostel`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Blocks",
            href: `/admin/${adminSlug}/hostel-blocks`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Rooms",
            href: `/admin/${adminSlug}/hostel-rooms`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Residents",
            href: `/admin/${adminSlug}/hostel-residents`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Room Assignments",
            href: `/admin/${adminSlug}/hostel-room-assignments`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Maintenance Requests",
            href: `/admin/${adminSlug}/hostel-maintenance-requests`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Visitors",
            href: `/admin/${adminSlug}/hostel-visitors`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Fee Management", href: `/admin/${adminSlug}/hostel-fee-management` },
          // { label: "Inventory", href: `/admin/${adminSlug}/hostel-inventory` },
          {
            label: "Staff",
            href: `/admin/${adminSlug}/hostel-staff`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/hostel-reports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Staff",
        href: `/admin/${adminSlug}/staff`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Departments",
            href: `/admin/${adminSlug}/staff-departments`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Roles",
            href: `/admin/${adminSlug}/staff-roles`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Staff Members",
            href: `/admin/${adminSlug}/staff-members`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Attendance",
            href: `/admin/${adminSlug}/staff-attendance`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Payroll",
            href: `/admin/${adminSlug}/staff-payroll`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Leave Management",
            href: `/admin/${adminSlug}/staff-leave-management`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Performance Reviews",
            href: `/admin/${adminSlug}/staff-performance-reviews`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Recruitment",
            href: `/admin/${adminSlug}/staff-recruitment`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/staff-reports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "FEE Management",
        icon: BanknotesIcon,
        subItems: [
          // { label: "FEE Dashboard", href: `/admin/${adminSlug}/fee-dashboard` },
          // { label: "FEE Structure", href: `/admin/${adminSlug}/fee-structure` },
          {
            label: "FEE Structure",
            href: `/admin/${adminSlug}/fee-items`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "FEE Transactions",
            href: `/admin/${adminSlug}/fee`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Transactions", href: `/admin/${adminSlug}/fee-transactions` },
          // { label: "Invoices", href: `/admin/${adminSlug}/fee-invoices` },
          {
            label: "Expenses",
            href: `/admin/${adminSlug}/fee-expenses`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Profit & Loss",
            href: `/admin/${adminSlug}/fee-profit-loss`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Payment Methods", href: `/admin/${adminSlug}/fee-payment-methods` },
          // { label: "Discounts", href: `/admin/${adminSlug}/fee-discounts` },
          // { label: "Reports", href: `/admin/${adminSlug}/fee-reports` },
        ],
      },
      {
        label: "Inventory & Asset Manage",
        icon: HomeIcon,
        subItems: [
          {
            label: "Inventory Dashboard",
            href: `/admin/${adminSlug}/inventory-dashboard`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Assets Overview",
            href: `/admin/${adminSlug}/inventory-assets-overview`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Assets",
            href: `/admin/${adminSlug}/inventory-assets-list`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Asset Tracking",
            href: `/admin/${adminSlug}/asset-tracking`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Categories",
            href: `/admin/${adminSlug}/inventory-categories`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Inventory Items",
            href: `/admin/${adminSlug}/inventory-items`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Inventory Audits",
            href: `/admin/${adminSlug}/inventory-audits`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Suppliers",
            href: `/admin/${adminSlug}/inventory-suppliers`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Purchase Orders",
            href: `/admin/${adminSlug}/inventory-purchase-orders`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/inventory-maintenance-records`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Depreciation Schedules",
            href: `/admin/${adminSlug}/inventory-depreciation-schedules`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/inventory-reports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/school-reports`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    "Nonprofit & Community": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Donations",
        href: `/admin/${adminSlug}/donations`,
        icon: HeartIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Campaigns",
        href: `/admin/${adminSlug}/campaigns`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Donors",
        href: `/admin/${adminSlug}/donors`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/non-profit-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
            isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
          },
        ],
      },
      {
        label: "Members",
        href: `/admin/${adminSlug}/members`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Manage Events",
        href: `/admin/${adminSlug}/manage-events`,
        icon: TicketIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
    ]),

    "Company Portfolio": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",
        isLocked:checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive)
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/reports`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked:checkIsLocked("Ghuba Growth", currentTier, isSubscriptionActive)
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    "Restaurant & Food Delivery": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Products",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Browse Catalog",
            href: `/admin/${adminSlug}/inventory`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Market List",
            href: `/admin/${adminSlug}/mymarketplace`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Orders",
        href: `/admin/${adminSlug}/orders`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Delivery",
        href: `/admin/${adminSlug}/delivery`,
        icon: GlobeAltIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/store-transport-vehicles`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/store-transport-routes`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/store-transport-drivers`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/store-transport-schedules`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/store-transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/store-transport-fuel-logs`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/store-transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/store-transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/store-transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
    ]),

    "Event & Ticketing": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Manage Events",
        href: `/admin/${adminSlug}/manage-events`,
        icon: TicketIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Tickets",
        href: `/admin/${adminSlug}/manage-tickets`,
        icon: TicketIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Orders",
        href: `/admin/${adminSlug}/manage-event-orders`,
        icon: ShoppingBagIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Check-in",
        href: `/admin/${adminSlug}/manage-check-in`,
        icon: QrCodeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Attendees",
        href: `/admin/${adminSlug}/manage-attendees`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/company-pos`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Users",
        icon: UsersIcon,
        subItems: [
          {
            label: "Sales Agents",
            href: `/admin/${adminSlug}/agents`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    "Content Management": filterTiers([
      {
        label: "Pages",
        href: `/admin/${adminSlug}/pages`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // For static pages like About Us, Contact
      {
        label: "Blog Posts",
        href: `/admin/${adminSlug}/blog`,
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // If you have a blog
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // For site-wide announcements
      {
        label: "Media Library",
        href: `/admin/${adminSlug}/media`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Central place for images, videos
      {
        label: "Promotions",
        href: `/admin/${adminSlug}/promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // For discounts, promo codes
      {
        label: "Sponsors",
        href: `/admin/${adminSlug}/sponsors`,
        icon: HandRaisedIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // If events have sponsors
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
    ]),

    "User Management": filterTiers([
      {
        label: "Users",
        href: `/admin/${adminSlug}/users`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Manage all platform users
      {
        label: "Roles & Permissions",
        href: `/admin/${adminSlug}/roles`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // If you have different admin/organizer roles
      {
        label: "Organizers",
        href: `/admin/${adminSlug}/organizers`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Manage event organizers (if distinct from general users)
    ]),

    "Financials & Reports": filterTiers([
      {
        label: "Payouts",
        href: `/admin/${adminSlug}/payouts`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Track money paid out to organizers
      {
        label: "Transactions",
        href: `/admin/${adminSlug}/transactions`,
        icon: ReceiptPercentIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Detailed transaction logs
      {
        label: "Revenue Reports",
        href: `/admin/${adminSlug}/reports/revenue`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Sales Reports",
        href: `/admin/${adminSlug}/reports/sales`,
        icon: ChartPieIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    Settings: filterTiers([
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/settings/general`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Profile",
        href: `/admin/${adminSlug}/settings/profile`,
        icon: UserCircleIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Admin user profile settings
      {
        label: "Integrations",
        href: `/admin/${adminSlug}/settings/integrations`,
        icon: PuzzlePieceIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // API keys, third-party connections
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/settings/audit-log`,
        icon: ListBulletIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Track admin actions
    ]),

    // {
    //   category: "Content Management",
    //   items: [
    //     { label: "Blog Posts", href: `/admin/${adminSlug}/blog`, icon: NewspaperIcon }, // Manage articles, news, and updates
    //     { label: "Testimonials", href: `/admin/${adminSlug}/testimonials`, icon: StarIcon }, // Manage client reviews and testimonials
    //     { label: "FAQs", href: `/admin/${adminSlug}/faqs`, icon: QuestionMarkCircleIcon }, // Manage frequently asked questions
    //     { label: "Pages", href: `/admin/${adminSlug}/pages`, icon: DocumentIcon }, // Manage static pages (e.g., About Us, Contact)
    //   ],
    // },
    // {
    //   category: "Financial & Reports",
    //   items: [
    //     { label: "Transactions", href: `/admin/${adminSlug}/transactions`, icon: CreditCardIcon }, // View and manage financial transactions
    //     { label: "Commissions", href: `/admin/${adminSlug}/commissions`, icon: CurrencyDollarIcon }, // Track agent commissions
    //     { label: "Reports", href: `/admin/${adminSlug}/reports`, icon: ChartBarIcon }, // Generate various business reports (sales, agent performance)
    //     // The "POS" (Point of Sale) could be here if you have direct sales of other items,
    //     // but for real estate, it's less common unless you're selling related merchandise.
    //     // If it's for direct property sales/reservations, "Offers & Contracts" might be more suitable.
    //     // If still desired, you could place it here:
    //     // { label: "POS", href: `/admin/${adminSlug}/pos`, icon: ClipboardDocumentListIcon },
    //   ],
    // },
    // {
    //   category: "Settings & Administration",
    //   items: [
    //     { label: "Users & Roles", href: `/admin/${adminSlug}/users`, icon: KeyIcon }, // Manage admin users, permissions, and roles
    //     { label: "Site Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon }, // General website settings (branding, contact info)
    //     { label: "Notifications", href: `/admin/${adminSlug}/notifications`, icon: BellIcon }, // Manage notification settings
    //     { label: "Integrations", href: `/admin/${adminSlug}/integrations`, icon: PuzzlePieceIcon }, // Manage third-party integrations (e.g., CRM, email marketing)
    //   ],
    // },

    "SaaS & Web Apps": filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Backup And Restore",
        href: `/admin/${adminSlug}/db-management`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    Dashboards: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/cated`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Site Categories",
        href: `/admin/${adminSlug}/site-categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locat`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/salesleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/salesleadstatuses`,
          // },
        ],
      },
      {
        label: "Sample Listings Generator",
        href: `/admin/${adminSlug}/samplelistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Bulk Csv Upload For listings",
        href: `/admin/${adminSlug}/bulkcsvlistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Sample Image Upload For listings",
        href: `/admin/${adminSlug}/sync-images`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Backup And Restore",
        href: `/admin/${adminSlug}/db-management`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Marketplace Listings",
        href: `/admin/${adminSlug}/marketplace-gh`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    "Media & Entertainment": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Content Library", // Renamed for clarity
        href: `/admin/${adminSlug}/media-content`, // Unified content management
        icon: FilmIcon, // Covers both video and general media
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Article Management", // Specific for articles
        href: `/admin/${adminSlug}/blogs`, //media-articles
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery Management", // Specific for galleries
        href: `/admin/${adminSlug}/media-gallery`,
        icon: VideoCameraIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Video Management", // Specific for videos
        href: `/admin/${adminSlug}/media-videos`,
        icon: VideoCameraIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Publishing Schedule", // More descriptive
        href: `/admin/${adminSlug}/media-schedule`,
        icon: CalendarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "User Management", // Essential for any platform
        href: `/admin/${adminSlug}/media-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Featured & Top Picks", // For managing highlighted content
        href: `/admin/${adminSlug}/media-featured-picks`,
        icon: StarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Sponsors & Partnerships", // More descriptive
        href: `/admin/${adminSlug}/media-sponsors`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Analytics", // For insights
        href: `/admin/${adminSlug}/media-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
    ]),

    "Finance & Legal": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/finance-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage client feedback
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/finance-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage frequently asked questions
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        subItems: [{ label: "All Blogs", href: `/admin/${adminSlug}/blogs` }],
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/finance-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // General admin settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Experts/Team",
        href: `/admin/${adminSlug}/finance-team`,
        icon: ShieldCheckIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage experts/advisors
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/finance-appointments`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // For scheduling consultations
      {
        label: "Documents",
        href: `/admin/${adminSlug}/finance-documents`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Packages & Pricing",
        href: `/admin/${adminSlug}/finance-packages`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage consultation packages
      {
        label: "Cases & Matters",
        href: `/admin/${adminSlug}/finance-cases`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // For legal cases/financial matters
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/finance-invoices`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
    ]),

    Automotive: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      // { label: "Requests", href: `/admin/${adminSlug}/vehicle-requests`, icon: ClipboardDocumentListIcon },
      // { label: "Clients", href: `/admin/${adminSlug}/vehicle-clients`, icon: UsersIcon },
    ]),

    "Car Dealership": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      // { label: "Requests", href: `/admin/${adminSlug}/vehicle-requests`, icon: ClipboardDocumentListIcon },
      // { label: "Clients", href: `/admin/${adminSlug}/vehicle-clients`, icon: UsersIcon },
    ]),

    "Car Dealership 2": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      // { label: "Requests", href: `/admin/${adminSlug}/vehicle-requests`, icon: ClipboardDocumentListIcon },
      // { label: "Clients", href: `/admin/${adminSlug}/vehicle-clients`, icon: UsersIcon },
    ]),

    "Travel & Tourism": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Destinations",
        href: `/admin/${adminSlug}/travel-destinations`,
        icon: GlobeAltIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Packages & Tours",
        href: `/admin/${adminSlug}/travel-packages`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Listings",
        href: `/admin/${adminSlug}/travel-experiences`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Track and manage all property inquiries and messages
      {
        label: "Blog & Content",
        href: `/admin/${adminSlug}/blogs`,
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/travel-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/travel-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Users",
        href: `/admin/${adminSlug}/travel-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Schedule and manage property viewings
      {
        label: "Travel Experts",
        href: `/admin/${adminSlug}/travel-experts`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/travel-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/travel-promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/travel-transport-vehicles`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Bookings",
        href: `/admin/${adminSlug}/travel-bookings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
    ]),

    "Property Management": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overall view of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Properties",
        href: `/admin/${adminSlug}/properties`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Schedule and manage property viewings
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/properties-inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Track and manage all property inquiries and messages
      {
        label: "Media Library",
        href: `/admin/${adminSlug}/properties-media`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Central place for property images, videos, and virtual tour media
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/properties-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage client testimonials for properties
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/properties-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage frequently asked questions related to properties
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/properties-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // General administrative settings
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/properties-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Property Units",
        // href: `/admin/${adminSlug}/hostel`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Blocks",
            href: `/admin/${adminSlug}/property-blocks`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Rooms",
            href: `/admin/${adminSlug}/property-rooms`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Residents",
            href: `/admin/${adminSlug}/property-residents`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Room Assignments",
            href: `/admin/${adminSlug}/property-room-assignments`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Maintenance Requests",
            href: `/admin/${adminSlug}/property-maintenance-requests`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Visitors",
            href: `/admin/${adminSlug}/property-visitors`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Fee Management",
            href: `/admin/${adminSlug}/property-fee-management`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Inventory", href: `/admin/${adminSlug}/property-inventory` },
          {
            label: "Staff",
            href: `/admin/${adminSlug}/property-staff`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/property-reports`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/properties-showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/properties-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage virtual tour content for listings
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/properties-promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Create and manage discounts, special offers for listings
      {
        label: "Reports",
        href: `/admin/${adminSlug}/properties-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Generate various reports (sales, agent performance, market trends)
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/properties-offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
    ]),

    "Fitness & Wellness": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overview of gym activity
      {
        label: "POS & Sales",
        href: `/admin/${adminSlug}/fitness-pos`,
        icon: CurrencyDollarIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Point of Sale and transaction management
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Programs",
        href: `/admin/${adminSlug}/fitness-listings`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage fitness programs, classes, schedules
      {
        label: "Classes",
        href: `/admin/${adminSlug}/fitness-classes`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage fitness programs, classes, schedules
      {
        label: "Trainers & Staff",
        href: `/admin/${adminSlug}/fitness-trainers`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage trainer profiles, availability
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/fitness-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // General administrative settings, user roles
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients & Members",
      //   href: `/admin/${adminSlug}/fitness-clients`,
      //   icon: UsersIcon,
      // }, // Manage client accounts, memberships, progress
      {
        label: "Locations & Facilities",
        href: `/admin/${adminSlug}/fitness-locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage physical gym locations, equipment, rooms
      {
        label: "Notifications & Comms",
        href: `/admin/${adminSlug}/fitness-notifications`,
        icon: BellIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Send announcements, newsletters, client messages
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/fitness-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Reports & Analytics",
        href: `/admin/${adminSlug}/fitness-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // View performance metrics, sales reports
      {
        label: "Bookings & Schedule",
        href: `/admin/${adminSlug}/fitness-bookings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // Manage class and personal training bookings
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
    ]),

    // You could also categorize into more specific sections if the admin grows
    "Marketing & Engagement": filterTiers([
      {
        label: "Content Management",
        href: `/admin/${adminSlug}/content`,
        icon: PencilSquareIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Blog posts, articles, website content
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/promotions`,
        icon: TagIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Create and manage discounts, special offers
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Manage client testimonials
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      }, // Manage frequently asked questions
    ]),

    "Billing & Finance": filterTiers([
      {
        label: "Invoices",
        href: `/admin/${adminSlug}/invoices`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/payments`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
      {
        label: "Refunds",
        href: `/admin/${adminSlug}/refunds`,
        icon: ArrowUturnLeftIcon,
        minTier: "Ghuba Starter",
        isLocked:checkIsLocked("Ghuba Starter", currentTier, isSubscriptionActive)
      },
    ]),

    "Consultant & Coach": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overview of key metrics
      {
        label: "Programs & Courses",
        icon: BookOpenIcon, // Icon for a book or learning
        subItems: [
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
            // icon: ClipboardDocumentListIcon,
          },
          {
            label: "Ebooks",
            href: `/admin/${adminSlug}/ebooks`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Programs",
            href: `/admin/${adminSlug}/programs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Course Builder", href: `/admin/${adminSlug}/course-builder` },
          // { label: "Content Library", href: `/admin/${adminSlug}/content-library` },
          // { label: "Resource Downloads", href: `/admin/${adminSlug}/resources` },
        ],
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Icon for gear/settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients",
      //   icon: UsersIcon, // Icon for people/groups
      //   subItems: [
      //     { label: "Client List", href: `/admin/${adminSlug}/clients` },
      //     // { label: "Leads/Prospects", href: `/admin/${adminSlug}/leads` },
      //     // { label: "Client History", href: `/admin/${adminSlug}/client-history` },
      //   ],
      // },
      {
        label: "Reports & Analytics",
        href: `/admin/${adminSlug}/analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Icon for charts/graphs
      {
        label: "Messaging",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Icon for chat/messages
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/appointments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      // { label: "Schedule & Booking", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon }, // Icon for a calendar
      // {
      //   label: "Payments & Invoicing",
      //   icon: CurrencyDollarIcon, // Icon for money/finance
      //   subItems: [
      //     { label: "Invoices", href: `/admin/${adminSlug}/invoices` },
      //     { label: "Subscriptions", href: `/admin/${adminSlug}/subscriptions` },
      //     { label: "Payment History", href: `/admin/${adminSlug}/payments` },
      //   ],
      // },
    ]),

    "Public Speaking": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overview of key metrics
      {
        label: "Programs & Courses",
        icon: BookOpenIcon, // Icon for a book or learning
        subItems: [
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Ebooks",
            href: `/admin/${adminSlug}/ebooks`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Programs",
            href: `/admin/${adminSlug}/programs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Course Builder", href: `/admin/${adminSlug}/course-builder` },
          // { label: "Content Library", href: `/admin/${adminSlug}/content-library` },
          // { label: "Resource Downloads", href: `/admin/${adminSlug}/resources` },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Icon for gear/settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserCircleIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients",
      //   icon: UsersIcon, // Icon for people/groups
      //   subItems: [
      //     { label: "Client List", href: `/admin/${adminSlug}/clients` },
      //     // { label: "Leads/Prospects", href: `/admin/${adminSlug}/leads` },
      //     // { label: "Client History", href: `/admin/${adminSlug}/client-history` },
      //   ],
      // },
      {
        label: "Messaging",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Icon for chat/messages
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/appointments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      // { label: "Schedule & Booking", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon }, // Icon for a calendar
      // {
      //   label: "Payments & Invoicing",
      //   icon: CurrencyDollarIcon, // Icon for money/finance
      //   subItems: [
      //     { label: "Invoices", href: `/admin/${adminSlug}/invoices` },
      //     { label: "Subscriptions", href: `/admin/${adminSlug}/subscriptions` },
      //     { label: "Payment History", href: `/admin/${adminSlug}/payments` },
      //   ],
      // },
      // { label: "Reports & Analytics", href: `/admin/${adminSlug}/analytics`, icon: ChartBarIcon }, // Icon for charts/graphs
    ]),

    // "Security Services":[
    //   { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    //   { label: "Clients", href: `/admin/${adminSlug}/security-clients`, icon: UsersIcon },
    //   { label: "Security Personnel", href: `/admin/${adminSlug}/security-personnel`, icon: ShieldCheckIcon },
    //   { label: "Service Requests", href: `/admin/${adminSlug}/security-requests`, icon: ClipboardDocumentListIcon },
    //   { label: "Schedules & Assignments", href: `/admin/${adminSlug}/security-schedules`, icon: CalendarDaysIcon },
    //   { label: "Incidents & Reports", href: `/admin/${adminSlug}/security-incidents`, icon: DocumentTextIcon },
    //   { label: "Billing & Invoices", href: `/admin/${adminSlug}/security-billing`, icon: CreditCardIcon },
    //   { label: "Equipment & Inventory", href: `/admin/${adminSlug}/security-equipment`, icon: CubeTransparentIcon },
    //   { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    //   { label: "Settings", href: `/admin/${adminSlug}/security-settings`, icon: Cog6ToothIcon },
    // ],

    Security: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overview of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients",
      //   href: `/admin/${adminSlug}/finance-clients`,
      //   icon: UsersIcon,
      // },
      {
        label: "Experts/Team",
        href: `/admin/${adminSlug}/finance-team`,
        icon: ShieldCheckIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage experts/advisors
      // { label: "Cases & Matters", href: `/admin/${adminSlug}/finance-cases`, icon: BriefcaseIcon }, // For legal cases/financial matters
      {
        label: "Documents",
        href: `/admin/${adminSlug}/finance-documents`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/finance-appointments`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      }, // For scheduling consultations
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/finance-invoices`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // More explicit name
      {
        label: "Packages & Pricing",
        href: `/admin/${adminSlug}/finance-packages`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage consultation packages
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/finance-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage client feedback
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/finance-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Manage frequently asked questions
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/finance-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // General admin settings
    ]),

    "Delivery & Logistics": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      }, // Overview of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Services",
        icon: ClipboardDocumentListIcon,
        href: `/admin/${adminSlug}/services`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      // {
      //   label: "Bookings",
      //   href: `/admin/${adminSlug}/appointments`,
      //   icon: UsersIcon,
      // },
      {
        label: "Orders",
        icon: UsersIcon,
        subItems: [
          // { label: "Agent Orders", href: `/admin/${adminSlug}/agentorders` },
          // { label: "Client Orders", href: `/admin/${adminSlug}/clientorders` },
          {
            label: "Marketplace",
            href: `/admin/${adminSlug}/customerorders`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Delivery",
            href: `/admin/${adminSlug}/deliveries`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/store-transport-vehicles`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/store-transport-routes`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/store-transport-drivers`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/store-transport-schedules`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/store-transport-maintenance-records`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/store-transport-fuel-logs`,
            minTier: "Ghuba Growth",
            isLocked: checkIsLocked(
              "Ghuba Growth",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/store-transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/store-transport-incidents`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/store-transport-reports`,
            minTier: "Ghuba Pro",
            isLocked: checkIsLocked(
              "Ghuba Pro",
              currentTier,
              isSubscriptionActive,
            ),
          },
        ],
      },
      // {
      //   label: "Drivers & Personnel",
      //   href: `/admin/${adminSlug}/logistics-drivers`,
      //   icon: UsersIcon,
      // },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients",
      //   href: `/admin/${adminSlug}/logistics-clients`,
      //   icon: UserGroupIcon,
      // },
      // {
      //   label: "Vehicles & Fleet",
      //   href: `/admin/${adminSlug}/logistics-vehicles`,
      //   icon: TruckIcon,
      // },
      // {
      //   label: "Routes & Schedules",
      //   href: `/admin/${adminSlug}/logistics-routes`,
      //   icon: MapPinIcon,
      // },
      {
        label: "Inquirys & Requests",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Shipments & Orders",
        href: `/admin/${adminSlug}/logistics-shipments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Tracking & Status",
        href: `/admin/${adminSlug}/logistics-tracking`,
        icon: EyeIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/logistics-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Reports & Analytics",
        href: `/admin/${adminSlug}/logistics-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    "Social Media Manager": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
            isLocked: checkIsLocked(
              "Ghuba Starter",
              currentTier,
              isSubscriptionActive,
            ),
          },
          // { label: "Lead Bulk", href: `/admin/${adminSlug}/salesleads/imports` },
          // { label: "Add New Lead", href: `/admin/${adminSlug}/salesleads/new` },
          // { label: "Lead Sources", href: `/admin/${adminSlug}/saasleadsources` },
          // {
          //   label: "Lead Statuses",
          //   href: `/admin/${adminSlug}/saasleadstatuses`,
          // },
        ],
      },
      // {
      //   label: "Clients & Accounts",
      //   href: `/admin/${adminSlug}/social-clients`,
      //   icon: UsersIcon,
      // },
      {
        label: "Content Calendar",
        href: `/admin/${adminSlug}/social-calendar`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Post Management",
        href: `/admin/${adminSlug}/social-posts`,
        icon: PencilSquareIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Analytics & Reports",
        href: `/admin/${adminSlug}/social-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
        isLocked: checkIsLocked("Ghuba Pro", currentTier, isSubscriptionActive),
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Messages & Engagement",
        href: `/admin/${adminSlug}/social-messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
        isLocked: checkIsLocked(
          "Ghuba Growth",
          currentTier,
          isSubscriptionActive,
        ),
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/social-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
        isLocked: checkIsLocked(
          "Ghuba Starter",
          currentTier,
          isSubscriptionActive,
        ),
      },
    ]),

    SCHOOL_DRIVER: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },

      // Trips & Routes
      {
        label: "My Routes",
        href: `/admin/${adminSlug}/school-driver-routes`,
        icon: MapIcon,
      }, //today-trips
      // { label: "Today's Trips", href: `/admin/${adminSlug}/school-driver-trips/today`, icon: ClockIcon },
      {
        label: "Trip History",
        href: `/admin/${adminSlug}/school-driver-trips/history`,
        icon: CalendarIcon,
      },

      // Students
      // { label: "Assigned Students", href: `/admin/${adminSlug}/school-driver-students`, icon: UsersIcon },
      // { label: "Attendance", href: `/admin/${adminSlug}/school-driver-attendance`, icon: ClipboardDocumentCheckIcon },

      // Vehicle
      {
        label: "Vehicle Details",
        href: `/admin/${adminSlug}/school-driver-vehicle`,
        icon: TruckIcon,
      },
      // { label: "Fuel & Mileage", href: `/admin/${adminSlug}/school-driver-vehicle/fuel`, icon: BoltIcon },
      // { label: "Maintenance Logs", href: `/admin/${adminSlug}/school-driver-vehicle/maintenance`, icon: WrenchScrewdriverIcon },

      // Safety & Communication
      // { label: "Live Tracking", href: `/admin/${adminSlug}/school-driver-tracking`, icon: MapPinIcon },
      {
        label: "Incidents & Reports",
        href: `/admin/${adminSlug}/school-driver-incidents`,
        icon: ExclamationTriangleIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/school-driver-messages`,
        icon: ChatBubbleLeftRightIcon,
      },

      // Profile
      {
        label: "My Profile",
        href: `/admin/${adminSlug}/school-driver-profile`,
        icon: UserCircleIcon,
      },
    ]),

    STORE_DRIVER: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },

      // Deliveries
      {
        label: "Assigned Deliveries",
        href: `/admin/${adminSlug}/deliveries`,
        icon: CubeIcon,
      },
      {
        label: "Today's Deliveries",
        href: `/admin/${adminSlug}/deliveries/today`,
        icon: ClockIcon,
      },
      {
        label: "Delivery History",
        href: `/admin/${adminSlug}/deliveries/history`,
        icon: CalendarIcon,
      },

      // Orders
      {
        label: "Order Details",
        href: `/admin/${adminSlug}/orders`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Proof of Delivery",
        href: `/admin/${adminSlug}/deliveries/proof`,
        icon: CameraIcon,
      },

      // Navigation
      { label: "Live Map", href: `/admin/${adminSlug}/map`, icon: MapIcon },
      {
        label: "Route Optimization",
        href: `/admin/${adminSlug}/routes/optimize`,
        icon: ArrowsRightLeftIcon,
      },

      // Vehicle
      {
        label: "Vehicle Status",
        href: `/admin/${adminSlug}/vehicle`,
        icon: TruckIcon,
      },
      {
        label: "Fuel & Mileage",
        href: `/admin/${adminSlug}/vehicle/fuel`,
        icon: BoltIcon,
      },

      // Earnings & Performance
      {
        label: "Earnings",
        href: `/admin/${adminSlug}/earnings`,
        icon: BanknotesIcon,
      },
      {
        label: "Performance",
        href: `/admin/${adminSlug}/performance`,
        icon: ChartBarIcon,
      },

      // Profile
      {
        label: "My Profile",
        href: `/admin/${adminSlug}/profile`,
        icon: UserCircleIcon,
      },
    ]),

    //Old PAths
    // "Marketplace": [
    //   { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    //   { label: "POS", href: `/admin/${adminSlug}/pos`, icon: ClipboardDocumentListIcon },
    //   { label: "Vendors", href: `/admin/${adminSlug}/vendors`, icon: UsersIcon },
    //   { label: "Products", href: `/admin/${adminSlug}/products`, icon: ClipboardDocumentListIcon },
    //   { label: "Orders", href: `/admin/${adminSlug}/orders`, icon: UsersIcon },
    // ],

    Tutor: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      // {
      //   label: "My Classes",
      //   icon: ClipboardDocumentListIcon,
      //   subItems: [
      //     { label: "Assigned Classes", href: `/admin/${adminSlug}/teacherclasslist` },
      //     { label: "Assigned Subjects", href: `/admin/${adminSlug}/teachersubjectlist` },
      //     { label: "Assignments", href: `/admin/${adminSlug}/teacherassignments` },
      //     { label: "Materials", href: `/admin/${adminSlug}/teachermaterials` },
      //   ],
      // },
      // {
      //   label: "Students",
      //   icon: UsersIcon,
      //   subItems: [
      //     { label: "Student List", href: `/admin/${adminSlug}/teacherstudents` },
      //     { label: "Grades & Feedback", href: `/admin/${adminSlug}/teachergrades` },
      //     { label: "Attendance", href: `/admin/${adminSlug}/teacherattendance` },
      //   ],
      // },
      {
        label: "Assigned Classes",
        href: `/admin/${adminSlug}/teacherclasslist`,
        icon: UsersIcon,
      },
      {
        label: "Assigned Subjects",
        href: `/admin/${adminSlug}/teachersubjectlist`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Schedule",
        href: `/admin/${adminSlug}/teacherschedule`,
        icon: CalendarIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
    ]),

    Lecturer: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Assigned Classes",
        href: `/admin/${adminSlug}/teacherclasslist`,
        icon: UsersIcon,
      },
      {
        label: "Assigned Subjects",
        href: `/admin/${adminSlug}/teachersubjectlist`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Schedule",
        href: `/admin/${adminSlug}/teacherschedule`,
        icon: CalendarIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
      // {
      //   label: "My Classes",
      //   icon: ClipboardDocumentListIcon,
      //   subItems: [
      //     { label: "Class List", href: `/admin/${adminSlug}/teacherclasseslist` },
      //     { label: "Assignments", href: `/admin/${adminSlug}/teacherassignments` },
      //     { label: "Materials", href: `/admin/${adminSlug}/teachermaterials` },
      //   ],
      // },
      // {
      //   label: "Students",
      //   icon: UsersIcon,
      //   subItems: [
      //     { label: "Student List", href: `/admin/${adminSlug}/students` },
      //     { label: "Grades & Feedback", href: `/admin/${adminSlug}/grades` },
      //     { label: "Attendance", href: `/admin/${adminSlug}/attendance` },
      //   ],
      // },
      // { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
      // { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
      // { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
    ]),

    Teacher: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Assigned Classes",
        href: `/admin/${adminSlug}/teacherclasslist`,
        icon: UsersIcon,
      },
      {
        label: "Assigned Subjects",
        href: `/admin/${adminSlug}/teachersubjectlist`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Schedule",
        href: `/admin/${adminSlug}/teacherschedule`,
        icon: CalendarIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
      // {
      //   label: "My Classes",
      //   icon: ClipboardDocumentListIcon,
      //   subItems: [
      //     { label: "Class List", href: `/admin/${adminSlug}/teacherclasseslist` },
      //     { label: "Assignments", href: `/admin/${adminSlug}/teacherassignments` },
      //     { label: "Materials", href: `/admin/${adminSlug}/teachermaterials` },
      //   ],
      // },
      // {
      //   label: "Students",
      //   icon: UsersIcon,
      //   subItems: [
      //     { label: "Student List", href: `/admin/${adminSlug}/teacherstudents` },
      //     { label: "Grades & Feedback", href: `/admin/${adminSlug}/teachergrades` },
      //     { label: "Attendance", href: `/admin/${adminSlug}/teacherattendance` },
      //   ],
      // },
      // { label: "Schedule", href: `/admin/${adminSlug}/teacherschedule`, icon: CalendarIcon },
      // { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
      // { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
    ]),

    Student: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "My Classes",
        href: `/admin/${adminSlug}/studentclasses`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Assignments",
        href: `/admin/${adminSlug}/studentassignments`,
        icon: DocumentTextIcon,
      },
      {
        label: "Grades",
        href: `/admin/${adminSlug}/studentgrades`,
        icon: ChartBarIcon,
      },
      {
        label: "Schedule",
        href: `/admin/${adminSlug}/studentschedule`,
        icon: CalendarIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/studentmessages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Resources",
        href: `/admin/${adminSlug}/studentresources`,
        icon: PresentationChartBarIcon,
      },
    ]),

    Pupil: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "My Classes",
        href: `/admin/${adminSlug}/studentclasses`,
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Assignments",
        href: `/admin/${adminSlug}/studentassignments`,
        icon: DocumentTextIcon,
      },
      {
        label: "Grades",
        href: `/admin/${adminSlug}/studentgrades`,
        icon: ChartBarIcon,
      },
      {
        label: "Schedule",
        href: `/admin/${adminSlug}/studentschedule`,
        icon: CalendarIcon,
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/studentmessages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Resources",
        href: `/admin/${adminSlug}/studentresources`,
        icon: PresentationChartBarIcon,
      },
    ]),

    Parent: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "My Children",
        href: `/admin/${adminSlug}/parentchildren`,
        icon: UsersIcon,
      },
      // { label: "Child Assignments", href: `/admin/${adminSlug}/parentassignments`, icon: DocumentTextIcon },
      // { label: "Child Grades", href: `/admin/${adminSlug}/parentgrades`, icon: ChartBarIcon },
      // { label: "Schedule", href: `/admin/${adminSlug}/parentschedule`, icon: CalendarIcon },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/parentmessages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Resources",
        href: `/admin/${adminSlug}/parentresources`,
        icon: PresentationChartBarIcon,
      },
    ]),

    "School Head": filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Management",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Teachers", href: `/admin/${adminSlug}/teachers` },
          { label: "Students", href: `/admin/${adminSlug}/students` },
          { label: "Classes", href: `/admin/${adminSlug}/classes` },
        ],
      },
      {
        label: "Reports",
        icon: ChartBarIcon,
        subItems: [
          {
            label: "Attendance Report",
            href: `/admin/${adminSlug}/reports/attendance`,
          },
          {
            label: "Performance",
            href: `/admin/${adminSlug}/reports/performance`,
          },
        ],
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
    ]),

    "Head Teacher": filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Management",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Teachers", href: `/admin/${adminSlug}/teachers` },
          { label: "Students", href: `/admin/${adminSlug}/students` },
          { label: "Classes", href: `/admin/${adminSlug}/classes` },
        ],
      },
      {
        label: "Reports",
        icon: ChartBarIcon,
        subItems: [
          {
            label: "Attendance Report",
            href: `/admin/${adminSlug}/reports/attendance`,
          },
          {
            label: "Performance",
            href: `/admin/${adminSlug}/reports/performance`,
          },
        ],
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
    ]),

    Other: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
      },
    ]),
  };
};
