const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const withVideos = await prisma.marketplaceListings.findMany({
    where: {
      videos: {
        isEmpty: false
      }
    },
    take: 5,
    select: {
      id: true,
      name: true,
      videos: true,
      images: true,
    }
  });
  console.log('Listings with videos count (sampled):', withVideos.length);
  if (withVideos.length > 0) {
    console.log('Sample video structure:', JSON.stringify(withVideos, null, 2));
  } else {
    console.log('No listings with non-empty videos array found in database currently.');
  }

  // Also check Video model count
  try {
    const videoCount = await prisma.video.count();
    console.log('Total Video model records:', videoCount);
    if (videoCount > 0) {
      const sampleVideos = await prisma.video.findMany({
        take: 3,
        include: {
          mediaAsset: true,
          album: true,
        }
      });
      console.log('Sample Video model:', JSON.stringify(sampleVideos, null, 2));
    }
  } catch (err) {
    console.log('Error querying Video model:', err.message);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
