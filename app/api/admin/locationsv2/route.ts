// app/api/admin/[adminSlug]/locations/route.js
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';

// A robust slugify function to create a URL-friendly string from a name.
const slugify = (text : string) => {
  return text
    .toString()
    .normalize('NFD') // Normalize characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-');      // Replace multiple - with single -
};

// GET /api/admin/[adminSlug]/locations
// Fetches all locations for a specific company.
// export async function GET(request: Request) {
//      const { searchParams } = new URL(request.url);
//     const companyId = searchParams.get('companyId');

//   try {
//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       select: { id: true },
//     });

//     if (!company) {
//       return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
//     }

//     const locations = await prisma.companyLocation.findMany({
//       where: {
//         companyId: company.id,
//       },
//       // select:{
//       //   location:{
//       //     na
//       //   }
//       // },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // Map Prisma Location model to a frontend-friendly interface
//     const formattedLocations = locations.map(location => ({
//       id: location.id,
//       name: location.displayName,
//       slug: "location.slug",
//       address: "location.address",
//       city: "location.city",
//       state: "location.state || ''",
//       zipCode: "location.zipCode || ''",
//       country: "location.country",
//       description: "location.description || ''",
//       imageUrl: "location.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image'",
//       phone: "location.phone || 'N/A'",
//       email: "location.email || 'N/A'",
//       capacity: "location.capacity || 0",
//       openHours: "location.openHours || 'N/A'",
//       status: "location.status",
//     }));

//     return NextResponse.json(formattedLocations);
//   } catch (error) {
//     console.error('Error fetching locations:', error);
//     return NextResponse.json({ message: 'Failed to fetch locations', error: error.message }, { status: 500 });
//   }
// }
// app/api/admin/locations/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// app/api/admin/company-locations/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// app/api/admin/company-locations/route.ts
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Fetch company-specific associations
    const companyLocations = await prisma.companyLocation.findMany({
      where: { companyId },
      include: { location: true },
      orderBy: { sortOrder: "asc" },
    });

    // Collect parentIds from base Locations
    const missingParentIds = companyLocations
      .map((cl) => cl.location?.parentId)
      .filter((pid): pid is string => !!pid && !companyLocations.find((cl) => cl.locationId === pid));

    let parentLocations: any[] = [];
    if (missingParentIds.length > 0) {
      parentLocations = await prisma.location.findMany({
        where: { id: { in: missingParentIds } },
      });
    }

    // Format company locations
    const formattedCompanyLocs = companyLocations.map((cl) => {
      const loc = cl.location;
      return {
        id: cl.id,
        locationId: loc?.id,
        parentId: loc?.parentId,
        name: cl.displayName || loc?.name,
        slug: loc?.slug,
        description: loc?.description,
        addressLine1: cl.addressLine1Override || loc?.addressLine1,
        addressLine2: cl.addressLine2Override || loc?.addressLine2,
        city: cl.cityOverride || loc?.city,
        state: cl.stateOverride || loc?.state,
        postalCode: cl.postalCodeOverride || loc?.postalCode,
        country: cl.countryOverride || loc?.country,
        latitude: cl.latitudeOverride ?? loc?.latitude,
        longitude: cl.longitudeOverride ?? loc?.longitude,
        imageUrl: loc?.imageUrl,
        phone: loc?.phone,
        email: loc?.email,
        capacity: loc?.capacity,
        openHours: loc?.openHours,
        status: loc?.status,
        sortOrder: cl.sortOrder ?? loc?.sortOrder,
        visible: cl.visible ?? loc?.visible,
        createdAt: cl.createdAt,
        updatedAt: cl.updatedAt,
        isParent: false, // mark as company association
      };
    });

    // Format fallback parent locations (no overrides)
    const formattedParents = parentLocations.map((loc) => ({
      id: loc.id, // base ID since no companyLocation
      locationId: loc.id,
      parentId: loc.parentId,
      name: loc.name,
      slug: loc.slug,
      description: loc.description,
      addressLine1: loc.addressLine1,
      addressLine2: loc.addressLine2,
      city: loc.city,
      state: loc.state,
      postalCode: loc.postalCode,
      country: loc.country,
      latitude: loc.latitude,
      longitude: loc.longitude,
      imageUrl: loc.imageUrl,
      phone: loc.phone,
      email: loc.email,
      capacity: loc.capacity,
      openHours: loc.openHours,
      status: loc.status,
      sortOrder: loc.sortOrder,
      visible: loc.visible,
      createdAt: loc.createdAt,
      updatedAt: loc.updatedAt,
      isParent: true, // mark fallback parents
    }));

    return NextResponse.json(
      { data: [...formattedCompanyLocs, ...formattedParents] },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching company locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch company locations" },
      { status: 500 }
    );
  }
}




// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const companyId = searchParams.get("companyId");

