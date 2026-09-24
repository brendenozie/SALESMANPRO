import prisma from '../server/db/prismadb';

async function testActivitiesSection() {
  console.log('--- Testing Activities & Early Learning CRUD ---');
  const companyId = '683581bba1bdf6ca3624b530'; // Mount Moriah

  // 1. Verify / ensure Activity Types exist
  let drawingType = await prisma.activityType.findFirst({
    where: { companyId, slug: 'drawing' }
  });

  if (!drawingType) {
    drawingType = await prisma.activityType.create({
      data: {
        companyId,
        name: 'Drawing',
        slug: 'drawing',
        description: 'Creative arts and drawing activities',
        icon: '🎨',
        color: '#3B82F6',
        ageMin: 3,
        ageMax: 10,
        isActive: true,
      }
    });
    console.log('Created Drawing ActivityType:', drawingType.id);
  } else {
    console.log('Found existing Drawing ActivityType:', drawingType.id);
  }

  // Ensure user for creation
  const user = await prisma.user.findFirst({
    where: { email: 'brendenozie@gmail.com' }
  });
  if (!user) throw new Error('Owner user not found');

  // 2. CREATE Activity
  const testTitle = `Audit Test Drawing ${Date.now()}`;
  const createdActivity = await prisma.activity.create({
    data: {
      companyId,
      activityTypeId: drawingType.id,
      title: testTitle,
      description: 'Audit Test Drawing Activity Description',
      instructions: 'Draw a bright sunny day',
      durationMins: 20,
      isPublished: true,
      createdById: user.id,
    }
  });
  console.log('1. Created Activity:', createdActivity.id, createdActivity.title);

  // 3. READ Activity
  const fetched = await prisma.activity.findFirst({
    where: { id: createdActivity.id, companyId },
    include: { activityType: true }
  });
  if (!fetched || fetched.title !== testTitle) {
    throw new Error('Failed to retrieve created activity');
  }
  console.log('2. Retrieved Activity successfully:', fetched.title, 'Type:', fetched.activityType.name);

  // 4. UPDATE Activity
  const updatedTitle = `${testTitle} - Updated`;
  const updated = await prisma.activity.update({
    where: { id: createdActivity.id },
    data: {
      title: updatedTitle,
      durationMins: 25,
      isPublished: false,
    }
  });
  if (updated.title !== updatedTitle || updated.durationMins !== 25 || updated.isPublished !== false) {
    throw new Error('Failed to update activity');
  }
  console.log('3. Updated Activity successfully:', updated.title, 'Published:', updated.isPublished);

  // 5. Query published activities (like play mode does)
  const publishedForPlay = await prisma.activity.findMany({
    where: {
      companyId,
      activityType: { slug: 'drawing' },
      isPublished: true,
    }
  });
  console.log('4. Play mode query test passed. Found count:', publishedForPlay.length);

  // 6. DELETE Activity
  await prisma.activity.delete({
    where: { id: createdActivity.id }
  });
  const deletedCheck = await prisma.activity.findUnique({
    where: { id: createdActivity.id }
  });
  if (deletedCheck) {
    throw new Error('Activity still exists after delete');
  }
  console.log('5. Deleted Activity successfully.');
  console.log('--- Section 3: Activities & Early Learning Verification Complete: ALL PASS ---');
}

testActivitiesSection()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
