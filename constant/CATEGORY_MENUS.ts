import {
  HomeIcon,
  UsersIcon,
  ChartBarIcon,
  CalendarIcon,
  ChatBubbleBottomCenterTextIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowRightOnRectangleIcon,
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
  // CarIcon,
} from "@heroicons/react/24/outline";

// Helper to inject dynamic adminSlug
export const getCategoryMenus = (adminSlug: string) => ({
  "E-commerce": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Browse Catalog", href: `/admin/${adminSlug}/inventory` },
        { label: "Market List", href: `/admin/${adminSlug}/mymarketplace` },
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
    { label: "Reports", href: `/admin/${adminSlug}/reports`, icon: ChartBarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Service Provider": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "Bookings",
      icon: CalendarIcon,
      subItems: [
        { label: "Manage Appointments", href: `/admin/${adminSlug}/appointments` },
        { label: "Clients", href: `/admin/${adminSlug}/clients` },
      ],
    },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "Reports", href: `/admin/${adminSlug}/reports`, icon: ChartBarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Booking & Appointments": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Calendar", href: `/admin/${adminSlug}/calendar`, icon: CalendarIcon },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "Appointments", href: `/admin/${adminSlug}/appointments`, icon: ClipboardDocumentListIcon },
    { label: "Clients", href: `/admin/${adminSlug}/clients`, icon: UsersIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Portfolio & Personal Branding": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Projects", href: `/admin/${adminSlug}/projects`, icon: PresentationChartBarIcon },
    { label: "Services", href: `/admin/${adminSlug}/services`, icon: WrenchScrewdriverIcon },
    { label: "Testimonials", href: `/admin/${adminSlug}/testimonials`, icon: ChatBubbleBottomCenterTextIcon },
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
    { label: "Categories", href: `/admin/${adminSlug}/categories`, icon: ClipboardDocumentListIcon },
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
      label: "Courses",
      icon: AcademicCapIcon,
      subItems: [
        { label: "All Courses", href: `/admin/${adminSlug}/courses` },
        { label: "Add Course", href: `/admin/${adminSlug}/courses/new` },
      ],
    },
    { label: "Students", href: `/admin/${adminSlug}/students`, icon: UsersIcon },
    { label: "Instructors", href: `/admin/${adminSlug}/instructors`, icon: BriefcaseIcon },
  ],

  "Nonprofit & Community": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Projects", href: `/admin/${adminSlug}/projects`, icon: PresentationChartBarIcon },
    { label: "Donations", href: `/admin/${adminSlug}/donations`, icon: HeartIcon },
    { label: "Members", href: `/admin/${adminSlug}/members`, icon: UsersIcon },
  ],

  "Restaurant & Food Delivery": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Menu", href: `/admin/${adminSlug}/menu`, icon: ClipboardDocumentListIcon },
    { label: "Orders", href: `/admin/${adminSlug}/orders`, icon: UsersIcon },
    { label: "Delivery", href: `/admin/${adminSlug}/delivery`, icon: GlobeAltIcon },
  ],

  "Event & Ticketing": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Events", href: `/admin/${adminSlug}/events`, icon: CalendarIcon },
    { label: "Tickets", href: `/admin/${adminSlug}/tickets`, icon: ClipboardDocumentListIcon },
    { label: "Attendees", href: `/admin/${adminSlug}/attendees`, icon: UsersIcon },
  ],

  "Real Estate": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Properties", href: `/admin/${adminSlug}/properties`, icon: BuildingOfficeIcon },
    { label: "Agents", href: `/admin/${adminSlug}/agents`, icon: UsersIcon },
    { label: "Clients", href: `/admin/${adminSlug}/clients`, icon: UsersIcon },
  ],

  "Healthcare & Clinics": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Patients", href: `/admin/${adminSlug}/patients`, icon: UsersIcon },
    { label: "Appointments", href: `/admin/${adminSlug}/appointments`, icon: CalendarIcon },
    { label: "Doctors", href: `/admin/${adminSlug}/doctors`, icon: BriefcaseIcon },
  ],

  "SaaS & Web Apps": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Users", href: `/admin/${adminSlug}/users`, icon: UsersIcon },
    { label: "Plans", href: `/admin/${adminSlug}/plans`, icon: ClipboardDocumentListIcon },
    { label: "Billing", href: `/admin/${adminSlug}/billing`, icon: CreditCardIcon },
  ],

  "Media & Entertainment": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Media Library", href: `/admin/${adminSlug}/media`, icon: FilmIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Sponsors", href: `/admin/${adminSlug}/sponsors`, icon: BriefcaseIcon },
  ],

  "Finance & Legal": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Clients", href: `/admin/${adminSlug}/clients`, icon: UsersIcon },
    { label: "Invoices", href: `/admin/${adminSlug}/invoices`, icon: ClipboardDocumentListIcon },
    { label: "Documents", href: `/admin/${adminSlug}/documents`, icon: DocumentTextIcon },
  ],

  "Automotive": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Vehicles", href: `/admin/${adminSlug}/vehicles`, icon: FilmIcon },
    { label: "Requests", href: `/admin/${adminSlug}/requests`, icon: ClipboardDocumentListIcon },
    { label: "Clients", href: `/admin/${adminSlug}/clients`, icon: UsersIcon },
  ],

  "Travel & Tourism": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Destinations", href: `/admin/${adminSlug}/destinations`, icon: GlobeAltIcon },
    { label: "Bookings", href: `/admin/${adminSlug}/bookings`, icon: CalendarIcon },
    { label: "Packages", href: `/admin/${adminSlug}/packages`, icon: ClipboardDocumentListIcon },
  ],

  "Fitness & Wellness": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Programs", href: `/admin/${adminSlug}/programs`, icon: ClipboardDocumentListIcon },
    { label: "Trainers", href: `/admin/${adminSlug}/trainers`, icon: BriefcaseIcon },
    { label: "Clients", href: `/admin/${adminSlug}/clients`, icon: UsersIcon },
  ],

  "Marketplace": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "Vendors", href: `/admin/${adminSlug}/vendors`, icon: UsersIcon },
    { label: "Products", href: `/admin/${adminSlug}/products`, icon: ClipboardDocumentListIcon },
    { label: "Orders", href: `/admin/${adminSlug}/orders`, icon: UsersIcon },
  ],

  "Tutor": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "My Classes",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Class List", href: `/admin/${adminSlug}/classes` },
        { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        { label: "Materials", href: `/admin/${adminSlug}/materials` },
      ],
    },
    {
      label: "Students",
      icon: UsersIcon,
      subItems: [
        { label: "Student List", href: `/admin/${adminSlug}/students` },
        { label: "Grades & Feedback", href: `/admin/${adminSlug}/grades` },
        { label: "Attendance", href: `/admin/${adminSlug}/attendance` },
      ],
    },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Lecturer": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "My Classes",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Class List", href: `/admin/${adminSlug}/classes` },
        { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        { label: "Materials", href: `/admin/${adminSlug}/materials` },
      ],
    },
    {
      label: "Students",
      icon: UsersIcon,
      subItems: [
        { label: "Student List", href: `/admin/${adminSlug}/students` },
        { label: "Grades & Feedback", href: `/admin/${adminSlug}/grades` },
        { label: "Attendance", href: `/admin/${adminSlug}/attendance` },
      ],
    },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Teacher": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    {
      label: "My Classes",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Class List", href: `/admin/${adminSlug}/classes` },
        { label: "Assignments", href: `/admin/${adminSlug}/assignments` },
        { label: "Materials", href: `/admin/${adminSlug}/materials` },
      ],
    },
    {
      label: "Students",
      icon: UsersIcon,
      subItems: [
        { label: "Student List", href: `/admin/${adminSlug}/students` },
        { label: "Grades & Feedback", href: `/admin/${adminSlug}/grades` },
        { label: "Attendance", href: `/admin/${adminSlug}/attendance` },
      ],
    },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Settings", href: `/admin/${adminSlug}/settings`, icon: Cog6ToothIcon },
  ],

  "Students": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "My Classes", href: `/admin/${adminSlug}/myclasses`, icon: ClipboardDocumentListIcon },
    { label: "Assignments", href: `/admin/${adminSlug}/assignments`, icon: DocumentTextIcon },
    { label: "Grades", href: `/admin/${adminSlug}/grades`, icon: ChartBarIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Resources", href: `/admin/${adminSlug}/resources`, icon: PresentationChartBarIcon },
  ],

  "Pupil": [
    { label: "Dashboard", href: `/admin/${adminSlug}`, icon: HomeIcon },
    { label: "My Classes", href: `/admin/${adminSlug}/myclasses`, icon: ClipboardDocumentListIcon },
    { label: "Assignments", href: `/admin/${adminSlug}/assignments`, icon: DocumentTextIcon },
    { label: "Grades", href: `/admin/${adminSlug}/grades`, icon: ChartBarIcon },
    { label: "Schedule", href: `/admin/${adminSlug}/schedule`, icon: CalendarIcon },
    { label: "Messages", href: `/admin/${adminSlug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
    { label: "Resources", href: `/admin/${adminSlug}/resources`, icon: PresentationChartBarIcon },
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
