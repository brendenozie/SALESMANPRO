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
  // CarIcon,
} from "@heroicons/react/24/outline";

// Helper to inject dynamic adminSlug
//accessLevel is the users different user roles that allows for users to access some paths or not 

export const getCategoryMenus = (adminSlug: string, accessLevel: string) => ({
  "E-commerce": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "POS", href: `/admin/${adminSlug}/storepos`, icon: ClipboardDocumentListIcon },
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Browse Catalog", href: `/admin/${adminSlug}/inventory` },
        { label: "Market List", href: `/admin/${adminSlug}/mymarketplace` },
      ],
    },
    {
      label:"Users",
      icon: UsersIcon,
      subItems: [
        { label: "Sales Agents", href: `/admin/${adminSlug}/agents` },
        { label: "Clients", href: `/admin/${adminSlug}/storeclients` },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Agent Orders", href: `/admin/${adminSlug}/agentorders` },
        { label: "Client Orders", href: `/admin/${adminSlug}/clientorders` },
        { label: "Marketplace", href: `/admin/${adminSlug}/customerorders` },
      ],
    },
    { label: "Reports", href: `/admin/${adminSlug}/revenuereport`, icon: ChartBarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Service Provider": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },    
    { label: "POS", href: `/admin/${adminSlug}/service-pos`, icon: ClipboardDocumentListIcon },
    {
      label: "Bookings",
      icon: CalendarIcon,
      subItems: [
        { label: "Manage Appointments", href: `/admin/${adminSlug}/appointments` },
        { label: "Clients", href: `/admin/${adminSlug}/storeclients` },
      ],
    },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "blogs", href: `/admin/${adminSlug}/blogs`, icon: WrenchScrewdriverIcon },
    { label: "Reports", href: `/admin/${adminSlug}/revenuereport`, icon: ChartBarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Booking & Appointments": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },    
    { label: "POS", href: `/admin/${adminSlug}/service-pos`, icon: ClipboardDocumentListIcon },
    { label: "Calendar", href: `/admin/${adminSlug}/calendar`, icon: CalendarIcon },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "Appointments", href: `/admin/${adminSlug}/appointments`, icon: ClipboardDocumentListIcon },
    { label: "Clients", href: `/admin/${adminSlug}/storeclients`, icon: UsersIcon },
    { label: "Reports", href: `/admin/${adminSlug}/revenuereport`, icon: ChartBarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Portfolio & Personal Branding": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "POS", href: `/admin/${adminSlug}/service-pos`, icon: ClipboardDocumentListIcon },
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    
    { label: "Projects", href: `/admin/${adminSlug}/projects`, icon: PresentationChartBarIcon },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "blogs", href: `/admin/${adminSlug}/blogs`, icon: WrenchScrewdriverIcon },
    // { label: "Testimonials", href: `/admin/${adminSlug}/testimonials`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Blog & Content": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "Blogs",
      icon: DocumentTextIcon,
      subItems: [
        { label: "All Blogs", href: `/admin/${adminSlug}/blogs` },
      ],
    },
    { label: "Writers", href: `/admin/${adminSlug}/writers`, icon: UsersIcon },
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    { label: "Podcast", href: `/admin/${adminSlug}/podcast`, icon: ClipboardDocumentListIcon },
    { label: "Comments", href: `/admin/${adminSlug}/comments`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Analytics", href: `/admin/${adminSlug}/analytics`, icon: ChartBarIcon },
  ],

  "Directory & Listings": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Listings", href: `/admin/${adminSlug}/listings`, icon: BuildingOfficeIcon },
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    { label: "Reviews", href: `/admin/${adminSlug}/reviews`, icon: ChatBubbleBottomCenterTextIcon },
  ],

  "Educational & Online Courses": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },    
    {
      label: "Management",
      icon: ClipboardDocumentListIcon,
      subItems: [
        
        { label: "Departments", href: `/admin/${adminSlug}/departments` },
        { label: "Categories", href: `/admin/${adminSlug}/categories` },
        { label: "TimeTable", href: `/admin/${adminSlug}/lessons` },
        { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        { label: "Courses", href: `/admin/${adminSlug}/courses` },
        { label: "Course Materials", href: `/admin/${adminSlug}/course-materials` },
        { label: "Academic Levels", href: `/admin/${adminSlug}/academic-levels` },
        { label: "Teachers", href: `/admin/${adminSlug}/teachers` },
        { label: "Parents", href: `/admin/${adminSlug}/parents` },     
        { label: "Students", href: `/admin/${adminSlug}/students` },           
        { label: "FEE", href: `/admin/${adminSlug}/fee` },       
      ],
    },
    {
      label: "Exams/Assessments",
      icon: AcademicCapIcon,
      subItems: [
        { label: "Exams", href: `/admin/${adminSlug}/exams` },
        { label: "Results", href: `/admin/${adminSlug}/results` },
      ],
    },    
    { label: "Attendance", href: `/admin/${adminSlug}/attendance`, icon: HomeIcon },
    {
      label: "Events",
      icon: AcademicCapIcon,
      subItems: [
        { label: "All Events", href: `/admin/${adminSlug}/school-events` },
      ],
    },    
    { label: "Announcements", href: `/admin/${adminSlug}/schoolAnnouncements`, icon: AcademicCapIcon },
    { label: "Reports", href: `/admin/${adminSlug}/school-reports`, icon: HomeIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],
  
  "Nonprofit & Community": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Projects", href: `/admin/${adminSlug}/projects`, icon: PresentationChartBarIcon },
    { label: "Donations", href: `/admin/${adminSlug}/donations`, icon: HeartIcon },
    { label: "Campaigns", href: `/admin/${adminSlug}/campaigns`, icon: MegaphoneIcon }, // Added Campaigns link
    { label: "Donors", href: `/admin/${adminSlug}/donors`, icon: UsersIcon },
    { label: "Members", href: `/admin/${adminSlug}/members`, icon: UsersIcon },
  ],

  "Restaurant & Food Delivery": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },    
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
    { label: "POS", href: `/admin/${adminSlug}/pos`, icon: ClipboardDocumentListIcon },
    { label: "Menu", href: `/admin/${adminSlug}/menu`, icon: ClipboardDocumentListIcon },
    { label: "Orders", href: `/admin/${adminSlug}/orders`, icon: UsersIcon },
    { label: "Delivery", href: `/admin/${adminSlug}/delivery`, icon: GlobeAltIcon },
  ],
  
 "Event & Ticketing": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "POS", href: `/admin/${adminSlug}/company-pos`, icon: CreditCardIcon }, // Changed icon for POS for better representation
    { label: "Events", href: `/admin/${adminSlug}/company-events`, icon: CalendarIcon },
    { label: "Manage Events", href: `/admin/${adminSlug}/manage-events`, icon: TicketIcon },
    { label: "Tickets", href: `/admin/${adminSlug}/manage-tickets`, icon: TicketIcon }, // Changed icon to TicketIcon for clarity
    { label: "Attendees", href: `/admin/${adminSlug}/manage-attendees`, icon: UsersIcon },
    { label: "Orders", href: `/admin/${adminSlug}/manage-event-orders`, icon: ShoppingBagIcon }, // Added Orders for transaction tracking
    { label: "Check-in", href: `/admin/${adminSlug}/manage-check-in`, icon: QrCodeIcon }, // For attendee check-in at events
  ],

  "Content Management": [
    { label: "Pages", href: `/admin/${adminSlug}/pages`, icon: DocumentTextIcon }, // For static pages like About Us, Contact
    { label: "Blog Posts", href: `/admin/${adminSlug}/blog`, icon: NewspaperIcon }, // If you have a blog
    { label: "Announcements", href: `/admin/${adminSlug}/announcements`, icon: MegaphoneIcon }, // For site-wide announcements
    { label: "Promotions", href: `/admin/${adminSlug}/promotions`, icon: TagIcon }, // For discounts, promo codes
    { label: "Sponsors", href: `/admin/${adminSlug}/sponsors`, icon: HandRaisedIcon }, // If events have sponsors
    { label: "Media Library", href: `/admin/${adminSlug}/media`, icon: PhotoIcon }, // Central place for images, videos
  ],

  "User Management": [
    { label: "Users", href: `/admin/${adminSlug}/users`, icon: UserGroupIcon }, // Manage all platform users
    { label: "Roles & Permissions", href: `/admin/${adminSlug}/roles`, icon: KeyIcon }, // If you have different admin/organizer roles
    { label: "Organizers", href: `/admin/${adminSlug}/organizers`, icon: BuildingOfficeIcon }, // Manage event organizers (if distinct from general users)
  ],

  "Financials & Reports": [
    { label: "Payouts", href: `/admin/${adminSlug}/payouts`, icon: BanknotesIcon }, // Track money paid out to organizers
    { label: "Transactions", href: `/admin/${adminSlug}/transactions`, icon: ReceiptPercentIcon }, // Detailed transaction logs
    { label: "Revenue Reports", href: `/admin/${adminSlug}/reports/revenue`, icon: ChartBarIcon },
    { label: "Sales Reports", href: `/admin/${adminSlug}/reports/sales`, icon: ChartPieIcon },
  ],
  
  "Settings": [
    { label: "General Settings", href: `/admin/${adminSlug}/settings/general`, icon: Cog6ToothIcon },
    { label: "Profile", href: `/admin/${adminSlug}/settings/profile`, icon: UserCircleIcon }, // Admin user profile settings
    { label: "Integrations", href: `/admin/${adminSlug}/settings/integrations`, icon: PuzzlePieceIcon }, // API keys, third-party connections
    { label: "Audit Log", href: `/admin/${adminSlug}/settings/audit-log`, icon: ListBulletIcon }, // Track admin actions
  ],

  "Real Estate": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon }, // Overall view of key metrics
      { label: "Properties", href: `/admin/${adminSlug}/properties`, icon: BuildingOfficeIcon }, // Manage all property listings (add, edit, delete, status)
      { label: "Agents", href: `/admin/${adminSlug}/properties-agents`, icon: UsersIcon }, // Manage agent profiles, performance, and assignments
      { label: "Clients", href: `/admin/${adminSlug}/properties-clients`, icon: UserGroupIcon }, // Manage client profiles, inquiries, and history (changed to UserGroupIcon for clarity)
      { label: "Inquiries", href: `/admin/${adminSlug}/properties-inquiries`, icon: ChatBubbleLeftRightIcon }, // Track and manage all property inquiries and messages
      { label: "Showings", href: `/admin/${adminSlug}/properties-showings`, icon: CalendarDaysIcon }, // Schedule and manage property viewings
      { label: "Offers & Contracts", href: `/admin/${adminSlug}/properties-offers`, icon: DocumentTextIcon }, // Manage offers, sales agreements, and contracts
      { label: "Categories", href: `/admin/${adminSlug}/properties-categories`, icon: TagIcon }, // Manage property categories (e.g., Residential, Commercial, Land)
      { label: "Locations", href: `/admin/${adminSlug}/properties-locations`, icon: MapPinIcon }, // Manage geographic locations for listings
  ],

  
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

  "Healthcare & Clinics": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "POS", href: `/admin/${adminSlug}/health-pos`, icon: ClipboardDocumentListIcon },
    { label: "Patients", href: `/admin/${adminSlug}/health-patients`, icon: UsersIcon },
    { label: "Appointments", href: `/admin/${adminSlug}/health-appointments`, icon: CalendarIcon },
    { label: "Doctors", href: `/admin/${adminSlug}/health-doctors`, icon: BriefcaseIcon },
    { label: "Staff", href: `/admin/${adminSlug}/health-staff`, icon: UserGroupIcon }, // Manage all clinic staff
    { label: "Services", href: `/admin/${adminSlug}/health-services`, icon: HeartIcon }, // Manage medical services offered
    { label: "Prescriptions", href: `/admin/${adminSlug}/health-prescriptions`, icon: DocumentTextIcon }, // Manage patient prescriptions
    { label: "Billing & Invoices", href: `/admin/${adminSlug}/health-billing`, icon: CreditCardIcon }, // Handle financial transactions
    { label: "Inventory", href: `/admin/${adminSlug}/health-inventory`, icon: CubeTransparentIcon }, // Manage medical supplies and equipment
    { label: "Reports", href: `/admin/${adminSlug}/health-reports`, icon: ChartBarIcon }, // Generate various clinic reports
    { label: "Settings", href: `/admin/${adminSlug}/health-settings`, icon: Cog6ToothIcon }, // Clinic-wide settings
  ],

  "SaaS & Web Apps": [
      {label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon,  },
      {
        label: "Users",  href: `/admin/${adminSlug}/saas-users`, icon: UsersIcon,  },
      {
        label: "Plans & Subscriptions",
        href: "/admin/${adminSlug}/saas-plans",
        icon: ClipboardDocumentListIcon,
      },
      {
        label: "Billing & Payments",
        href: `/admin/${adminSlug}/saas-billing`,
        icon: CreditCardIcon,
      },
      {
        label: "General Settings",
        href: `/admin/${adminSlug}/saas-settings`,
        icon: Cog6ToothIcon,
      },
      {
        label: "Analytics",
        href: `/admin/${adminSlug}/saas-analytics`,
        icon: ChartBarIcon,
      },
      {
        label: "Reports",
        href: `/admin/${adminSlug}/saas-reports`,
        icon: DocumentChartBarIcon,
      },
      {
        label: "Support Tickets",
        href: `/admin/${adminSlug}/saas-support`,
        icon: LifebuoyIcon,
      },
      {
        label: "Announcements",
        href: `/admin/${adminSlug}/saas-announcements`,
        icon: MegaphoneIcon,
      },
      {
        label: "Content (CMS)",
        href: `/admin/${adminSlug}/saas-content`,
        icon: DocumentTextIcon,
      },
      {
        label: "API Keys",
        href: `/admin/${adminSlug}/saas-api-keys`,
        icon: KeyIcon,
      },
      {
        label: "Audit Log",
        href: `/admin/${adminSlug}/saas-audit-log`,
        icon: ClipboardDocumentCheckIcon,
      },
      {
        label: "System Status",
        href: `/admin/${adminSlug}/saas-status`,
        icon: ServerStackIcon,
      }
    ],

  "Media & Entertainment": [
    { 
      label: "Dashboard", 
      href: `/admin/${adminSlug}`, 
      icon: HomeIcon,
    },
    { 
      label: "Content Library", // Renamed for clarity
      href: `/admin/${adminSlug}/media-content`, // Unified content management
      icon: FilmIcon, // Covers both video and general media
    },
    { 
      label: "Article Management", // Specific for articles
      href: `/admin/${adminSlug}/media-articles`, 
      icon: NewspaperIcon,
    },
    { 
      label: "Video Management", // Specific for videos
      href: `/admin/${adminSlug}/media-videos`, 
      icon: VideoCameraIcon,
    },
    { 
      label: "Publishing Schedule", // More descriptive
      href: `/admin/${adminSlug}/media-schedule`, 
      icon: CalendarIcon,
    },
    { 
      label: "User Management", // Essential for any platform
      href: `/admin/${adminSlug}/media-users`, 
      icon: UsersIcon,
    },
    { 
      label: "Sponsors & Partnerships", // More descriptive
      href: `/admin/${adminSlug}/media-sponsors`, 
      icon: BriefcaseIcon,
    },
    { 
      label: "Analytics", // For insights
      href: `/admin/${adminSlug}/media-analytics`, 
      icon: ChartBarIcon,
    },
    {
      label: "Featured & Top Picks", // For managing highlighted content
      href: `/admin/${adminSlug}/media-featured-picks`,
      icon: StarIcon,
    },
  ],

  "Finance & Legal": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Clients", href: `/admin/${adminSlug}/finance-clients`, icon: UsersIcon },
    { label: "Cases & Matters", href: `/admin/${adminSlug}/finance-cases`, icon: BriefcaseIcon }, // For legal cases/financial matters
    { label: "Documents", href: `/admin/${adminSlug}/finance-documents`, icon: DocumentTextIcon },
    { label: "Appointments", href: `/admin/${adminSlug}/finance-appointments`, icon: CalendarDaysIcon }, // For scheduling consultations
    { label: "Billing & Invoices", href: `/admin/${adminSlug}/finance-invoices`, icon: ClipboardDocumentListIcon }, // More explicit name
    { label: "Experts/Team", href: `/admin/${adminSlug}/finance-team`, icon: ShieldCheckIcon }, // Manage experts/advisors
    { label: "Packages & Pricing", href: `/admin/${adminSlug}/finance-packages`, icon: TagIcon }, // Manage consultation packages
    { label: "Testimonials", href: `/admin/${adminSlug}/finance-testimonials`, icon: ChatBubbleLeftRightIcon }, // Manage client feedback
    { label: "FAQs", href: `/admin/${adminSlug}/finance-faqs`, icon: QuestionMarkCircleIcon }, // Manage frequently asked questions
    { label: "Settings", href: `/admin/${adminSlug}/finance-settings`, icon: Cog6ToothIcon }, // General admin settings
  ],

  "Automotive": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Vehicles", href: `/admin/${adminSlug}/vehicle-manage`, icon: FilmIcon },
    { label: "Requests", href: `/admin/${adminSlug}/vehicle-requests`, icon: ClipboardDocumentListIcon },
    { label: "Clients", href: `/admin/${adminSlug}/vehicle-clients`, icon: UsersIcon },
  ],

  "Travel & Tourism": [
    {
      label: "Dashboard",
      href: `/admin/${adminSlug}`,
      icon: HomeIcon
    },
    {
      label: "Bookings",
      href: `/admin/${adminSlug}/travel-bookings`,
      icon: CalendarDaysIcon
    },
    {
      label: "Destinations",
      href: `/admin/${adminSlug}/travel-destinations`,
      icon: GlobeAltIcon
    },
    {
      label: "Packages & Tours",
      href: `/admin/${adminSlug}/travel-packages`,
      icon: BriefcaseIcon
    },
    {
      label: "Users & Customers",
      href: `/admin/${adminSlug}/travel-users`,
      icon: UsersIcon
    },
    {
      label: "Travel Experts",
      href: `/admin/${adminSlug}/travel-experts`,
      icon: UserGroupIcon
    },
    {
      label: "Virtual Tours",
      href: `/admin/${adminSlug}/travel-virtual-tours`,
      icon: PlayCircleIcon
    },
    {
      label: "Testimonials",
      href: `/admin/${adminSlug}/travel-testimonials`,
      icon: ChatBubbleLeftRightIcon
    },
    {
      label: "Blog & Content",
      href: `/admin/${adminSlug}/travel-blog`,
      icon: NewspaperIcon
    },
    {
      label: "Promotions & Deals",
      href: `/admin/${adminSlug}/travel-promotions`,
      icon: TagIcon
    },
    {
      label: "Inquiries",
      href: `/admin/${adminSlug}/travel-inquiries`,
      icon: QuestionMarkCircleIcon
    },
    {
      label: "Settings",
      href: `/admin/${adminSlug}/travel-settings`,
      icon: Cog6ToothIcon
    }
  ],

  "Fitness & Wellness": [
        { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon }, // Overview of gym activity
        { label: "POS & Sales", href: `/admin/${adminSlug}/fitness-pos`, icon: CurrencyDollarIcon }, // Point of Sale and transaction management
        { label: "Programs & Classes", href: `/admin/${adminSlug}/fitness-programs`, icon : ClipboardDocumentListIcon}, // Manage fitness programs, classes, schedules
        { label: "Trainers & Staff", href: `/admin/${adminSlug}/fitness-trainers`, icon : BriefcaseIcon}, // Manage trainer profiles, availability
        { label: "Clients & Members", href: `/admin/${adminSlug}/fitness-clients`, icon : UsersIcon}, // Manage client accounts, memberships, progress
        { label: "Locations & Facilities", href: `/admin/${adminSlug}/fitness-locations`, icon : MapPinIcon}, // Manage physical gym locations, equipment, rooms
        { label: "Bookings & Schedule", href: `/admin/${adminSlug}/fitness-bookings`, icon : CalendarDaysIcon}, // Manage class and personal training bookings
        { label: "Notifications & Comms", href: `/admin/${adminSlug}/fitness-notifications`, icon : BellIcon}, // Send announcements, newsletters, client messages
        { label: "Reports & Analytics", href: `/admin/${adminSlug}/fitness-reports`, icon : ChartBarIcon}, // View performance metrics, sales reports
        { label: "Settings", href: `/admin/${adminSlug}/fitness-settings`, icon : Cog6ToothIcon}, // General administrative settings, user roles
    ],
    // You could also categorize into more specific sections if the admin grows
    "Marketing & Engagement": [
        { label: "Content Management", href: `/admin/${adminSlug}/content`, icon : PencilSquareIcon}, // Blog posts, articles, website content
        { label: "Promotions & Deals", href: `/admin/${adminSlug}/promotions`, icon : TagIcon}, // Create and manage discounts, special offers
        { label: "Testimonials", href: `/admin/${adminSlug}/testimonials`, icon : ChatBubbleLeftRightIcon}, // Manage client testimonials
        { label: "FAQs", href: `/admin/${adminSlug}/faqs`, icon : QuestionMarkCircleIcon}, // Manage frequently asked questions
    ],
    "Billing & Finance": [
        { label: "Invoices", href: `/admin/${adminSlug}/invoices`, icon : DocumentTextIcon},
        { label: "Payments", href: `/admin/${adminSlug}/payments`, icon : CreditCardIcon},
        { label: "Refunds", href: `/admin/${adminSlug}/refunds`, icon : ArrowUturnLeftIcon},
    ],

  "Marketplace": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "POS", href: `/admin/${adminSlug}/pos`, icon: ClipboardDocumentListIcon },
    { label: "Vendors", href: `/admin/${adminSlug}/vendors`, icon: UsersIcon },
    { label: "Products", href: `/admin/${adminSlug}/products`, icon: ClipboardDocumentListIcon },
    { label: "Orders", href: `/admin/${adminSlug}/orders`, icon: UsersIcon },
  ],

  "Tutor": [
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
    { label: "Assigned Classes", href: `/admin/${adminSlug}/teacherclasslist`, icon: UsersIcon },
    { label: "Assigned Subjects", href: `/admin/${adminSlug}/teachersubjectlist`, icon: ClipboardDocumentListIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/teacherschedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Lecturer": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Assigned Classes", href: `/admin/${adminSlug}/teacherclasslist`, icon: UsersIcon },
    { label: "Assigned Subjects", href: `/admin/${adminSlug}/teachersubjectlist`, icon: ClipboardDocumentListIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/teacherschedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
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
  ],

  "Teacher": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Assigned Classes", href: `/admin/${adminSlug}/teacherclasslist`, icon: UsersIcon },
    { label: "Assigned Subjects", href: `/admin/${adminSlug}/teachersubjectlist`, icon: ClipboardDocumentListIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/teacherschedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
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
  ],

  "Student": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "My Classes", href: `/admin/${adminSlug}/studentclasses`, icon: ClipboardDocumentListIcon },
    { label: "Assignments", href: `/admin/${adminSlug}/studentassignments`, icon: DocumentTextIcon },
    { label: "Grades", href: `/admin/${adminSlug}/studentgrades`, icon: ChartBarIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/studentschedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/studentmessages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Resources", href: `/admin/${adminSlug}/studentresources`, icon: PresentationChartBarIcon },
  ],

  "Pupil": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "My Classes", href: `/admin/${adminSlug}/studentclasses`, icon: ClipboardDocumentListIcon },
    { label: "Assignments", href: `/admin/${adminSlug}/studentassignments`, icon: DocumentTextIcon },
    { label: "Grades", href: `/admin/${adminSlug}/studentgrades`, icon: ChartBarIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/studentschedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/studentmessages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Resources", href: `/admin/${adminSlug}/studentresources`, icon: PresentationChartBarIcon },
  ],

  "School Head": [
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
        { label: "Attendance Report", href: `/admin/${adminSlug}/reports/attendance` },
        { label: "Performance", href: `/admin/${adminSlug}/reports/performance` },
      ],
    },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Head Teacher": [
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
        { label: "Attendance Report", href: `/admin/${adminSlug}/reports/attendance` },
        { label: "Performance", href: `/admin/${adminSlug}/reports/performance` },
      ],
    },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],


  "Other": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],
});
