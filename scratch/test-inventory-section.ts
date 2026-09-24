import prisma from "../server/db/prismadb";

const COMPANY_ID = "683581bba1bdf6ca3624b530"; // Mount Moriah International School

async function runInventorySectionTests() {
  console.log("=== STARTING SECTION 10: INVENTORY & ASSET MANAGEMENT TEST ===");
  const testRunId = `TEST-INV-${Date.now()}`;

  let testProductId: string | null = null;
  let testInventoryItemId: string | null = null;
  let testAssetId: string | null = null;
  let testAssetTrackingId: string | null = null;
  let testAuditId: string | null = null;
  let testSupplierId: string | null = null;
  let testPurchaseOrderId: string | null = null;

  try {
    // -------------------------------------------------------------
    // 0. Ensure User exists for audits & tracking
    // -------------------------------------------------------------
    console.log("\n[0] Ensuring auditor/user exists...");
    const user = await prisma.user.findFirst({
      where: { companyId: COMPANY_ID },
    });
    if (!user) throw new Error("No user found in company for audit tests");
    console.log(`✓ User ready: ${user.name} (${user.id})`);

    // -------------------------------------------------------------
    // 1. Inventory Items CRUD (app/admin/[slug]/inventory-items)
    // -------------------------------------------------------------
    console.log("\n[1] Testing Inventory Items & Products CRUD...");
    const productName = `Interactive Digital Whiteboard ${testRunId}`;
    const product = await prisma.product.create({
      data: {
        company: { connect: { id: COMPANY_ID } },
        name: productName,
        category: "ELECTRONICS",
        sellingPrice: 850.0,
        costPrice: 850.0,
      },
    });
    testProductId = product.id;

    const inventoryItem = await prisma.inventoryItem.create({
      data: {
        companyId: COMPANY_ID,
        productId: product.id,
        quantity: 15,
        reorderThreshold: 4,
      },
      include: { product: true },
    });
    testInventoryItemId = inventoryItem.id;
    console.log(`✓ Inventory Item Created: ${product.name} (Qty: ${inventoryItem.quantity}) - ID: ${inventoryItem.id}`);

    // Verify Read
    const readItem = await prisma.inventoryItem.findUnique({
      where: { id: testInventoryItemId },
      include: { product: true },
    });
    if (!readItem || readItem.quantity !== 15 || readItem.product?.sellingPrice !== 850.0) {
      throw new Error("InventoryItem read verification failed");
    }
    console.log("✓ Inventory Item Read with Product verified");

    // Update
    const updatedItem = await prisma.inventoryItem.update({
      where: { id: testInventoryItemId },
      data: {
        quantity: 20,
        reorderThreshold: 6,
      },
      include: { product: true },
    });
    if (updatedItem.quantity !== 20 || updatedItem.reorderThreshold !== 6) {
      throw new Error("InventoryItem update verification failed");
    }
    console.log(`✓ Inventory Item Updated: New Qty ${updatedItem.quantity}, New Threshold ${updatedItem.reorderThreshold}`);

    // -------------------------------------------------------------
    // 2. Fixed Assets CRUD (app/admin/[slug]/inventory-assets-list & overview)
    // -------------------------------------------------------------
    console.log("\n[2] Testing Fixed Assets CRUD...");
    const assetName = `Physics Lab Optical Spectrometer ${testRunId}`;
    const asset = await prisma.asset.create({
      data: {
        companyId: COMPANY_ID,
        name: assetName,
        category: "EQUIPMENT",
        purchaseDate: new Date("2026-01-15"),
        purchaseValue: 3400.0,
        currentValue: 3100.0,
        status: "ACTIVE",
        serialNumber: `SPEC-${Date.now().toString().slice(-5)}`,
        location: "Science Complex Room 204",
        notes: "Precision optical calibration certificate verified",
      },
    });
    testAssetId = asset.id;
    console.log(`✓ Asset Created: ${asset.name} ($${asset.purchaseValue}) - ID: ${asset.id}`);

    // Verify Read
    const readAsset = await prisma.asset.findUnique({
      where: { id: testAssetId },
    });
    if (!readAsset || readAsset.purchaseValue !== 3400.0) {
      throw new Error("Asset read verification failed");
    }
    console.log("✓ Asset Read verified");

    // Update
    const updatedAsset = await prisma.asset.update({
      where: { id: testAssetId },
      data: {
        currentValue: 2950.0,
        status: "IN_USE",
      },
    });
    if (updatedAsset.currentValue !== 2950.0 || updatedAsset.status !== "IN_USE") {
      throw new Error("Asset update verification failed");
    }
    console.log(`✓ Asset Updated: New Value $${updatedAsset.currentValue}, Status: ${updatedAsset.status}`);

    // -------------------------------------------------------------
    // 3. Asset Tracking (app/admin/[slug]/asset-tracking)
    // -------------------------------------------------------------
    console.log("\n[3] Testing Asset Tracking Lifecycle...");
    const tracking = await prisma.assetTracking.create({
      data: {
        assetId: testAssetId,
        action: "ASSIGNED",
        performedBy: user.id,
        date: new Date(),
        notes: "Custody handed over to Physics Lab Director",
      },
      include: { asset: true, performer: true },
    });
    testAssetTrackingId = tracking.id;
    console.log(`✓ Asset Tracking Entry Created: Action ${tracking.action} by ${tracking.performer?.name}`);

    const readTracking = await prisma.assetTracking.findUnique({
      where: { id: testAssetTrackingId },
      include: { asset: true, performer: true },
    });
    if (!readTracking || readTracking.action !== "ASSIGNED") {
      throw new Error("AssetTracking read verification failed");
    }
    console.log("✓ Asset Tracking Read verified");

    // -------------------------------------------------------------
    // 4. Inventory Audits (app/admin/[slug]/inventory-audits)
    // -------------------------------------------------------------
    console.log("\n[4] Testing Inventory Audits CRUD...");
    const audit = await prisma.inventoryAudit.create({
      data: {
        companyId: COMPANY_ID,
        conductedBy: user.id,
        auditDate: new Date(),
        status: "IN_PROGRESS",
        findings: `Physical stock count for science equipment ${testRunId}`,
        notes: "All laboratory units cataloged without variance",
      },
      include: { conductor: true },
    });
    testAuditId = audit.id;
    console.log(`✓ Inventory Audit Created: Conducted by ${audit.conductor.name} - Status: ${audit.status}`);

    const updatedAudit = await prisma.inventoryAudit.update({
      where: { id: testAuditId },
      data: { status: "COMPLETED" },
    });
    if (updatedAudit.status !== "COMPLETED") throw new Error("Audit status update failed");
    console.log(`✓ Inventory Audit Updated to COMPLETED`);

    // -------------------------------------------------------------
    // 5. Suppliers & Purchase Orders (app/admin/[slug]/inventory-suppliers & purchase-orders)
    // -------------------------------------------------------------
    console.log("\n[5] Testing Procurement Suppliers & Purchase Orders...");
    const supplier = await prisma.supplier.create({
      data: {
        companyId: COMPANY_ID,
        name: `Academic Instruments Ltd ${testRunId}`,
        contactPerson: "Dr. Gregory House",
        email: `procurement-${Date.now()}@academicinstruments.com`,
        phone: "+1-800-555-4321",
        category: "Laboratory Equipment",
        paymentTerms: "Net 30",
        address: "742 Evergreen Terrace",
      },
    });
    testSupplierId = supplier.id;
    console.log(`✓ Supplier Created: ${supplier.name} - ID: ${supplier.id}`);

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        companyId: COMPANY_ID,
        supplierId: supplier.id,
        poNumber: `PO-${Date.now().toString().slice(-6)}`,
        status: "APPROVED",
        totalAmount: 4200.0,
        subtotal: 4200.0,
        taxAmount: 0.0,
        notes: "Quarterly scientific restock",
        items: {
          create: [
            {
              description: "Glassware Starter Pack",
              quantityOrdered: 10,
              quantityReceived: 0,
              unitCost: 150.0,
              totalCost: 1500.0,
            },
            {
              description: "Digital Multimeters",
              quantityOrdered: 20,
              quantityReceived: 0,
              unitCost: 135.0,
              totalCost: 2700.0,
            },
          ],
        },
      },
      include: { items: true, supplier: true },
    });
    testPurchaseOrderId = purchaseOrder.id;
    console.log(`✓ Purchase Order Created: ${purchaseOrder.poNumber} ($${purchaseOrder.totalAmount}) with ${purchaseOrder.items.length} items`);

    // -------------------------------------------------------------
    // 6. Inventory Dashboard & Reports Live Aggregations
    // -------------------------------------------------------------
    console.log("\n[6] Testing Inventory Dashboard & Reports Calculations...");
    const [allInvItems, allAssets, allAuditsCount] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { companyId: COMPANY_ID },
        include: { product: true },
      }),
      prisma.asset.findMany({
        where: { companyId: COMPANY_ID },
      }),
      prisma.inventoryAudit.count({
        where: { companyId: COMPANY_ID },
      }),
    ]);

    const totalSkus = allInvItems.length;
    const totalAssetBookValue = allAssets.reduce((sum, a) => sum + (a.currentValue || a.purchaseValue || 0), 0);
    const totalInventoryValue = allInvItems.reduce((sum, i) => sum + (i.quantity * ((i.product as any)?.sellingPrice || (i.product as any)?.costPrice || 0)), 0);

    console.log(`✓ Live Stock & Asset Aggregates:`);
    console.log(`   Total Monitored SKUs: ${totalSkus}`);
    console.log(`   Total Inventory Value: $${totalInventoryValue.toLocaleString()}`);
    console.log(`   Total Asset Book Value: $${totalAssetBookValue.toLocaleString()}`);
    console.log(`   Audits Logged: ${allAuditsCount}`);

    if (totalSkus < 1 || totalAssetBookValue < 2950.0) {
      throw new Error("Live aggregation does not include created inventory or asset");
    }

    // -------------------------------------------------------------
    // 7. Cleanup & Verification
    // -------------------------------------------------------------
    console.log("\n[7] Verifying Deletion Lifecycle & Cleanup...");

    // Delete PO Items & Purchase Order
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: testPurchaseOrderId } });
    await prisma.purchaseOrder.delete({ where: { id: testPurchaseOrderId } });
    const verifyPO = await prisma.purchaseOrder.findUnique({ where: { id: testPurchaseOrderId } });
    if (verifyPO) throw new Error("Purchase Order deletion failed");
    testPurchaseOrderId = null;
    console.log("✓ Purchase Order & items deleted");

    // Delete Supplier
    await prisma.supplier.delete({ where: { id: testSupplierId } });
    const verifySup = await prisma.supplier.findUnique({ where: { id: testSupplierId } });
    if (verifySup) throw new Error("Supplier deletion failed");
    testSupplierId = null;
    console.log("✓ Supplier deleted");

    // Delete Audit
    await prisma.inventoryAudit.delete({ where: { id: testAuditId } });
    const verifyAudit = await prisma.inventoryAudit.findUnique({ where: { id: testAuditId } });
    if (verifyAudit) throw new Error("Audit deletion failed");
    testAuditId = null;
    console.log("✓ Inventory Audit deleted");

    // Delete Asset Tracking & Asset
    await prisma.assetTracking.deleteMany({ where: { assetId: testAssetId } });
    await prisma.asset.delete({ where: { id: testAssetId } });
    const verifyAsset = await prisma.asset.findUnique({ where: { id: testAssetId } });
    if (verifyAsset) throw new Error("Asset deletion failed");
    testAssetId = null;
    console.log("✓ Asset and tracking logs deleted");

    // Delete Inventory Item & Product
    await prisma.inventoryItem.delete({ where: { id: testInventoryItemId } });
    await prisma.product.delete({ where: { id: testProductId } });
    const verifyItem = await prisma.inventoryItem.findUnique({ where: { id: testInventoryItemId } });
    if (verifyItem) throw new Error("Inventory Item deletion failed");
    testInventoryItemId = null;
    testProductId = null;
    console.log("✓ Inventory Item & Product deleted");

    console.log("\n============================================================");
    console.log("🎉 ALL SECTION 10 (INVENTORY & ASSET MANAGEMENT) TESTS PASSED!");
    console.log("============================================================");
  } catch (error) {
    console.error("\n❌ Section 10 Test Failed:", error);

    // Emergency cleanup
    if (testPurchaseOrderId) {
      await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrderId: testPurchaseOrderId } }).catch(() => {});
      await prisma.purchaseOrder.delete({ where: { id: testPurchaseOrderId } }).catch(() => {});
    }
    if (testSupplierId) await prisma.supplier.delete({ where: { id: testSupplierId } }).catch(() => {});
    if (testAuditId) await prisma.inventoryAudit.delete({ where: { id: testAuditId } }).catch(() => {});
    if (testAssetId) {
      await prisma.assetTracking.deleteMany({ where: { assetId: testAssetId } }).catch(() => {});
      await prisma.asset.delete({ where: { id: testAssetId } }).catch(() => {});
    }
    if (testInventoryItemId) await prisma.inventoryItem.delete({ where: { id: testInventoryItemId } }).catch(() => {});
    if (testProductId) await prisma.product.delete({ where: { id: testProductId } }).catch(() => {});

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runInventorySectionTests();
