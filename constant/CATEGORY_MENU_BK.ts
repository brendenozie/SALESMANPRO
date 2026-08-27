// src/constants/adminMenus.ts
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
} from "@heroicons/react/24/outline";

// Reusable Common Menus
const COMMON_ITEMS = (slug: string) => [
  { label: "Dashboard", href: `/admin/${slug}`, icon: HomeIcon },
  { label: "Messages", href: `/admin/${slug}/messages`, icon: ChatBubbleBottomCenterTextIcon },
  { label: "Settings", href: `/admin/${slug}/settings`, icon: Cog6ToothIcon },
];

const teacherClassSubItems = (slug: string) => [
  { label: "Class List", href: `/admin/${slug}/teacherclasseslist` },
  { label: "Assignments", href: `/admin/${slug}/teacherassignments` },
  { label: "Materials", href: `/admin/${slug}/teachermaterials` },
];

const studentSubItems = (slug: string) => [
  { label: "Student List", href: `/admin/${slug}/teacherstudents` },
  { label: "Grades & Feedback", href: `/admin/${slug}/teachergrades` },
  { label: "Attendance", href: `/admin/${slug}/teacherattendance` },
];

// Service Provider
// Booking & Appointments
// Portfolio & Personal Branding
// Blog & Content
// Directory & Listings
// Restaurant & Food Delivery
// Event & Ticketing
// Real Estate
// Healthcare & Clinics
// SaaS & Web Apps
// Media & Entertainment
// Finance & Legal
// Automotive
// Travel & Tourism
// Fitness & Wellness
// Marketplace
// Head Teacher
// School Head
// Pupil


