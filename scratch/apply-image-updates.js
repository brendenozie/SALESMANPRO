const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

const updates = [
  {
    title: 'Savannah Space Handcrafted Solid Oak Coffee Table',
    productId: '687a5ea5e1d9d9821d5ee9df',
    listingId: '68e17afe16ac60978dc272f2',
    newUrl: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Herman Miller Aeron Ergonomic Mesh Office Chair',
    productId: '6ac7ff18ae010e336bdcdba0',
    listingId: '6ac7ff1bae010e336bdcdba1',
    newUrl: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Industrial Rustic Solid Wood & Steel Bookshelf',
    productId: '6ac7ff1dae010e336bdcdba4',
    listingId: '6ac7ff1eae010e336bdcdba5',
    newUrl: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: "Levi's 501 Original Fit Straight-Leg Denim Jeans",
    productId: '6ac7ff25ae010e336bdcdbac',
    listingId: '6ac7ff25ae010e336bdcdbad',
    newUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Castrol EDGE 5W-30 Advanced Full Synthetic Engine Oil 4L',
    productId: '6ac7ff2fae010e336bdcdbba',
    listingId: '6ac7ff2fae010e336bdcdbbb',
    newUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Seven Seas Cod Liver Oil Plus Multivitamins (120 Capsules)',
    productId: '6ac7ff48ae010e336bdcdbdc',
    listingId: '6ac7ff49ae010e336bdcdbdd',
    newUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Safari Sevens Rugby Tournament - Weekend Stadium Pass',
    productId: '6ac7ff50ae010e336bdcdbe6',
    listingId: '6ac7ff51ae010e336bdcdbe7',
    newUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Solar PV System Consultation & Energy Audit',
    productId: '6ac7ff55ae010e336bdcdbee',
    listingId: '6ac7ff56ae010e336bdcdbef',
    newUrl: 'https://images.unsplash.com/photo-1613665813446-82a78c468a1d?auto=format&fit=crop&w=800&q=80'
  }
];

async function main() {
  console.log(`Starting targeted update of 8 approved image URLs...`);

  for (const item of updates) {
    console.log(`\nUpdating: ${item.title}`);
    const updatedProd = await prisma.product.update({
      where: { id: item.productId },
      data: { images: [item.newUrl] }
    });
    const updatedList = await prisma.marketplaceListings.update({
      where: { id: item.listingId },
      data: { images: [item.newUrl] }
    });
    console.log(`  Product ${updatedProd.id} image set to: ${updatedProd.images[0]}`);
    console.log(`  Listing ${updatedList.id} image set to: ${updatedList.images[0]}`);
  }

  console.log(`\nAll 8 approved image URLs successfully updated!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
