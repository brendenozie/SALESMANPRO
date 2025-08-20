import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { getAuthSession } from "@/lib/auth";
import { companySchema } from "@/lib/validations/company";

export const dynamic = "force-dynamic";

// GET a single company by ID
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const company = await prisma.company.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure the user owns this company
      },
      include: { // Include all related data to populate the edit form
        SEO: true,
        AnalyticsConfig: true,
        PaymentSettings: true,
        ShippingSettings: true,
        socialLinks: true,
        policies: true,
        faqs: true,
        testimonials: true,
        heroSlides: true,
        promotions: true,
        StoreCategory: {
          include: {
            category: true
          }
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Failed to fetch company:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT (update) a company
// PUT (update) a company
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Ensure companyId is present
  if (!params.id) {
      return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
  }

  const body = await req.json();
  const parseResult = companySchema.safeParse(body);

  if (!parseResult.success) {
    return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
  }

  const {
    // Destructure to separate relation data from direct company fields
    seo,
    analyticsConfig,
    paymentSettings,
    shippingSettings,
    socialLinks,
    policies,
    faqs,
    testimonials,
    heroSlides,
    promotions,
    StoreCategory,
    ...companyData // The rest are direct fields of the company
  } = parseResult.data;

  try {
    const companyToUpdate = await prisma.company.findFirst({
        where: { id: params.id, userId: session.user.id }
    });

    if (!companyToUpdate) {
        return NextResponse.json({ error: "Company not found or you do not have permission to edit it." }, { status: 404 });
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: {
        // 1. Update direct company fields
        ...companyData,
        
        // 2. Handle nested relations correctly
        SEO: seo ? { update: seo } : undefined,
        AnalyticsConfig: analyticsConfig ? { update: analyticsConfig } : undefined,
        PaymentSettings: paymentSettings ? { update: paymentSettings } : undefined,
        ShippingSettings: shippingSettings ? { update: shippingSettings } : undefined,

        socialLinks: socialLinks ? { deleteMany: {}, create: socialLinks } : undefined,
        policies: policies ? { deleteMany: {}, create: policies } : undefined,
        faqs: faqs ? { deleteMany: {}, create: faqs } : undefined,
        testimonials: testimonials ? { deleteMany: {}, create: testimonials } : undefined,
        
        heroSlides: heroSlides ? { 
            deleteMany: {}, 
            create: heroSlides.map(h => ({
                ...h, 
                endsAt: h.endsAt ? new Date(h.endsAt) : undefined
            })) 
        } : undefined,

        promotions: promotions ? { 
            deleteMany: {}, 
            create: promotions.map(p => ({
                ...p, 
                startsAt: p.startsAt ? new Date(p.startsAt) : undefined, 
                endsAt: p.endsAt ? new Date(p.endsAt) : undefined
            })) 
        } : undefined,

        StoreCategory: StoreCategory ? {
            deleteMany: { companyId: params.id },
            create: StoreCategory.map(sc => ({
                displayName: sc.displayName,
                icon: sc.icon,
                sortOrder: sc.sortOrder,
                subcategories:sc.subcategories,
                category: { connect: { id: sc.categoryId } }
            }))
        } : undefined,
      },
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Failed to update company:", error);
    // Add more detailed logging for debugging
    if (error instanceof Error) {
        console.error(error.message);
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
// export async function PUT(
//   req: Request,
//   { params }: { params: { companyId: string } }
// ) {
//   const session = await getAuthSession();
//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   const body = await req.json();
//   const parseResult = companySchema.safeParse(body);

//   if (!parseResult.success) {
//     return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
//   }

//   const data = parseResult.data;

//   try {
//     const companyToUpdate = await prisma.company.findFirst({
//         where: { id: params.companyId, userId: session.user.id }
//     });

//     if (!companyToUpdate) {
//         return NextResponse.json({ error: "Company not found or you do not have permission to edit it." }, { status: 404 });
//     }

//     const updatedCompany = await prisma.company.update({
//       where: { id: params.companyId },
//       data: {
//         // Update direct fields
//         ...data,
        
//         // --- Handle Nested Relations on Update ---

//         // One-to-One: Use 'update'
//         SEO: data.seo ? { update: data.seo } : undefined,
//         AnalyticsConfig: data.analyticsConfig ? { update: data.analyticsConfig } : undefined,
//         PaymentSettings: data.paymentSettings ? { update: data.paymentSettings } : undefined,
//         ShippingSettings: data.shippingSettings ? { update: data.shippingSettings } : undefined,

//         // One-to-Many: Use the 'deleteMany' and 'create' strategy to sync
//         socialLinks: data.socialLinks ? { deleteMany: {}, create: data.socialLinks } : undefined,
//         policies: data.policies ? { deleteMany: {}, create: data.policies } : undefined,
//         faqs: data.faqs ? { deleteMany: {}, create: data.faqs } : undefined,
//         testimonials: data.testimonials ? { deleteMany: {}, create: data.testimonials } : undefined,
//         heroSlides: data.heroSlides ? { deleteMany: {}, create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : undefined})) } : undefined,
//         promotions: data.promotions ? { deleteMany: {}, create: data.promotions.map(p => ({...p, startsAt: p.startsAt ? new Date(p.startsAt) : undefined, endsAt: p.endsAt ? new Date(p.endsAt) : undefined})) } : undefined,

//         // Many-to-Many: Also use delete/create strategy
//         StoreCategory: data.storeCategories ? {
//             deleteMany: {},
//             create: data.storeCategories.map(sc => ({
//                 displayName: sc.displayName,
//                 icon: sc.icon,
//                 sortOrder: sc.sortOrder,
//                 category: { connect: { id: sc.id } }
//             }))
//         } : undefined,
//       },
//     });

//     return NextResponse.json(updatedCompany);
//   } catch (error) {
//     console.error("Failed to update company:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

// DELETE a company
export async function DELETE(
  req: Request,
  { params }: { params: { companyId: string } }
) {
    const session = await getAuthSession();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const companyToDelete = await prisma.company.findFirst({
            where: { id: params.companyId, userId: session.user.id },
            select: { sEOId: true, analyticsConfigId: true, paymentSettingsId: true, shippingSettingsId: true }
        });

        if (!companyToDelete) {
            return NextResponse.json({ error: "Company not found or you do not have permission to delete it." }, { status: 404 });
        }

        // Use a transaction to ensure all related data is deleted successfully
        await prisma.$transaction(async (tx) => {
            // Manually delete related 1-to-1 records because of `onDelete: NoAction`
            if (companyToDelete.sEOId) await tx.sEO.delete({ where: { id: companyToDelete.sEOId }});
            if (companyToDelete.analyticsConfigId) await tx.analyticsConfig.delete({ where: { id: companyToDelete.analyticsConfigId }});
            if (companyToDelete.paymentSettingsId) await tx.paymentSettings.delete({ where: { id: companyToDelete.paymentSettingsId }});
            if (companyToDelete.shippingSettingsId) await tx.shippingSettings.delete({ where: { id: companyToDelete.shippingSettingsId }});

            // Now delete the company itself. Prisma will handle cascading deletes for other relations.
            await tx.company.delete({ where: { id: params.companyId } });
        });
        
        return NextResponse.json({ message: "Company deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Failed to delete company:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/server/db/prismadb";
// import { getAuthSession } from "../../../../lib/auth";
// import { companySchema } from "@/lib/validations/company";
// import { Prisma } from "@prisma/client";

// export const dynamic = "force-dynamic";

// // GET all companies for the authenticated user
// export async function GET(req: Request) {
//   const session = await getAuthSession();

//   if (!session?.user?.id) {
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const companies = await prisma.company.findMany({
//       where: { userId: session.user.id },
//       orderBy: { createdAt: 'desc' }
//     });
//     return NextResponse.json(companies);
//   } catch (error) {
//     console.error("Failed to fetch companies:", error);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }


// // (Your GET, DELETE handlers for a specific company would also go here)

// // PUT handler to update a 
// /**
//  * Utility to merge array updates:
//  * - Update items with IDs
//  * - Add new ones without IDs
//  * - Delete items in `idsToDelete`
//  */
// function handleNestedArray<T extends { id?: string }>(
//   existing: T[],
//   updates: Partial<T>[] = [],
//   idsToDelete: string[] = []
// ): Partial<T>[] {
//   // 1. Filter out deleted
//   let result = existing.filter((item) => !idsToDelete.includes(item.id!));

//   // 2. Update existing or add new
//   updates.forEach((update) => {
//     if (update.id) {
//       // update
//       result = result.map((item) =>
//         item.id === update.id ? { ...item, ...update } : item
//       );
//     } else {
//       // new item
//       result.push(update as T);
//     }
//   });

//   return result;
// }

// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const { id } = params;
//     const body = await req.json();

//     const company = await prisma.company.findUnique({
//       where: { id: id },
//       include: {
//         SEO: true,
//         PaymentSettings: true,
//         heroSlides: true,
//         promotions: true,
//         policies: true,
//         socialLinks: true,
//       },
//     });

//     if (!company) {
//       return NextResponse.json({ error: "Company not found" }, { status: 404 });
//     }

//     // build update object
//     const data: any = {};

//     // ✅ Simple scalar fields
//     if (body.name !== undefined) data.name = body.name;
//     if (body.description !== undefined) data.description = body.description;
//     if (body.logo !== undefined) data.logo = body.logo;
//     if (body.banner !== undefined) data.banner = body.banner;

//     // ✅ Nested single relations
//     if (body.seo) {
//       data.SEO = {
//         upsert: {
//           create: body.seo,
//           update: body.seo,
//         },
//       };
//     }

//     if (body.paymentSettings) {
//       data.PaymentSettings = {
//         upsert: {
//           create: body.paymentSettings,
//           update: body.paymentSettings,
//         },
//       };
//     }

//     if (body.shippingSettings) {
//       data.ShippingSettings = {
//         upsert: {
//           create: body.shippingSettings,
//           update: body.shippingSettings,
//         },
//       };
//     }

//     if (body.analyticsConfig) {
//       data.AnalyticsConfig = {
//         upsert: {
//           create: body.analyticsConfig,
//           update: body.analyticsConfig,
//         },
//       };
//     }

//     // ✅ Arrays with partial update support
//     const arrayFields = [
//       "heroSlides",
//       "promotions",
//       "policies",
//       "socialLinks",
//     ] as const;

//     for (const field of arrayFields) {
//       if (body[field]) {
//         const { updates = [], idsToDelete = [] } = body[field];

//         // compute new array snapshot
//         const newArray = handleNestedArray(
//           (company as any)[field],
//           updates,
//           idsToDelete
//         );

//         // reset and replace
//         data[field] = {
//           deleteMany: {}, // clear old
//           create: newArray.map((item) => {
//             const { id, ...rest } = item;
//             return rest;
//           }),
//         };
//       }
//     }

//     const { companyId, ...rest } = data;

//     const updatedCompany = await prisma.company.update({
//       where: { id: id },
//       data:{
//         ...rest
//       },
//       include: {
//         SEO: true,
//         PaymentSettings: true,
//         heroSlides: true,
//         promotions: true,
//         policies: true,
//         socialLinks: true,
//       },
//     });

//     return NextResponse.json(updatedCompany);
//   } catch (error: any) {
//     console.error("PUT /company error", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
// export async function PUTV(req: Request, { params }: { params: { id: string } }) {
//   try {
//     const body = await req.json();
//     const { id } = params;

//     // Example payload:
//     // {
//     //   name: "New Name",
//     //   seo: {...},
//     //   paymentSettings: {...},
//     //   heroSlides: [
//     //     { id: "existing-1", title: "Updated title" }, // update
//     //     { title: "New Slide" }, // create
//     //   ],
//     //   promotions: [
//     //     { id: "existing-2", _delete: true } // delete
//     //   ]
//     // }

//     // Build update object dynamically
//     const data: any = {};

//     // ✅ Simple scalar updates
//     if (body.name) data.name = body.name;
//     if (body.description) data.description = body.description;

//     // ✅ Nested object updates
//     if (body.seo) {
//       data.SEO = {
//         upsert: {
//           create: body.seo,
//           update: body.seo,
//         },
//       };
//     }

//     if (body.paymentSettings) {
//       data.PaymentSettings = {
//         upsert: {
//           create: body.paymentSettings,
//           update: body.paymentSettings,
//         },
//       };
//     }

//     // ✅ Handle heroSlides array (add, update, delete)
//     if (body.heroSlides) {
//       data.heroSlides = {
//         upsert: body.heroSlides
//           .filter((s: any) => s.id) // update existing
//           .map((s: any) => ({
//             where: { id: s.id },
//             update: { ...s },
//             create: { ...s },
//           })),
//         create: body.heroSlides
//           .filter((s: any) => !s.id) // create new
//           .map((s: any) => ({ ...s })),
//         deleteMany: body.heroSlides
//           .filter((s: any) => s._delete)
//           .map((s: any) => ({ id: s.id })),
//       };
//     }

//     // ✅ Same pattern for promotions
//     if (body.promotions) {
//       data.promotions = {
//         upsert: body.promotions
//           .filter((p: any) => p.id && !p._delete)
//           .map((p: any) => ({
//             where: { id: p.id },
//             update: { ...p },
//             create: { ...p },
//           })),
//         create: body.promotions.filter((p: any) => !p.id).map((p: any) => ({ ...p })),
//         deleteMany: body.promotions
//           .filter((p: any) => p._delete)
//           .map((p: any) => ({ id: p.id })),
//       };
//     }

//     // ✅ Same for policies
//     if (body.policies) {
//       data.policies = {
//         upsert: body.policies
//           .filter((p: any) => p.id && !p._delete)
//           .map((p: any) => ({
//             where: { id: p.id },
//             update: { ...p },
//             create: { ...p },
//           })),
//         create: body.policies.filter((p: any) => !p.id).map((p: any) => ({ ...p })),
//         deleteMany: body.policies
//           .filter((p: any) => p._delete)
//           .map((p: any) => ({ id: p.id })),
//       };
//     }

//     const company = await prisma.company.update({
//       where: { id },
//       data,
//       include: {
//         SEO: true,
//         PaymentSettings: true,
//         heroSlides: true,
//         promotions: true,
//         policies: true,
//       },
//     });

//     return NextResponse.json(company);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
//   }
// }
// // export async function PUT(
// //   req: Request,
// //   { params }: { params: { id: string } }
// // ) {
// //   const session = await getAuthSession();

// //   if (!session?.user?.id) {
// //     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
// //   }

// //   const { id } = params;

// //   if (!id) {
// //     return NextResponse.json({ error: "Company ID is required" }, { status: 400 });
// //   }

// //   const body = await req.json();
  
// //   const parseResult = companySchema.safeParse(body);

// //   if (!parseResult.success) {
// //     return NextResponse.json({ errors: parseResult.error.errors }, { status: 400 });
// //   }

// //   const data = parseResult.data;

// //   try {
// //     // First, verify the company belongs to the user
// //     const company = await prisma.company.findFirst({
// //       where: {
// //         id: id,
// //         userId: session.user.id,
// //       },
// //     });

// //     if (!company) {
// //       return NextResponse.json({ error: "Company not found or access denied" }, { status: 404 });
// //     }

// //     // Now, update the company
// //     const updatedCompany = await prisma.company.update({
// //       where: {
// //         id: id,
// //       },
      
// //       data: {
// //           ...data,

// //           // You would need similar logic for policies, faqs, testimonials, promotions, etc.
// //         // ... add update logic for other relations here ...
// //          // Securely associate with the logged-in user
// //         user: { connect: { id: session.user.id } },

// //           // One-to-one relations with upsert
// //           SEO: data.seo
// //             ? {
// //                 upsert: {
// //                   create: data.seo,
// //                   update: data.seo,
// //                 },
// //               }
// //             : undefined,

// //           AnalyticsConfig: data.analyticsConfig
// //             ? {
// //                 upsert: {
// //                   create: data.analyticsConfig,
// //                   update: data.analyticsConfig,
// //                 },
// //               }
// //             : undefined,

// //           PaymentSettings: data.paymentSettings
// //             ? {
// //                 upsert: {
// //                   create: data.paymentSettings,
// //                   update: data.paymentSettings,
// //                 },
// //               }
// //             : undefined,

// //           ShippingSettings: data.shippingSettings
// //             ? {
// //                 upsert: {
// //                   create: data.shippingSettings,
// //                   update: data.shippingSettings,
// //                 },
// //               }
// //             : undefined,

// //           // One-to-many relations
// //           socialLinks: data.socialLinks
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.socialLinks,
// //               }
// //             : undefined,

// //           heroSlides: data.heroSlides
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.heroSlides.map((h) => ({
// //                   ...h,
// //                   endsAt: h.endsAt ? new Date(h.endsAt) : null,
// //                 })),
// //               }
// //             : undefined,

// //           promotions: data.promotions
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.promotions.map((p) => ({
// //                   ...p,
// //                   startsAt: p.startsAt ? new Date(p.startsAt) : null,
// //                   endsAt: p.endsAt ? new Date(p.endsAt) : null,
// //                 })),
// //               }
// //             : undefined,

// //           policies: data.policies
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.policies,
// //               }
// //             : undefined,

// //           faqs: data.faqs
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.faqs,
// //               }
// //             : undefined,

// //           testimonials: data.testimonials
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.testimonials,
// //               }
// //             : undefined,

// //           // Many-to-many with custom fields
// //           StoreCategory: data.storeCategories
// //             ? {
// //                 deleteMany: { companyId: id },
// //                 create: data.storeCategories.map((sc, idx) => ({
// //                   category: { connect: { id: sc.id } },
// //                   displayName: sc.displayName,
// //                   sortOrder: sc.sortOrder ?? idx,
// //                 })),
// //               }
// //             : undefined,
// //       },

// //     });

// //     return NextResponse.json(updatedCompany, { status: 200 });
// //   } catch (error) {
// //     console.error("❌ Company update failed:", error);
// //     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
// //   }
// // }



// // data: {
// //         ...data,
       
// //         socialLinks: data.socialLinks
// //           ? {
// //               deleteMany: {}, // Delete all existing links for this company
// //               create: data.socialLinks, // Create the new ones from the payload
// //             }
// //           : undefined,

// //         heroSlides: data.heroSlides ? {
// //             deleteMany: {},
// //             create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : null}))
// //         } : undefined,

//         // // You would need similar logic for policies, faqs, testimonials, promotions, etc.
//         // // ... add update logic for other relations here ...
//         //  // Securely associate with the logged-in user
//         // user: { connect: { id: session.user.id } },
        
// //         // Handle creation of nested relations
// //         // heroSlides: data.heroSlides ? { create: data.heroSlides.map(h => ({...h, endsAt: h.endsAt ? new Date(h.endsAt) : null})) } : undefined,
// //         promotions: data.promotions ? { create: data.promotions.map(p => ({...p, startsAt: p.startsAt ? new Date(p.startsAt) : null, endsAt: p.endsAt ? new Date(p.endsAt) : null})) } : undefined,
        
// //         policies: data.policies ? { create: data.policies } : undefined,
// //         faqs: data.faqs ? { create: data.faqs } : undefined,
// //         testimonials: data.testimonials ? { create: data.testimonials } : undefined,
// //         SEO: data.seo ? { create: data.seo } : undefined,
// //         AnalyticsConfig: data.analyticsConfig ? { create: data.analyticsConfig } : undefined,
// //         PaymentSettings: data.paymentSettings ? { create: data.paymentSettings } : undefined,
// //         ShippingSettings: data.shippingSettings ? { create: data.shippingSettings } : undefined,

// //         // Many-to-many relations
// //         StoreCategory: data.storeCategories ? {
// //             create: data.storeCategories.map((sc, idx) => ({
// //                 category: { connect: { id: sc.id } },
// //                 displayName: sc.displayName,
// //                 sortOrder: sc.sortOrder ?? idx,
// //             }))
// //         } : undefined,
// //       },