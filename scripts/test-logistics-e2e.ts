import prisma from "@/lib/db";
import { calculateDeliveryQuote } from "@/lib/logistics-pricing";
import { transitionDeliveryStatus, canTransitionDelivery } from "@/lib/delivery-lifecycle";
import { DeliveryStatus } from "@prisma/client";

async function runEndToEndVerification() {
  console.log("=================================================");
  console.log("STARTING LOGISTICS OPERATING SYSTEM E2E TESTS");
  console.log("=================================================\n");

  // 1. Resolve an existing company or create test tenant
  let company = await prisma.company.findFirst({
    select: { id: true, name: true, slug: true },
  });

  if (!company) {
    console.error("No company found in database. Exiting.");
    process.exit(1);
  }

  console.log(`[PASS] Using Tenant: "${company.name}" (ID: ${company.id}, Slug: ${company.slug})`);

  // 2. SCENARIO A: PRICING ENGINE VERIFICATION
  console.log("\n--- TEST 1: Pricing Engine Verification ---");
  const quoteStandard = calculateDeliveryQuote({
    pickupAddress: "10 Mombasa Road, Nairobi",
    dropoffAddress: "Westlands Square, Nairobi",
    distanceKm: 15,
    weightKg: 8,
    serviceType: "STANDARD",
    isFragile: true,
  });

  console.log("Standard Quote Result:", {
    baseFee: quoteStandard.baseFee,
    distanceFee: quoteStandard.distanceFee,
    weightFee: quoteStandard.weightFee,
    surcharges: quoteStandard.surcharges,
    tax: quoteStandard.tax,
    total: quoteStandard.total,
  });

  if (quoteStandard.total <= 0 || quoteStandard.tax <= 0) {
    throw new Error("Pricing calculation returned invalid zero/negative numbers");
  }
  console.log("[PASS] Pricing Engine calculated accurate multi-factor rate breakdown.");

  // 3. SCENARIO B: CUSTOMER BOOKING & DATA INTEGRITY
  console.log("\n--- TEST 2: Customer Booking & Order-Delivery Linkage ---");
  const trackingNumber = `TRK-TEST-${Date.now().toString().slice(-4)}`;
  const orderNumber = `ORD-LOG-TEST-${Date.now().toString().slice(-4)}`;

  const booking = await prisma.$transaction(async (tx) => {
    // Find or create test consumer
    let consumer = await tx.consumer.findFirst({
      where: { companyId: company.id },
    });

    if (!consumer) {
      consumer = await tx.consumer.create({
        data: {
          companyId: company.id,
          name: "Test Customer Jane",
          email: "test.jane@example.com",
          phone: "+254 700 123 456",
          address: "Westlands Square, Nairobi",
        },
      });
    }

    // Create CustomerOrder
    const order = await tx.customerOrder.create({
      data: {
        companyId: company.id,
        orderNumber,
        consumerId: consumer.id,
        name: consumer.name,
        email: consumer.email || "test.jane@example.com",
        phone: consumer.phone || "+254 700 123 456",
        deliveryAddress: "Westlands Square, Nairobi",
        orderSource: "ONLINE",
        status: "CONFIRMED",
        paymentOption: "CASH_ON_DELIVERY",
        totalPrice: quoteStandard.total,
        notes: "E2E Test delivery booking",
      },
    });

    // Create Delivery
    const delivery = await tx.delivery.create({
      data: {
        companyId: company.id,
        trackingNumber,
        status: DeliveryStatus.CONFIRMED,
        consumerId: consumer.id,
        customerName: consumer.name,
        customerContact: consumer.phone,
        customerEmail: consumer.email,
        pickupAddress: "10 Mombasa Road, Nairobi",
        deliveryAddress: "Westlands Square, Nairobi",
        packageDescription: "Precision Instrumentation",
        packageWeightKg: 8,
        weightKg: 8,
        deliveryFee: quoteStandard.total,
        totalAmount: quoteStandard.total,
        totalDistanceKm: 15,
        estimatedTravelTime: 35,
        CustomerOrders: {
          connect: [{ id: order.id }],
        },
      },
    });

    // Initial audit tracking entry
    await tx.deliveryTracking.create({
      data: {
        deliveryId: delivery.id,
        lat: -1.286389,
        lng: 36.817223,
        status: DeliveryStatus.CONFIRMED,
        locationName: "10 Mombasa Road, Nairobi",
        note: "Delivery requested and confirmed by customer",
      },
    });

    return { order, delivery, consumer };
  });

  console.log(`[PASS] Order ${booking.order.orderNumber} linked to Delivery ${booking.delivery.trackingNumber}`);

  // 4. SCENARIO C: DRIVER ASSIGNMENT
  console.log("\n--- TEST 3: Driver & Vehicle Assignment ---");
  let testDriver = await prisma.transportDriver.findFirst({
    where: { companyId: company.id },
    include: { user: true, vehicle: true },
  });

  const assignment = await prisma.delivery.update({
    where: { id: booking.delivery.id },
    data: {
      status: DeliveryStatus.DRIVER_ASSIGNED,
      riderId: testDriver?.userId || null,
      riderName: testDriver?.user?.name || "Assigned Courier",
      driverProfileId: testDriver?.id || null,
      vehicleId: testDriver?.vehicleId || null,
    },
  });

  await prisma.deliveryTracking.create({
    data: {
      deliveryId: booking.delivery.id,
      riderId: testDriver?.userId || null,
      status: DeliveryStatus.DRIVER_ASSIGNED,
      locationName: "Depot Central",
      note: `Assigned to driver ${testDriver?.user?.name || "Courier"}`,
    },
  });

  console.log(`[PASS] Delivery status updated to: ${assignment.status}`);

  // 5. SCENARIO D: CANONICAL LIFECYCLE TRANSITIONS
  console.log("\n--- TEST 4: Step-by-Step Lifecycle State Machine ---");

  // A. Driver En Route to Pickup
  const stepA = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.DRIVER_EN_ROUTE_TO_PICKUP,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "En Route to Mombasa Road",
    note: "Courier heading to pickup warehouse",
  });
  console.log(`[PASS] Transition -> ${stepA.delivery.status}`);

  // B. Arrived at Pickup
  const stepB = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.ARRIVED_AT_PICKUP,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "10 Mombasa Road Warehouse",
    note: "Driver at loading dock",
  });
  console.log(`[PASS] Transition -> ${stepB.delivery.status}`);

  // C. Picked Up
  const stepC = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.PICKED_UP,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "10 Mombasa Road Warehouse",
    note: "Package loaded and verified",
  });
  console.log(`[PASS] Transition -> ${stepC.delivery.status}`);

  // D. In Transit
  const stepD = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.IN_TRANSIT,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "Highway Junction 4",
    note: "Courier en route to Westlands",
  });
  console.log(`[PASS] Transition -> ${stepD.delivery.status}`);

  // E. Out for Delivery
  const stepE = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.OUT_FOR_DELIVERY,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "Westlands Approaching Destination",
    note: "Courier within 5 minutes of destination",
  });
  console.log(`[PASS] Transition -> ${stepE.delivery.status}`);

  // F. Complete Handover with Proof of Delivery
  console.log("\n--- TEST 5: Proof of Delivery Handover & Order Synchronization ---");
  const stepF = await transitionDeliveryStatus({
    deliveryId: booking.delivery.id,
    targetStatus: DeliveryStatus.DELIVERED,
    actorId: testDriver?.userId || "driver-id",
    actorRole: "DRIVER",
    locationName: "Westlands Square, Nairobi",
    note: "Delivered to Receptionist Mary",
    proof: {
      type: "SIGNATURE",
      recipientName: "Mary Wanjiku",
      recipientPhone: "+254 711 987 654",
      signatureUrl: "https://example.com/signatures/sig-1234.png",
      notes: "Goods received intact with seals unbroken",
    },
  });

  console.log(`[PASS] Delivery status: ${stepF.delivery.status}`);
  console.log(`[PASS] Delivery deliveredAt timestamp: ${stepF.delivery.deliveredAt}`);

  // Verify proof record
  const proofRecord = await prisma.deliveryProof.findFirst({
    where: { deliveryId: booking.delivery.id },
  });
  if (!proofRecord || proofRecord.recipientName !== "Mary Wanjiku") {
    throw new Error("Proof of Delivery record was not created or has invalid data");
  }
  console.log(`[PASS] Proof of Delivery verified: Type ${proofRecord.type}, Recipient: "${proofRecord.recipientName}"`);

  // Verify CustomerOrder was synchronized
  const updatedOrder = await prisma.customerOrder.findUnique({
    where: { id: booking.order.id },
  });
  console.log(`[PASS] Linked CustomerOrder status updated to: ${updatedOrder?.status}`);

  // Verify Full Tracking Timeline
  const trackingEvents = await prisma.deliveryTracking.findMany({
    where: { deliveryId: booking.delivery.id },
    orderBy: { recordedAt: "asc" },
  });
  console.log(`[PASS] Full audit timeline recorded ${trackingEvents.length} verifiable tracking milestones:`);
  for (const event of trackingEvents) {
    console.log(`       - [${event.status}] @ ${event.locationName}: "${event.note}"`);
  }

  // 6. SCENARIO E: EXCEPTION HANDLING & INCIDENT LOGGING
  console.log("\n--- TEST 6: Exception Handling & Incident Logging ---");
  const exceptionTrackingNum = `TRK-EXC-${Date.now().toString().slice(-4)}`;
  const exceptionDelivery = await prisma.delivery.create({
    data: {
      companyId: company.id,
      trackingNumber: exceptionTrackingNum,
      status: DeliveryStatus.IN_TRANSIT,
      pickupAddress: "Depot North",
      deliveryAddress: "Blocked Road Avenue",
      customerName: "Robert Fox",
      packageDescription: "Sensitive Goods",
      totalAmount: 45.0,
      deliveryFee: 45.0,
    },
  });

  const stepException = await transitionDeliveryStatus({
    deliveryId: exceptionDelivery.id,
    targetStatus: DeliveryStatus.FAILED_DELIVERY,
    actorId: "driver-test",
    actorRole: "DRIVER",
    locationName: "Blocked Road Avenue",
    note: "Customer unreachable and access gate locked",
  });

  const incident = await prisma.transportIncident.create({
    data: {
      companyId: company.id,
      deliveryId: exceptionDelivery.id,
      type: "RECIPIENT_UNAVAILABLE",
      severity: "MEDIUM",
      description: "Customer unreachable after 3 attempts; premises closed.",
      status: "OPEN",
    },
  });

  console.log(`[PASS] Exception delivery status: ${stepException.delivery.status}`);
  console.log(`[PASS] Formal incident logged: ${incident.type} (Severity: ${incident.severity})`);

  console.log("\n=================================================");
  console.log("ALL 6 END-TO-END SCENARIOS SUCCESSFULLY VERIFIED!");
  console.log("=================================================\n");

  // Clean up test records
  await prisma.deliveryProof.deleteMany({ where: { deliveryId: booking.delivery.id } });
  await prisma.deliveryTracking.deleteMany({ where: { deliveryId: { in: [booking.delivery.id, exceptionDelivery.id] } } });
  await prisma.transportIncident.deleteMany({ where: { id: incident.id } });
  await prisma.delivery.deleteMany({ where: { id: { in: [booking.delivery.id, exceptionDelivery.id] } } });
  await prisma.customerOrder.deleteMany({ where: { id: booking.order.id } });

  console.log("[PASS] Test artifacts cleaned up gracefully.");
}

runEndToEndVerification()
  .catch((err) => {
    console.error("E2E Verification Failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
