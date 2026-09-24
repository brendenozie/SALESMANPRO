import prisma from "../server/db/prismadb";

const COMPANY_ID = "683581bba1bdf6ca3624b530"; // Mount Moriah International School

async function runSettingsSectionTests() {
  console.log("=== STARTING SECTION 11: REPORTS, GALLERY & SYSTEM SETTINGS TEST ===");
  const testRunId = `TEST-SET-${Date.now()}`;

  let testGalleryId: string | null = null;
  let originalCompanyPhone: string | null = null;

  try {
    // -------------------------------------------------------------
    // 1. School Reports Authoritative Metrics Live Derivation
    // -------------------------------------------------------------
    console.log("\n[1] Testing School Reports Authoritative Aggregations...");
    const [studentsCount, educatorsCount, coursesCount, gradesCount, attendanceCount] = await Promise.all([
      prisma.student.count({ where: { companyId: COMPANY_ID } }),
      prisma.educator.count({ where: { companyId: COMPANY_ID } }),
      prisma.course.count({ where: { companyId: COMPANY_ID } }),
      prisma.grade.count({ where: { companyId: COMPANY_ID } }),
      prisma.attendanceRecord.count({ where: { companyId: COMPANY_ID } }),
    ]);

    console.log(`✓ Live Executive Reports Metrics:`);
    console.log(`   Total Students:    ${studentsCount}`);
    console.log(`   Total Educators:   ${educatorsCount}`);
    console.log(`   Academic Courses:  ${coursesCount}`);
    console.log(`   Grade Submissions: ${gradesCount}`);
    console.log(`   Attendance Events: ${attendanceCount}`);

    // Verify student performance distribution
    const sampleGrades = await prisma.grade.findMany({
      where: { companyId: COMPANY_ID },
      take: 10,
    });
    console.log(`✓ Sample grade records retrieved: ${sampleGrades.length}`);

    // -------------------------------------------------------------
    // 2. Photo Albums & Gallery CRUD (app/admin/[slug]/gallery)
    // -------------------------------------------------------------
    console.log("\n[2] Testing Gallery Album & Media Items CRUD...");
    const galleryTitle = `Annual Sports Gala ${testRunId}`;
    const gallery = await prisma.gallery.create({
      data: {
        companyId: COMPANY_ID,
        title: galleryTitle,
        description: "Official photo archive for inter-house athletic competition",
        type: "events",
        isFeatured: true,
        items: {
          create: [
            {
              imageUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018",
              caption: "Track sprint finals",
              altText: "Students running 100m sprint",
              order: 1,
              featured: true,
            },
            {
              imageUrl: "https://images.unsplash.com/photo-1526676037777-05a232554f77",
              caption: "Trophy award ceremony",
              altText: "Head teacher awarding gold cup",
              order: 2,
              featured: false,
            },
          ],
        },
      },
      include: { items: true },
    });
    testGalleryId = gallery.id;
    console.log(`✓ Gallery Created: "${gallery.title}" with ${gallery.items.length} media items - ID: ${gallery.id}`);

    // Verify Read
    const readGallery = await prisma.gallery.findUnique({
      where: { id: testGalleryId },
      include: { items: true },
    });
    if (!readGallery || readGallery.items.length !== 2) {
      throw new Error("Gallery read with items verification failed");
    }
    console.log("✓ Gallery Read with nested items verified");

    // Update Gallery
    const updatedGallery = await prisma.gallery.update({
      where: { id: testGalleryId },
      data: {
        title: `Annual Sports & Track Gala ${testRunId}`,
        description: "Updated description with victory ceremony photos",
      },
      include: { items: true },
    });
    if (updatedGallery.title !== `Annual Sports & Track Gala ${testRunId}`) {
      throw new Error("Gallery update verification failed");
    }
    console.log(`✓ Gallery Updated: "${updatedGallery.title}"`);

    // -------------------------------------------------------------
    // 3. System & Company Settings (app/admin/[slug]/settings)
    // -------------------------------------------------------------
    console.log("\n[3] Testing Company & School Settings Persistence...");
    const company = await prisma.company.findUnique({
      where: { id: COMPANY_ID },
    });
    if (!company) throw new Error("Target school company not found");
    originalCompanyPhone = company.contactPhone || null;

    const testPhoneNumber = `+1-555-${Date.now().toString().slice(-4)}`;
    const updatedCompany = await prisma.company.update({
      where: { id: COMPANY_ID },
      data: {
        contactPhone: testPhoneNumber,
      },
    });

    if (updatedCompany.contactPhone !== testPhoneNumber) {
      throw new Error("Company phone setting update failed");
    }
    console.log(`✓ School Settings Updated: Contact phone set to ${updatedCompany.contactPhone}`);

    // Restore original phone
    await prisma.company.update({
      where: { id: COMPANY_ID },
      data: { contactPhone: originalCompanyPhone },
    });
    console.log(`✓ School Settings Restored: Original phone restored`);

    // -------------------------------------------------------------
    // 4. Cleanup Gallery
    // -------------------------------------------------------------
    console.log("\n[4] Verifying Gallery Deletion Lifecycle...");
    await prisma.galleryItem.deleteMany({ where: { galleryId: testGalleryId } });
    await prisma.gallery.delete({ where: { id: testGalleryId } });
    const verifyGallery = await prisma.gallery.findUnique({ where: { id: testGalleryId } });
    if (verifyGallery) throw new Error("Gallery deletion verification failed");
    testGalleryId = null;
    console.log("✓ Gallery & gallery items deleted and absent from DB");

    console.log("\n============================================================");
    console.log("🎉 ALL SECTION 11 (REPORTS, GALLERY & SETTINGS) TESTS PASSED!");
    console.log("============================================================");
  } catch (error) {
    console.error("\n❌ Section 11 Test Failed:", error);

    if (testGalleryId) {
      await prisma.galleryItem.deleteMany({ where: { galleryId: testGalleryId } }).catch(() => {});
      await prisma.gallery.delete({ where: { id: testGalleryId } }).catch(() => {});
    }
    if (originalCompanyPhone !== null) {
      await prisma.company.update({
        where: { id: COMPANY_ID },
        data: { contactPhone: originalCompanyPhone },
      }).catch(() => {});
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runSettingsSectionTests();
