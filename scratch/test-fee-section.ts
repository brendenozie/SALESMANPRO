import prisma from "../server/db/prismadb";

const COMPANY_ID = "683581bba1bdf6ca3624b530"; // Mount Moriah International School

async function runFeeSectionTests() {
  console.log("=== STARTING SECTION 9: FEES & FINANCIAL OPERATIONS TEST ===");
  const testRunId = `TEST-FEE-${Date.now()}`;

  let testFeeItemId: string | null = null;
  let testFeeStructureId: string | null = null;
  let testStudentId: string | null = null;
  let testFeeRecordId: string | null = null;
  let testExpenseId: string | null = null;

  try {
    // -------------------------------------------------------------
    // 0. Setup: Ensure a test student exists in company
    // -------------------------------------------------------------
    console.log("\n[0] Ensuring active student exists for invoice & payment test...");
    let student = await prisma.student.findFirst({
      where: { companyId: COMPANY_ID },
    });

    if (!student) {
      console.log("Creating temporary student for fee tests...");
      student = await prisma.student.create({
        data: {
          companyId: COMPANY_ID,
          firstName: "FinanceTest",
          lastName: "Student",
          admissionNumber: `ADM-${Date.now().toString().slice(-4)}`,
          status: "ACTIVE",
          currentClass: "Grade 10",
        },
      });
      testStudentId = student.id;
    }
    console.log(`✓ Student ready: ${student.firstName} ${student.lastName} (${student.id})`);

    // -------------------------------------------------------------
    // 1. Fee Item CRUD (app/admin/[slug]/fee-items)
    // -------------------------------------------------------------
    console.log("\n[1] Testing Fee Item CRUD...");
    const feeItemName = `Tech Lab Fee ${testRunId}`;
    const feeItem = await prisma.feeItem.create({
      data: {
        companyId: COMPANY_ID,
        name: feeItemName,
        description: "Annual laboratory computing resources",
        defaultAmount: 350.0,
        currency: "USD",
        applicableTo: "ALL",
        isMandatory: true,
        academicYear: "2026/2027",
        term: "Term 1",
      },
    });
    testFeeItemId = feeItem.id;
    console.log(`✓ Fee Item Created: ${feeItem.name} ($${feeItem.defaultAmount}) - ID: ${feeItem.id}`);

    // Verify Read
    const readFeeItem = await prisma.feeItem.findUnique({
      where: { id: testFeeItemId },
    });
    if (!readFeeItem || readFeeItem.defaultAmount !== 350.0) {
      throw new Error("FeeItem read verification failed");
    }
    console.log("✓ Fee Item Read verified");

    // Update
    const updatedFeeItem = await prisma.feeItem.update({
      where: { id: testFeeItemId },
      data: {
        defaultAmount: 420.0,
        description: "Updated computing and network resources",
      },
    });
    if (updatedFeeItem.defaultAmount !== 420.0) {
      throw new Error("FeeItem update verification failed");
    }
    console.log(`✓ Fee Item Updated: New amount $${updatedFeeItem.defaultAmount}`);

    // -------------------------------------------------------------
    // 2. Fee Structure CRUD (app/admin/[slug]/fee-structure)
    // -------------------------------------------------------------
    console.log("\n[2] Testing Fee Structure CRUD...");
    const structureName = `Senior Tuition Group ${testRunId}`;
    const feeStructure = await prisma.feeStructure.create({
      data: {
        companyId: COMPANY_ID,
        name: structureName,
        year: "2026/2027",
        term: "Term 1",
        amount: 1500.0,
        items: {
          create: [
            { name: "Core Tuition", amount: 1200.0, isOptional: false },
            { name: "Library & Tech", amount: 300.0, isOptional: false },
          ],
        },
      },
      include: { items: true },
    });
    testFeeStructureId = feeStructure.id;
    console.log(`✓ Fee Structure Created: ${feeStructure.name} ($${feeStructure.amount}) with ${feeStructure.items.length} items`);

    // Verify Read
    const readStructure = await prisma.feeStructure.findUnique({
      where: { id: testFeeStructureId },
      include: { items: true },
    });
    if (!readStructure || readStructure.items.length !== 2) {
      throw new Error("FeeStructure read verification failed");
    }
    console.log("✓ Fee Structure Read with items verified");

    // Update
    const updatedStructure = await prisma.feeStructure.update({
      where: { id: testFeeStructureId },
      data: {
        amount: 1650.0,
      },
      include: { items: true },
    });
    if (updatedStructure.amount !== 1650.0) {
      throw new Error("FeeStructure update verification failed");
    }
    console.log(`✓ Fee Structure Updated: New amount $${updatedStructure.amount}`);

    // -------------------------------------------------------------
    // 3. Student Invoicing & Fee Records (app/admin/[slug]/fee-invoices & /fee)
    // -------------------------------------------------------------
    console.log("\n[3] Testing Student Invoicing & Fee Records...");
    const academicYear = "2026/2027";
    const term = `Term 1 ${testRunId}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const feeRecord = await prisma.studentFeeRecord.create({
      data: {
        studentId: student.id,
        academicYear,
        term,
        invoiceNumber,
        paymentStatus: "Unpaid",
        dueDate: "2026-10-31",
        amountPaid: 0.0,
        appliedFeeItems: [
          { feeItemId: feeItem.id, name: feeItem.name, amount: 420.0, isMandatory: true },
          { name: "General Boarding", amount: 800.0, isMandatory: true },
        ],
        payments: [],
      },
    });
    testFeeRecordId = feeRecord.id;
    console.log(`✓ Student Fee Record Created: Invoice ${invoiceNumber} for Student ${student.id} - ID: ${feeRecord.id}`);

    // Read & Validate dynamic balance calculation
    const readFeeRecord = await prisma.studentFeeRecord.findUnique({
      where: { id: testFeeRecordId },
      include: { student: true },
    });
    if (!readFeeRecord) throw new Error("FeeRecord read failed");

    const appliedItems = (readFeeRecord.appliedFeeItems as any[]) || [];
    const totalDue = appliedItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const balance = Math.max(0, totalDue - (readFeeRecord.amountPaid || 0));
    console.log(`✓ Calculated Invoice Due: $${totalDue}, Paid: $${readFeeRecord.amountPaid}, Balance: $${balance}`);

    if (totalDue !== 1220.0 || balance !== 1220.0) {
      throw new Error(`Invoice calculation mismatch: expected 1220.0, got totalDue=${totalDue}, balance=${balance}`);
    }

    // -------------------------------------------------------------
    // 4. Online Payments & Fee Transactions (app/admin/[slug]/fee-transactions)
    // -------------------------------------------------------------
    console.log("\n[4] Testing Payment Recording & Transaction Processing...");
    const paymentAmount = 500.0;
    const paymentTimestamp = Date.now().toString().slice(-6);
    const receiptNumber = `REC-2026-${paymentTimestamp}`;
    const paymentEntry = {
      paymentId: `PAY-${paymentTimestamp}`,
      receiptNumber,
      amount: paymentAmount,
      date: new Date().toISOString().slice(0, 10),
      method: "MPESA",
      reference: `MPESA-${paymentTimestamp}`,
      status: "SUCCESS",
    };

    const updatedRecordAfterPayment = await prisma.studentFeeRecord.update({
      where: { id: testFeeRecordId },
      data: {
        amountPaid: (readFeeRecord.amountPaid || 0) + paymentAmount,
        paymentStatus: "Partially Paid",
        lastPaymentDate: paymentEntry.date,
        payments: [paymentEntry],
      },
    });

    const newBalance = totalDue - updatedRecordAfterPayment.amountPaid;
    console.log(`✓ Payment Processed: Recorded $${paymentAmount} via ${paymentEntry.method}. New Amount Paid: $${updatedRecordAfterPayment.amountPaid}, New Balance: $${newBalance}, Status: ${updatedRecordAfterPayment.paymentStatus}`);

    if (updatedRecordAfterPayment.amountPaid !== 500.0 || newBalance !== 720.0) {
      throw new Error("Payment transaction balance update mismatch");
    }

    // -------------------------------------------------------------
    // 5. Expense Tracking (app/admin/[slug]/fee-expenses)
    // -------------------------------------------------------------
    console.log("\n[5] Testing Expense Tracking CRUD...");
    const expenseCode = `EXP-${Date.now().toString().slice(-5)}`;
    const expense = await prisma.expense.create({
      data: {
        companyId: COMPANY_ID,
        expenseId: expenseCode,
        category: "Laboratory Supplies",
        description: `High purity chemicals and test tubes for science dept ${testRunId}`,
        vendor: "Acme Scientific Instruments",
        amount: 280.0,
        taxAmount: 20.0,
        paymentMethod: "BANK",
        reference: `WIRE-${expenseCode}`,
        costCenter: "Academic Science",
        status: "Paid",
        date: new Date(),
        notes: "Approved by Head Teacher",
      },
    });
    testExpenseId = expense.id;
    console.log(`✓ Expense Recorded: ${expense.expenseId} ($${expense.amount}) - ID: ${expense.id}`);

    // Read Expense
    const readExpense = await prisma.expense.findUnique({
      where: { id: testExpenseId },
    });
    if (!readExpense || readExpense.amount !== 280.0) {
      throw new Error("Expense read verification failed");
    }
    console.log("✓ Expense Read verified");

    // Update Expense
    const updatedExpense = await prisma.expense.update({
      where: { id: testExpenseId },
      data: {
        amount: 310.0,
        description: "Updated order with extra glassware",
      },
    });
    if (updatedExpense.amount !== 310.0) {
      throw new Error("Expense update verification failed");
    }
    console.log(`✓ Expense Updated: New amount $${updatedExpense.amount}`);

    // -------------------------------------------------------------
    // 6. Profit & Loss Aggregate Calculation (app/admin/[slug]/fee-profit-loss)
    // -------------------------------------------------------------
    console.log("\n[6] Testing Profit & Loss Statement Live Derivation...");
    const [expensesAgg, feeRecordsForPL] = await Promise.all([
      prisma.expense.groupBy({
        by: ["category"],
        where: {
          companyId: COMPANY_ID,
          status: "Paid",
        },
        _sum: { amount: true },
      }),
      prisma.studentFeeRecord.findMany({
        where: {
          student: { companyId: COMPANY_ID },
        },
      }),
    ]);

    let totalPLIncome = 0;
    feeRecordsForPL.forEach((r) => {
      const payments = (r.payments as any[]) || [];
      payments.forEach((p) => {
        totalPLIncome += Number(p.amount) || 0;
      });
    });

    const totalPLExpenses = expensesAgg.reduce((acc, curr) => acc + (curr._sum.amount || 0), 0);
    const netSurplus = totalPLIncome - totalPLExpenses;

    console.log(`✓ Live P&L Statement Computed:`);
    console.log(`   Total Fee Income:   $${totalPLIncome.toLocaleString()}`);
    console.log(`   Total Paid Expenses: $${totalPLExpenses.toLocaleString()}`);
    console.log(`   Net Operating Position: $${netSurplus.toLocaleString()}`);
    console.log(`   Expense Categories Tracked: ${expensesAgg.length}`);

    if (totalPLIncome < 500.0) {
      throw new Error("P&L income does not include our verified payment of 500.0");
    }
    if (totalPLExpenses < 310.0) {
      throw new Error("P&L expenses do not include our verified expense of 310.0");
    }

    // -------------------------------------------------------------
    // 7. Cleanup & Delete Lifecycle Verification
    // -------------------------------------------------------------
    console.log("\n[7] Verifying Deletion Lifecycle & Cleanup...");

    // Delete Expense
    await prisma.expense.delete({ where: { id: testExpenseId } });
    const verifyDelExpense = await prisma.expense.findUnique({ where: { id: testExpenseId } });
    if (verifyDelExpense) throw new Error("Expense deletion failed");
    testExpenseId = null;
    console.log("✓ Expense deleted and absent from DB");

    // Delete Fee Record
    await prisma.studentFeeRecord.delete({ where: { id: testFeeRecordId } });
    const verifyDelRecord = await prisma.studentFeeRecord.findUnique({ where: { id: testFeeRecordId } });
    if (verifyDelRecord) throw new Error("FeeRecord deletion failed");
    testFeeRecordId = null;
    console.log("✓ StudentFeeRecord deleted and absent from DB");

    // Delete Fee Structure Items & Fee Structure
    await prisma.feeStructureItem.deleteMany({ where: { feeStructureId: testFeeStructureId } });
    await prisma.feeStructure.delete({ where: { id: testFeeStructureId } });
    const verifyDelStructure = await prisma.feeStructure.findUnique({ where: { id: testFeeStructureId } });
    if (verifyDelStructure) throw new Error("FeeStructure deletion failed");
    testFeeStructureId = null;
    console.log("✓ FeeStructure & items deleted and absent from DB");

    // Delete Fee Item
    await prisma.feeItem.delete({ where: { id: testFeeItemId } });
    const verifyDelFeeItem = await prisma.feeItem.findUnique({ where: { id: testFeeItemId } });
    if (verifyDelFeeItem) throw new Error("FeeItem deletion failed");
    testFeeItemId = null;
    console.log("✓ FeeItem deleted and absent from DB");

    // Clean up temporary student if created
    if (testStudentId) {
      await prisma.student.delete({ where: { id: testStudentId } });
      testStudentId = null;
      console.log("✓ Temporary test student cleaned up");
    }

    console.log("\n============================================================");
    console.log("🎉 ALL SECTION 9 (FEES & FINANCIAL OPERATIONS) TESTS PASSED!");
    console.log("============================================================");
  } catch (error) {
    console.error("\n❌ Section 9 Test Failed:", error);

    // Emergency cleanup
    if (testExpenseId) await prisma.expense.delete({ where: { id: testExpenseId } }).catch(() => {});
    if (testFeeRecordId) await prisma.studentFeeRecord.delete({ where: { id: testFeeRecordId } }).catch(() => {});
    if (testFeeStructureId) {
      await prisma.feeStructureItem.deleteMany({ where: { feeStructureId: testFeeStructureId } }).catch(() => {});
      await prisma.feeStructure.delete({ where: { id: testFeeStructureId } }).catch(() => {});
    }
    if (testFeeItemId) await prisma.feeItem.delete({ where: { id: testFeeItemId } }).catch(() => {});
    if (testStudentId) await prisma.student.delete({ where: { id: testStudentId } }).catch(() => {});

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runFeeSectionTests();
