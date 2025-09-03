// constants/adminCategorySidebarMap.ts
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

export const adminCategorySidebarMap: Record<
  string,
  {
    label: string;
    icon: any;
    href?: (id: string) => string;
    subItems?: { label: string; href: (id: string) => string }[];
  }[]
> = {
  "e-commerce": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Browse Catalog", href: (id) => `/admin/${id}/inventory` },
        { label: "Market List", href: (id) => `/admin/${id}/mymarketplace` },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Agent Orders", href: (id) => `/admin/${id}/agentorders` },
        { label: "Client Orders", href: (id) => `/admin/${id}/clientorders` },
        { label: "Marketplace", href: (id) => `/admin/${id}/customerorders` },
      ],
    },
    { label: "Reports", icon: ChartBarIcon, href: (id) => `/admin/${id}/reports` },
    { label: "Messages", icon: ChatBubbleBottomCenterTextIcon, href: (id) => `/admin/${id}/messages` },
    { label: "Settings", icon: Cog6ToothIcon, href: (id) => `/admin/${id}/settings` },
  ],

  "shoes store": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    {
      label: "Products",
      icon: ClipboardDocumentListIcon,
      subItems: [
        { label: "Browse Catalog", href: (id) => `/admin/${id}/inventory` },
        { label: "Market List", href: (id) => `/admin/${id}/mymarketplace` },
      ],
    },
    {
      label: "Orders",
      icon: UsersIcon,
      subItems: [
        { label: "Agent Orders", href: (id) => `/admin/${id}/agentorders` },
        { label: "Client Orders", href: (id) => `/admin/${id}/clientorders` },
        { label: "Marketplace", href: (id) => `/admin/${id}/customerorders` },
      ],
    },
    { label: "Reports", icon: ChartBarIcon, href: (id) => `/admin/${id}/reports` },
    { label: "Messages", icon: ChatBubbleBottomCenterTextIcon, href: (id) => `/admin/${id}/messages` },
    { label: "Settings", icon: Cog6ToothIcon, href: (id) => `/admin/${id}/settings` },
  ],
  "real estate": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    { label: "Properties", icon: BuildingOfficeIcon, href: (id) => `/admin/${id}/properties` },
    { label: "Agents", icon: UsersIcon, href: (id) => `/admin/${id}/agents` },
    { label: "Clients", icon: UsersIcon, href: (id) => `/admin/${id}/clients` },
  ],

  "blog & content": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    {
      label: "Posts",
      icon: DocumentTextIcon,
      subItems: [
        { label: "All Posts", href: (id) => `/admin/${id}/posts` },
        { label: "Create New", href: (id) => `/admin/${id}/posts/new` },
      ],
    },
    { label: "Categories", icon: ClipboardDocumentListIcon, href: (id) => `/admin/${id}/categories` },
    { label: "Comments", icon: ChatBubbleBottomCenterTextIcon, href: (id) => `/admin/${id}/comments` },
    { label: "Analytics", icon: ChartBarIcon, href: (id) => `/admin/${id}/analytics` },
  ],

  "service provider": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    {
      label: "Bookings",
      icon: CalendarIcon,
      subItems: [
        { label: "Manage Appointments", href: (id) => `/admin/${id}/appointments` },
        { label: "Clients", href: (id) => `/admin/${id}/clients` },
      ],
    },
    { label: "Services", icon: WrenchScrewdriverIcon, href: (id) => `/admin/${id}/services` },
    { label: "Reports", icon: ChartBarIcon, href: (id) => `/admin/${id}/reports` },
    { label: "Messages", icon: ChatBubbleBottomCenterTextIcon, href: (id) => `/admin/${id}/messages` },
    { label: "Settings", icon: Cog6ToothIcon, href: (id) => `/admin/${id}/settings` },
  ],

  "educational & online courses": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    {
      label: "Courses",
      icon: AcademicCapIcon,
      subItems: [
        { label: "All Courses", href: (id) => `/admin/${id}/courses` },
        { label: "Add Course", href: (id) => `/admin/${id}/courses/new` },
      ],
    },
    { label: "Students", icon: UsersIcon, href: (id) => `/admin/${id}/students` },
    { label: "Instructors", icon: BriefcaseIcon, href: (id) => `/admin/${id}/instructors` },
  ],

  "media & entertainment": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    { label: "Media Library", icon: FilmIcon, href: (id) => `/admin/${id}/media` },
    { label: "Schedule", icon: CalendarIcon, href: (id) => `/admin/${id}/schedule` },
    { label: "Sponsors", icon: BriefcaseIcon, href: (id) => `/admin/${id}/sponsors` },
  ],

  "fitness & wellness": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    { label: "Programs", icon: ClipboardDocumentListIcon, href: (id) => `/admin/${id}/programs` },
    { label: "Trainers", icon: BriefcaseIcon, href: (id) => `/admin/${id}/trainers` },
    { label: "Clients", icon: UsersIcon, href: (id) => `/admin/${id}/clients` },
  ],

  "automotive": [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    { label: "Vehicles", icon: FilmIcon, href: (id) => `/admin/${id}/vehicles` },
    { label: "Requests", icon: ClipboardDocumentListIcon, href: (id) => `/admin/${id}/requests` },
    { label: "Clients", icon: UsersIcon, href: (id) => `/admin/${id}/clients` },
  ],

  // ... Add others as needed similarly

  other: [
    { label: "Dashboard", icon: HomeIcon, href: (id) => `/admin/${id}` },
    { label: "Settings", icon: Cog6ToothIcon, href: (id) => `/admin/${id}/settings` },
  ],
};
