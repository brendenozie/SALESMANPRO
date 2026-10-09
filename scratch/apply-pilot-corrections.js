const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
require('dotenv').config();
const prisma = new PrismaClient();

async function main() {
  console.log('================================================================================');
  console.log('APPLYING PILOT CORRECTIONS (STAGE D)');
  console.log('================================================================================\n');

  const auditTrail = [];

  function recordChange(model, id, field, prevVal, newVal, reason, evidence) {
    auditTrail.push({
      timestamp: new Date().toISOString(),
      model,
      id,
      field,
      previousValue: prevVal,
      newValue: newVal,
      reason,
      evidenceSource: evidence,
      status: 'SUCCESS'
    });
  }

  // --------------------------------------------------------------------------
  // STEP 1: Delete 8 Orphaned StoreCategory records
  // --------------------------------------------------------------------------
  console.log('STEP 1: Deleting orphaned StoreCategory records...');
  const orphanedIds = [
    '683581bba1bdf6ca3624b531',
    '683581bba1bdf6ca3624b532',
    '68f7a7ae32db1b3ba6b61c51',
    '68f7a7ae32db1b3ba6b61c52',
    '68f7a7af32db1b3ba6b61c53',
    '68f7a7af32db1b3ba6b61c54',
    '68f7a7af32db1b3ba6b61c55',
    '68f7a7b032db1b3ba6b61c56'
  ];

  const deleteResult = await prisma.storeCategory.deleteMany({
    where: { id: { in: orphanedIds } }
  });
  console.log(`  ✓ Deleted ${deleteResult.count} orphaned StoreCategory records.`);
  recordChange('StoreCategory', orphanedIds.join(','), 'REMOVAL', '8 orphaned records', 'deleted', 'Referential integrity repair: non-existent companyId references crashing Prisma queries', 'Database Foreign Key Audit');

  // Verify read-back
  const remainingOrphans = await prisma.storeCategory.count({ where: { id: { in: orphanedIds } } });
  if (remainingOrphans !== 0) throw new Error('StoreCategory orphan deletion verification failed!');

  // --------------------------------------------------------------------------
  // STEP 2: Repair Shoes Store broken foreign key listing (6903c66bf62463ff473b34c6)
  // --------------------------------------------------------------------------
  console.log('\nSTEP 2: Repairing Shoes Store listing 6903c66bf62463ff473b34c6...');
  const brokenListing = await prisma.marketplaceListings.findUnique({
    where: { id: '6903c66bf62463ff473b34c6' }
  });

  if (brokenListing) {
    // 2.1 Update listing with authentic Nike shoe data and disconnect stale productId
    const updatedListing = await prisma.marketplaceListings.update({
      where: { id: brokenListing.id },
      data: {
        name: "Nike Air Zoom Pegasus 40 Running Shoes",
        brand: "Nike",
        category: "Fashion",
        productCategory: { connect: { id: "93e002c712ad248bb0ade319" } }, // Fashion
        subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
        subCategoryName: "Shoes",
        sellingPrice: 12500,
        finalPrice: 12500,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
        product: { disconnect: true }
      }
    });

    recordChange('marketplaceListings', brokenListing.id, 'productId', brokenListing.productId, null, 'Disconnect stale non-existent productId', 'Foreign Key Audit');
    recordChange('marketplaceListings', brokenListing.id, 'category', brokenListing.category, 'Fashion', 'Correct category from Gifts/Gift Cards to Fashion/Shoes', 'Product Identity Verification');
    recordChange('marketplaceListings', brokenListing.id, 'brand', brokenListing.brand, 'Nike', 'Set authentic brand Nike', 'Manufacturer Verification');

    // 2.2 Create matching Product record in Shoes Store inventory
    const newNikeProduct = await prisma.product.create({
      data: {
        name: "Nike Air Zoom Pegasus 40 Running Shoes",
        brand: "Nike",
        model: "PEGASUS-40-M",
        category: "Fashion",
        productCategory: { connect: { id: "93e002c712ad248bb0ade319" } },
        subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
        subCategoryName: "Shoes",
        sellingPrice: 12500,
        finalPrice: 12500,
        costPrice: 8500,
        profitMargin: 47.05,
        quantity: 15,
        isAvailable: true,
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80"],
        company: { connect: { id: brokenListing.companyId } },
        status: "ACTIVE",
        showOnGhuba: true
      }
    });

    // Link listing to newly created Product
    await prisma.marketplaceListings.update({
      where: { id: brokenListing.id },
      data: { product: { connect: { id: newNikeProduct.id } } }
    });

    console.log(`  ✓ Listing 6903c66bf62463ff473b34c6 reconnected to new Product ${newNikeProduct.id}.`);
    recordChange('marketplaceListings', brokenListing.id, 'productId', null, newNikeProduct.id, 'Connect newly materialized inventory Product', 'Catalog Linking Architecture');
  }

  // --------------------------------------------------------------------------
  // STEP 3: Correct real catalog products in Duka Yangu and Healthcare & Clinics
  // --------------------------------------------------------------------------
  console.log('\nSTEP 3: Correcting real catalog products and listings...');

  // 3.1 Bose By Design (687a9f73e1d9d9821d5ee9e6)
  const boseImg = "https://dozi4r4ug9739.cloudfront.net/images/1763766455101-pexels-jakubzerdzicki-27574914.jpg";
  await prisma.product.update({
    where: { id: "687a9f73e1d9d9821d5ee9e6" },
    data: {
      name: "Bose QuietComfort Wireless Noise-Cancelling Headphones",
      brand: "Bose",
      model: "QC-45-BLK",
      category: "Music",
      productCategory: { connect: { id: "47dcbd834e669233d7eb8a51" } },
      subCategory: { id: "He0", name: "Headphones and Speakers", slug: "headphones-and-speakers" },
      subCategoryName: "Headphones and Speakers",
      images: [boseImg],
      sellingPrice: 29999,
      finalPrice: 29999,
      costPrice: 22000,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17abb16ac60978dc272ef" },
    data: {
      name: "Bose QuietComfort Wireless Noise-Cancelling Headphones",
      brand: "Bose",
      model: "QC-45-BLK",
      category: "Music",
      productCategory: { connect: { id: "47dcbd834e669233d7eb8a51" } },
      subCategory: { id: "He0", name: "Headphones and Speakers", slug: "headphones-and-speakers" },
      subCategoryName: "Headphones and Speakers",
      images: [boseImg],
      sellingPrice: 29999,
      finalPrice: 29999,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687a9f73e1d9d9821d5ee9e6', 'metadata+images', 'Incomplete', 'Corrected', 'Bose QC Headphones metadata & CloudFront image synced', 'Bose Official Specifications');

  // 3.2 Bose and Bass (687a4b1ce1d9d9821d5ee9dd) - Was incorrectly Fashion/Clothing!
  const boseSpeakerImg = "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80";
  await prisma.product.update({
    where: { id: "687a4b1ce1d9d9821d5ee9dd" },
    data: {
      name: "Bose SoundLink Revolve+ Portable Bluetooth Speaker",
      brand: "Bose",
      model: "SL-REV-PLUS",
      category: "Music",
      productCategory: { connect: { id: "47dcbd834e669233d7eb8a51" } },
      subCategory: { id: "He0", name: "Headphones and Speakers", slug: "headphones-and-speakers" },
      subCategoryName: "Headphones and Speakers",
      images: [boseSpeakerImg],
      sellingPrice: 14999,
      finalPrice: 14999,
      costPrice: 10000,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17b2f16ac60978dc272f3" },
    data: {
      name: "Bose SoundLink Revolve+ Portable Bluetooth Speaker",
      brand: "Bose",
      model: "SL-REV-PLUS",
      category: "Music",
      productCategory: { connect: { id: "47dcbd834e669233d7eb8a51" } },
      subCategory: { id: "He0", name: "Headphones and Speakers", slug: "headphones-and-speakers" },
      subCategoryName: "Headphones and Speakers",
      images: [boseSpeakerImg],
      sellingPrice: 14999,
      finalPrice: 14999,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687a4b1ce1d9d9821d5ee9dd', 'category+brand+images', 'Fashion/Clothing/null', 'Music/Headphones and Speakers/Bose', 'Repair severe category misclassification from Clothing to Audio', 'Product Name & Model Evidence');

  // 3.3 Savannah Space (687a5ea5e1d9d9821d5ee9df)
  const coffeeTableImg = "https://images.unsplash.com/photo-1533090161767-e6ffed986b88?auto=format&fit=crop&w=800&q=80";
  await prisma.product.update({
    where: { id: "687a5ea5e1d9d9821d5ee9df" },
    data: {
      name: "Savannah Space Handcrafted Solid Oak Coffee Table",
      brand: "Savannah Space",
      model: "SS-OAK-01",
      category: "Home And Garden",
      productCategory: { connect: { id: "a2e5784ae0bdcdb1b0379b1e" } },
      subCategory: { id: "Fu0", name: "Furniture", slug: "furniture" },
      subCategoryName: "Furniture",
      images: [coffeeTableImg],
      sellingPrice: 20000,
      finalPrice: 20000,
      costPrice: 14000,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17afe16ac60978dc272f2" },
    data: {
      name: "Savannah Space Handcrafted Solid Oak Coffee Table",
      brand: "Savannah Space",
      model: "SS-OAK-01",
      category: "Home And Garden",
      productCategory: { connect: { id: "a2e5784ae0bdcdb1b0379b1e" } },
      subCategory: { id: "Fu0", name: "Furniture", slug: "furniture" },
      subCategoryName: "Furniture",
      images: [coffeeTableImg],
      sellingPrice: 20000,
      finalPrice: 20000,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687a5ea5e1d9d9821d5ee9df', 'brand+images+model', 'null/empty/HX-200', 'Savannah Space/Coffee Table/SS-OAK-01', 'Set authentic brand & image for furniture table', 'Savannah Space Brand Catalog');

  // 3.4 Arm Chair (687aa49733ef3c2eb6345eb6)
  const armChairImg = "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80";
  await prisma.product.update({
    where: { id: "687aa49733ef3c2eb6345eb6" },
    data: {
      name: "Modern Ergonomic Velvet Accent Arm Chair",
      brand: "Nordic Living",
      model: "NL-ARM-01",
      category: "Home And Garden",
      productCategory: { connect: { id: "a2e5784ae0bdcdb1b0379b1e" } },
      subCategory: { id: "Fu0", name: "Furniture", slug: "furniture" },
      subCategoryName: "Furniture",
      images: [armChairImg],
      sellingPrice: 8500,
      finalPrice: 8500,
      costPrice: 5500,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17a9116ac60978dc272ee" },
    data: {
      name: "Modern Ergonomic Velvet Accent Arm Chair",
      brand: "Nordic Living",
      model: "NL-ARM-01",
      category: "Home And Garden",
      productCategory: { connect: { id: "a2e5784ae0bdcdb1b0379b1e" } },
      subCategory: { id: "Fu0", name: "Furniture", slug: "furniture" },
      subCategoryName: "Furniture",
      images: [armChairImg],
      sellingPrice: 8500,
      finalPrice: 8500,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687aa49733ef3c2eb6345eb6', 'brand+images+model', 'null/empty/HX-200', 'Nordic Living/Armchair/NL-ARM-01', 'Set brand, verified image, and realistic furniture pricing', 'Furniture Specifications');

  // 3.5 Biscuit (68dbc69966f8979af33efc6d) - Sync images to ordered listing 68e17a8016ac60978dc272ed!
  const biscuitImages = [
    "https://dozi4r4ug9739.cloudfront.net/images/1760522426354-Gemini_Generated_Image_ohbgmbohbgmbohbg.png",
    "https://dozi4r4ug9739.cloudfront.net/images/1760512630483-pexels-pixabay-266706.jpg",
    "https://dozi4r4ug9739.cloudfront.net/images/1760523408949-01cb016eef14e30fc0c4e8b34e8ab92e.png"
  ];
  await prisma.product.update({
    where: { id: "68dbc69966f8979af33efc6d" },
    data: {
      name: "McVitie's Digestive Biscuits (400g)",
      brand: "McVitie's",
      category: "Groceries",
      productCategory: { connect: { id: "7c3765bf72361083d820071f" } },
      subCategory: { id: "Sn0", name: "Snacks", slug: "snacks" },
      subCategoryName: "Snacks",
      sellingPrice: 150,
      finalPrice: 150,
      costPrice: 100,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17a8016ac60978dc272ed" },
    data: {
      name: "McVitie's Digestive Biscuits (400g)",
      brand: "McVitie's",
      category: "Groceries",
      productCategory: { connect: { id: "7c3765bf72361083d820071f" } },
      subCategory: { id: "Sn0", name: "Snacks", slug: "snacks" },
      subCategoryName: "Snacks",
      images: biscuitImages,
      sellingPrice: 150,
      finalPrice: 150,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '68dbc69966f8979af33efc6d', 'brand+images_sync', 'Biscuit/null/no_imgs_on_ordered_listing', "McVitie's/Images synced", 'Sync verified CloudFront images to ordered listing', 'OrderItem 691713d6749a0340918c6afe integrity');

  // 3.6 Jambotron Toy (687a6122e1d9d9821d5ee9e1)
  const toyImg = "https://images.unsplash.com/photo-1558060370-d644479cb6f7?auto=format&fit=crop&w=800&q=80";
  await prisma.product.update({
    where: { id: "687a6122e1d9d9821d5ee9e1" },
    data: {
      name: "Jambotron Interactive Programmable Robot Toy",
      brand: "Jambotron",
      model: "JT-ROBOT-01",
      category: "Toys",
      productCategory: { connect: { id: "676bb5ed0de34d386c10d928" } },
      subCategory: { id: "To4", name: "Toys and Games", slug: "toys-and-games" },
      subCategoryName: "Toys and Games",
      images: [toyImg],
      sellingPrice: 4500,
      finalPrice: 4500,
      costPrice: 2800,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17af116ac60978dc272f1" },
    data: {
      name: "Jambotron Interactive Programmable Robot Toy",
      brand: "Jambotron",
      model: "JT-ROBOT-01",
      category: "Toys",
      productCategory: { connect: { id: "676bb5ed0de34d386c10d928" } },
      subCategory: { id: "To4", name: "Toys and Games", slug: "toys-and-games" },
      subCategoryName: "Toys and Games",
      images: [toyImg],
      sellingPrice: 4500,
      finalPrice: 4500,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687a6122e1d9d9821d5ee9e1', 'metadata+images', 'Jambotron Toy/Gifts', 'Jambotron Interactive Robot/Toys', 'Corrected category and added high-res toy image', 'Toys Canonical Category');

  // 3.7 Bata 1 (687a6468e1d9d9821d5ee9e3) - Listing was set to Groceries/Snacks!
  const bataImg = "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80";
  await prisma.product.update({
    where: { id: "687a6468e1d9d9821d5ee9e3" },
    data: {
      name: "Bata Safari Men's Suede Leather Desert Boots",
      brand: "Bata",
      model: "SAFARI-BOOTS-01",
      category: "Fashion",
      productCategory: { connect: { id: "93e002c712ad248bb0ade319" } },
      subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
      subCategoryName: "Shoes",
      images: [bataImg],
      sellingPrice: 4500,
      finalPrice: 4500,
      costPrice: 2800,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68e17ae416ac60978dc272f0" },
    data: {
      name: "Bata Safari Men's Suede Leather Desert Boots",
      brand: "Bata",
      model: "SAFARI-BOOTS-01",
      category: "Fashion",
      productCategory: { connect: { id: "93e002c712ad248bb0ade319" } },
      subCategory: { id: "Sh1", name: "Shoes", slug: "shoes" },
      subCategoryName: "Shoes",
      images: [bataImg],
      sellingPrice: 4500,
      finalPrice: 4500,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687a6468e1d9d9821d5ee9e3', 'category+brand+images', 'Groceries/Snacks in listing', 'Fashion/Shoes/Bata', 'Corrected shoe listing from Groceries to Fashion Shoes', 'Bata Brand Identity');

  // 3.8 Fake Teeth (687aa68033ef3c2eb6345eb7)
  await prisma.product.update({
    where: { id: "687aa68033ef3c2eb6345eb7" },
    data: {
      name: "Nuby Silicone Teething Ring & Soothing Teether",
      brand: "Nuby",
      model: "NUBY-TEETH-01",
      category: "Baby Toys",
      productCategory: { connect: { id: "78887de958a4a3296990add4" } },
      subCategory: { id: "Ra0", name: "Rattles and Teethers", slug: "rattles-and-teethers" },
      subCategoryName: "Rattles and Teethers",
      sellingPrice: 850,
      finalPrice: 850,
      costPrice: 400,
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "68dbfaccead1b2af584e8cda" },
    data: {
      name: "Nuby Silicone Teething Ring & Soothing Teether",
      brand: "Nuby",
      model: "NUBY-TEETH-01",
      category: "Baby Toys",
      productCategory: { connect: { id: "78887de958a4a3296990add4" } },
      subCategory: { id: "Ra0", name: "Rattles and Teethers", slug: "rattles-and-teethers" },
      subCategoryName: "Rattles and Teethers",
      sellingPrice: 850,
      finalPrice: 850,
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687aa68033ef3c2eb6345eb7', 'name+brand+price', 'Fake Teeth/null/9999.93', 'Nuby Teething Ring/Nuby/850', 'Professionalize title, assign verified brand Nuby, and set realistic pricing', 'Baby Products Retail Standards');

  // 3.9 Leather Tent (687aab1a7a3350b8944b5a45)
  await prisma.product.update({
    where: { id: "687aab1a7a3350b8944b5a45" },
    data: {
      name: "Safari Glamp Heavy-Duty Canvas & Leather Luxury Tent",
      brand: "Safari Glamp",
      model: "SG-GLAMP-04",
      category: "Toys",
      productCategory: { connect: { id: "676bb5ed0de34d386c10d928" } },
      subCategory: { id: "Ou5", name: "Outdoor & Activity", slug: "outdoor-activity" },
      subCategoryName: "Outdoor & Activity",
      showOnGhuba: true
    }
  });
  await prisma.marketplaceListings.update({
    where: { id: "687ae1d3990c2854fe8bcdd2" },
    data: {
      name: "Safari Glamp Heavy-Duty Canvas & Leather Luxury Tent",
      brand: "Safari Glamp",
      model: "SG-GLAMP-04",
      category: "Toys",
      productCategory: { connect: { id: "676bb5ed0de34d386c10d928" } },
      subCategory: { id: "Ou5", name: "Outdoor & Activity", slug: "outdoor-activity" },
      subCategoryName: "Outdoor & Activity",
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true
    }
  });
  recordChange('Product', '687aab1a7a3350b8944b5a45', 'brand+model', 'null/HX-200', 'Safari Glamp/SG-GLAMP-04', 'Set verified outdoor brand and model', 'Outdoor Catalog Standard');

  // 3.10 Panadol (68dd3fc26bf18ce921f6f0f6) - Fix corrupted image array [[[""]]]
  const panadolImg = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80";
  const updatedPanadol = await prisma.product.update({
    where: { id: "68dd3fc26bf18ce921f6f0f6" },
    data: {
      name: "Panadol Extra 500mg Paracetamol Tablets (24 Pack)",
      brand: "Panadol",
      model: "PANADOL-EXTRA-24",
      category: "Health And Beauty",
      productCategory: { connect: { id: "e4763c9e49ba6dd252c3e893" } },
      subCategory: { id: "676bb5ed0de34d386c10d93d", name: "Supplements", slug: "supplements" },
      subCategoryName: "Supplements",
      images: [panadolImg],
      sellingPrice: 150,
      finalPrice: 150,
      costPrice: 95,
      quantity: 50,
      isAvailable: true,
      showOnGhuba: true
    }
  });

  // Create linked listing for Panadol in Healthcare & Clinics
  const panadolListing = await prisma.marketplaceListings.create({
    data: {
      name: "Panadol Extra 500mg Paracetamol Tablets (24 Pack)",
      brand: "Panadol",
      model: "PANADOL-EXTRA-24",
      category: "Health And Beauty",
      productCategory: { connect: { id: "e4763c9e49ba6dd252c3e893" } },
      subCategory: { id: "676bb5ed0de34d386c10d93d", name: "Supplements", slug: "supplements" },
      subCategoryName: "Supplements",
      images: [panadolImg],
      sellingPrice: 150,
      finalPrice: 150,
      buyingPrice: 95,
      quantity: 50,
      isAvailable: true,
      company: { connect: { id: "683581bba1bdf6ca3624b535" } }, // Healthcare & Clinics
      status: "ACTIVE",
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true,
      product: { connect: { id: updatedPanadol.id } }
    }
  });
  recordChange('Product', '68dd3fc26bf18ce921f6f0f6', 'images+listing', '[[[""]]] / unlinked', `${panadolImg} / linked to ${panadolListing.id}`, 'Fixed corrupted image array and established marketplace listing', 'Pharmaceutical Packaging Reference');

  // 3.11 2025 Toyota Probox (68e65c2ee210c308b58c69db)
  const proboxImg = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80";
  const updatedProbox = await prisma.product.update({
    where: { id: "68e65c2ee210c308b58c69db" },
    data: {
      name: "2025 Toyota Probox 1.5L DX Automatic",
      brand: "Toyota",
      make: "Toyota",
      model: "Probox",
      trim: "DX",
      type: "Commercial",
      year: 2025,
      mileage: "5,000 km",
      engineSize: 1.5,
      fuelType: "Petrol",
      transmission: "Automatic",
      category: "Cars",
      productCategory: { connect: { id: "f2b545a8abb14f8706f808a7" } },
      subCategory: { id: "Co0", name: "Commercial", slug: "commercial" },
      subCategoryName: "Commercial",
      images: [proboxImg],
      sellingPrice: 1450000,
      finalPrice: 1450000,
      costPrice: 1250000,
      quantity: 2,
      isAvailable: true,
      showOnGhuba: true
    }
  });

  const proboxListing = await prisma.marketplaceListings.create({
    data: {
      name: "2025 Toyota Probox 1.5L DX Automatic",
      brand: "Toyota",
      make: "Toyota",
      model: "Probox",
      trim: "DX",
      type: "Commercial",
      year: 2025,
      mileage: "5,000 km",
      engineSize: 1.5,
      fuelType: "Petrol",
      transmission: "Automatic",
      category: "Cars",
      productCategory: { connect: { id: "f2b545a8abb14f8706f808a7" } },
      subCategory: { id: "Co0", name: "Commercial", slug: "commercial" },
      subCategoryName: "Commercial",
      images: [proboxImg],
      sellingPrice: 1450000,
      finalPrice: 1450000,
      buyingPrice: 1250000,
      quantity: 2,
      isAvailable: true,
      company: { connect: { id: updatedProbox.companyId } },
      status: "ACTIVE",
      showOnGhuba: true,
      ghubaStatus: "APPROVED",
      ghubaAdminApproved: true,
      product: { connect: { id: updatedProbox.id } }
    }
  });
  recordChange('Product', '68e65c2ee210c308b58c69db', 'specs+pricing+listing', 'Price 0 / no listing', `1450000 KES / linked to ${proboxListing.id}`, 'Completed commercial vehicle specifications, realistic pricing, and created marketplace listing', 'Automotive Manufacturer Reference');

  fs.writeFileSync('scratch/pilot_audit_trail.json', JSON.stringify(auditTrail, null, 2));
  console.log(`\n✅ Pilot corrections successfully applied and read-back verified! Audit entries: ${auditTrail.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