const categories = [
  {
    key: "E-commerce",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      {
        label: "Products",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Browse Catalog", href: `/admin/${slug}/inventory` },
          { label: "Market List", href: `/admin/${slug}/mymarketplace` },
        ],
      },
      {
        label: "Orders",
        icon: UsersIcon,
        subItems: [
          { label: "Agent Orders", href: `/admin/${slug}/agentorders` },
          { label: "Client Orders", href: `/admin/${slug}/clientorders` },
          { label: "Marketplace", href: `/admin/${slug}/customerorders` },
        ],
      },
      { label: "Reports", href: `/admin/${slug}/reports`, icon: ChartBarIcon },
    ],
  },
  {
    key: "Service Provider",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Services", href: `/admin/${slug}/services`, icon: WrenchScrewdriverIcon },
      { label: "Appointments", href: `/admin/${slug}/appointments`, icon: CalendarIcon },
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
    ],
  },
  {
    key: "Booking & Appointments",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Appointments", href: `/admin/${slug}/appointments`, icon: CalendarIcon },
      { label: "Services", href: `/admin/${slug}/services`, icon: ClipboardDocumentListIcon },
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
    ],
  },
  {
    key: "Portfolio & Personal Branding",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Projects", href: `/admin/${slug}/projects`, icon: PresentationChartBarIcon },
      { label: "Services", href: `/admin/${slug}/services`, icon: WrenchScrewdriverIcon },
      { label: "Testimonials", href: `/admin/${slug}/testimonials`, icon: ChatBubbleBottomCenterTextIcon },
    ],
  },
  {
    key: "Teacher",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      {
        label: "My Classes",
        icon: ClipboardDocumentListIcon,
        subItems: teacherClassSubItems(slug),
      },
      {
        label: "Students",
        icon: UsersIcon,
        subItems: studentSubItems(slug),
      },
      { label: "Schedule", href: `/admin/${slug}/teacherschedule`, icon: CalendarIcon },
    ],
  },
  {
    key: "School Head",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Teachers", href: `/admin/${slug}/teachers`, icon: UsersIcon },
      { label: "Students", href: `/admin/${slug}/students`, icon: UsersIcon },
      { label: "Classes", href: `/admin/${slug}/classes`, icon: ClipboardDocumentListIcon },
      { label: "Reports", href: `/admin/${slug}/school-reports`, icon: ChartBarIcon },
    ],
  },
  {
    key: "Pupil",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "My Classes", href: `/admin/${slug}/pupilclasses`, icon: ClipboardDocumentListIcon },
      { label: "Assignments", href: `/admin/${slug}/pupilassignments`, icon: DocumentTextIcon },
      { label: "Grades", href: `/admin/${slug}/pupilgrades`, icon: ChartBarIcon },
      { label: "Schedule", href: `/admin/${slug}/pupilschedule`, icon: CalendarIcon },
      { label: "Messages", href: `/admin/${slug}/pupilmessages`, icon: ChatBubbleBottomCenterTextIcon },
      { label: "Resources", href: `/admin/${slug}/pupilresources`, icon: PresentationChartBarIcon },
    ],
  },
  {
    key: "Students",
    items: (slug: string) => [
      { label: "Dashboard", href: `/admin/${slug}`, icon: HomeIcon },
      { label: "My Classes", href: `/admin/${slug}/studentclasses`, icon: ClipboardDocumentListIcon },
      { label: "Assignments", href: `/admin/${slug}/studentassignments`, icon: DocumentTextIcon },
      { label: "Grades", href: `/admin/${slug}/studentgrades`, icon: ChartBarIcon },
      { label: "Schedule", href: `/admin/${slug}/studentschedule`, icon: CalendarIcon },
      { label: "Messages", href: `/admin/${slug}/studentmessages`, icon: ChatBubbleBottomCenterTextIcon },
      { label: "Resources", href: `/admin/${slug}/studentresources`, icon: PresentationChartBarIcon },
    ],
  },
  {
    key: "Blog & Content",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Posts", href: `/admin/${slug}/posts`, icon: DocumentTextIcon },
      { label: "Categories", href: `/admin/${slug}/categories`, icon: ClipboardDocumentListIcon },
      { label: "Comments", href: `/admin/${slug}/comments`, icon: ChatBubbleBottomCenterTextIcon },
    ],
  },
  {
    key: "Directory & Listings",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Listings", href: `/admin/${slug}/listings`, icon: BuildingOfficeIcon },
      { label: "Categories", href: `/admin/${slug}/directory-categories`, icon: ClipboardDocumentListIcon },
      { label: "Reviews", href: `/admin/${slug}/reviews`, icon: ChatBubbleBottomCenterTextIcon },
    ],
  },
  {
    key: "Restaurant & Food Delivery",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Menu", href: `/admin/${slug}/menu`, icon: ClipboardDocumentListIcon },
      { label: "Orders", href: `/admin/${slug}/orders`, icon: UsersIcon },
      { label: "Reservations", href: `/admin/${slug}/reservations`, icon: CalendarIcon },
    ],
  },
  {
    key: "Finance & Legal",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
      { label: "Invoices", href: `/admin/${slug}/invoices`, icon: CreditCardIcon },
      { label: "Reports", href: `/admin/${slug}/reports`, icon: ChartBarIcon },
    ],
  },
  {
    key: "Real Estate",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Properties", href: `/admin/${slug}/properties`, icon: BuildingOfficeIcon },
      { label: "Agents", href: `/admin/${slug}/agents`, icon: UsersIcon },
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
    ],
  },
  {
    key: "SaaS & Web Apps",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Users", href: `/admin/${slug}/users`, icon: UsersIcon },
      { label: "Plans", href: `/admin/${slug}/plans`, icon: ClipboardDocumentListIcon },
      { label: "Billing", href: `/admin/${slug}/billing`, icon: CreditCardIcon },
    ],
  },
  {
    key: "Healthcare & Clinics",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Patients", href: `/admin/${slug}/patients`, icon: UsersIcon },
      { label: "Appointments", href: `/admin/${slug}/appointments`, icon: CalendarIcon },
      { label: "Doctors", href: `/admin/${slug}/doctors`, icon: BriefcaseIcon },
    ],
  },
  {
    key: "Educational & Online Courses",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      {
        label: "Management",
        icon: ClipboardDocumentListIcon,
        subItems: [
          { label: "Teachers", href: `/admin/${slug}/teachers` },
          { label: "Students", href: `/admin/${slug}/students` },
          { label: "Classes", href: `/admin/${slug}/classes` },
        ],
      },
      {
        label: "Courses",
        icon: AcademicCapIcon,
        subItems: [
          { label: "All Courses", href: `/admin/${slug}/courses` },
        ],
      },
      { label: "Reports", href: `/admin/${slug}/school-reports`, icon: ChartBarIcon },
    ],
  },
  {
    key: "Travel & Tourism",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Destinations", href: `/admin/${slug}/destinations`, icon: GlobeAltIcon },
      { label: "Bookings", href: `/admin/${slug}/bookings`, icon: CalendarIcon },
      { label: "Packages", href: `/admin/${slug}/packages`, icon: ClipboardDocumentListIcon },
    ],
  },
  {
    key: "Media & Entertainment",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Media Library", href: `/admin/${slug}/media`, icon: FilmIcon },
      { label: "Schedule", href: `/admin/${slug}/schedule`, icon: CalendarIcon },
      { label: "Sponsors", href: `/admin/${slug}/sponsors`, icon: BriefcaseIcon },
    ],
  },
  {
    key: "Event & Ticketing",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Events", href: `/admin/${slug}/events`, icon: CalendarIcon },
      { label: "Tickets", href: `/admin/${slug}/tickets`, icon: ClipboardDocumentListIcon },
      { label: "Attendees", href: `/admin/${slug}/attendees`, icon: UsersIcon },
    ],
  },
  {
    key: "Automotive",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Vehicles", href: `/admin/${slug}/vehicles`, icon: FilmIcon },
      { label: "Requests", href: `/admin/${slug}/requests`, icon: ClipboardDocumentListIcon },
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
    ],
  },
  {
    key: "Fitness & Wellness",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Programs", href: `/admin/${slug}/programs`, icon: ClipboardDocumentListIcon },
      { label: "Trainers", href: `/admin/${slug}/trainers`, icon: BriefcaseIcon },
      { label: "Clients", href: `/admin/${slug}/clients`, icon: UsersIcon },
    ],
  },
  {
    key: "Marketplace",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Vendors", href: `/admin/${slug}/vendors`, icon: UsersIcon },
      { label: "Products", href: `/admin/${slug}/products`, icon: ClipboardDocumentListIcon },
      { label: "Orders", href: `/admin/${slug}/orders`, icon: UsersIcon },
    ],
  },
  {
    key: "Nonprofit & Community",
    items: (slug: string) => [
      ...COMMON_ITEMS(slug),
      { label: "Projects", href: `/admin/${slug}/projects`, icon: PresentationChartBarIcon },
      { label: "Donations", href: `/admin/${slug}/donations`, icon: HeartIcon },
      { label: "Members", href: `/admin/${slug}/members`, icon: UsersIcon },
    ],
  },
  {
    key: "Other",
    items: (slug: string) => [
      { label: "Dashboard", href: `/admin/${slug}`, icon: HomeIcon },
      { label: "Settings", href: `/admin/${slug}/settings`, icon: Cog6ToothIcon },
    ],
  },
];

export const getCategoryMenus = (adminSlug: string): Record<string, any[]> => {
  return categories.reduce((acc, curr) => {
    acc[curr.key] = curr.items(adminSlug);
    return acc;
  }, {} as Record<string, any[]>);
};
