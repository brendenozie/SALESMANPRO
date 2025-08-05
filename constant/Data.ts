import { title } from "process";

export const Navdata = [
  {
    href: "/#features",
    title: "Features",
    reference: "features",
  },
  {
    href: "/#about",
    title: "About Us",
    reference: "about",
  },
  {
    href: "/#contact",
    title: "Contact",
    reference: "contact",
  },
];


export const NavDashdata = [
  {
    href: "/dashboard2",
    title: "Dashboard",
    reference: "dashboard2",
  },
  {
    href: "#clients",
    title: "Clients",
    reference: "clients",
  },
  {
    href: "#products",
    title: "Products",
    reference: "products",
  },
  {
    href: "#sales",
    title: "Sales",
    reference: "sales",
  },
  {
    href: "#reports",
    title: "Reports",
    reference: "reports",
  },
  {
    href: "#settings",
    title: "Settings",
    reference: "settings",
  },
];



export const FilterData = [
  {
    data1: "All",
    data2: "Trending",
  },
  {
    data1: "Popular",
    data2: "Features",
  },
  {
    data1: "Recommend",
    data: "Theme",
  },

  {
    data1: "Original",
    data: "Tour",
  },
  {
    data1: "Packages",
    data2: "",
  },
];

export const gymLocationsData = [
  {
    id: 1,
    src: "/38.jpg",
    title: "Chynoweth House, Malindi",
    desc: "One of the highest and finest mountain in East Java Province",
  },
  {
    id: 2,
    src: "/tarangau.jpg",
    title: "Tarangau Retreat, Kilifi",
    desc: "Calming and homey family resort in the side of Gralus City",
  },
  {
    id: 3,
    src: "/10.jpg",
    title: "Kawamwaki Studio, Tigoni",
    desc: "The larget pine tree forest located in Balamban City in Cepu",
  },
  {
    id: 4,
    src: "/kimana.jpg",
    title: "Kimana House, Amboseli",
    desc: "The highest top stunning scenery view in Liscanor, County Clare",
  },
  {
    id: 6,
    src: "/olarro.jpg",
    title: "Olarro Plains, Maasai Mara",
    desc: "The small plateau with hilly surroundings locatied in the Purulia",
  },
  {
    id: 7,
    src: "/chuilodge.jpg",
    title: "Chui Lodge, Naivasha",
    desc: "One of the highest and finest mountain in East Java Province",
  },
  {
    id: 8,
    src: "/17.jpg",
    title: "Maasai Mara National Reserve",
    desc: "One of the highest and finest mountain in East Java Province",
  },
  {
    id: 9,
    src: "/22.jpg",
    title: "Ololo Safari Lodge, Nairobi",
    desc: "One of the highest and finest mountain in East Java Province",
  },
  {
    id: 10,
    src: "/19.jpg",
    title: "Tawi Lodge, Amboseli",
    desc: "One of the highest and finest mountain in East Java Province",
  },
  {
    id: 5,
    src: "/14.jpg",
    title: "Maili saba camp, Nakuru",
    desc: "One of the highest and finest mountain in East Java Province",
  },
];

// src/constant/Data.js

export const picardData = [
  {
    id: 1,
    title: "Intelligent Lead Capture",
    desc: "Never miss a potential sale. Our system automatically captures, organizes, and scores your leads, so you always know who to prioritize.",
  },
  {
    id: 2,
    title: "Visual Sales Pipeline",
    desc: "Get a crystal-clear overview of your deals. Drag and drop leads between stages, identify bottlenecks, and forecast revenue with confidence.",
  },
  {
    id: 3,
    title: "Smart Outreach Automation",
    desc: "Save time and never let a lead go cold. Our platform sends personalized follow-up emails and messages for you, keeping every conversation active.",
  },
  {
    id: 4,
    title: "Real-Time Analytics",
    desc: "Track your team’s performance with beautiful dashboards and actionable insights. Understand what's working and drive continuous improvement.",
  },
  {
    id: 5,
    title: "Seamless Integrations",
    desc: "Connect your favorite apps like Slack, Salesforce, and HubSpot. Our platform works with your existing tools to create a single source of truth.",
  },
  {
    id: 6,
    title: "Mobile-First Sales",
    desc: "Manage your deals, update contacts, and log activities from anywhere. Our mobile app keeps your entire team connected and productive on the go.",
  },
];

