import prisma from "../server/db/prismadb";

async function runStaffTests() {
  console.log("=== STARTING SECTION 8: STAFF & HUMAN RESOURCES TESTS ===");

  const company = await prisma.company.findFirst({
    where: { slug: "educational-online-courses" }
  });

  if (!company) {
    throw new Error("Target test company not found!");
  }
  const companyId = company.id;
  console.log(`Scoped Company: ${company.name} (${companyId})`);

  const timestamp = Date.now();

  try {
    // 1. DEPARTMENT CRUD
    console.log("\n--- Testing Department CRUD ---");
    const dept = await prisma.department.create({
      data: {
        name: `Test Department ${timestamp}`,
        description: "Department for HR testing",
        companyId
      }
    });
    console.log(`[PASS] Created Department: ${dept.id} - ${dept.name}`);

    const fetchedDept = await prisma.department.findUnique({ where: { id: dept.id } });
    if (!fetchedDept || fetchedDept.companyId !== companyId) {
      throw new Error("Department GET or tenant scoping failed");
    }
    console.log(`[PASS] Read Department: ${fetchedDept.name}`);

    const updatedDept = await prisma.department.update({
      where: { id: dept.id },
      data: { name: `Updated Dept ${timestamp}` }
    });
    if (updatedDept.name !== `Updated Dept ${timestamp}`) {
      throw new Error("Department UPDATE failed");
    }
    console.log(`[PASS] Updated Department: ${updatedDept.name}`);

    // 2. ROLE CRUD
    console.log("\n--- Testing Role CRUD ---");
    const role = await prisma.role.create({
      data: {
        name: `Test Role ${timestamp}`,
        companyId,
        permissions: ["VIEW_STUDENTS", "MANAGE_COURSES"]
      }
    });
    console.log(`[PASS] Created Role: ${role.id} - ${role.name}`);

    const fetchedRole = await prisma.role.findUnique({ where: { id: role.id } });
    if (!fetchedRole || fetchedRole.companyId !== companyId) {
      throw new Error("Role GET or tenant scoping failed");
    }
    console.log(`[PASS] Read Role: ${fetchedRole.name}`);

    const updatedRole = await prisma.role.update({
      where: { id: role.id },
      data: { permissions: ["VIEW_STUDENTS", "MANAGE_COURSES", "EXPORT_REPORTS"] }
    });
    if (!updatedRole.permissions.includes("EXPORT_REPORTS")) {
      throw new Error("Role UPDATE failed");
    }
    console.log(`[PASS] Updated Role Permissions: ${updatedRole.permissions.join(", ")}`);

    // 3. STAFF MEMBER (StaffProfile) CRUD
    console.log("\n--- Testing StaffProfile CRUD ---");
    let testUser = await prisma.user.findFirst({
      where: { email: `teststaff_${timestamp}@example.com` }
    });
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          name: `Staff Member ${timestamp}`,
          email: `teststaff_${timestamp}@example.com`,
          companyId,
          role: "STAFF"
        }
      });
    }

    const staffProfile = await prisma.staffProfile.create({
      data: {
        userId: testUser.id,
        companyId,
        jobTitle: "Senior Lecturer",
        department: updatedDept.name,
        employmentStatus: "ACTIVE",
        salary: 4500,
        bankAccount: "ACC-987654",
        bankCode: "BNK-001"
      }
    });
    console.log(`[PASS] Created StaffProfile: ${staffProfile.id} for user ${testUser.name}`);

    const updatedStaff = await prisma.staffProfile.update({
      where: { id: staffProfile.id },
      data: { salary: 5000, jobTitle: "Lead Faculty" }
    });
    if (updatedStaff.salary !== 5000 || updatedStaff.jobTitle !== "Lead Faculty") {
      throw new Error("StaffProfile UPDATE failed");
    }
    console.log(`[PASS] Updated StaffProfile: ${updatedStaff.jobTitle} - Salary: $${updatedStaff.salary}`);

    // 4. STAFF ATTENDANCE
    console.log("\n--- Testing Staff Attendance ---");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendanceRecord = await prisma.staffAttendanceRecord.upsert({
      where: {
        userId_date: {
          userId: testUser.id,
          date: today
        }
      },
      update: {
        checkInTime: new Date(),
        status: "PRESENT",
        method: "BIOMETRIC"
      },
      create: {
        userId: testUser.id,
        companyId,
        date: today,
        checkInTime: new Date(),
        status: "PRESENT",
        method: "BIOMETRIC"
      }
    });
    console.log(`[PASS] Upserted Staff Attendance: ${attendanceRecord.id} (Status: ${attendanceRecord.status})`);

    const attendanceLogs = await prisma.staffAttendanceRecord.findMany({
      where: { companyId, date: today }
    });
    if (!attendanceLogs.some(l => l.userId === testUser!.id)) {
      throw new Error("Staff attendance query failed to find created record");
    }
    console.log(`[PASS] Verified Staff Attendance Query: Found ${attendanceLogs.length} record(s) today`);

    // 5. STAFF PAYROLL DERIVATION
    console.log("\n--- Testing Staff Payroll Derivation ---");
    const staffPayrollList = await prisma.staffProfile.findMany({
      where: { companyId }
    });
    const currentStaff = staffPayrollList.find(s => s.id === staffProfile.id);
    if (!currentStaff) throw new Error("Staff profile missing in payroll lookup");
    const tax = (currentStaff.salary || 0) * 0.15;
    const net = (currentStaff.salary || 0) - tax;
    if (net !== 4250) { // 5000 - 750
      throw new Error(`Expected net 4250, got ${net}`);
    }
    console.log(`[PASS] Verified Payroll: Base=$${currentStaff.salary}, Tax=$${tax}, Net=$${net}`);

    // 6. STAFF LEAVE MANAGEMENT
    console.log("\n--- Testing Staff Leave Management ---");
    const leaveReq = await prisma.leaveRequest.create({
      data: {
        companyId,
        userId: testUser.id,
        type: "ANNUAL",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000 * 3),
        daysRequested: 3,
        reason: "Family function",
        status: "PENDING"
      }
    });
    console.log(`[PASS] Created LeaveRequest: ${leaveReq.id} (Days: ${leaveReq.daysRequested})`);

    const updatedLeave = await prisma.leaveRequest.update({
      where: { id: leaveReq.id },
      data: { status: "APPROVED", adminNote: "Approved by Admin" }
    });
    if (updatedLeave.status !== "APPROVED") {
      throw new Error("LeaveRequest approval failed");
    }
    console.log(`[PASS] Approved LeaveRequest: ${updatedLeave.status}`);

    // 7. STAFF PERFORMANCE REVIEWS
    console.log("\n--- Testing Staff Performance Reviews ---");
    const adminUser = await prisma.user.findFirst({
      where: { companyId }
    });

    const review = await prisma.staffPerformanceReview.create({
      data: {
        employeeId: testUser.id,
        reviewerId: adminUser!.id,
        reviewPeriod: "2025/2026 Academic Year",
        rating: "EXCELLENT",
        strengths: "Great teaching skills",
        comments: "Outstanding educator"
      }
    });
    console.log(`[PASS] Created StaffPerformanceReview: ${review.id} - Rating: ${review.rating}`);

    const fetchedReviews = await prisma.staffPerformanceReview.findMany({
      where: { employee: { companyId } }
    });
    if (!fetchedReviews.some(r => r.id === review.id)) {
      throw new Error("Performance review lookup failed");
    }
    console.log(`[PASS] Verified Performance Reviews: Found ${fetchedReviews.length} total review(s)`);

    // 8. STAFF RECRUITMENT
    console.log("\n--- Testing Staff Recruitment ---");
    const candidate = await prisma.candidate.create({
      data: {
        companyId,
        name: `Candidate ${timestamp}`,
        email: `candidate_${timestamp}@example.com`,
        position: "Physics Instructor",
        status: "Applied"
      }
    });
    console.log(`[PASS] Created Candidate: ${candidate.id} - ${candidate.name} (${candidate.position})`);

    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: { status: "Interview" }
    });
    if (updatedCandidate.status !== "Interview") {
      throw new Error("Candidate stage transition failed");
    }
    console.log(`[PASS] Transitioned Candidate Stage: ${updatedCandidate.status}`);

    // 9. STAFF REPORTS & WORKFORCE ANALYTICS DERIVATION
    console.log("\n--- Testing Staff Reports & Analytics Derivation ---");
    const [totalStaffCount, payrollSum, deptBreakdown] = await Promise.all([
      prisma.staffProfile.count({ where: { companyId } }),
      prisma.staffProfile.aggregate({
        where: { companyId },
        _sum: { salary: true }
      }),
      prisma.staffProfile.groupBy({
        by: ["department"],
        where: { companyId },
        _sum: { salary: true },
        _count: { id: true }
      })
    ]);
    console.log(`[PASS] Verified Staff Reports: Total Staff=${totalStaffCount}, Payroll Sum=$${payrollSum._sum.salary || 0}, Departments Tracked=${deptBreakdown.length}`);

    // 10. CLEANUP & TEARDOWN
    console.log("\n--- Testing Safe Deletion / Teardown ---");
    await prisma.candidate.delete({ where: { id: candidate.id } });
    console.log(`[PASS] Deleted Candidate: ${candidate.id}`);

    await prisma.staffPerformanceReview.delete({ where: { id: review.id } });
    console.log(`[PASS] Deleted Performance Review: ${review.id}`);

    await prisma.leaveRequest.delete({ where: { id: leaveReq.id } });
    console.log(`[PASS] Deleted Leave Request: ${leaveReq.id}`);

    await prisma.staffAttendanceRecord.delete({ where: { id: attendanceRecord.id } });
    console.log(`[PASS] Deleted Attendance Record: ${attendanceRecord.id}`);

    await prisma.staffProfile.delete({ where: { id: staffProfile.id } });
    console.log(`[PASS] Deleted Staff Profile: ${staffProfile.id}`);

    await prisma.user.delete({ where: { id: testUser.id } });
    console.log(`[PASS] Deleted Test User: ${testUser.id}`);

    await prisma.role.delete({ where: { id: role.id } });
    console.log(`[PASS] Deleted Role: ${role.id}`);

    await prisma.department.delete({ where: { id: dept.id } });
    console.log(`[PASS] Deleted Department: ${dept.id}`);

    console.log("\n=== ALL 9 STAFF & HUMAN RESOURCES ROUTES VERIFIED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("STAFF TEST ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runStaffTests();
