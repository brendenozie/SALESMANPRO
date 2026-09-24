import prisma from '../server/db/prismadb';

const COMPANY_ID = '683581bba1bdf6ca3624b530';

async function run() {
  console.log('=== VERIFYING SECTION 1: ACADEMIC CORE WORKFLOWS ===');
  const testSuffix = `Audit_${Date.now()}`;

  // Clean any previous test artifacts with Audit_
  await prisma.term.deleteMany({ where: { name: { contains: 'Audit_' } } });
  await prisma.academicYear.deleteMany({ where: { name: { contains: 'Audit_' } } });
  await prisma.department.deleteMany({ where: { name: { contains: 'Audit_' } } });

  // 1. Academic Year CRUD
  console.log('\n[1] Testing Academic Year...');
  const newYear = await prisma.academicYear.create({
    data: {
      name: `Year ${testSuffix}`,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2027-06-30'),
      companyId: COMPANY_ID,
      isActive: false,
    },
  });
  console.log('  -> Created year:', newYear.id, newYear.name);

  const updatedYear = await prisma.academicYear.update({
    where: { id: newYear.id },
    data: { name: `Year ${testSuffix} Updated` },
  });
  console.log('  -> Updated year name:', updatedYear.name);

  // 2. Academic Term CRUD
  console.log('\n[2] Testing Academic Term...');
  const newTerm = await prisma.term.create({
    data: {
      name: `Term 1 ${testSuffix}`,
      termNumber: 1,
      startDate: new Date('2026-09-01'),
      endDate: new Date('2026-12-15'),
      academicYearId: newYear.id,
      companyId: COMPANY_ID,
      isActive: false,
    },
  });
  console.log('  -> Created term:', newTerm.id, newTerm.name);

  const updatedTerm = await prisma.term.update({
    where: { id: newTerm.id },
    data: { name: `Term 1 ${testSuffix} Updated` },
  });
  console.log('  -> Updated term name:', updatedTerm.name);

  // 3. Department CRUD
  console.log('\n[3] Testing Department...');
  const newDept = await prisma.department.create({
    data: {
      name: `Dept ${testSuffix}`,
      description: 'Department for testing',
      companyId: COMPANY_ID,
    },
  });
  console.log('  -> Created dept:', newDept.id, newDept.name);

  const updatedDept = await prisma.department.update({
    where: { id: newDept.id },
    data: { description: 'Updated description' },
  });
  console.log('  -> Updated dept:', updatedDept.description);

  // 4. Academic Level CRUD
  console.log('\n[4] Testing Academic Level...');
  const newLevel = await prisma.academicLevel.create({
    data: {
      name: `Level ${testSuffix}`,
      sortOrder: 99,
      companyId: COMPANY_ID,
    },
  });
  console.log('  -> Created level:', newLevel.id, newLevel.name);

  const updatedLevel = await prisma.academicLevel.update({
    where: { id: newLevel.id },
    data: { name: `Level ${testSuffix} Updated` },
  });
  console.log('  -> Updated level:', updatedLevel.name);

  // 5. Classroom CRUD
  console.log('\n[5] Testing Classroom with Academic Level Relation...');
  const newRoom = await prisma.classroom.create({
    data: {
      name: `Room ${testSuffix}`,
      capacity: 35,
      academicLevelId: newLevel.id,
      companyId: COMPANY_ID,
    },
  });
  console.log('  -> Created room:', newRoom.id, newRoom.name, 'Level:', newRoom.academicLevelId);

  const updatedRoom = await prisma.classroom.update({
    where: { id: newRoom.id },
    data: { capacity: 40 },
  });
  console.log('  -> Updated room capacity:', updatedRoom.capacity);

  // 6. Course CRUD
  console.log('\n[6] Testing Course with Department and Level relation...');
  const newCourse = await prisma.course.create({
    data: {
      title: `Course ${testSuffix}`,
      code: `CRS_${Date.now()}`,
      companyId: COMPANY_ID,
      departmentId: newDept.id,
    },
  });
  console.log('  -> Created course:', newCourse.id, newCourse.title);

  // Join level to course
  const levelJoin = await prisma.courseAcademicLevel.create({
    data: {
      courseId: newCourse.id,
      academicLevelId: newLevel.id,
    },
  });
  console.log('  -> Linked course to level:', levelJoin.id);

  // 7. Cleanup test records safely in reverse order
  console.log('\n[7] Cleaning up test records...');
  await prisma.courseAcademicLevel.delete({ where: { id: levelJoin.id } });
  await prisma.course.delete({ where: { id: newCourse.id } });
  await prisma.classroom.delete({ where: { id: newRoom.id } });
  await prisma.academicLevel.delete({ where: { id: newLevel.id } });
  await prisma.department.delete({ where: { id: newDept.id } });
  await prisma.term.delete({ where: { id: newTerm.id } });
  await prisma.academicYear.delete({ where: { id: newYear.id } });
  console.log('  -> All test records verified and cleaned up successfully.');

  console.log('\n=== SECTION 1 VERIFICATION PASS ===');
}

run()
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