export const picardDataV1 = [
  {
    id: 1,
    src: "/gym1.jpg",
    title: "Downtown Sales HQ",
    desc: "A vibrant office equipped with cutting-edge tools for lead generation and client management.",
  },
  {
    id: 2,
    src: "/gym2.jpg",
    title: "Highland Negotiation Suite",
    desc: "A dedicated space for closing deals and hosting high-value client meetings.",
  },
  {
    id: 3,
    src: "/gym3.jpg",
    title: "Elite Analytics Lab",
    desc: "An advanced hub offering real-time sales performance tracking and predictive analytics.",
  },
  {
    id: 4,
    src: "/gym4.jpg",
    title: "Flex & Connect Lounge",
    desc: "A collaborative environment for networking and brainstorming sales strategies.",
  },
  {
    id: 5,
    src: "/gym5.jpg",
    title: "Powerhouse Training Center",
    desc: "A facility designed for sales training, workshops, and skill-building programs.",
  },
  {
    id: 6,
    src: "/gym6.jpg",
    title: "Outdoor Sales Retreat",
    desc: "An open-air venue for team-building exercises and motivational sales bootcamps.",
  },
  {
    id: 7,
    src: "/gym7.jpg",
    title: "Zen Sales Studio",
    desc: "A tranquil space for strategic planning, mindfulness sessions, and stress management for sales teams.",
  },
  {
    id: 8,
    src: "/gym8.jpg",
    title: "Urban Sales Accelerator",
    desc: "A modern hub offering tools for rapid client acquisition and revenue growth strategies.",
  },
  {
    id: 9,
    src: "/gym9.jpg",
    title: "Pure Performance Hub",
    desc: "Focused on developing high-performing sales professionals with targeted coaching programs.",
  },
  {
    id: 10,
    src: "/gym10.jpg",
    title: "Deal Closer HQ",
    desc: "Specialized in hosting deal-closing sessions with private meeting rooms and support resources.",
  },
];

// data/admin-dashboard-data.ts (You might put this in a central data folder)

// Shared data types
interface AdminPageProps {
  params: {
    adminSlug: string;
  };
}

// --- Dashboard Data ---
export interface DashboardMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersToday: number;
  revenueToday: number;
  upcomingClasses: { name: string; time: string; instructor: string; }[];
  recentActivities: { type: string; description: string; timestamp: string; }[];
}

export const getDashboardData = (adminSlug: string): DashboardMetrics => ({
  totalMembers: 1250,
  activeMembers: 980,
  newMembersToday: 15,
  revenueToday: 12500, // in USD or your local currency
  upcomingClasses: [
    { name: "Morning Yoga Flow", time: "08:00 AM", instructor: "Elara Vance" },
    { name: "HIIT Blast", time: "09:30 AM", instructor: "Marcus Johnson" },
    { name: "Spin Express", time: "06:00 PM", instructor: "Mia Wong" },
  ],
  recentActivities: [
    { type: "Membership Renewal", description: "David Kim renewed Premium plan.", timestamp: "2025-07-16 22:05" },
    { type: "New Booking", description: "Sarah Chen booked Yoga Flow.", timestamp: "2025-07-16 21:50" },
    { type: "Product Sale", description: "Sold 'Zenith Protein Shake'.", timestamp: "2025-07-16 20:15" },
  ],
});

// --- POS & Sales Data ---
export interface SaleItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
  date: string;
  customer?: string;
}

