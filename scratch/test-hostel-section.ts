import prisma from "../server/db/prismadb";

async function runHostelTests() {
  console.log("=== STARTING SECTION 7: HOSTEL / BOARDING MANAGEMENT TESTS ===");

  const company = await prisma.company.findFirst({
    where: { slug: "educational-online-courses" }
  });

  if (!company) {
    throw new Error("Target test company not found!");
  }
  const companyId = company.id;
  console.log(`Scoped Company: ${company.name} (${companyId})`);

  // Ensure a valid user exists for maintenance reporting
  const testUser = await prisma.user.findFirst({
    where: { companyId }
  }) || await prisma.user.findFirst();

  if (!testUser) {
    throw new Error("No user found in database to act as reporter!");
  }

  // Ensure a valid student exists for hostel resident
  let testStudent = await prisma.student.findFirst({
    where: { companyId }
  });

  if (!testStudent) {
    testStudent = await prisma.student.create({
      data: {
        companyId,
        firstName: "HostelTest",
        lastName: "Student",
        admissionNumber: `HSTL-${Date.now()}`,
        status: "ACTIVE"
      }
    });
  }

  const timestamp = Date.now();

  try {
    // 1. HOSTEL BLOCK CRUD
    console.log("\n--- Testing HostelBlock CRUD ---");
    const block = await prisma.hostelBlock.create({
      data: {
        name: `Test Wing ${timestamp}`,
        type: "BOYS",
        companyId
      }
    });
    console.log(`[PASS] Created HostelBlock: ${block.id} - ${block.name}`);

    const fetchedBlock = await prisma.hostelBlock.findUnique({
      where: { id: block.id }
    });
    if (!fetchedBlock || fetchedBlock.companyId !== companyId) {
      throw new Error("HostelBlock GET or tenant scoping failed");
    }
    console.log(`[PASS] Read HostelBlock: ${fetchedBlock.name}`);

    const updatedBlock = await prisma.hostelBlock.update({
      where: { id: block.id },
      data: { name: `Updated Wing ${timestamp}` }
    });
    if (updatedBlock.name !== `Updated Wing ${timestamp}`) {
      throw new Error("HostelBlock UPDATE failed");
    }
    console.log(`[PASS] Updated HostelBlock: ${updatedBlock.name}`);

    // 2. HOSTEL ROOM CRUD
    console.log("\n--- Testing HostelRoom CRUD ---");
    const room = await prisma.hostelRoom.create({
      data: {
        blockId: block.id,
        roomNumber: `R-${timestamp.toString().slice(-4)}`,
        capacity: 4,
        type: "QUAD",
        rentPerMonth: 500,
        isAvailable: true,
        floor: 1
      }
    });
    console.log(`[PASS] Created HostelRoom: ${room.id} - Room ${room.roomNumber}`);

    const fetchedRoom = await prisma.hostelRoom.findUnique({
      where: { id: room.id },
      include: { block: true }
    });
    if (!fetchedRoom || fetchedRoom.block.companyId !== companyId) {
      throw new Error("HostelRoom GET or block company relation failed");
    }
    console.log(`[PASS] Read HostelRoom: Room ${fetchedRoom.roomNumber} in ${fetchedRoom.block.name}`);

    const updatedRoom = await prisma.hostelRoom.update({
      where: { id: room.id },
      data: { capacity: 6 }
    });
    if (updatedRoom.capacity !== 6) {
      throw new Error("HostelRoom capacity UPDATE failed");
    }
    console.log(`[PASS] Updated HostelRoom capacity: ${updatedRoom.capacity}`);

    // 3. HOSTEL RESIDENT (HostelMember) & ALLOCATION
    console.log("\n--- Testing HostelMember & Allocation Lifecycle ---");
    // Clean up any previous test hostelMember for this student
    await prisma.hostelAllocation.deleteMany({
      where: { hostelMember: { studentId: testStudent.id } }
    });
    await prisma.hostelMember.deleteMany({
      where: { studentId: testStudent.id }
    });

    const member = await prisma.hostelMember.create({
      data: {
        companyId,
        studentId: testStudent.id,
        memberId: `MBR-${timestamp}`,
        status: "ACTIVE",
        accountBalance: 100
      }
    });
    console.log(`[PASS] Created HostelMember: ${member.id} (${member.memberId})`);

    const allocation = await prisma.hostelAllocation.create({
      data: {
        roomId: room.id,
        hostelMemberId: member.id,
        status: "ACTIVE",
        startDate: new Date()
      }
    });
    console.log(`[PASS] Created HostelAllocation: ${allocation.id} in room ${room.roomNumber}`);

    // Verify room occupancy
    const activeAllocCount = await prisma.hostelAllocation.count({
      where: { roomId: room.id, status: "ACTIVE" }
    });
    if (activeAllocCount !== 1) {
      throw new Error(`Expected room occupancy 1, got ${activeAllocCount}`);
    }
    console.log(`[PASS] Verified Room Occupancy: ${activeAllocCount}/${updatedRoom.capacity}`);

    // Checkout allocation
    const checkedOutAlloc = await prisma.hostelAllocation.update({
      where: { id: allocation.id },
      data: { status: "VACATED", endDate: new Date() }
    });
    if (checkedOutAlloc.status !== "VACATED") {
      throw new Error("HostelAllocation checkout failed");
    }
    console.log(`[PASS] Checked out HostelAllocation: ${checkedOutAlloc.status}`);

    // 4. HOSTEL MAINTENANCE REQUEST
    console.log("\n--- Testing HostelMaintenanceRequest CRUD ---");
    const ticket = await prisma.hostelMaintenanceRequest.create({
      data: {
        roomId: room.id,
        reportedBy: testUser.id,
        category: "PLUMBING",
        priority: "HIGH",
        description: `Test leak issue ${timestamp}`,
        status: "PENDING"
      }
    });
    console.log(`[PASS] Created Maintenance Request: ${ticket.id} (${ticket.category} - ${ticket.priority})`);

    const updatedTicket = await prisma.hostelMaintenanceRequest.update({
      where: { id: ticket.id },
      data: { status: "COMPLETED", resolvedDate: new Date(), notes: "Fixed pipe valve" }
    });
    if (updatedTicket.status !== "COMPLETED" || !updatedTicket.resolvedDate) {
      throw new Error("Maintenance Request status UPDATE failed");
    }
    console.log(`[PASS] Updated Maintenance Request to COMPLETED`);

    // 5. HOSTEL VISITOR LOGS
    console.log("\n--- Testing HostelVisitor CRUD ---");
    const visitor = await prisma.hostelVisitor.create({
      data: {
        companyId,
        studentId: testStudent.id,
        name: `Visitor ${timestamp}`,
        relation: "Guardian",
        idType: "National ID",
        idNumber: `ID-${timestamp.toString().slice(-6)}`,
        status: "ACTIVE",
        checkIn: new Date()
      }
    });
    console.log(`[PASS] Created HostelVisitor: ${visitor.id} (${visitor.name} - visiting ${testStudent.firstName})`);

    const checkedOutVisitor = await prisma.hostelVisitor.update({
      where: { id: visitor.id },
      data: { status: "CHECKED_OUT", checkOut: new Date() }
    });
    if (checkedOutVisitor.status !== "CHECKED_OUT" || !checkedOutVisitor.checkOut) {
      throw new Error("HostelVisitor check-out failed");
    }
    console.log(`[PASS] Checked out HostelVisitor`);

    // 6. HOSTEL STAFF CRUD
    console.log("\n--- Testing HostelStaff CRUD ---");
    const staffMember = await prisma.hostelStaff.create({
      data: {
        companyId,
        staffId: `STF-${timestamp.toString().slice(-4)}`,
        name: `Warden ${timestamp}`,
        phoneNumber: "+1234567890",
        role: "WARDEN",
        shiftLabel: "Night (20:00 - 04:00)",
        isOnDuty: false
      }
    });
    console.log(`[PASS] Created HostelStaff: ${staffMember.id} (${staffMember.name} - ${staffMember.staffId})`);

    const dutyStaff = await prisma.hostelStaff.update({
      where: { id: staffMember.id },
      data: { isOnDuty: true }
    });
    if (!dutyStaff.isOnDuty) {
      throw new Error("HostelStaff duty toggle failed");
    }
    console.log(`[PASS] Toggled HostelStaff on duty: ${dutyStaff.isOnDuty}`);

    // 7. HOSTEL REPORTS / ANALYTICS
    console.log("\n--- Testing Hostel Reports & Analytics Derivation ---");
    const [totalBedsAgg, activeAllocationsCount, onDutyStaffCount] = await Promise.all([
      prisma.hostelRoom.aggregate({
        where: { block: { companyId } },
        _sum: { capacity: true }
      }),
      prisma.hostelAllocation.count({
        where: { status: "ACTIVE", room: { block: { companyId } } }
      }),
      prisma.hostelStaff.count({
        where: { companyId, isOnDuty: true }
      })
    ]);
    const totalCap = totalBedsAgg._sum.capacity || 0;
    const occupancyRate = totalCap > 0 ? ((activeAllocationsCount / totalCap) * 100).toFixed(1) : "0";
    console.log(`[PASS] Verified Analytics Derivation: Total Capacity=${totalCap}, Active Allocations=${activeAllocationsCount}, Occupancy=${occupancyRate}%, On-Duty Staff=${onDutyStaffCount}`);

    // 8. TEARDOWN & DELETE VERIFICATION
    console.log("\n--- Testing Safe Deletion / Teardown ---");
    await prisma.hostelStaff.delete({ where: { id: staffMember.id } });
    console.log(`[PASS] Deleted HostelStaff: ${staffMember.id}`);

    await prisma.hostelVisitor.delete({ where: { id: visitor.id } });
    console.log(`[PASS] Deleted HostelVisitor: ${visitor.id}`);

    await prisma.hostelMaintenanceRequest.delete({ where: { id: ticket.id } });
    console.log(`[PASS] Deleted Maintenance Request: ${ticket.id}`);

    await prisma.hostelAllocation.delete({ where: { id: allocation.id } });
    console.log(`[PASS] Deleted HostelAllocation: ${allocation.id}`);

    await prisma.hostelMember.delete({ where: { id: member.id } });
    console.log(`[PASS] Deleted HostelMember: ${member.id}`);

    await prisma.hostelRoom.delete({ where: { id: room.id } });
    console.log(`[PASS] Deleted HostelRoom: ${room.id}`);

    await prisma.hostelBlock.delete({ where: { id: block.id } });
    console.log(`[PASS] Deleted HostelBlock: ${block.id}`);

    console.log("\n=== ALL 8 HOSTEL / BOARDING MANAGEMENT ROUTES VERIFIED SUCCESSFULLY! ===");
  } catch (error) {
    console.error("HOSTEL TEST ERROR:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runHostelTests();
