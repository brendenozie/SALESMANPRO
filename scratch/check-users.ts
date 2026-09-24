import client from '../server/db/prismadb';

async function main() {
  const company = await client.company.findUnique({
    where: { id: '683581bba1bdf6ca3624b530' },
    select: { id: true, name: true, slug: true, userId: true, user: { select: { id: true, email: true, role: true } } }
  });
  console.log('Company owner:', JSON.stringify(company, null, 2));

  const educators = await client.educator.findMany({
    where: { companyId: '683581bba1bdf6ca3624b530' },
    include: { user: { select: { id: true, email: true, role: true, name: true } } },
    take: 3
  });
  console.log('Educators count:', educators.length);
  if (educators.length > 0) {
    console.log('Sample educator:', JSON.stringify(educators[0], null, 2));
  }

  const students = await client.student.findMany({
    where: { companyId: '683581bba1bdf6ca3624b530' },
    include: { user: { select: { id: true, email: true, role: true, name: true } } },
    take: 3
  });
  console.log('Students count:', students.length);
  if (students.length > 0) {
    console.log('Sample student:', JSON.stringify(students[0], null, 2));
  }

  const superAdmins = await client.user.findMany({
    where: { role: { in: ['SUPER_ADMIN', 'ADMIN', 'admin'] } },
    select: { id: true, email: true, role: true, companyId: true },
    take: 5
  });
  console.log('Admins:', JSON.stringify(superAdmins, null, 2));
}

main().catch(console.error).finally(() => process.exit(0));