//     if (!companyId) {
//       return NextResponse.json(
//         { error: "Missing companyId" },
//         { status: 400 }
//       );
//     }

//     const companyLocations = await prisma.companyLocation.findMany({
//       where: { companyId },
//       include: {
//         location: true, // pull base Location
//       },
//       orderBy: { sortOrder: "asc" },
//     });

//     const formattedLocations = companyLocations.map((cl) => {
//       const loc = cl.location;
//       return {
//         id: loc.id,
//         name: cl.name ?? loc.name,
//         slug: cl.slug ?? loc.slug,
//         description: cl.description ?? loc.description,
//         address: cl.address ?? loc.address,
//         city: cl.city ?? loc.city,
//         state: cl.state ?? loc.state,
//         zipCode: cl.zipCode ?? loc.zipCode,
//         country: cl.country ?? loc.country,
//         imageUrl: cl.imageUrl ?? loc.imageUrl,
//         phone: cl.phone ?? loc.phone,
//         email: cl.email ?? loc.email,
//         capacity: cl.capacity ?? loc.capacity,
//         openHours: cl.openHours ?? loc.openHours,
//         status: cl.status ?? loc.status,
//         sortOrder: cl.sortOrder ?? loc.sortOrder,
//         visible: cl.visible ?? loc.visible,
//         parentId: loc.parentId, // <-- include parentId for tree building
//       };
//     });

//     return NextResponse.json(formattedLocations);
//   } catch (error) {
//     console.error("Error fetching company locations:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch company locations" },
//       { status: 500 }
//     );
//   }
// }

// GET /api/admin/[adminSlug]/locations
// import { NextResponse } from "next/server";
// import { prisma } from "@/lib/prisma";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const companyId = searchParams.get("companyId");

//   try {
//     const company = await prisma.company.findUnique({
//       where: { id: companyId ?? "" },
//       select: { id: true },
//     });

//     if (!company) {
//       return NextResponse.json(
//         { message: "Company not found for the given companyId." },
//         { status: 404 }
//       );
//     }

//     const locations = await prisma.companyLocation.findMany({
//       where: {
//         companyId: company.id,
//       },
//       include: {
//         location: true, // fetch base location details
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     // Map Prisma data to frontend-friendly structure
//     const formattedLocations = locations.map((cl) => {
//       const loc = cl.location;

//       return {
//         id: cl.id,
//         name: cl.displayName ?? loc?.name ?? "Unnamed Location",
//         slug: loc?.slug ?? "",
//         address:
//           cl.addressLine1Override ??
//           loc?.addressLine1 ??
//           loc?.address ??
//           "",
//         city: cl.cityOverride ?? loc?.city ?? "",
//         state: cl.stateOverride ?? loc?.state ?? "",
//         zipCode: cl.postalCodeOverride ?? loc?.postalCode ?? loc?.zipCode ?? "",
//         country: cl.countryOverride ?? loc?.country ?? "",
//         description: loc?.description ?? "",
//         imageUrl:
//           loc?.imageUrl ??
//           "https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image",
//         phone: loc?.phone ?? "N/A",
//         email: loc?.email ?? "N/A",
//         capacity: loc?.capacity ?? 0,
//         openHours: loc?.openHours ?? "N/A",
//         status: loc?.status ?? "OPEN",
//         sortOrder: cl.sortOrder,
//         visible: cl.visible,
//       };
//     });

//     return NextResponse.json(formattedLocations);
//   } catch (error: any) {
//     console.error("Error fetching locations:", error);
//     return NextResponse.json(
//       { message: "Failed to fetch locations", error: error.message },
//       { status: 500 }
//     );
//   }
// }

// POST /api/admin/[adminSlug]/locations
// Creates a new location.
// export async function POST(request: Request) {

//      const { searchParams } = new URL(request.url);
//     const companyId = searchParams.get('companyId');

//   try {
//     const body = await request.json();
//     const {
//       name,
//       address,
//       city,
//       state,
//       zipCode,
//       country,
//       description,
//       imageUrl,
//       phone,
//       email,
//       capacity,
//       openHours,
//       status,
//     } = body;

//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       select: { id: true },
//     });

//     if (!company) {
//       return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
//     }

//     // const companyId = company.id;

//     // Basic validation
//     if (!name || !address || !city || !country) {
//       return NextResponse.json({ message: 'Name, address, city, and country are required.' }, { status: 400 });
//     }

//     // Generate slug and check for uniqueness
//     const generatedSlug = slugify(name);
//     const existingLocationWithSlug = await prisma.companyLocation.findUnique({
//       where: { slug: generatedSlug },
//     });

//     if (existingLocationWithSlug) {
//       // Append a unique suffix if slug already exists
//       let uniqueSlug = generatedSlug;
//       let suffix = 1;
//       while (await prisma.companyLocation.findUnique({ where: { slug: uniqueSlug } })) {
//         uniqueSlug = `${generatedSlug}-${suffix}`;
//         suffix++;
//       }
//       generatedSlug = uniqueSlug;
//     }

