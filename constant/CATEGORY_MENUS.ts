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
  SparklesIcon,
  MapIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";

// Define hierarchy of tiers with weights for comparison
// 1. Define hierarchy ONLY for paid/tiered plans (Lowest to Highest)
// Free and Trial are handled separately as all-access passes.
const TIER_WEIGHTS: Record<string, number> = {
  "Ghuba Basic": 1,
  "Ghuba Starter": 2,
  "Ghuba Pro": 3,
  "Ghuba Growth": 4,
};

// 2. Centralized Evaluation Function
// Helper to filter items based on Tier and Access Level
// Helper to map items and flag them as locked if access is denied

export interface SubMenuItem {
  label: string;
  href: string;
  minTier?: string;
  accessLevel?: string[];
  isLocked?: boolean;
  requiredTier?: string;
}

export interface MenuItem {
  label: string;
  href?: string;
  icon: any;
  minTier?: string;
  accessLevel?: string[];
  subItems?: SubMenuItem[];
  isLocked?: boolean;
  requiredTier?: string;
}

// Centralized Evaluation Function
const evaluateMenuItemsAccess = (
  items: MenuItem[],
  currentTier: string,
  isSubscriptionActive: boolean,
  userAccessLevel?: string,
): MenuItem[] => {
  const hasUnlimitedAccess =
    isSubscriptionActive &&
    (currentTier === "Ghuba Free" || currentTier === "Ghuba Trial");

  const currentWeight = TIER_WEIGHTS[currentTier] ?? 0;

  return items.map((item) => {
    let itemLocked = false;
    const requiredTier = item.minTier ?? "Ghuba Basic";

    if (!hasUnlimitedAccess) {
      if (!isSubscriptionActive) {
        itemLocked = true;
      } else if (item.minTier) {
        const requiredWeight = TIER_WEIGHTS[item.minTier] ?? 0;
        if (currentWeight < requiredWeight) {
          itemLocked = true;
        }
      }
    }

    const updatedSubItems = item.subItems?.map((sub) => {
      let subLocked = false;
      const subRequiredTier = sub.minTier ?? "Ghuba Basic";

      if (!hasUnlimitedAccess) {
        if (!isSubscriptionActive) {
          subLocked = true;
        } else if (sub.minTier) {
          const requiredWeight = TIER_WEIGHTS[sub.minTier] ?? 0;
          if (currentWeight < requiredWeight) {
            subLocked = true;
          }
        }
      }

      return {
        ...sub,
        isLocked: subLocked,
        requiredTier: subLocked ? subRequiredTier : undefined,
      };
    });

    return {
      ...item,
      isLocked: itemLocked,
      requiredTier: itemLocked ? requiredTier : undefined,
      ...(updatedSubItems ? { subItems: updatedSubItems } : {}),
    };
  });
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
    },
    {
      label: "Website Builder",
      href: `/admin/${adminSlug}/website-builder`,
      icon: GlobeAltIcon,
      minTier: "Ghuba Starter",
    },
    {
      label: "POS",
      href: `/admin/${adminSlug}/storepos`,
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Basic",
    },
    {
      label: "Categories",
      href: `/admin/${adminSlug}/categories`,
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Starter",
    },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      minTier: "Ghuba Starter",
      subItems: [
        {
          label: "Browse Catalog",
          href: `/admin/${adminSlug}/inventory`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Market List",
          href: `/admin/${adminSlug}/mymarketplace`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Product Analytics",
          href: `/admin/${adminSlug}/analytics`,
          minTier: "Ghuba Starter",
        },
        {
          label: "Search Demand",
          href: `/admin/${adminSlug}/search-analytics`,
          minTier: "Ghuba Starter",
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
        },
        {
          label: "Clients",
          href: `/admin/${adminSlug}/consumers`,
          minTier: "Ghuba Basic",
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
        },
        {
          label: "Marketplace",
          href: `/admin/${adminSlug}/customerorders`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Delivery",
          href: `/admin/${adminSlug}/deliveries`,
          minTier: "Ghuba Growth",
        },
        {
          label: "Payments",
          href: `/admin/${adminSlug}/companyPaymentsDashboard`,
          minTier: "Ghuba Starter",
        },
      ],
    },
    {
      label: "Invoices",
      href: `/admin/${adminSlug}/invoices`,
      icon: DocumentTextIcon,
      minTier: "Ghuba Basic",
    },
    {
      label: "Finance & Accounts",
      icon: BanknotesIcon,
      minTier: "Ghuba Basic",
      subItems: [
        {
          label: "Finance Hub",
          href: `/admin/${adminSlug}/finance`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Profit & Loss (P&L)",
          href: `/admin/${adminSlug}/finance?tab=pnl`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Cash Flow Statement",
          href: `/admin/${adminSlug}/finance?tab=cashflow`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Operating Expenses",
          href: `/admin/${adminSlug}/finance?tab=expenses`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Accounts Receivable",
          href: `/admin/${adminSlug}/finance?tab=receivables`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Accounts Payable",
          href: `/admin/${adminSlug}/finance?tab=payables`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Tax / VAT Summary",
          href: `/admin/${adminSlug}/finance?tab=tax`,
          minTier: "Ghuba Basic",
        },
      ],
    },
    {
      label: "Procurement",
      icon: TruckIcon,
      minTier: "Ghuba Starter",
      subItems: [
        {
          label: "Purchase Orders",
          href: `/admin/${adminSlug}/inventory-purchase-orders`,
          minTier: "Ghuba Starter",
        },
        {
          label: "Suppliers Directory",
          href: `/admin/${adminSlug}/inventory-suppliers`,
          minTier: "Ghuba Starter",
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
        },
        {
          label: "Routes",
          href: `/admin/${adminSlug}/store-transport-routes`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Drivers",
          href: `/admin/${adminSlug}/store-transport-drivers`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Schedules",
          href: `/admin/${adminSlug}/store-transport-schedules`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Maintenance Records",
          href: `/admin/${adminSlug}/store-transport-maintenance-records`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Fuel Logs",
          href: `/admin/${adminSlug}/store-transport-fuel-logs`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Incidents",
          href: `/admin/${adminSlug}/store-transport-incidents`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Reports",
          href: `/admin/${adminSlug}/store-transport-reports`,
          minTier: "Ghuba Pro",
        },
      ],
    },
    {
      label: "WhatsApp Engine",
      // href: `/admin/${adminSlug}/whatsapp-inbox`,
      icon: ChatBubbleLeftRightIcon,
      minTier: "Ghuba Pro",
      subItems: [
        {
          label: "Live Inbox",
          href: `/admin/${adminSlug}/whatsapp-inbox`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Conversations & Logs",
          href: `/admin/${adminSlug}/whatsapp-conversations`,
          minTier: "Ghuba Pro",
        },
        {
          label: "Templates & Broadcasts",
          href: `/admin/${adminSlug}/whatsapp-templates`,
          minTier: "Ghuba Pro",
        },
        {
          label: "AI Automation & Rules",
          href: `/admin/${adminSlug}/whatsapp-settings`,
          minTier: "Ghuba Pro",
        },
      ],
    },
    {
      label: "AI Studio & Media",
      icon: SparklesIcon,
      minTier: "Ghuba Basic",
      subItems: [
        {
          label: "AI Workforce (28 Agents)",
          href: `/admin/${adminSlug}/ai-workforce`,
          minTier: "Ghuba Basic",
        },
        {
          label: "AI Studio (Full Suite)",
          href: `/admin/${adminSlug}/ai-studio`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Image Generation",
          href: `/admin/${adminSlug}/ai-images`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Video Generation",
          href: `/admin/${adminSlug}/ai-videos`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Generated Library",
          href: `/admin/${adminSlug}/ai-media-library`,
          minTier: "Ghuba Basic",
        },
        {
          label: "AI Wallet & Settings",
          href: `/admin/${adminSlug}/ai-settings`,
          minTier: "Ghuba Basic",
        },
      ],
    },
    {
      label: "Social Media AI",
      icon: ShareIcon,
      minTier: "Ghuba Basic",
      subItems: [
        {
          label: "Marketing Command Center",
          href: `/admin/${adminSlug}/social`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Content Calendar",
          href: `/admin/${adminSlug}/social/calendar`,
          minTier: "Ghuba Basic",
        },
        {
          label: "Social Analytics",
          href: `/admin/${adminSlug}/social/analytics`,
          minTier: "Ghuba Basic",
        },
      ],
    },
    {
      label: "Ads & Marketing",
      icon: CurrencyDollarIcon,
      minTier: "Ghuba Pro",
      href: `/admin/${adminSlug}/ads`,
    },
    {
      label: "Email",
      icon: HomeIcon,
      href: `/admin/${adminSlug}/email`,
      minTier: "Ghuba Basic",
    },
    {
      label: "Etims",
      href: `/admin/${adminSlug}/etims`,
      icon: ChartBarIcon,
      minTier: "Ghuba Pro",
    },
    {
      label: "Reports & Analytics",
      icon: ChartBarIcon,
      minTier: "Ghuba Starter",
      subItems: [
        {
          label: "Product Analytics",
          href: `/admin/${adminSlug}/analytics`,
          minTier: "Ghuba Starter",
        },
        {
          label: "Search Analytics",
          href: `/admin/${adminSlug}/search-analytics`,
          minTier: "Ghuba Starter",
        },
        {
          label: "Revenue Reports",
          href: `/admin/${adminSlug}/revenuereport`,
          minTier: "Ghuba Starter",
        },
      ],
    },
    {
      label: "Blogs",
      href: `/admin/${adminSlug}/blogs`,
      icon: DocumentTextIcon,
      minTier: "Ghuba Starter",
    },
    {
      label: "gallery",
      href: `/admin/${adminSlug}/gallery`,
      icon: PhotoIcon,
      minTier: "Ghuba Starter",
    },
    {
      label: "Messages",
      href: `/admin/${adminSlug}/messages`,
      icon: ChatBubbleBottomCenterTextIcon,
      minTier: "Ghuba Basic",
    },
    {
      label: "Settings",
      href: `/admin/${adminSlug}/settings`,
      icon: Cog6ToothIcon,
      minTier: "Ghuba Starter",
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
    "E-commerce": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Agrovet Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Baby Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Bike Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Book Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Cake Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Directory & Listings": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Earphones Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Fashion Shop": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Flowers Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Furniture Shop": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Gaming Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Glasses Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Groceries Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Hardware Shop": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Honey Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Meat Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Motorcycle Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Peanuts Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Pets Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Shoes Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Watch Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    "Automotive Store": filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),
    Marketplace: filterTiers([
      ...commonEcommerce(
        adminSlug,
        accessLevel,
        currentTier,
        isSubscriptionActive,
      ),
    ]),

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
      },
      {
        label: "Site Categories",
        href: `/admin/${adminSlug}/site-categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locat`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
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
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Super Admin Dashboard",
        href: `/super-admin/`,
        icon: UsersIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Ai",
            href: `/super-admin/ai`,
            minTier: "Ghuba Pro",
          },
          {
            label: "KRA ",
            href: `/super-admin/etims`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Email",
            href: `/super-admin/email`,
            minTier: "Ghuba Basic",
          },
          {
            label: "ads",
            href: "/super-admin/ads",
            minTier: "Ghuba Pro",
          },
          {
            label: "ai-workforce",
            href: "/super-admin/ai-workforce",
            minTier: "Ghuba Pro",
          },
          {
            label: "payments",
            href: "/super-admin/payments",
            minTier: "Ghuba Pro",
          },
          {
            label: "seo",
            href: "/super-admin/seo",
            minTier: "Ghuba Pro",
          },
          {
            label: "Observability",
            href: "/super-admin/observability",
            // icon: UsersIcon,
            minTier: "Ghuba Pro",
            // subItems: [
            //   {
            //     label: "Overview",
            //     href: "/super-admin/observability",
            //     minTier: "Ghuba Pro",
            //   },
            //   {
            //     label: "Database",
            //     href: "/super-admin/observability/database",
            //     minTier: "Ghuba Pro",
            //   },
            //   {
            //     label: "Storage",
            //     href: "/super-admin/observability/storage",
            //     minTier: "Ghuba Pro",
            //   },
            //   {
            //     label: "Queues",
            //     href: "/super-admin/observability/queues",
            //     minTier: "Ghuba Pro",
            //   },
            //   {
            //     label: "Alerts",
            //     href: "/super-admin/observability/alerts",
            //     minTier: "Ghuba Pro",
            //   },
            // ],
          },
        ],
      },
      {
        label: "Sample Listings Generator",
        href: `/admin/${adminSlug}/samplelistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Bulk Csv Upload For listings",
        href: `/admin/${adminSlug}/bulkcsvlistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Sample Image Upload For listings",
        href: `/admin/${adminSlug}/sync-images`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Backup And Restore",
        href: `/admin/${adminSlug}/db-management`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Marketplace Listings",
        href: `/admin/${adminSlug}/marketplace-gh`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Basic",
      },
    ]),

    "Service Provider": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
            href: `/admin/${adminSlug}/service-transport-vehicles`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Booking & Appointments": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Real Estate": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Agents",
        href: `/admin/${adminSlug}/properties-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Properties",
        href: `/admin/${adminSlug}/properties`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/properties-inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/properties-showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/properties-offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Healthcare & Clinics": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/health-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Patients",
        href: `/admin/${adminSlug}/health-patients`,
        icon: UsersIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/health-appointments`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Doctors",
        href: `/admin/${adminSlug}/health-doctors`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Staff",
        href: `/admin/${adminSlug}/health-staff`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/health-services`,
        icon: HeartIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Prescriptions",
        href: `/admin/${adminSlug}/health-prescriptions`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/health-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Inventory",
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "Browse Catalog",
            href: `/admin/${adminSlug}/inventory`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Market List",
            href: `/admin/${adminSlug}/mymarketplace`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/health-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/health-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    Barbershop: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",

        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/booking-transport-vehicles`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    Drycleaning: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",

        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/booking-transport-vehicles`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/revenuereport`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Portfolio & Personal Branding": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/service-pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Calendar",
        href: `/admin/${adminSlug}/calendar`,
        icon: CalendarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Transport",
        href: `/admin/${adminSlug}/transport`,
        icon: HomeIcon,
        minTier: "Ghuba Pro",

        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/portfolio-transport-vehicles`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Bookings",
        icon: CalendarIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "Manage Appointments",
            href: `/admin/${adminSlug}/appointments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Basic",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/reports`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Blog & Content": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",

        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Content Analytics",
            href: `/admin/${adminSlug}/analytics`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Writers",
        href: `/admin/${adminSlug}/writers`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Podcast",
        icon: PlayCircleIcon,
        minTier: "Ghuba Starter",
        subItems: [
          {
            label: "All Episodes",
            href: `/admin/${adminSlug}/podcast`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Podcast Analytics",
            href: `/admin/${adminSlug}/analytics`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Basic",
      },
      {
        label: "Leads",
        icon: UsersIcon,
        minTier: "Ghuba Growth",

        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Comments",
        href: `/admin/${adminSlug}/comments`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Finance & Royalties",
        href: `/admin/${adminSlug}/finance`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
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
      },
      {
        label: "Management",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Academic Years",
            href: `/admin/${adminSlug}/academic-years`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Academic Terms",
            href: `/admin/${adminSlug}/academic-terms`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Departments",
            href: `/admin/${adminSlug}/departments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Academic Levels",
            href: `/admin/${adminSlug}/academic-levels`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Classrooms",
            href: `/admin/${adminSlug}/classrooms`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Teachers",
            href: `/admin/${adminSlug}/teachers`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Parents",
            href: `/admin/${adminSlug}/parents`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Students",
            href: `/admin/${adminSlug}/students`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Courses",
            href: `/admin/${adminSlug}/courses`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Course Materials",
            href: `/admin/${adminSlug}/course-materials`,
            minTier: "Ghuba Starter",
          },
          {
            label: "TimeTable",
            href: `/admin/${adminSlug}/lessons`,
            minTier: "Ghuba Starter",
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
          },
          {
            label: "Exams",
            href: `/admin/${adminSlug}/exams`,
            minTier: "Ghuba Starter",
          },
          // { label: "Results", href: `/admin/${adminSlug}/results` },
          {
            label: "Grades & Report Card",
            href: `/admin/${adminSlug}/grading-report-card`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Activities & Early Learning",
        icon: PuzzlePieceIcon,
        minTier: "Ghuba Starter",
        subItems: [
          {
            label: "All Activities",
            href: `/admin/${adminSlug}/activities`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Drawing & Art",
            href: `/admin/${adminSlug}/activities?type=drawing`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Story Time",
            href: `/admin/${adminSlug}/activities?type=story-time`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Puzzle Play",
            href: `/admin/${adminSlug}/activities?type=puzzle-play`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Sing-Along",
            href: `/admin/${adminSlug}/activities?type=sing-along`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Make Friends",
            href: `/admin/${adminSlug}/activities?type=make-friends`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Pupil Play Mode",
            href: `/admin/${adminSlug}/play/drawing`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Attendance",
        href: `/admin/${adminSlug}/attendance`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Events",
        icon: AcademicCapIcon,
        subItems: [
          {
            label: "All Events",
            href: `/admin/${adminSlug}/school-events`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/schoolAnnouncements`,
        icon: AcademicCapIcon,
        minTier: "Ghuba Starter",
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
          },
          {
            label: "Books",
            href: `/admin/${adminSlug}/library-books`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Members",
            href: `/admin/${adminSlug}/library-members`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Issuance Records",
            href: `/admin/${adminSlug}/library-issuance-records`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Returns",
            href: `/admin/${adminSlug}/library-returns`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Fines",
            href: `/admin/${adminSlug}/library-fines`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Maintenance",
            href: `/admin/${adminSlug}/library-maintenance`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reservations",
            href: `/admin/${adminSlug}/library-reservations`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Suppliers Categories",
            href: `/admin/${adminSlug}/library-suppliers-categories`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Suppliers",
            href: `/admin/${adminSlug}/library-suppliers`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Acquisitions",
            href: `/admin/${adminSlug}/library-acquisitions`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Inventory",
            href: `/admin/${adminSlug}/library-inventory`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/library-reports`,
            minTier: "Ghuba Starter",
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
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Starter",
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
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
          },
          {
            label: "Rooms",
            href: `/admin/${adminSlug}/hostel-rooms`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Residents",
            href: `/admin/${adminSlug}/hostel-residents`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Room Assignments",
            href: `/admin/${adminSlug}/hostel-room-assignments`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Maintenance Requests",
            href: `/admin/${adminSlug}/hostel-maintenance-requests`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Visitors",
            href: `/admin/${adminSlug}/hostel-visitors`,
            minTier: "Ghuba Starter",
          },
          // { label: "Fee Management", href: `/admin/${adminSlug}/hostel-fee-management` },
          // { label: "Inventory", href: `/admin/${adminSlug}/hostel-inventory` },
          {
            label: "Staff",
            href: `/admin/${adminSlug}/hostel-staff`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/hostel-reports`,
            minTier: "Ghuba Starter",
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
          },
          {
            label: "Roles",
            href: `/admin/${adminSlug}/staff-roles`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Staff Members",
            href: `/admin/${adminSlug}/staff-members`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Attendance",
            href: `/admin/${adminSlug}/staff-attendance`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Payroll",
            href: `/admin/${adminSlug}/staff-payroll`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Leave Management",
            href: `/admin/${adminSlug}/staff-leave-management`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Performance Reviews",
            href: `/admin/${adminSlug}/staff-performance-reviews`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Recruitment",
            href: `/admin/${adminSlug}/staff-recruitment`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/staff-reports`,
            minTier: "Ghuba Starter",
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
          },
          {
            label: "FEE Transactions",
            href: `/admin/${adminSlug}/fee`,
            minTier: "Ghuba Starter",
          },
          // { label: "Transactions", href: `/admin/${adminSlug}/fee-transactions` },
          // { label: "Invoices", href: `/admin/${adminSlug}/fee-invoices` },
          {
            label: "Expenses",
            href: `/admin/${adminSlug}/fee-expenses`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Profit & Loss",
            href: `/admin/${adminSlug}/fee-profit-loss`,
            minTier: "Ghuba Starter",
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
          },
          {
            label: "Assets Overview",
            href: `/admin/${adminSlug}/inventory-assets-overview`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Assets",
            href: `/admin/${adminSlug}/inventory-assets-list`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Asset Tracking",
            href: `/admin/${adminSlug}/asset-tracking`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Categories",
            href: `/admin/${adminSlug}/inventory-categories`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Inventory Items",
            href: `/admin/${adminSlug}/inventory-items`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Inventory Audits",
            href: `/admin/${adminSlug}/inventory-audits`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Suppliers",
            href: `/admin/${adminSlug}/inventory-suppliers`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Purchase Orders",
            href: `/admin/${adminSlug}/inventory-purchase-orders`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/inventory-maintenance-records`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Depreciation Schedules",
            href: `/admin/${adminSlug}/inventory-depreciation-schedules`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/inventory-reports`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/school-reports`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Nonprofit & Community": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Donations",
        href: `/admin/${adminSlug}/donations`,
        icon: HeartIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Campaigns",
        href: `/admin/${adminSlug}/campaigns`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Donors",
        href: `/admin/${adminSlug}/donors`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Members",
        href: `/admin/${adminSlug}/members`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Manage Events",
        href: `/admin/${adminSlug}/manage-events`,
        icon: TicketIcon,
        minTier: "Ghuba Growth",
      },
    ]),

    "Company Portfolio": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Projects",
        href: `/admin/${adminSlug}/projects`,
        icon: PresentationChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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

        subItems: [
          {
            label: "Vehicles",
            href: `/admin/${adminSlug}/service-transport-vehicles`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/reports`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Restaurant & Food Delivery": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/pos`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Products",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Browse Catalog",
            href: `/admin/${adminSlug}/inventory`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Market List",
            href: `/admin/${adminSlug}/mymarketplace`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Orders",
        href: `/admin/${adminSlug}/orders`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
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
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/store-transport-routes`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/store-transport-drivers`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/store-transport-schedules`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/store-transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/store-transport-fuel-logs`,
            minTier: "Ghuba Pro",
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/store-transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/store-transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/store-transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
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
      },
      {
        label: "Manage Events",
        href: `/admin/${adminSlug}/manage-events`,
        icon: TicketIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Tickets",
        href: `/admin/${adminSlug}/manage-tickets`,
        icon: TicketIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Orders",
        href: `/admin/${adminSlug}/manage-event-orders`,
        icon: ShoppingBagIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Check-in",
        href: `/admin/${adminSlug}/manage-check-in`,
        icon: QrCodeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Attendees",
        href: `/admin/${adminSlug}/manage-attendees`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "POS",
        href: `/admin/${adminSlug}/company-pos`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Users",
        icon: UsersIcon,
        subItems: [
          {
            label: "Sales Agents",
            href: `/admin/${adminSlug}/agents`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Clients",
            href: `/admin/${adminSlug}/consumers`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Growth",
      },
    ]),

    "Content Management": filterTiers([
      {
        label: "Pages",
        href: `/admin/${adminSlug}/pages`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      }, // For static pages like About Us, Contact
      {
        label: "Blog Posts",
        href: `/admin/${adminSlug}/blog`,
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
      }, // If you have a blog
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
      }, // For site-wide announcements
      {
        label: "Media Library",
        href: `/admin/${adminSlug}/media`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      }, // Central place for images, videos
      {
        label: "Promotions",
        href: `/admin/${adminSlug}/promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
      }, // For discounts, promo codes
      {
        label: "Sponsors",
        href: `/admin/${adminSlug}/sponsors`,
        icon: HandRaisedIcon,
        minTier: "Ghuba Growth",
      }, // If events have sponsors
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
      }, // Manage all platform users
      {
        label: "Roles & Permissions",
        href: `/admin/${adminSlug}/roles`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
      }, // If you have different admin/organizer roles
      {
        label: "Organizers",
        href: `/admin/${adminSlug}/organizers`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // Manage event organizers (if distinct from general users)
    ]),

    "Financials & Reports": filterTiers([
      {
        label: "Payouts",
        href: `/admin/${adminSlug}/payouts`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
      }, // Track money paid out to organizers
      {
        label: "Transactions",
        href: `/admin/${adminSlug}/transactions`,
        icon: ReceiptPercentIcon,
        minTier: "Ghuba Starter",
      }, // Detailed transaction logs
      {
        label: "Revenue Reports",
        href: `/admin/${adminSlug}/reports/revenue`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Sales Reports",
        href: `/admin/${adminSlug}/reports/sales`,
        icon: ChartPieIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    Settings: filterTiers([
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/settings/general`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Profile",
        href: `/admin/${adminSlug}/settings/profile`,
        icon: UserCircleIcon,
        minTier: "Ghuba Starter",
      }, // Admin user profile settings
      {
        label: "Integrations",
        href: `/admin/${adminSlug}/settings/integrations`,
        icon: PuzzlePieceIcon,
        minTier: "Ghuba Starter",
      }, // API keys, third-party connections
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/settings/audit-log`,
        icon: ListBulletIcon,
        minTier: "Ghuba Starter",
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
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Starter",
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
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    Dashboards: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "AI Workforce",
        href: `/admin/${adminSlug}/ai-workforce`,
        icon: SparklesIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "AI Studio",
        href: `/dashboards/ai-studio`,
        icon: SparklesIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/cated`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Site Categories",
        href: `/admin/${adminSlug}/site-categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locat`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Users",
        href: `/admin/${adminSlug}/saas-users`,
        icon: UsersIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Lead Bulk",
            href: `/admin/${adminSlug}/salesleads/imports`,
            minTier: "Ghuba Starter",
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
      },
      {
        label: "Bulk Csv Upload For listings",
        href: `/admin/${adminSlug}/bulkcsvlistingsgenerator`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Sample Image Upload For listings",
        href: `/admin/${adminSlug}/sync-images`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Backup And Restore",
        href: `/admin/${adminSlug}/db-management`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Plans & Subscriptions",
        href: `/admin/${adminSlug}/saas-plans`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "All Companies",
        href: `/admin/${adminSlug}/companies-full-site`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Marketplace Listings",
        href: `/admin/${adminSlug}/marketplace-gh`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Subscription Payments",
        href: `/admin/${adminSlug}/subscriptionpayments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Media & Entertainment": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Content Library", // Renamed for clarity
        href: `/admin/${adminSlug}/media-content`, // Unified content management
        icon: FilmIcon, // Covers both video and general media
        minTier: "Ghuba Starter",
      },
      {
        label: "Article Management", // Specific for articles
        href: `/admin/${adminSlug}/blogs`, //media-articles
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery Management", // Specific for galleries
        href: `/admin/${adminSlug}/media-gallery`,
        icon: VideoCameraIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Video Management", // Specific for videos
        href: `/admin/${adminSlug}/media-videos`,
        icon: VideoCameraIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Publishing Schedule", // More descriptive
        href: `/admin/${adminSlug}/media-schedule`,
        icon: CalendarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "User Management", // Essential for any platform
        href: `/admin/${adminSlug}/media-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Featured & Top Picks", // For managing highlighted content
        href: `/admin/${adminSlug}/media-featured-picks`,
        icon: StarIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Sponsors & Partnerships", // More descriptive
        href: `/admin/${adminSlug}/media-sponsors`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Analytics", // For insights
        href: `/admin/${adminSlug}/media-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
      },
    ]),

    "Finance & Legal": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/finance-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Manage client feedback
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/finance-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
      }, // Manage frequently asked questions
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        subItems: [{ label: "All Blogs", href: `/admin/${adminSlug}/blogs` }],
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/finance-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // General admin settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Experts/Team",
        href: `/admin/${adminSlug}/finance-team`,
        icon: ShieldCheckIcon,
        minTier: "Ghuba Growth",
      }, // Manage experts/advisors
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/finance-appointments`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      }, // For scheduling consultations
      {
        label: "Documents",
        href: `/admin/${adminSlug}/finance-documents`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Packages & Pricing",
        href: `/admin/${adminSlug}/finance-packages`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
      }, // Manage consultation packages
      {
        label: "Cases & Matters",
        href: `/admin/${adminSlug}/finance-cases`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Pro",
      }, // For legal cases/financial matters
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/finance-invoices`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
    ]),

    Automotive: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
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
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
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
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Vehicles",
        href: `/admin/${adminSlug}/vehicles`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Track and manage all property inquiries and messages
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/sales-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      }, // Schedule and manage property viewings
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
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
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Destinations",
        href: `/admin/${adminSlug}/travel-destinations`,
        icon: GlobeAltIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Packages & Tours",
        href: `/admin/${adminSlug}/travel-packages`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Listings",
        href: `/admin/${adminSlug}/travel-experiences`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // vehicle-manage Manage all property listings (add, edit, delete, status)
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/inquiries`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
      }, // Track and manage all property inquiries and messages
      {
        label: "Blog & Content",
        href: `/admin/${adminSlug}/blogs`,
        icon: NewspaperIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/travel-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/travel-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Users",
        href: `/admin/${adminSlug}/travel-users`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
      }, // Schedule and manage property viewings
      {
        label: "Travel Experts",
        href: `/admin/${adminSlug}/travel-experts`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/travel-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/travel-promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
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
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/transport-routes`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/transport-drivers`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/transport-maintenance-records`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/transport-fuel-logs`,
            minTier: "Ghuba Growth",
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/transport-incidents`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/transport-reports`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Bookings",
        href: `/admin/${adminSlug}/travel-bookings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      }, // Manage offers, sales agreements, and contracts
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
    ]),

    "Property Management": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      }, // Overall view of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Properties",
        href: `/admin/${adminSlug}/properties`,
        icon: BuildingOfficeIcon,
        minTier: "Ghuba Starter",
      }, // Schedule and manage property viewings
      {
        label: "Inquiries",
        href: `/admin/${adminSlug}/properties-inquiries`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Track and manage all property inquiries and messages
      {
        label: "Media Library",
        href: `/admin/${adminSlug}/properties-media`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      }, // Central place for property images, videos, and virtual tour media
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/properties-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Manage client testimonials for properties
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/properties-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
      }, // Manage frequently asked questions related to properties
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/properties-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // General administrative settings
      {
        label: "Locations",
        href: `/admin/${adminSlug}/locations`,
        icon: MapPinIcon,
        minTier: "Ghuba Growth",
      }, // company-locations properties-locations Manage geographic locations for listings
      {
        label: "Agents",
        href: `/admin/${adminSlug}/properties-agents`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      }, // Manage agent profiles, performance, and assignments
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
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
          },
          {
            label: "Rooms",
            href: `/admin/${adminSlug}/property-rooms`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Residents",
            href: `/admin/${adminSlug}/property-residents`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Room Assignments",
            href: `/admin/${adminSlug}/property-room-assignments`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Maintenance Requests",
            href: `/admin/${adminSlug}/property-maintenance-requests`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Visitors",
            href: `/admin/${adminSlug}/property-visitors`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Fee Management",
            href: `/admin/${adminSlug}/property-fee-management`,
            minTier: "Ghuba Growth",
          },
          // { label: "Inventory", href: `/admin/${adminSlug}/property-inventory` },
          {
            label: "Staff",
            href: `/admin/${adminSlug}/property-staff`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/property-reports`,
            minTier: "Ghuba Growth",
          },
        ],
      },
      {
        label: "Showings",
        href: `/admin/${adminSlug}/properties-showings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/properties-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
      }, // Manage virtual tour content for listings
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/properties-promotions`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
      }, // Create and manage discounts, special offers for listings
      {
        label: "Reports",
        href: `/admin/${adminSlug}/properties-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      }, // Generate various reports (sales, agent performance, market trends)
      {
        label: "Offers & Contracts",
        href: `/admin/${adminSlug}/properties-offers`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
    ]),

    "Fitness & Wellness": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      }, // Overview of gym activity
      {
        label: "POS & Sales",
        href: `/admin/${adminSlug}/fitness-pos`,
        icon: CurrencyDollarIcon,
        minTier: "Ghuba Starter",
      }, // Point of Sale and transaction management
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Programs",
        href: `/admin/${adminSlug}/fitness-listings`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      }, // Manage fitness programs, classes, schedules
      {
        label: "Classes",
        href: `/admin/${adminSlug}/fitness-classes`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      }, // Manage fitness programs, classes, schedules
      {
        label: "Trainers & Staff",
        href: `/admin/${adminSlug}/fitness-trainers`,
        icon: BriefcaseIcon,
        minTier: "Ghuba Starter",
      }, // Manage trainer profiles, availability
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "blogs",
        href: `/admin/${adminSlug}/blogs`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/fitness-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // General administrative settings, user roles
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UsersIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
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
      }, // Manage physical gym locations, equipment, rooms
      {
        label: "Notifications & Comms",
        href: `/admin/${adminSlug}/fitness-notifications`,
        icon: BellIcon,
        minTier: "Ghuba Growth",
      }, // Send announcements, newsletters, client messages
      {
        label: "Virtual Tours",
        href: `/admin/${adminSlug}/fitness-virtual-tours`,
        icon: PlayCircleIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Reports & Analytics",
        href: `/admin/${adminSlug}/fitness-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Growth",
      }, // View performance metrics, sales reports
      {
        label: "Bookings & Schedule",
        href: `/admin/${adminSlug}/fitness-bookings`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
      }, // Manage class and personal training bookings
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
    ]),

    // You could also categorize into more specific sections if the admin grows
    "Marketing & Engagement": filterTiers([
      {
        label: "Content Management",
        href: `/admin/${adminSlug}/content`,
        icon: PencilSquareIcon,
        minTier: "Ghuba Starter",
      }, // Blog posts, articles, website content
      {
        label: "Promotions & Deals",
        href: `/admin/${adminSlug}/promotions`,
        icon: TagIcon,
        minTier: "Ghuba Starter",
      }, // Create and manage discounts, special offers
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
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
      },
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Manage client testimonials
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
      }, // Manage frequently asked questions
    ]),

    "Billing & Finance": filterTiers([
      {
        label: "Invoices",
        href: `/admin/${adminSlug}/invoices`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/payments`,
        icon: CreditCardIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Refunds",
        href: `/admin/${adminSlug}/refunds`,
        icon: ArrowUturnLeftIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Consultant & Coach": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      }, // Overview of key metrics
      {
        label: "Programs & Courses",
        icon: BookOpenIcon, // Icon for a book or learning
        subItems: [
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",

            // icon: ClipboardDocumentListIcon,
          },
          {
            label: "Ebooks",
            href: `/admin/${adminSlug}/ebooks`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Programs",
            href: `/admin/${adminSlug}/programs`,
            minTier: "Ghuba Starter",
          },
          // { label: "Course Builder", href: `/admin/${adminSlug}/course-builder` },
          // { label: "Content Library", href: `/admin/${adminSlug}/content-library` },
          // { label: "Resource Downloads", href: `/admin/${adminSlug}/resources` },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // Icon for gear/settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
      }, // Icon for charts/graphs
      {
        label: "Messaging",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
      }, // Icon for chat/messages
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/appointments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
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
      }, // Overview of key metrics
      {
        label: "Programs & Courses",
        icon: BookOpenIcon, // Icon for a book or learning
        subItems: [
          {
            label: "Categories",
            href: `/admin/${adminSlug}/categories`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Ebooks",
            href: `/admin/${adminSlug}/ebooks`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Programs",
            href: `/admin/${adminSlug}/programs`,
            minTier: "Ghuba Starter",
          },
          {
            label: "blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
          },
          // { label: "Course Builder", href: `/admin/${adminSlug}/course-builder` },
          // { label: "Content Library", href: `/admin/${adminSlug}/content-library` },
          // { label: "Resource Downloads", href: `/admin/${adminSlug}/resources` },
        ],
      },

      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // Icon for gear/settings
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserCircleIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Growth",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
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
      }, // Icon for chat/messages
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/appointments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
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
      }, // Overview of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
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
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
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
      }, // Manage experts/advisors
      // { label: "Cases & Matters", href: `/admin/${adminSlug}/finance-cases`, icon: BriefcaseIcon }, // For legal cases/financial matters
      {
        label: "Documents",
        href: `/admin/${adminSlug}/finance-documents`,
        icon: DocumentTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Appointments",
        href: `/admin/${adminSlug}/finance-appointments`,
        icon: CalendarDaysIcon,
        minTier: "Ghuba Pro",
      }, // For scheduling consultations
      {
        label: "Services",
        href: `/admin/${adminSlug}/services`,
        icon: WrenchScrewdriverIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/finance-invoices`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Growth",
      }, // More explicit name
      {
        label: "Packages & Pricing",
        href: `/admin/${adminSlug}/finance-packages`,
        icon: TagIcon,
        minTier: "Ghuba Growth",
      }, // Manage consultation packages
      {
        label: "Testimonials",
        href: `/admin/${adminSlug}/finance-testimonials`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Starter",
      }, // Manage client feedback
      {
        label: "FAQs",
        href: `/admin/${adminSlug}/finance-faqs`,
        icon: QuestionMarkCircleIcon,
        minTier: "Ghuba Starter",
      }, // Manage frequently asked questions
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        subItems: [
          {
            label: "All Blogs",
            href: `/admin/${adminSlug}/blogs`,
            minTier: "Ghuba Starter",
          },
        ],
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/finance-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      }, // General admin settings
    ]),

    "Delivery & Logistics": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      }, // Overview of key metrics
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Services",
        icon: ClipboardDocumentListIcon,
        href: `/admin/${adminSlug}/services`,
        minTier: "Ghuba Starter",
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
          },
          {
            label: "Delivery",
            href: `/admin/${adminSlug}/deliveries`,
            minTier: "Ghuba Starter",
          },
          {
            label: "Payments",
            href: `/admin/${adminSlug}/companyPaymentsDashboard`,
            minTier: "Ghuba Pro",
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
          },
          {
            label: "Routes",
            href: `/admin/${adminSlug}/store-transport-routes`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Drivers",
            href: `/admin/${adminSlug}/store-transport-drivers`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Schedules",
            href: `/admin/${adminSlug}/store-transport-schedules`,
            minTier: "Ghuba Growth",
          },
          {
            label: "Maintenance Records",
            href: `/admin/${adminSlug}/store-transport-maintenance-records`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Fuel Logs",
            href: `/admin/${adminSlug}/store-transport-fuel-logs`,
            minTier: "Ghuba Growth",
          },
          // {
          //   label: "Assignments",
          //   href: `/admin/${adminSlug}/store-transport-assignments`,
          // },
          {
            label: "Incidents",
            href: `/admin/${adminSlug}/store-transport-incidents`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Reports",
            href: `/admin/${adminSlug}/store-transport-reports`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
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
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
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
      },
      {
        label: "Shipments & Orders",
        href: `/admin/${adminSlug}/logistics-shipments`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Tracking & Status",
        href: `/admin/${adminSlug}/logistics-tracking`,
        icon: EyeIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Billing & Invoices",
        href: `/admin/${adminSlug}/logistics-billing`,
        icon: CreditCardIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "Reports & Analytics",
        href: `/admin/${adminSlug}/logistics-reports`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Blogs",
        icon: DocumentTextIcon,
        href: `/admin/${adminSlug}/blogs`,
        minTier: "Ghuba Starter",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Messages",
        href: `/admin/${adminSlug}/messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    "Social Media Manager": filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Categories",
        href: `/admin/${adminSlug}/categories`,
        icon: ClipboardDocumentListIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Clients",
        href: `/admin/${adminSlug}/consumers`,
        icon: UserGroupIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "leads",
        icon: UsersIcon,
        subItems: [
          {
            label: "All Leads",
            href: `/admin/${adminSlug}/salesleads`,
            minTier: "Ghuba Starter",
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
      },
      {
        label: "Post Management",
        href: `/admin/${adminSlug}/social-posts`,
        icon: PencilSquareIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Analytics & Reports",
        href: `/admin/${adminSlug}/social-analytics`,
        icon: ChartBarIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Payments",
        href: `/admin/${adminSlug}/companyPaymentsDashboard`,
        icon: BanknotesIcon,
        minTier: "Ghuba Pro",
      },
      {
        label: "Gallery",
        href: `/admin/${adminSlug}/gallery`,
        icon: PhotoIcon,
        minTier: "Ghuba Starter",
      },
      {
        label: "Messages & Engagement",
        href: `/admin/${adminSlug}/social-messages`,
        icon: ChatBubbleBottomCenterTextIcon,
        minTier: "Ghuba Growth",
      },
      {
        label: "WhatsApp Engine",
        // href: `/admin/${adminSlug}/whatsapp-inbox`,
        icon: ChatBubbleLeftRightIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Live Inbox",
            href: `/admin/${adminSlug}/whatsapp-inbox`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Conversations & Logs",
            href: `/admin/${adminSlug}/whatsapp-conversations`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Templates & Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
            minTier: "Ghuba Pro",
          },
          {
            label: "AI Automation & Rules",
            href: `/admin/${adminSlug}/whatsapp-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "AI Media Studio",
        icon: SparklesIcon,
        minTier: "Ghuba Pro",
        subItems: [
          {
            label: "Image Generation",
            href: `/admin/${adminSlug}/ai-images`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Video Generation",
            href: `/admin/${adminSlug}/ai-videos`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Generated Library",
            href: `/admin/${adminSlug}/ai-media-library`,
            minTier: "Ghuba Pro",
          },
          {
            label: "Integration Settings",
            href: `/admin/${adminSlug}/ai-settings`,
            minTier: "Ghuba Pro",
          },
        ],
      },
      {
        label: "Settings",
        href: `/admin/${adminSlug}/social-settings`,
        icon: Cog6ToothIcon,
        minTier: "Ghuba Starter",
      },
    ]),

    SCHOOL_DRIVER: filterTiers([
      {
        label: "Dashboard",
        href: `/admin/${adminSlug}`,
        icon: HomeIcon,
        minTier: "Ghuba Starter",
      },

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
        label: "My Classes & Students",
        icon: UsersIcon,
        subItems: [
          {
            label: "Assigned Classes",
            href: `/admin/${adminSlug}/teacherclasslist`,
          },
          {
            label: "Assigned Subjects",
            href: `/admin/${adminSlug}/teachersubjectlist`,
          },
          {
            label: "Student Roster",
            href: `/admin/${adminSlug}/teacherstudents`,
          },
          {
            label: "Course Materials",
            href: `/admin/${adminSlug}/teachermaterials`,
          },
        ],
      },
      {
        label: "Academic Work",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Assignments & Submissions",
            href: `/admin/${adminSlug}/teacherassignments`,
          },
          {
            label: "Grades & Grading",
            href: `/admin/${adminSlug}/teachergrades`,
          },
          {
            label: "Attendance Register",
            href: `/admin/${adminSlug}/teacherattendance`,
          },
        ],
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

    Educator: filterTiers([
      { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
      {
        label: "My Classes & Students",
        icon: UsersIcon,
        subItems: [
          {
            label: "Assigned Classes",
            href: `/admin/${adminSlug}/teacherclasslist`,
          },
          {
            label: "Assigned Subjects",
            href: `/admin/${adminSlug}/teachersubjectlist`,
          },
          {
            label: "Student Roster",
            href: `/admin/${adminSlug}/teacherstudents`,
          },
          {
            label: "Course Materials",
            href: `/admin/${adminSlug}/teachermaterials`,
          },
        ],
      },
      {
        label: "Academic Work",
        icon: ClipboardDocumentListIcon,
        subItems: [
          {
            label: "Assignments & Submissions",
            href: `/admin/${adminSlug}/teacherassignments`,
          },
          {
            label: "Grades & Grading",
            href: `/admin/${adminSlug}/teachergrades`,
          },
          {
            label: "Attendance Register",
            href: `/admin/${adminSlug}/teacherattendance`,
          },
        ],
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
        label: "Play & Activities",
        icon: PuzzlePieceIcon,
        subItems: [
          { label: "Drawing & Art", href: `/admin/${adminSlug}/play/drawing` },
          { label: "Story Time", href: `/admin/${adminSlug}/play/story-time` },
          { label: "Puzzles", href: `/admin/${adminSlug}/play/puzzle-play` },
          { label: "Sing-Along", href: `/admin/${adminSlug}/play/sing-along` },
          {
            label: "Make Friends",
            href: `/admin/${adminSlug}/play/make-friends`,
          },
        ],
      },
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
        label: "Academics & Classes",
        icon: AcademicCapIcon,
        subItems: [
          { label: "Classrooms", href: `/admin/${adminSlug}/classrooms` },
          {
            label: "Academic Levels",
            href: `/admin/${adminSlug}/academic-levels`,
          },
          {
            label: "Academic Years",
            href: `/admin/${adminSlug}/academic-years`,
          },
          {
            label: "Academic Terms",
            href: `/admin/${adminSlug}/academic-terms`,
          },
          { label: "Courses", href: `/admin/${adminSlug}/courses` },
          {
            label: "Timetable / Schedule",
            href: `/admin/${adminSlug}/lessons`,
          },
        ],
      },
      {
        label: "Faculty & Students",
        icon: UsersIcon,
        subItems: [
          { label: "Teachers", href: `/admin/${adminSlug}/teachers` },
          { label: "Students", href: `/admin/${adminSlug}/students` },
          { label: "Parents", href: `/admin/${adminSlug}/parents` },
          { label: "Staff Members", href: `/admin/${adminSlug}/staff-members` },
        ],
      },
      {
        label: "Exams & Grading",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Exams", href: `/admin/${adminSlug}/exams` },
          {
            label: "Report Cards & Transcripts",
            href: `/admin/${adminSlug}/grading-report-card`,
          },
          { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        ],
      },
      {
        label: "School Finance & Fees",
        icon: BanknotesIcon,
        subItems: [
          { label: "Fee Ledger & Balances", href: `/admin/${adminSlug}/fee` },
          {
            label: "Student Invoices",
            href: `/admin/${adminSlug}/fee-invoices`,
          },
          {
            label: "Payment Transactions",
            href: `/admin/${adminSlug}/fee-transactions`,
          },
          {
            label: "Fee Structures",
            href: `/admin/${adminSlug}/fee-structure`,
          },
          { label: "Fee Items & Setup", href: `/admin/${adminSlug}/fee-items` },
          {
            label: "School Expenses",
            href: `/admin/${adminSlug}/fee-expenses`,
          },
          {
            label: "Profit & Loss Reports",
            href: `/admin/${adminSlug}/fee-profit-loss`,
          },
        ],
      },
      {
        label: "School Operations",
        icon: ClipboardDocumentCheckIcon,
        subItems: [
          {
            label: "Attendance Register",
            href: `/admin/${adminSlug}/attendance`,
          },
          { label: "School Events", href: `/admin/${adminSlug}/school-events` },
          {
            label: "Announcements & Notices",
            href: `/admin/${adminSlug}/schoolAnnouncements`,
          },
        ],
      },
      {
        label: "Library Management",
        icon: BookOpenIcon,
        subItems: [
          { label: "Book Catalog", href: `/admin/${adminSlug}/library-books` },
          {
            label: "Member Directory",
            href: `/admin/${adminSlug}/library-members`,
          },
          {
            label: "Book Issuance & Returns",
            href: `/admin/${adminSlug}/library-issuance-records`,
          },
          { label: "Overdue Fines", href: `/admin/${adminSlug}/library-fines` },
          {
            label: "Library Reports",
            href: `/admin/${adminSlug}/library-reports`,
          },
        ],
      },
      {
        label: "Transport & Fleet",
        icon: TruckIcon,
        subItems: [
          {
            label: "School Vehicles",
            href: `/admin/${adminSlug}/transport-vehicles`,
          },
          {
            label: "Drivers Directory",
            href: `/admin/${adminSlug}/transport-drivers`,
          },
          {
            label: "Transport Routes",
            href: `/admin/${adminSlug}/transport-routes`,
          },
          {
            label: "Trip Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
          },
          {
            label: "Transport Reports",
            href: `/admin/${adminSlug}/transport-reports`,
          },
        ],
      },
      {
        label: "Hostel & Boarding",
        icon: BuildingOfficeIcon,
        subItems: [
          { label: "Hostel Blocks", href: `/admin/${adminSlug}/hostel-blocks` },
          { label: "Rooms & Suites", href: `/admin/${adminSlug}/hostel-rooms` },
          {
            label: "Boarding Residents",
            href: `/admin/${adminSlug}/hostel-residents`,
          },
          {
            label: "Room Allocations",
            href: `/admin/${adminSlug}/hostel-room-assignments`,
          },
          {
            label: "Hostel Reports",
            href: `/admin/${adminSlug}/hostel-reports`,
          },
        ],
      },
      {
        label: "Staff & Human Resources",
        icon: BriefcaseIcon,
        subItems: [
          {
            label: "Staff Directory",
            href: `/admin/${adminSlug}/staff-members`,
          },
          {
            label: "Staff Departments",
            href: `/admin/${adminSlug}/staff-departments`,
          },
          {
            label: "Staff Attendance",
            href: `/admin/${adminSlug}/staff-attendance`,
          },
          {
            label: "Leave Management",
            href: `/admin/${adminSlug}/staff-leave-management`,
          },
          { label: "Staff Payroll", href: `/admin/${adminSlug}/staff-payroll` },
          { label: "Staff Reports", href: `/admin/${adminSlug}/staff-reports` },
        ],
      },
      {
        label: "Inventory & Assets",
        icon: CubeIcon,
        subItems: [
          {
            label: "Inventory Dashboard",
            href: `/admin/${adminSlug}/inventory-dashboard`,
          },
          { label: "Stock Items", href: `/admin/${adminSlug}/inventory-items` },
          {
            label: "Fixed Assets Register",
            href: `/admin/${adminSlug}/inventory-assets-list`,
          },
          {
            label: "Inventory Reports",
            href: `/admin/${adminSlug}/inventory-reports`,
          },
        ],
      },
      {
        label: "School AI Studio",
        href: `/admin/${adminSlug}/ai-studio`,
        icon: SparklesIcon,
      },
      {
        label: "WhatsApp Engine",
        icon: ChatBubbleLeftRightIcon,
        subItems: [
          { label: "WhatsApp Dashboard", href: `/admin/${adminSlug}/whatsapp` },
          {
            label: "School Notice Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
          },
          { label: "Live Inbox", href: `/admin/${adminSlug}/whatsapp-inbox` },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/school-reports`,
        icon: ChartBarIcon,
      },
      {
        label: "Messages & Circulars",
        icon: ChatBubbleBottomCenterTextIcon,
        subItems: [
          {
            label: "Communication Center",
            href: `/admin/${adminSlug}/messages`,
          },
          {
            label: "Parent Messages",
            href: `/admin/${adminSlug}/parentmessages`,
          },
        ],
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
        label: "Academics & Classes",
        icon: AcademicCapIcon,
        subItems: [
          { label: "Classrooms", href: `/admin/${adminSlug}/classrooms` },
          {
            label: "Academic Levels",
            href: `/admin/${adminSlug}/academic-levels`,
          },
          {
            label: "Academic Years",
            href: `/admin/${adminSlug}/academic-years`,
          },
          {
            label: "Academic Terms",
            href: `/admin/${adminSlug}/academic-terms`,
          },
          { label: "Courses", href: `/admin/${adminSlug}/courses` },
          {
            label: "Course Materials",
            href: `/admin/${adminSlug}/course-materials`,
          },

          { label: "Timetable / Lessons", href: `/admin/${adminSlug}/lessons` },
        ],
      },
      {
        label: "Faculty & Students",
        icon: UsersIcon,
        subItems: [
          { label: "Teachers", href: `/admin/${adminSlug}/teachers` },
          { label: "Students", href: `/admin/${adminSlug}/students` },
          { label: "Parents", href: `/admin/${adminSlug}/parents` },
          { label: "Staff Members", href: `/admin/${adminSlug}/staff-members` },
        ],
      },
      {
        label: "Exams & Grading",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Exams", href: `/admin/${adminSlug}/exams` },
          {
            label: "Report Cards & Transcripts",
            href: `/admin/${adminSlug}/grading-report-card`,
          },
          { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        ],
      },
      {
        label: "School Finance & Fees",
        icon: BanknotesIcon,
        subItems: [
          { label: "Fee Ledger & Balances", href: `/admin/${adminSlug}/fee` },
          {
            label: "Student Invoices",
            href: `/admin/${adminSlug}/fee-invoices`,
          },
          {
            label: "Payment Transactions",
            href: `/admin/${adminSlug}/fee-transactions`,
          },
          {
            label: "Fee Structures",
            href: `/admin/${adminSlug}/fee-structure`,
          },
          { label: "Fee Items & Setup", href: `/admin/${adminSlug}/fee-items` },
          {
            label: "School Expenses",
            href: `/admin/${adminSlug}/fee-expenses`,
          },
          {
            label: "Profit & Loss Reports",
            href: `/admin/${adminSlug}/fee-profit-loss`,
          },
        ],
      },
      {
        label: "School Operations",
        icon: ClipboardDocumentCheckIcon,
        subItems: [
          {
            label: "Attendance Register",
            href: `/admin/${adminSlug}/attendance`,
          },
          { label: "School Events", href: `/admin/${adminSlug}/school-events` },
          {
            label: "Announcements & Notices",
            href: `/admin/${adminSlug}/schoolAnnouncements`,
          },
        ],
      },
      {
        label: "Library Management",
        icon: BookOpenIcon,
        subItems: [
          { label: "Book Catalog", href: `/admin/${adminSlug}/library-books` },
          {
            label: "Member Directory",
            href: `/admin/${adminSlug}/library-members`,
          },
          {
            label: "Book Issuance & Returns",
            href: `/admin/${adminSlug}/library-issuance-records`,
          },
          { label: "Overdue Fines", href: `/admin/${adminSlug}/library-fines` },
          {
            label: "Library Reports",
            href: `/admin/${adminSlug}/library-reports`,
          },
        ],
      },
      {
        label: "Transport & Fleet",
        icon: TruckIcon,
        subItems: [
          {
            label: "School Vehicles",
            href: `/admin/${adminSlug}/transport-vehicles`,
          },
          {
            label: "Drivers Directory",
            href: `/admin/${adminSlug}/transport-drivers`,
          },
          {
            label: "Transport Routes",
            href: `/admin/${adminSlug}/transport-routes`,
          },
          {
            label: "Trip Schedules",
            href: `/admin/${adminSlug}/transport-schedules`,
          },
          {
            label: "Transport Reports",
            href: `/admin/${adminSlug}/transport-reports`,
          },
        ],
      },
      {
        label: "Hostel & Boarding",
        icon: BuildingOfficeIcon,
        subItems: [
          { label: "Hostel Blocks", href: `/admin/${adminSlug}/hostel-blocks` },
          { label: "Rooms & Suites", href: `/admin/${adminSlug}/hostel-rooms` },
          {
            label: "Boarding Residents",
            href: `/admin/${adminSlug}/hostel-residents`,
          },
          {
            label: "Room Allocations",
            href: `/admin/${adminSlug}/hostel-room-assignments`,
          },
          {
            label: "Hostel Reports",
            href: `/admin/${adminSlug}/hostel-reports`,
          },
        ],
      },
      {
        label: "Staff & Human Resources",
        icon: BriefcaseIcon,
        subItems: [
          {
            label: "Staff Directory",
            href: `/admin/${adminSlug}/staff-members`,
          },
          {
            label: "Staff Departments",
            href: `/admin/${adminSlug}/staff-departments`,
          },
          {
            label: "Staff Attendance",
            href: `/admin/${adminSlug}/staff-attendance`,
          },
          {
            label: "Leave Management",
            href: `/admin/${adminSlug}/staff-leave-management`,
          },
          { label: "Staff Payroll", href: `/admin/${adminSlug}/staff-payroll` },
          { label: "Staff Reports", href: `/admin/${adminSlug}/staff-reports` },
        ],
      },
      {
        label: "Inventory & Assets",
        icon: CubeIcon,
        subItems: [
          {
            label: "Inventory Dashboard",
            href: `/admin/${adminSlug}/inventory-dashboard`,
          },
          { label: "Stock Items", href: `/admin/${adminSlug}/inventory-items` },
          {
            label: "Fixed Assets Register",
            href: `/admin/${adminSlug}/inventory-assets-list`,
          },
          {
            label: "Inventory Reports",
            href: `/admin/${adminSlug}/inventory-reports`,
          },
        ],
      },
      {
        label: "School AI Studio",
        href: `/admin/${adminSlug}/ai-studio`,
        icon: SparklesIcon,
      },
      {
        label: "WhatsApp Engine",
        icon: ChatBubbleLeftRightIcon,
        subItems: [
          { label: "WhatsApp Dashboard", href: `/admin/${adminSlug}/whatsapp` },
          {
            label: "School Notice Broadcasts",
            href: `/admin/${adminSlug}/whatsapp-templates`,
          },
          { label: "Live Inbox", href: `/admin/${adminSlug}/whatsapp-inbox` },
        ],
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/school-reports`,
        icon: ChartBarIcon,
      },
      {
        label: "Messages & Circulars",
        icon: ChatBubbleBottomCenterTextIcon,
        subItems: [
          {
            label: "Communication Center",
            href: `/admin/${adminSlug}/messages`,
          },
          {
            label: "Parent Messages",
            href: `/admin/${adminSlug}/parentmessages`,
          },
        ],
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
