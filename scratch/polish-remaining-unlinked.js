const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function main() {
  console.log('Polishing and connecting the final 7 unlinked listings...\n');
  const audit = [];

  // 1. pflourishhub listing 690084dca2172b890cd8f61b (E-book)
  const pEbook = await prisma.marketplaceListings.findUnique({ where: { id: '690084dca2172b890cd8f61b' } });
  if (pEbook && !pEbook.productId) {
    const prod = await prisma.product.create({
      data: {
        name: pEbook.name,
        category: "Digital Goods & Subscriptions",
        productCategory: { connect: { id: "d1f2e3c4b5a6978877665544" } },
        subCategory: pEbook.subCategory,
        subCategoryName: "E-books",
        brand: "FlourishHub",
        images: pEbook.images,
        sellingPrice: 12500,
        finalPrice: 12500,
        costPrice: 5000,
        company: { connect: { id: pEbook.companyId } },
        status: "ACTIVE",
        showOnGhuba: true
      }
    });
    await prisma.marketplaceListings.update({
      where: { id: pEbook.id },
      data: { product: { connect: { id: prod.id } } }
    });
    console.log(`  ✓ Linked pflourishhub ebook ${pEbook.id} to Product ${prod.id}`);
  }

  // 2. pflourishhub listing 69012ecbcda3cea48b52be7f (Life Coaching)
  const pCoach = await prisma.marketplaceListings.findUnique({ where: { id: '69012ecbcda3cea48b52be7f' } });
  if (pCoach && !pCoach.productId) {
    const prod = await prisma.product.create({
      data: {
        name: pCoach.name,
        category: "Consulting & Coaching",
        productCategory: { connect: { id: "68fbd9b9312d85c98ea7fdf4" } },
        subCategory: pCoach.subCategory,
        subCategoryName: "Life Coaching",
        brand: "FlourishHub",
        images: pCoach.images,
        sellingPrice: 12500,
        finalPrice: 12500,
        costPrice: 5000,
        company: { connect: { id: pCoach.companyId } },
        status: "ACTIVE",
        showOnGhuba: true
      }
    });
    await prisma.marketplaceListings.update({
      where: { id: pCoach.id },
      data: { product: { connect: { id: prod.id } } }
    });
    console.log(`  ✓ Linked pflourishhub coaching ${pCoach.id} to Product ${prod.id}`);
  }

  // 3. travel-tourism listing 68ca81c355aabf7d60a8c91a
  const travelImg = "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=800&q=80";
  const pTravel = await prisma.product.create({
    data: {
      name: "7-Day Luxury Private Safari to Maasai Mara & Serengeti",
      brand: "Safari Safari Tours",
      model: "SST-LUX-7D",
      category: "Travel & Experiences",
      productCategory: { connect: { id: "e6f7a8b9c0d1325476685501" } },
      subCategory: { id: "tour-packages", name: "Tour Packages", slug: "tour-packages" },
      subCategoryName: "Tour Packages",
      images: [travelImg],
      sellingPrice: 85000,
      finalPrice: 85000,
      costPrice: 65000,
      company: { connect: { id: "683581bba1bdf6ca3624b540" } }, // travel-tourism
      status: "ACTIVE",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68ca81c355aabf7d60a8c91a" },
    data: {
      name: "7-Day Luxury Private Safari to Maasai Mara & Serengeti",
      brand: "Safari Safari Tours",
      model: "SST-LUX-7D",
      category: "Travel & Experiences",
      productCategory: { connect: { id: "e6f7a8b9c0d1325476685501" } },
      subCategory: { id: "tour-packages", name: "Tour Packages", slug: "tour-packages" },
      subCategoryName: "Tour Packages",
      images: [travelImg],
      sellingPrice: 85000,
      finalPrice: 85000,
      product: { connect: { id: pTravel.id } },
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  console.log(`  ✓ Linked & upgraded travel listing to Product ${pTravel.id}`);

  // 4. restaurant listing 6884b2b6eb9bffc4afd0a22f (Fish Fry)
  const fishImg = "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80";
  const pFish = await prisma.product.create({
    data: {
      name: "Fresh Lake Victoria Tilapia Fillet & Potato Wedges",
      brand: "Swahili Plate",
      model: "SP-FISH-FILLET",
      category: "Restaurant & Food Delivery",
      productCategory: { connect: { id: "000000000000000000070001" } },
      subCategory: { id: "dining", name: "Dining", slug: "dining" },
      subCategoryName: "Dining",
      images: [fishImg],
      sellingPrice: 1350,
      finalPrice: 1350,
      costPrice: 800,
      company: { connect: { id: "683581bba1bdf6ca3624b532" } },
      status: "ACTIVE",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "6884b2b6eb9bffc4afd0a22f" },
    data: {
      name: "Fresh Lake Victoria Tilapia Fillet & Potato Wedges",
      brand: "Swahili Plate",
      model: "SP-FISH-FILLET",
      category: "Restaurant & Food Delivery",
      productCategory: { connect: { id: "000000000000000000070001" } },
      subCategory: { id: "dining", name: "Dining", slug: "dining" },
      subCategoryName: "Dining",
      images: [fishImg],
      sellingPrice: 1350,
      finalPrice: 1350,
      product: { connect: { id: pFish.id } },
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  console.log(`  ✓ Linked & upgraded fish listing to Product ${pFish.id}`);

  // 5. real-estate listing 6889c23b24f9f89a608b48fb (Awesome Apartments)
  const aptImg = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80";
  const pApt = await prisma.product.create({
    data: {
      name: "Awesome Heights Modern 3-Bedroom Master Ensuite, Kileleshwa",
      brand: "HassConsult",
      model: "KIL-APT-3B",
      category: "Property",
      productCategory: { connect: { id: "93e002c712ad248bb0ade320" } },
      subCategory: { id: "apartments", name: "Apartments", slug: "apartments" },
      subCategoryName: "Apartments",
      images: [aptImg],
      sellingPrice: 16500000,
      finalPrice: 16500000,
      costPrice: 14500000,
      company: { connect: { id: "683581bba1bdf6ca3624b534" } },
      status: "ACTIVE",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "6889c23b24f9f89a608b48fb" },
    data: {
      name: "Awesome Heights Modern 3-Bedroom Master Ensuite, Kileleshwa",
      brand: "HassConsult",
      model: "KIL-APT-3B",
      category: "Property",
      productCategory: { connect: { id: "93e002c712ad248bb0ade320" } },
      subCategory: { id: "apartments", name: "Apartments", slug: "apartments" },
      subCategoryName: "Apartments",
      images: [aptImg],
      sellingPrice: 16500000,
      finalPrice: 16500000,
      product: { connect: { id: pApt.id } },
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  console.log(`  ✓ Linked & upgraded real-estate listing to Product ${pApt.id}`);

  // 6. finance-legal listing 68c29ab8c4264d75af2ad196 (Corporate Law)
  const legalImg = "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80";
  const pLegal = await prisma.product.create({
    data: {
      name: "Corporate & Commercial Legal Advisory Retainer for Businesses",
      brand: "LexAfrica Legal Advocates",
      model: "LEX-RETAINER-01",
      category: "Finance & Legal",
      productCategory: { connect: { id: "000000000000000000120001" } },
      subCategory: { id: "finance-legal", name: "Finance & Legal", slug: "finance-legal" },
      subCategoryName: "Finance & Legal",
      images: [legalImg],
      sellingPrice: 35000,
      finalPrice: 35000,
      costPrice: 20000,
      company: { connect: { id: "683581bba1bdf6ca3624b538" } },
      status: "ACTIVE",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68c29ab8c4264d75af2ad196" },
    data: {
      name: "Corporate & Commercial Legal Advisory Retainer for Businesses",
      brand: "LexAfrica Legal Advocates",
      model: "LEX-RETAINER-01",
      category: "Finance & Legal",
      productCategory: { connect: { id: "000000000000000000120001" } },
      subCategory: { id: "finance-legal", name: "Finance & Legal", slug: "finance-legal" },
      subCategoryName: "Finance & Legal",
      images: [legalImg],
      sellingPrice: 35000,
      finalPrice: 35000,
      product: { connect: { id: pLegal.id } },
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  console.log(`  ✓ Linked & upgraded legal listing to Product ${pLegal.id}`);

  // 7. directory-listings listing 6882938ca195c3ed50b3fdaf (Bata Premium)
  const bataImg = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
  const pBata = await prisma.product.create({
    data: {
      name: "Bata Bullets High-Top Canvas Retro Sneakers",
      brand: "Bata",
      model: "BATA-BULLETS-01",
      category: "Fashion",
      productCategory: { connect: { id: "93e002c712ad248bb0ade319" } },
      subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
      subCategoryName: "Shoes",
      images: [bataImg],
      sellingPrice: 3500,
      finalPrice: 3500,
      costPrice: 2200,
      company: { connect: { id: "683581bba1bdf6ca3624b546" } },
      status: "ACTIVE",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "6882938ca195c3ed50b3fdaf" },
    data: {
      name: "Bata Bullets High-Top Canvas Retro Sneakers",
      brand: "Bata",
      model: "BATA-BULLETS-01",
      category: "Fashion",
      productCategory: { connect: { id: "93e002c712ad248bb0ade319" } },
      subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
      subCategoryName: "Shoes",
      images: [bataImg],
      sellingPrice: 3500,
      finalPrice: 3500,
      product: { connect: { id: pBata.id } },
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  console.log(`  ✓ Linked & upgraded directory listing to Product ${pBata.id}`);

  console.log('\nAll 7 remaining unlinked items successfully upgraded and connected to inventory products!');
  await prisma.$disconnect();
}

main().catch(console.error);