//     const newLocation = await prisma.companyLocation.create({
//       data: {
//         name: name,
//         slug: generatedSlug,
//         address: address,
//         city: city,
//         state: state || null,
//         zipCode: zipCode || null,
//         country: country,
//         description: description || null,
//         imageUrl: imageUrl || null,
//         phone: phone || null,
//         email: email || null,
//         capacity: capacity ? parseInt(capacity) : null,
//         openHours: openHours || null,
//         status: status || 'OPEN',
//         company: {
//           connect: { id: companyId },
//         },
//       },
//     });

//     // Format the new location data for frontend display
//     const formattedNewLocation = {
//       id: newLocation.id,
//       name: newLocation.name,
//       slug: newLocation.slug,
//       address: newLocation.address,
//       city: newLocation.city,
//       state: newLocation.state || '',
//       zipCode: newLocation.zipCode || '',
//       country: newLocation.country,
//       description: newLocation.description || '',
//       imageUrl: newLocation.imageUrl || 'https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image',
//       phone: newLocation.phone || 'N/A',
//       email: newLocation.email || 'N/A',
//       capacity: newLocation.capacity || 0,
//       openHours: newLocation.openHours || 'N/A',
//       status: newLocation.status,
//     };

//     return NextResponse.json(formattedNewLocation, { status: 201 });
//   } catch (error) {
//     console.error('Error creating location:', error);
//     // Specific error for unique constraint if slugify logic fails or for other unique fields
//     // if (error.code === 'P2002') {
//     //   return NextResponse.json({ message: 'A location with similar details already exists (e.g., slug conflict).', error: error.message }, { status: 409 });
//     // }
//     return NextResponse.json({ message: 'Failed to create location', error: "error.message" }, { status: 500 });
//   }
// }

// POST /api/admin/[adminSlug]/locations
// Creates a new location and associates it with a company
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  try {
    const body = await request.json();
    const {
      name,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      description,
      imageUrl,
      phone,
      email,
      capacity,
      openHours,
      status,
    } = body;

    if (!companyId) {
      return NextResponse.json({ message: "Missing companyId." }, { status: 400 });
    }

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { message: "Company not found for the given id." },
        { status: 404 }
      );
    }

    if (!name || !city || !country) {
      return NextResponse.json(
        { message: "Name, city, and country are required." },
        { status: 400 }
      );
    }

    // Generate slug and ensure uniqueness in Location model , { lower: true }
    let generatedSlug = slugify(name);
    let suffix = 1;
    while (
      await prisma.location.findUnique({
        where: { slug: generatedSlug },
      })
    ) {
      generatedSlug = `${slugify(name)}-${suffix}`;
      suffix++;
    }

    // Create Location first
    const newLocation = await prisma.location.create({
      data: {
        name,
        slug: generatedSlug,
        description: description || null,
        imageUrl: imageUrl || null,
        phone: phone || null,
        email: email || null,
        capacity: capacity ? parseInt(capacity) : null,
        openHours: openHours || null,
        status: status || "OPEN",
        company: { connect: { id: companyId } },
        addressLine1: addressLine1 || null,
        addressLine2: addressLine2 || null,
        city,
        state: state || null,
        postalCode: postalCode || null,
        country,
      },
    });

    // Create CompanyLocation link
    const companyLocation = await prisma.companyLocation.create({
      data: {
        company: { connect: { id: companyId } },
        location: { connect: { id: newLocation.id } },
        // defaults/overrides can be added if needed
      },
      include: { location: true },
    });

    // Format for frontend
    const formatted = {
      id: companyLocation.id,
      displayName: companyLocation.displayName || newLocation.name,
      slug: newLocation.slug,
      addressLine1: companyLocation.addressLine1Override || newLocation.addressLine1,
      addressLine2: companyLocation.addressLine2Override || newLocation.addressLine2,
      city: companyLocation.cityOverride || newLocation.city,
      state: companyLocation.stateOverride || newLocation.state || "",
      postalCode: companyLocation.postalCodeOverride || newLocation.postalCode || "",
      country: companyLocation.countryOverride || newLocation.country,
      description: newLocation.description || "",
      imageUrl:
        newLocation.imageUrl ||
        "https://placehold.co/600x400/E0E7FF/4338CA?text=No+Image",
      phone: newLocation.phone || "N/A",
      email: newLocation.email || "N/A",
      capacity: newLocation.capacity || 0,
      openHours: newLocation.openHours || "N/A",
      status: newLocation.status,
    };

    return NextResponse.json(formatted, { status: 201 });
  } catch (error: any) {
    console.error("Error creating location:", error);
    return NextResponse.json(
      { message: "Failed to create location", error: error.message },
      { status: 500 }
    );
  }
}