export const getSalesData = (slug: string): SaleItem[] => ([
  { id: "sale001", name: "Premium Membership", price: 99.99, quantity: 1, total: 99.99, date: "2025-07-16", customer: "Jane Doe" },
  { id: "sale002", name: "Yoga Mat", price: 29.99, quantity: 1, total: 29.99, date: "2025-07-16", customer: "John Smith" },
  { id: "sale003", name: "HIIT Class Drop-in", price: 25.00, quantity: 2, total: 50.00, date: "2025-07-15", customer: "Emily White" },
  { id: "sale004", name: "Personal Training Session (1hr)", price: 80.00, quantity: 1, total: 80.00, date: "2025-07-15", customer: "David Kim" },
  { id: "sale005", name: "Protein Bar", price: 3.50, quantity: 5, total: 17.50, date: "2025-07-14" },
]);

// --- Programs & Classes Data ---
export interface Program {
  id: string;
  name: string;
  description: string;
  type: "class" | "program";
  duration: string;
  instructor: string;
  price: number;
  status: "active" | "inactive" | "draft";
  schedule: string[]; // e.g., ["Mon 9:00 AM", "Wed 6:00 PM"]
}

export const getProgramsData = (adminSlug: string): Program[] => ([
  { id: "p001", name: "Morning Yoga Flow", description: "Beginner-friendly Vinyasa.", type: "class", duration: "60 min", instructor: "Elara Vance", price: 15.00, status: "active", schedule: ["Mon 8:00 AM", "Wed 8:00 AM"] },
  { id: "p002", name: "Strength Foundations", description: "Build full-body strength.", type: "program", duration: "8 weeks", instructor: "Marcus Johnson", price: 299.00, status: "active", schedule: [] },
  { id: "p003", name: "Cardio Kickboxing", description: "High-energy cardio workout.", type: "class", duration: "45 min", instructor: "Jordan Smith", price: 18.00, status: "active", schedule: ["Tue 5:00 PM", "Thu 6:00 PM"] },
  { id: "p004", name: "Mindful Meditation Series", description: "Improve focus and reduce stress.", type: "program", duration: "4 weeks", instructor: "Sofia Lee", price: 149.00, status: "draft", schedule: [] },
]);

// --- Trainers & Staff Data ---
export interface Trainer {
  id: string;
  name: string;
  specialty: string;
  email: string;
  phone: string;
  status: "active" | "on leave";
  bio: string;
  certifications: string[];
}

export const getTrainersData = (adminSlug: string): Trainer[] => ([
  { id: "t001", name: "Elara Vance", specialty: "Yoga, Pilates", email: "elara@zenith.com", phone: "555-1234", status: "active", bio: "Experienced yoga instructor...", certifications: ["RYT 200", "Pilates Certified"] },
  { id: "t002", name: "Marcus Johnson", specialty: "Strength & Conditioning", email: "marcus@zenith.com", phone: "555-5678", status: "active", bio: "Former pro athlete...", certifications: ["CSCS", "USAW Level 1"] },
  { id: "t003", name: "Sofia Lee", specialty: "Meditation, Mindfulness", email: "sofia@zenith.com", phone: "555-9012", status: "on leave", bio: "Mindfulness expert...", certifications: ["Certified Meditation Teacher"] },
]);

// --- Clients & Members Data ---
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  membershipStatus: "active" | "expired" | "pending";
  joinDate: string;
  lastActive: string;
}

export const getClientsData = (adminSlug: string): Client[] => ([
  { id: "c001", name: "Jane Doe", email: "jane@example.com", phone: "555-1111", membershipType: "Premium Annual", membershipStatus: "active", joinDate: "2024-01-15", lastActive: "2025-07-16" },
  { id: "c002", name: "John Smith", email: "john@example.com", phone: "555-2222", membershipType: "Monthly Basic", membershipStatus: "active", joinDate: "2025-03-01", lastActive: "2025-07-15" },
  { id: "c003", name: "Emily White", email: "emily@example.com", phone: "555-3333", membershipType: "Trial Pass", membershipStatus: "expired", joinDate: "2025-07-01", lastActive: "2025-07-07" },
]);

