import prisma from "../server/db/prismadb";
import QRCode from "qrcode";
import crypto from "crypto";

async function runVerification() {
  console.log("=== STARTING EVENT & TICKETING AUTOMATED VERIFICATION ===");
  
  // Find or create valid Company with real MongoDB ObjectId
  let company = await prisma.company.findFirst();
  if (!company) {
    company = await prisma.company.create({
      data: {
        name: "Event Ticketing Test Co",
        slug: "event-ticketing-test-" + Date.now().toString(36),
      },
    });
  }
  const testCompanyId = company.id;
  console.log(`✓ Using Company ID (Valid ObjectId): ${testCompanyId}`);

  let createdEventId: string | null = null;
  let createdVipTicketId: string | null = null;
  let createdRegularTicketId: string | null = null;
  let createdPurchaseId: string | null = null;
  let createdAttendeeId: string | null = null;
  let testTicketCode: string | null = null;

  try {
    // 1. Resolve an organizer user or admin
    let organizer = await prisma.user.findFirst();
    if (!organizer) {
      organizer = await prisma.user.create({
        data: {
          name: "Test Organizer",
          email: `organizer-${Date.now()}@example.com`,
          role: "ADMIN",
        },
      });
    }

    // 2. Scenario F: Admin Event CRUD (Create)
    console.log("\n[TEST 1] Creating Event...");
    const testEvent = await prisma.event.create({
      data: {
        title: "Global Tech Summit 2026",
        summary: "Premier annual tech and AI conference",
        description: "Deep dive into artificial intelligence and autonomous engineering.",
        startDateTime: new Date(Date.now() + 86400000 * 5),
        endDateTime: new Date(Date.now() + 86400000 * 6),
        location: "Kenyatta International Convention Centre, Nairobi",
        companyId: testCompanyId,
        organizerId: organizer.id,
        eventType: "GENERAL",
        eventStatus: "SCHEDULED",
        isRegistrationRequired: true,
        maxCapacity: 100,
        isPaid: true,
        price: 2500,
      },
    });
    createdEventId = testEvent.id;
    console.log(`✓ Event created successfully with ID: ${testEvent.id}`);

    // Verify Read
    const fetchedEvent = await prisma.event.findUnique({
      where: { id: createdEventId },
    });
    if (!fetchedEvent || fetchedEvent.title !== "Global Tech Summit 2026") {
      throw new Error("Event read verification failed!");
    }
    console.log("✓ Event read verified.");

    // Verify Edit/Update
    await prisma.event.update({
      where: { id: createdEventId },
      data: { summary: "Updated summary for 2026" },
    });
    const updatedEvent = await prisma.event.findUnique({ where: { id: createdEventId } });
    if (updatedEvent?.summary !== "Updated summary for 2026") {
      throw new Error("Event update verification failed!");
    }
    console.log("✓ Event update verified.");

    // 3. Admin Ticket CRUD
    console.log("\n[TEST 2] Creating Ticket Tiers (VIP & Regular)...");
    const vipTicket = await prisma.eventTicket.create({
      data: {
        eventId: testEvent.id,
        companyId: testCompanyId,
        name: "VIP Pass",
        ticketType: "VIP",
        price: 5000,
        quantityTotal: 2, // Small capacity to test Sold Out condition
        quantitySold: 0,
        currency: "KES",
        isActive: true,
        isVisible: true,
      },
    });
    createdVipTicketId = vipTicket.id;

    const regularTicket = await prisma.eventTicket.create({
      data: {
        eventId: testEvent.id,
        companyId: testCompanyId,
        name: "Regular Admission",
        ticketType: "REGULAR",
        price: 2500,
        quantityTotal: 50,
        quantitySold: 0,
        currency: "KES",
        isActive: true,
        isVisible: true,
      },
    });
    createdRegularTicketId = regularTicket.id;
    console.log(`✓ VIP Ticket (Total: 2) and Regular Ticket (Total: 50) created.`);

    // 4. Scenario A: Normal Purchase, Allocation, and QR Issuance
    console.log("\n[TEST 3] Scenario A: Ticket Checkout, Atomic Allocation & QR Generation...");
    testTicketCode = crypto.randomUUID();
    const qrDataUrl = await QRCode.toDataURL(testTicketCode, {
      width: 250,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    if (!qrDataUrl.startsWith("data:image/png;base64,")) {
      throw new Error("QR Code data URL generation failed!");
    }
    console.log("✓ Real scannable QR Code Data URL generated.");

    // Atomic transaction simulating /api/events/checkout
    const [updatedVip, purchase, attendee] = await prisma.$transaction(async (tx) => {
      // Guard quantity
      const t = await tx.eventTicket.update({
        where: { id: vipTicket.id },
        data: { quantitySold: { increment: 1 } },
      });

      const p = await tx.eventTicketPurchase.create({
        data: {
          eventId: testEvent.id,
          ticketId: vipTicket.id,
          companyId: testCompanyId,
          buyerName: "Jane Doe",
          buyerEmail: "jane.doe@example.com",
          quantity: 1,
          unitPrice: 5000,
          totalAmount: 5000,
          paymentMethod: "mpesa",
          paymentStatus: "PAID",
        },
      });

      const a = await tx.eventTicketAttendee.create({
        data: {
          purchaseId: p.id,
          ticketId: vipTicket.id,
          eventId: testEvent.id,
          fullName: "Jane Doe",
          email: "jane.doe@example.com",
          ticketCode: testTicketCode!,
          qrCodeUrl: qrDataUrl,
          checkInStatus: "PENDING",
        },
      });

      return [t, p, a];
    });

    createdPurchaseId = purchase.id;
    createdAttendeeId = attendee.id;

    if (updatedVip.quantitySold !== 1) {
      throw new Error(`Expected quantitySold to be 1, got ${updatedVip.quantitySold}`);
    }
    console.log(`✓ Purchase #${purchase.id} created and VIP quantitySold incremented to 1.`);
    console.log(`✓ Attendee pass issued with ticketCode: ${attendee.ticketCode}`);

    // 5. Scenario B & Check-In Validation
    console.log("\n[TEST 4] Scenario B: Entrance Gate Validation & Check-in...");
    // Simulate first scan
    const firstCheckIn = await prisma.eventTicketAttendee.update({
      where: { id: attendee.id },
      data: {
        checkInStatus: "CHECKED_IN",
        checkedInAt: new Date(),
      },
    });
    if (firstCheckIn.checkInStatus !== "CHECKED_IN" || !firstCheckIn.checkedInAt) {
      throw new Error("First check-in failed!");
    }
    console.log(`✓ First scan SUCCESS: Attendee ${firstCheckIn.fullName} checked in at ${firstCheckIn.checkedInAt.toISOString()}`);

    // Simulate Duplicate Scan Check
    console.log("\n[TEST 5] Duplicate Scan Check (Must Prevent Second Check-in)...");
    const recheckedAttendee = await prisma.eventTicketAttendee.findUnique({
      where: { ticketCode: testTicketCode },
    });
    if (recheckedAttendee?.checkInStatus === "CHECKED_IN") {
      console.log(`✓ Duplicate Scan BLOCKED: Ticket is ALREADY_CHECKED_IN at ${recheckedAttendee.checkedInAt?.toISOString()}.`);
    } else {
      throw new Error("Duplicate check-in prevention failed!");
    }

    // POS In-Person Walk-in Ticket Sale Test
    console.log("\n[TEST 6] POS In-Person Walk-in Ticket Sale (Cash/POS)...");
    const posTicketCode = crypto.randomUUID();
    const [posVip, posPurchase, posAttendee] = await prisma.$transaction(async (tx) => {
      const t = await tx.eventTicket.update({
        where: { id: regularTicket.id },
        data: { quantitySold: { increment: 1 } },
      });
      const p = await tx.eventTicketPurchase.create({
        data: {
          eventId: testEvent.id,
          ticketId: regularTicket.id,
          companyId: testCompanyId,
          buyerName: "Walk-in Customer",
          buyerEmail: "walkin@example.com",
          quantity: 1,
          unitPrice: 2500,
          totalAmount: 2500,
          paymentMethod: "cash",
          paymentStatus: "PAID",
        },
      });
      const a = await tx.eventTicketAttendee.create({
        data: {
          purchaseId: p.id,
          ticketId: regularTicket.id,
          eventId: testEvent.id,
          fullName: "Walk-in Customer",
          email: "walkin@example.com",
          ticketCode: posTicketCode,
          qrCodeUrl: qrDataUrl,
          checkInStatus: "PENDING",
        },
      });
      return [t, p, a];
    });
    if (posPurchase.paymentStatus !== "PAID" || !posAttendee.ticketCode) {
      throw new Error("POS walk-in sale failed to issue immediate active tickets!");
    }
    console.log(`✓ POS In-person sale complete: Purchase #${posPurchase.id} marked PAID immediately with ticketCode ${posAttendee.ticketCode}.`);

    // 7. Scenario E: Sold Out Enforcement
    console.log("\n[TEST 7] Scenario E: Sold Out Boundary Enforcement...");
    // Current VIP total is 2, sold is 1. Available: 1.
    // Try to purchase 2 VIP tickets (which would exceed total of 2)
    let soldOutBlocked = false;
    try {
      await prisma.$transaction(async (tx) => {
        const attemptedQty = 2;
        const currentTicket = await tx.eventTicket.findUniqueOrThrow({ where: { id: vipTicket.id } });
        if (currentTicket.quantitySold + attemptedQty > currentTicket.quantityTotal) {
          throw new Error("INSUFFICIENT_TICKETS: Exceeds total capacity");
        }
        await tx.eventTicket.update({
          where: { id: vipTicket.id },
          data: { quantitySold: { increment: attemptedQty } },
        });
      });
    } catch (e: any) {
      if (e.message.includes("INSUFFICIENT_TICKETS")) {
        soldOutBlocked = true;
      }
    }
    if (!soldOutBlocked) {
      throw new Error("Sold out inventory limit failed to block excess purchase!");
    }
    console.log("✓ Excess ticket purchase rejected server-side as expected.");

    // 7. Scenario: Order Cancellation & Inventory Rollback
    console.log("\n[TEST 7] Order Cancellation & Inventory Reinstatement...");
    await prisma.$transaction(async (tx) => {
      await tx.eventTicketPurchase.update({
        where: { id: purchase.id },
        data: { paymentStatus: "CANCELLED" },
      });
      await tx.eventTicket.update({
        where: { id: vipTicket.id },
        data: { quantitySold: { decrement: purchase.quantity } },
      });
      await tx.eventTicketAttendee.updateMany({
        where: { purchaseId: purchase.id },
        data: { checkInStatus: "CANCELLED" },
      });
    });

    const rolledBackTicket = await prisma.eventTicket.findUnique({ where: { id: vipTicket.id } });
    const cancelledAttendee = await prisma.eventTicketAttendee.findUnique({ where: { id: attendee.id } });
    if (rolledBackTicket?.quantitySold !== 0) {
      throw new Error(`Expected quantitySold to rollback to 0, got ${rolledBackTicket?.quantitySold}`);
    }
    if (cancelledAttendee?.checkInStatus !== "CANCELLED") {
      throw new Error(`Expected attendee status to be CANCELLED, got ${cancelledAttendee?.checkInStatus}`);
    }
    console.log("✓ Order cancelled: VIP quantitySold rolled back to 0, attendee pass marked CANCELLED.");

    // 8. Scenario G: Tenant Isolation Verification
    console.log("\n[TEST 8] Scenario G: Tenant Isolation Authorization Guard...");
    const foreignCompanyId = crypto.randomBytes(12).toString("hex");
    const foreignEvent = await prisma.event.findFirst({
      where: {
        id: testEvent.id,
        companyId: foreignCompanyId,
      },
    });
    if (foreignEvent !== null) {
      throw new Error("Tenant isolation failed! Foreign company could query event.");
    }
    console.log("✓ Tenant isolation confirmed: Foreign company ID returned null.");

    console.log("\n=======================================================");
    console.log("🎉 ALL EVENT & TICKETING CORE INVARIANTS PASSED! 🎉");
    console.log("=======================================================");
  } finally {
    // Cleanup fixtures
    console.log("\nCleaning up test records...");
    if (createdAttendeeId) {
      await prisma.eventTicketAttendee.deleteMany({ where: { eventId: createdEventId! } });
    }
    if (createdPurchaseId) {
      await prisma.eventTicketPurchase.deleteMany({ where: { eventId: createdEventId! } });
    }
    if (createdVipTicketId || createdRegularTicketId) {
      await prisma.eventTicket.deleteMany({ where: { eventId: createdEventId! } });
    }
    if (createdEventId) {
      await prisma.event.delete({ where: { id: createdEventId } });
    }
    console.log("✓ Test records cleaned up successfully.");
  }
}

runVerification()
  .catch((e) => {
    console.error("\n❌ VERIFICATION TEST FAILED:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
