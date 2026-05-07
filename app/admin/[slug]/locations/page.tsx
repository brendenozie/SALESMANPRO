
import React, { useState, useEffect, useMemo, useCallback } from "react";
import  LocationsClient  from "./LocationsClient"; // Adjust import path
import { DeleteConfirmModal } from "./DeleteForm"; // Adjust import path
import { PlusIcon } from "@heroicons/react/24/solid";
import {
  BuildingLibraryIcon,
  ChevronDoubleDownIcon,
  ChevronDoubleUpIcon,
  GlobeAltIcon,
  MapIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  SquaresPlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { cookies } from "next/headers";


const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';;//process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';


// --- Types: matches API response exactly ---
interface Location {
  id: string;             // companyLocation.id
  locationId: string;     // base location.id
  parentId: string | null;
  name: string;
  slug: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  country?: string | null;
  imageUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  capacity?: number | null;
  openHours?: string | null;
  status: "active" | "inactive" | "draft";
  sortOrder: number;
  visible: boolean;
  children?: Location[];
}


// --- Build tree from flat array ---
// const buildLocationTree = (locations: Location[]): Location[] => {
//   const map: Record<string, Location> = {};
//   const roots: Location[] = [];

//   locations.forEach((loc) => {
//     map[loc.id] = { ...loc, children: [] };
//   });

//   locations.forEach((loc) => {
//     if (loc.parentId && map[loc.parentId]) {
//       map[loc.parentId].children?.push(map[loc.id]);
//       map[loc.parentId].children?.sort((a, b) =>
//         a.name.localeCompare(b.name)
//       );
//     } else {
//       roots.push(map[loc.id]);
//     }
//   });

//   roots.sort((a, b) => a.name.localeCompare(b.name));
//   return roots;
// };

// const buildLocationTree = (locations: Location[]): Location[] => {
//   const map: Record<string, Location> = {};
//   const roots: Location[] = [];

//   // Build map keyed by locationId (not companyLocation.id)
//   locations.length > 0 && locations.forEach((loc) => {
//     map[loc.locationId] = { ...loc, children: [] };
//   });

//   locations.length > 0 && locations.forEach((loc) => {
//     if (loc.parentId && map[loc.parentId]) {
//       // attach child to parent using parentId (base location id)
//       map[loc.parentId].children?.push(map[loc.locationId]);
//       map[loc.parentId].children?.sort((a, b) =>
//         (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
//       );
//     } else {
//       roots.push(map[loc.locationId]);
//     }
//   });

//   // Sort roots as well
//   roots.sort(
//     (a, b) =>
//       (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)
//   );

//   return roots;
// };


// interface PageProps {
//   params:Promise<{ slug: string }> // Assuming this page might still get a slug, though not used for global locations
// }

// app/admin/[slug]/client-inventory/page.tsx

// import React from "react";
// import ListingsClient from "./ListingsClient";
// import { MarketListingForm, IStoreCategory } from "@/types/typings";

// import { cookies } from "next/headers";

// const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";//process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

// type MarketplaceProduct = {
//   _id: string;
//   sellerId: string;
//   sellerType: string;
//   productId: string;
//   title: string;
//   name: string;
//   description: string;
//   quantity: number;
//   createdAt: string;
//   updatedAt: string;
//   salesPrice: number;
//   discount: number;
//   isOnOffer: boolean;
//   isFlashDeal: boolean;
//   isNewArrival: boolean;
//   isDiscounted: boolean;
//   isFeatured: boolean;
//   buyingPrice: number;
//   sellingPrice: number;
// };

// type Category = {
//   id: string;
//   name: string;
//   image: string;
//   tags: string[];
//   status: string;
// };

// type Tag = {
//   id: string;
//   name: string;
//   image: string;
//   status: string;
// };

// type Agent = {
//   id: string;
//   name: string;
// };

// interface PaginatedListings {
//   meta: {
//     companyId:     string;
//     totalItems:    number;
//     totalPages:    number;
//     currentPage:   number;
//     perPage:       number;
//   };
//   results: MarketListingForm[];
// }

interface PageProps {
  params:Promise<{ slug: string }>
}

/**
 * Server Component: runs on each request (no-store), fetches marketplace products,
 * then renders the ClientInventoryClient with those props.
 */
export default async function ClientInventoryPage({ params }: PageProps) {
  const { slug : companyId } = await params;
    const cookieHeader = (await cookies()).toString();

  let locations: Location[] = [];

  try {
    const res = await fetch(`${apiBaseUrl}/admin/locationsv2?companyId=${companyId}`,
        {
          next: { revalidate: 60 },
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
          },
        }
      );
      
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `HTTP error: ${res.status}`);
      }

      const result = await res.json();
      // console.log(result);
      const data: Location[] = result.data.data || []; 

      locations = data;

  } catch (err: any) {
    // console.error("[ClientInventoryPage] Error fetching marketplace products:", err.message);
  }


  return <LocationsClient companyId={companyId} initialLocations={locations} />;
}