// --- Locations & Facilities Data ---
export interface Location {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: "open" | "closed" | "renovation";
  amenities: string[]; // e.g., ["Sauna", "Pool", "Free Parking"]
  capacity: number;
}

export const getLocationsData = (adminSlug: string): Location[] => ([
  { id: "loc001", name: "Downtown Studio", address: "123 Main St, Cityville", phone: "555-4444", email: "downtown@zenith.com", status: "open", amenities: ["Locker Rooms", "Sauna", "Group Class Studio"], capacity: 150 },
  { id: "loc002", name: "Uptown Branch", address: "456 Oak Ave, Townsville", phone: "555-5555", email: "uptown@zenith.com", status: "open", amenities: ["Personal Training Area", "Spin Studio"], capacity: 80 },
  { id: "loc003", name: "Online Hub", address: "N/A", phone: "N/A", email: "online@zenith.com", status: "open", amenities: ["Virtual Class Platform", "On-Demand Library"], capacity: 9999 },
]);

// --- Bookings & Schedule Data ---
export interface Booking {
  id: string;
  type: "class" | "personal training";
  clientName: string;
  item: string; // Class name or Trainer name
  date: string;
  time: string;
  status: "confirmed" | "cancelled" | "completed";
  location: string;
}

export const getBookingsData = (adminSlug: string): Booking[] => ([
  { id: "b001", type: "class", clientName: "Jane Doe", item: "Morning Yoga Flow", date: "2025-07-17", time: "08:00 AM", status: "confirmed", location: "Downtown Studio" },
  { id: "b002", type: "personal training", clientName: "John Smith", item: "Marcus Johnson", date: "2025-07-18", time: "10:00 AM", status: "confirmed", location: "Uptown Branch" },
  { id: "b003", type: "class", clientName: "Emily White", item: "HIIT Blast", date: "2025-07-16", time: "09:30 AM", status: "completed", location: "Downtown Studio" },
]);

// --- Notifications & Comms Data ---
export interface Communication {
  id: string;
  type: "email" | "sms" | "app notification";
  subject: string;
  recipients: "all" | "members" | "trainers" | string; // e.g., specific client ID
  status: "sent" | "draft" | "scheduled";
  sentDate?: string;
  content: string;
}

export const getCommunicationsData = (adminSlug: string): Communication[] => ([
  { id: "comm001", type: "email", subject: "New Class Schedule for August", recipients: "members", status: "sent", sentDate: "2025-07-01", content: "Dear members, exciting new classes..." },
  { id: "comm002", type: "app notification", subject: "Reminder: HIIT Blast Tomorrow", recipients: "all", status: "scheduled", content: "Don't miss tomorrow's HIIT blast at 9:30 AM!" },
  { id: "comm003", type: "sms", subject: "Membership Expiring Soon", recipients: "c003", status: "draft", content: "Hi Emily, your trial pass expires soon. Renew now!" },
]);

// --- Reports & Analytics Data ---
export interface ReportSummary {
  period: string; // e.g., "Last 30 Days"
  totalRevenue: number;
  newMembers: number;
  classAttendanceRate: number; // percentage
  topPerformingClass: string;
  mostBookedTrainer: string;
}

export const getReportsData = (adminSlug: string): ReportSummary => ({
  period: "Last 30 Days",
  totalRevenue: 35000,
  newMembers: 85,
  classAttendanceRate: 82, // percentage
  topPerformingClass: "Morning Yoga Flow",
  mostBookedTrainer: "Marcus Johnson",
});

// --- Settings Data ---
export interface GeneralSettings {
  gymName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
}

export const getSettingsData = (adminSlug: string): GeneralSettings => ({
  gymName: "Zenith Fitness Hub",
  contactEmail: "admin@zenithfitness.com",
  contactPhone: "+1 (555) 987-6543",
  address: "789 Fitness Blvd, Metro City, 12345",
  currency: "USD",
  timezone: "America/New_York",
});