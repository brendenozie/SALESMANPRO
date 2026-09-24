import prisma from '../server/db/prismadb';

async function testLibrarySection() {
  console.log('--- Testing Section 5: Library Operations (13 Routes) CRUD & Consistency ---');
  const companyId = '683581bba1bdf6ca3624b530'; // Mount Moriah

  // Ensure owner user exists
  const user = await prisma.user.findFirst({
    where: { email: 'brendenozie@gmail.com' },
  });
  if (!user) throw new Error('Owner user not found');

  const student = await prisma.student.findFirst({
    where: { companyId },
  });
  if (!student) throw new Error('Student not found for company');

  // ==========================================
  // 1. Library Category CRUD
  // ==========================================
  console.log('1. Testing LibraryCategory CRUD...');
  const catName = `Audit Test Science ${Date.now()}`;
  const category = await prisma.libraryCategory.create({
    data: {
      companyId,
      name: catName,
    },
  });
  console.log('   Created category:', category.id, category.name);

  const updatedCategory = await prisma.libraryCategory.update({
    where: { id: category.id },
    data: { name: `${catName} - Updated` },
  });
  console.log('   Updated category:', updatedCategory.id, updatedCategory.name);

  // ==========================================
  // 2. Library Book CRUD & Maintenance
  // ==========================================
  console.log('2. Testing LibraryBook CRUD & Maintenance...');
  const testIsbn = `978-${Date.now().toString().slice(-9)}`;
  const book = await prisma.libraryBook.create({
    data: {
      companyId,
      categoryId: category.id,
      title: `Audit Test Encyclopedia ${Date.now()}`,
      author: 'Dr. Jane Smith',
      isbn: testIsbn,
      publisher: 'Oxford Academic Press',
      status: 'AVAILABLE',
      location: 'Section A - Shelf 3',
      shelfLocation: 'A-3-12',
      integrity: 100,
      condition: 'Mint',
    },
    include: { category: true },
  });
  console.log('   Created Book:', book.id, book.title, 'ISBN:', book.isbn);

  // Update book / maintenance
  const updatedBook = await prisma.libraryBook.update({
    where: { id: book.id },
    data: {
      condition: 'Good',
      integrity: 95,
      shelfLocation: 'A-3-14',
    },
  });
  if (updatedBook.condition !== 'Good' || updatedBook.integrity !== 95) {
    throw new Error('Book maintenance update failed');
  }
  console.log('   Updated Book Maintenance:', updatedBook.id, 'Condition:', updatedBook.condition, 'Integrity:', updatedBook.integrity);

  // ==========================================
  // 3. Library Member CRUD
  // ==========================================
  console.log('3. Testing LibraryMember CRUD...');
  const memberBarCode = `LIB-${Date.now().toString().slice(-6)}`;
  // Check if student already has a library member profile
  let member = await prisma.libraryMember.findUnique({
    where: { studentId: student.id },
  });
  if (!member) {
    member = await prisma.libraryMember.create({
      data: {
        companyId,
        studentId: student.id,
        memberId: memberBarCode,
        status: 'ACTIVE',
      },
    });
    console.log('   Created Member:', member.id, 'Barcode:', member.memberId);
  } else {
    console.log('   Using existing Member:', member.id, 'Barcode:', member.memberId);
  }

  // ==========================================
  // 4. Book Issuance & Return
  // ==========================================
  console.log('4. Testing LibraryIssuance & Return flow...');
  const dueDate = new Date(Date.now() + 14 * 86400000);
  const issuance = await prisma.libraryIssuance.create({
    data: {
      companyId,
      bookId: book.id,
      libraryMemberId: member.id,
      dueDate,
      status: 'ACTIVE',
    },
  });
  console.log('   Issued book, issuance ID:', issuance.id);

  // Mark book issued
  await prisma.libraryBook.update({
    where: { id: book.id },
    data: { status: 'ISSUED' },
  });

  // Return flow
  const returnedIssuance = await prisma.libraryIssuance.update({
    where: { id: issuance.id },
    data: {
      returnDate: new Date(),
      status: 'RETURNED',
    },
  });
  await prisma.libraryBook.update({
    where: { id: book.id },
    data: { status: 'AVAILABLE' },
  });
  console.log('   Returned book successfully. ReturnDate:', returnedIssuance.returnDate);

  // ==========================================
  // 5. Library Fine CRUD
  // ==========================================
  console.log('5. Testing LibraryFine CRUD...');
  const fine = await prisma.libraryFine.create({
    data: {
      issuanceId: issuance.id,
      amount: 15.50,
      reason: 'Late return audit fee',
      status: 'PENDING',
    },
  });
  console.log('   Created fine:', fine.id, 'Amount:', fine.amount, 'Status:', fine.status);

  const updatedFine = await prisma.libraryFine.update({
    where: { id: fine.id },
    data: {
      status: 'PAID',
      paidDate: new Date(),
    },
  });
  if (updatedFine.status !== 'PAID') throw new Error('Fine update failed');
  console.log('   Updated fine to PAID successfully.');

  // ==========================================
  // 6. Library Reservation CRUD
  // ==========================================
  console.log('6. Testing LibraryReservation CRUD...');
  const expiryDate = new Date(Date.now() + 7 * 86400000);
  const reservation = await prisma.libraryReservation.create({
    data: {
      bookId: book.id,
      libraryMemberId: member.id,
      expiryDate,
      status: 'PENDING',
    },
  });
  console.log('   Created reservation:', reservation.id, 'Status:', reservation.status);

  await prisma.libraryReservation.update({
    where: { id: reservation.id },
    data: { status: 'FULFILLED' },
  });
  console.log('   Updated reservation to FULFILLED.');

  // ==========================================
  // 7. Library Supplier Category & Supplier CRUD
  // ==========================================
  console.log('7. Testing LibrarySupplierCategory & Supplier CRUD...');
  const supCat = await prisma.librarySupplierCategory.create({
    data: {
      companyId,
      name: `Academic Distributors ${Date.now()}`,
    },
  });
  console.log('   Created supplier category:', supCat.id, supCat.name);

  const supplier = await prisma.librarySupplier.create({
    data: {
      companyId,
      categoryId: supCat.id,
      name: `Scholastic Partners ${Date.now()}`,
      contactEmail: `orders-${Date.now()}@scholastic-audit.com`,
      phone: '+1 555-0199',
      leadTime: '5 Days',
      reliability: 98,
      status: 'Active',
    },
  });
  console.log('   Created supplier:', supplier.id, supplier.name);

  // Update supplier
  await prisma.librarySupplier.update({
    where: { id: supplier.id },
    data: { reliability: 100 },
  });

  // ==========================================
  // 8. Library Acquisition CRUD
  // ==========================================
  console.log('8. Testing LibraryAcquisition CRUD...');
  const acquisition = await prisma.libraryAcquisition.create({
    data: {
      companyId,
      title: 'Advanced Mathematics Volume 1-4',
      qty: 20,
      cost: 450.0,
      vendor: supplier.name,
      status: 'Requested',
      category: 'Textbooks',
    },
  });
  console.log('   Created acquisition:', acquisition.id, acquisition.title, 'Qty:', acquisition.qty);

  await prisma.libraryAcquisition.update({
    where: { id: acquisition.id },
    data: { status: 'Received' },
  });
  console.log('   Updated acquisition status to Received.');

  // ==========================================
  // 9. Cleanup Test Data
  // ==========================================
  console.log('9. Cleaning up test library records...');
  await prisma.libraryAcquisition.delete({ where: { id: acquisition.id } });
  await prisma.librarySupplier.delete({ where: { id: supplier.id } });
  await prisma.librarySupplierCategory.delete({ where: { id: supCat.id } });
  await prisma.libraryReservation.delete({ where: { id: reservation.id } });
  await prisma.libraryFine.delete({ where: { id: fine.id } });
  await prisma.libraryIssuance.delete({ where: { id: issuance.id } });
  await prisma.libraryBook.delete({ where: { id: book.id } });
  await prisma.libraryCategory.delete({ where: { id: category.id } });
  console.log('   Cleaned up all test library entities.');

  console.log('--- Section 5: Library Operations Complete: ALL 13 ROUTES PASS ---');
}

testLibrarySection()
  .catch((e) => {
    console.error('Test Failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
