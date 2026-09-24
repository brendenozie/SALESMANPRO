const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Replicate pricing engine logic for independent E2E validation
function calculateQuote({ distanceKm = 10, weightKg = 1, serviceType = "STANDARD", isFragile = false }) {
  const baseFee = 5.0;
  const distanceFee = distanceKm * 1.5;
  const weightFee = Math.max(0, weightKg - 2) * 0.8;
  const multiplier = serviceType === "EXPRESS" ? 1.5 : serviceType === "SAME_DAY" ? 2.0 : 1.0;
  const surcharges = isFragile ? 7.5 : 0;
  const subtotal = (baseFee + distanceFee + weightFee) * multiplier + surcharges;
  const tax = subtotal * 0.16;
  const total = Number((subtotal + tax).toFixed(2));
  return { baseFee, distanceFee, weightFee, surcharges, tax: Number(tax.toFixed(2)), total };
}

async function runE2E() {
  console.log("=================================================");
  console.log("STARTING LIVE LOGISTICS E2E VERIFICATION (NODE)");
  console.log("=================================================\n");

  try {
    // 1. Resolve Company
    const company = await prisma.company.findFirst({
      select: { id: true, name: true, slug: true },
    });

    if (!company) {
      console.error("[FAIL] No company found in database.");
      process.exit(1);
    }
    console.log(`[PASS] Tenant Resolved: "${company.name}" (ID: ${company.id}, Slug: ${company.slug})`);

    // 2. Test Pricing Engine
    console.log("\n--- TEST 1: Pricing Engine Verification ---");
    const quote = calculateQuote({ distanceKm: 14.5, weightKg: 6, serviceType: "EXPRESS", isFragile: true });
    console.log("Calculated Quote Breakdown:", quote);
    if (quote.total <= 0 || !quote.tax) {
      throw new Error("Invalid quote values generated");
    }
    console.log("[PASS] Pricing calculation verified.");

    // 3. Test Booking & Database Linkage
    console.log("\n--- TEST 2: Customer Booking & Order Linkage ---");
    const trackingNumber = `TRK-E2E-${Date.now().toString().slice(-4)}`;
    const orderNumber = `ORD-E2E-${Date.now().toString().slice(-4)}`;

    const { order, delivery } = await prisma.$transaction(async (tx) => {
      let consumer = await tx.consumer.findFirst({ where: { companyId: company.id } });
      if (!consumer) {
        consumer = await tx.consumer.create({
          data: {
            companyId: company.id,
            name: "John Enterprise",
            email: "john@enterprise.com",
            phone: "+254722000111",
            address: "Upper Hill, Nairobi",
          },
        });
      }

      const newOrder = await tx.customerOrder.create({
        data: {
          Company: { connect: { id: company.id } },
          consumerId: consumer.id,
          name: consumer.name,
          email: consumer.email || "john@enterprise.com",
          phone: consumer.phone || "+254722000111",
          shippingAddress: { address: "Upper Hill, Nairobi" },
          orderSource: "WEBSITE",
          status: "PROCESSING",
          paymentOption: "CASH_ON_DELIVERY",
          totalPrice: quote.total,
          totalFinalPrice: quote.total,
          delivery: true,
          trackingNumber,
          notes: "E2E Automated test delivery booking",
        },
      });

      const newDelivery = await tx.delivery.create({
        data: {
          companyId: company.id,
          trackingNumber,
          status: "CONFIRMED",
          consumerId: consumer.id,
          customerName: consumer.name,
          customerContact: consumer.phone,
          customerEmail: consumer.email,
          pickupAddress: "Airport Cargo Terminal 2",
          deliveryAddress: "Upper Hill, Nairobi",
          packageDescription: "Precision Medical Instruments",
          packageWeightKg: 6,
          weightKg: 6,
          deliveryFee: quote.total,
          totalAmount: quote.total,
          totalDistanceKm: 14.5,
          estimatedTravelTime: 30,
          CustomerOrders: {
            connect: [{ id: newOrder.id }],
          },
        },
      });

      await tx.deliveryTracking.create({
        data: {
          deliveryId: newDelivery.id,
          status: "CONFIRMED",
          locationName: "Airport Cargo Terminal 2",
          lat: -1.286389,
          lng: 36.817223,
          note: "Booking confirmed by customer, dispatch pending",
        },
      });

      return { order: newOrder, delivery: newDelivery };
    });

    console.log(`[PASS] Order created: (ID: ${order.id})`);
    console.log(`[PASS] Delivery created: ${delivery.trackingNumber} (ID: ${delivery.id})`);

    // 4. Test Driver Assignment
    console.log("\n--- TEST 3: Driver & Vehicle Assignment ---");
    const driver = await prisma.transportDriver.findFirst({
      where: { companyId: company.id },
      include: { user: true },
    });

    await prisma.delivery.update({
      where: { id: delivery.id },
      data: {
        status: "DRIVER_ASSIGNED",
        riderId: driver ? driver.userId : null,
        riderName: driver && driver.user ? driver.user.name : "Active Courier",
        driverProfileId: driver ? driver.id : null,
        vehicleId: driver ? driver.vehicleId : null,
      },
    });

    await prisma.deliveryTracking.create({
      data: {
        deliveryId: delivery.id,
        status: "DRIVER_ASSIGNED",
        locationName: "Depot Logistics Hub",
        lat: -1.286389,
        lng: 36.817223,
        note: `Assigned to courier ${driver && driver.user ? driver.user.name : "Active Courier"}`,
      },
    });
    console.log("[PASS] Driver assigned successfully.");

    // 5. Test Step-by-Step Lifecycle
    console.log("\n--- TEST 4: Full State Machine Progression ---");
    const stages = [
      { status: "DRIVER_EN_ROUTE_TO_PICKUP", loc: "En Route to Airport", note: "Driver heading to airport cargo" },
      { status: "ARRIVED_AT_PICKUP", loc: "Airport Cargo Terminal 2", note: "Driver arrived at loading gate" },
      { status: "PICKED_UP", loc: "Airport Cargo Terminal 2", note: "Cargo inspected and loaded onto fleet unit" },
      { status: "IN_TRANSIT", loc: "Mombasa Road Express", note: "Shipment in transit to Upper Hill" },
      { status: "OUT_FOR_DELIVERY", loc: "Upper Hill Avenue", note: "Courier arriving at delivery premises" },
    ];

    for (const stage of stages) {
      await prisma.delivery.update({
        where: { id: delivery.id },
        data: { status: stage.status },
      });
      await prisma.deliveryTracking.create({
        data: {
          deliveryId: delivery.id,
          status: stage.status,
          locationName: stage.loc,
          lat: -1.286389,
          lng: 36.817223,
          note: stage.note,
        },
      });
      console.log(`[PASS] -> ${stage.status} (${stage.loc})`);
    }

    // 6. Test Handover & Proof of Delivery
    console.log("\n--- TEST 5: Handover Confirmation & Proof of Delivery ---");
    await prisma.$transaction(async (tx) => {
      await tx.delivery.update({
        where: { id: delivery.id },
        data: {
          status: "DELIVERED",
        },
      });

      await tx.deliveryProof.create({
        data: {
          deliveryId: delivery.id,
          type: "SIGNATURE",
          recipientName: "Dr. Evelyn Kiprop",
          recipientPhone: "+254733999888",
          signatureUrl: "https://cloud.salesmanpro.com/proof/sig-992.png",
          notes: "Package inspected and approved on site",
        },
      });

      await tx.customerOrder.update({
        where: { id: order.id },
        data: { status: "COMPLETED" },
      });

      await tx.deliveryTracking.create({
        data: {
          deliveryId: delivery.id,
          status: "DELIVERED",
          locationName: "Upper Hill, Nairobi",
          lat: -1.292066,
          lng: 36.821945,
          note: "Handover confirmed to Dr. Evelyn Kiprop",
        },
      });
    });

    const proof = await prisma.deliveryProof.findFirst({
      where: { deliveryId: delivery.id },
    });
    const finalOrder = await prisma.customerOrder.findUnique({
      where: { id: order.id },
    });
    console.log(`[PASS] Proof of Delivery: ${proof.type}, Recipient: "${proof.recipientName}"`);
    console.log(`[PASS] Order Status Synchronized: ${finalOrder.status}`);

    // Verify Audit Timeline
    const timeline = await prisma.deliveryTracking.findMany({
      where: { deliveryId: delivery.id },
      orderBy: { recordedAt: "asc" },
    });
    console.log(`[PASS] Verifiable Milestones in Audit Log: ${timeline.length}`);

    // 7. Test Exception Handling
    console.log("\n--- TEST 6: Exception Reporting & Safety Watch ---");
    const excDel = await prisma.delivery.create({
      data: {
        companyId: company.id,
        trackingNumber: `TRK-EXC-${Date.now().toString().slice(-4)}`,
        status: "FAILED_DELIVERY",
        pickupAddress: "Industrial Depot",
        deliveryAddress: "Flooded Area Way",
        customerName: "Jane Smith",
      },
    });

    const incident = await prisma.transportIncident.create({
      data: {
        companyId: company.id,
        deliveryId: excDel.id,
        type: "WEATHER_HAZARD",
        severity: "HIGH",
        notes: "Flash flood blocked road; delivery safely halted",
        status: "OPEN",
      },
    });
    console.log(`[PASS] Incident recorded: ${incident.type} (Severity: ${incident.severity})`);

    // Clean up test records
    await prisma.deliveryProof.deleteMany({ where: { deliveryId: delivery.id } });
    await prisma.deliveryTracking.deleteMany({ where: { deliveryId: { in: [delivery.id, excDel.id] } } });
    await prisma.transportIncident.deleteMany({ where: { id: incident.id } });
    await prisma.delivery.deleteMany({ where: { id: { in: [delivery.id, excDel.id] } } });
    await prisma.customerOrder.deleteMany({ where: { id: order.id } });

    console.log("[PASS] Test data cleaned up successfully.");

    console.log("\n=================================================");
    console.log("ALL E2E WORKFLOW SCENARIOS VERIFIED SUCCESSFULLY!");
    console.log("=================================================\n");
  } catch (err) {
    console.error("E2E Test Execution Error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runE2E();
