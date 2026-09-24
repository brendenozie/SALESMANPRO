import client from '../server/db/prismadb';

async function main() {
  const companyId = '683581bba1bdf6ca3624b530';
  const counts: Record<string, any> = {};
  const models = [
    'academicYear', 'term', 'academicLevel', 'classroom', 'educator', 'student', 'parent',
    'course', 'courseMaterial', 'classSchedule', 'courseAssignment', 'examCategory', 'exam',
    'grade', 'attendance', 'department', 'activity', 'activityType', 'schoolEvent',
    'announcement', 'libraryBook', 'libraryCategory', 'libraryMember', 'libraryIssuance',
    'transportVehicle', 'transportRoute', 'transportDriver', 'transportSchedule',
    'hostelBlock', 'hostelRoom', 'hostelResident', 'staffMember', 'staffDepartment',
    'staffRole', 'feeItem', 'feeStructure', 'expense', 'inventoryItem', 'asset'
  ];
  for (const m of models) {
    try {
      if ((client as any)[m]) {
        counts[m] = await (client as any)[m].count({ where: { companyId } });
      } else {
        counts[m] = 'NOT_ON_PRISMA';
      }
    } catch (err: any) {
      counts[m] = 'ERR: ' + err.message;
    }
  }
  console.log('---COUNTS---');
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
