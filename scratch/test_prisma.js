const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const mediaAssetModel = Prisma.dmmf.datamodel.models.find(m => m.name === 'MediaAsset');
    console.log('MediaAsset model fields:', mediaAssetModel.fields.map(f => ({ name: f.name, type: f.type, required: f.isRequired })));
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

run();
