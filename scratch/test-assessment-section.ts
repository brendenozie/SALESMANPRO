import prisma from '../server/db/prismadb';

const COMPANY_ID = '683581bba1bdf6ca3624b530';

async function run() {
  console.log('=== VERIFYING SECTION 2: ASSIGNMENTS, EXAMS & GRADING ===');
  const testSuffix = `Audit_${Date.now()}`;

  // Clean any previous test artifacts
  await prisma.exam.deleteMany({ where: { title: { contains: 'Audit_' } } });
  await prisma.examCategory.deleteMany({ where: { name: { contains: 'Audit_' } } });

  // Get active or first academic year, term, course, educator, classroom, student
  const [year, course, educator, classroom, student] = await Promise.all([
    prisma.academicYear.findFirst({ where: { companyId: COMPANY_ID } }),
    prisma.course.findFirst({ where: { companyId: COMPANY_ID } }),
    prisma.educator.findFirst({ where: { companyId: COMPANY_ID } }),
    prisma.classroom.findFirst({ where: { companyId: COMPANY_ID } }),
    prisma.student.findFirst({ where: { companyId: COMPANY_ID } }),
  ]);

  if (!course || !educator || !student) {
    throw new Error('Prerequisite seed data missing (course, educator, or student).');
  }

  const term = await prisma.term.findFirst({
    where: { companyId: COMPANY_ID, ...(year ? { academicYearId: year.id } : {}) },
  });

  // 1. Exam Category CRUD
  console.log('\n[1] Testing Exam Category CRUD...');
  const newCat = await prisma.examCategory.create({
    data: {
      name: `Cat ${testSuffix}`,
      description: 'Test category description',
      companyId: COMPANY_ID,
    },
  });
  console.log('  -> Created category:', newCat.id, newCat.name);

  const updatedCat = await prisma.examCategory.update({
    where: { id: newCat.id },
    data: { description: 'Updated test category description' },
  });
  console.log('  -> Updated category:', updatedCat.id, updatedCat.description);

  // 2. Exam CRUD
  console.log('\n[2] Testing Exam CRUD...');
  const newExam = await prisma.exam.create({
    data: {
      title: `Exam ${testSuffix}`,
      description: 'Midterm test',
      courseId: course.id,
      createdByEducatorId: educator.id,
      examCategoryId: newCat.id,
      classroomId: classroom?.id,
      date: new Date('2026-10-15'),
      type: 'MIDTERM',
      totalPoints: 100,
      isPublished: true,
      companyId: COMPANY_ID,
      academicYearId: year?.id,
      termId: term?.id,
    },
  });
  console.log('  -> Created exam:', newExam.id, newExam.title);

  const updatedExam = await prisma.exam.update({
    where: { id: newExam.id },
    data: { totalPoints: 120 },
  });
  console.log('  -> Updated exam points:', updatedExam.totalPoints);

  // 3. Course Assignment CRUD
  console.log('\n[3] Testing Course Assignment CRUD...');
  const newAssignment = await prisma.courseAssignment.create({
    data: {
      title: `Assignment ${testSuffix}`,
      description: 'Homework assignment test',
      courseId: course.id,
      createdById: educator.id,
      dueDate: new Date('2026-10-20'),
      maxGrade: 50,
      companyId: COMPANY_ID,
      academicYearId: year?.id,
      termId: term?.id,
    },
  });
  console.log('  -> Created assignment:', newAssignment.id, newAssignment.title);

  const updatedAssignment = await prisma.courseAssignment.update({
    where: { id: newAssignment.id },
    data: { maxGrade: 60 },
  });
  console.log('  -> Updated assignment maxGrade:', updatedAssignment.maxGrade);

  // 4. Exam Submission / Results & Grade Entry
  console.log('\n[4] Testing Results (Exam Submission) & Grade Entry...');
  const newSubmission = await prisma.examSubmission.create({
    data: {
      examId: newExam.id,
      studentId: student.id,
      score: 95,
      submittedAt: new Date(),
    },
  });
  console.log('  -> Created exam submission for student:', newSubmission.id, 'Score:', newSubmission.score);

  const newGrade = await prisma.grade.create({
    data: {
      studentId: student.id,
      courseId: course.id,
      companyId: COMPANY_ID,
      academicYearId: year?.id,
      termId: term?.id,
      score: 95,
      comments: 'Excellent performance in assessment audit.',
    },
  });
  console.log('  -> Created grade record:', newGrade.id, 'Score:', newGrade.score);

  // 5. Verification of Report Card Data Calculation
  console.log('\n[5] Verifying Report Card derivation...');
  const derivedGrades = await prisma.grade.findMany({
    where: { studentId: student.id, companyId: COMPANY_ID },
  });
  console.log('  -> Student total grade records found in DB:', derivedGrades.length);

  // 6. Safe Cleanup of Section 2 Test Records
  console.log('\n[6] Cleaning up test records...');
  await prisma.grade.delete({ where: { id: newGrade.id } });
  await prisma.examSubmission.delete({ where: { id: newSubmission.id } });
  await prisma.courseAssignment.delete({ where: { id: newAssignment.id } });
  await prisma.exam.delete({ where: { id: newExam.id } });
  await prisma.examCategory.delete({ where: { id: newCat.id } });
  console.log('  -> All Section 2 test records cleaned up successfully.');

  console.log('\n=== SECTION 2 VERIFICATION PASS ===');
}

run()
  .catch((err) => {
    console.error('Test run failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
