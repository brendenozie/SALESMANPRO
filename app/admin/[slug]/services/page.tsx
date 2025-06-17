import React from "react";
import AdminServicesClient, { ServiceItem } from "./AdminServicesClient"; // Adjust path as needed
import { Category } from "../categories/page";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface PageProps {
  params: {
    slug: string; // This will be the companyId
  };
}

// Dummy data for select options - In a real app, these would also come from an API
const dummyProductCategories = [
  { id: "cat1", name: "Electronics" },
  { id: "cat2", name: "Services" },
  { id: "cat3", name: "Real Estate" },
  { id: "cat4", name: "Vehicles" },
  { id: "cat5", name: "Digital Goods" },
  // Add more as per your application's product categories
];

const dummyPaymentOptions = [
  "AT SHOP",
  "MOBILE MONEY",
  "BANK TRANSFER",
  "CREDIT CARD",
  // Add more as per your application's payment options
];

const dummyDeliveryMethods = [
  "On-site",
  "Remote/Virtual",
  "At Location",
  "Shipping",
  "Pickup",
  // Add more as per your application's delivery methods for services/products
];

const dummySellers = [
  { id: "seller1", name: "John Doe" },
  { id: "seller2", name: "Jane Smith" },
  // Fetch actual sellers for the company
];

const dummyCompanies = [
  { id: "company1", name: "Acme Corp" },
  { id: "company2", name: "Widgets Ltd" },
  // Fetch actual companies
];


export default async function ServicesPage({ params }: PageProps) {
  const companyId = params.slug;

  let initialServices: ServiceItem[] = [];
  let categoriesData: Category[] = [];

  try {
    // 1. Fetch marketplace listings for the given companyId
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/my-market-place?companyId=${companyId}`, {
      // You might want to add caching strategies here, e.g., revalidate data every hour
      // next: { revalidate: 3600 }, 
      cache: 'no-store' // For development, ensures fresh data on every request
    });

    

    // Fetch all categories for this company
    const categoriesRes = await fetch(
      `${apiUrl}/admin/get-store-categories?companyId=${encodeURIComponent(
        companyId
      )}`,
      { cache: "no-store" }
    );

    if (categoriesRes.ok) {
      const categoriesJson = (await categoriesRes.json()) as {
        results: Category[];
      };
      categoriesData = categoriesJson.results;
    }

    if (!res.ok) {
      // It's crucial to handle API errors.
      // Depending on your error handling strategy, you might want to:
      // - Throw an error (will be caught by Next.js error boundary if configured)
      // - Return an empty array
      // - Log the error and show a message to the user
      const errorText = await res.text();
      console.error(`Failed to fetch services: ${res.status} ${res.statusText} - ${errorText}`);
      // For now, we'll return an empty array if fetch fails, but you might throw an error.
      // throw new Error(`Failed to fetch services for company ${companyId}`); 
    } else {
      const data: ServiceItem[] = await res.json();
      
      // 2. Transform Date strings back to Date objects if AdminServicesClient expects them
      // This is necessary because Dates are serialized as strings when fetched from an API.
      initialServices = data.map(item => ({
        ...item,
        startDealDate: item.startDealDate ? new Date(item.startDealDate) : undefined,
        endDealDate: item.endDealDate ? new Date(item.endDealDate) : undefined,
        availabilityStart: item.availabilityStart ? new Date(item.availabilityStart) : undefined,
        availabilityEnd: item.availabilityEnd ? new Date(item.availabilityEnd) : undefined,
        // expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
      }));
    }

  } catch (error) {
    console.error("Error fetching initial services:", error);
    // You could also set a user-facing error message here if needed.
    initialServices = []; // Ensure it's an empty array on error
  }

  return (
    <div>
      <AdminServicesClient
        initialServices={initialServices}
        productCategories={dummyProductCategories}
        paymentOptions={dummyPaymentOptions}
        deliveryMethods={dummyDeliveryMethods}
        sellers={dummySellers}
        companies={dummyCompanies}
        companyId={companyId}
        categoriesData={categoriesData}
      />
    </div>
  );
}