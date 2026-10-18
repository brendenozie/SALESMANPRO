/**
 * School Documents PDF Generation Automated Test Suite
 * Validates School Fee Invoices, School Fee Receipts, and Academic Report Cards
 */

import { generateDocument } from "../lib/documents/engine";
import {
  InvoiceDocumentData,
  ReceiptDocumentData,
  StudentReportDocumentData,
} from "../lib/documents/types";
import fs from "fs";
import path from "path";

async function runSchoolTestSuite() {
  console.log("===============================================================================");
  console.log("    SALESMANPRO SCHOOL PDF SYSTEM (FEES & REPORT CARDS) — TEST SUITE           ");
  console.log("===============================================================================\n");

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  const assert = (condition: boolean, testName: string, details?: string) => {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  [PASS] ${testName}`);
    } else {
      failedTests++;
      console.error(`  [FAIL] ${testName} ${details ? `— ${details}` : ""}`);
    }
  };

  const outputDir = path.join(process.cwd(), "scratch", "pdf-test-output", "school");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Realistic School Profile
  const sampleSchoolBranding = {
    name: "St. Augustine Premier Academy",
    tagline: "Fostering Academic Excellence, Moral Integrity & Leadership",
    address: "Riverside Educational Complex, P.O. Box 48201-00100, Nairobi, Kenya",
    city: "Nairobi",
    state: "Nairobi County",
    country: "Kenya",
    contactEmail: "admissions@staugustineacademy.ac.ke",
    contactPhone: "+254 711 987 654",
    website: "https://staugustineacademy.ac.ke",
    taxPin: "P051874291X",
    registrationNumber: "MOE/PRI/2018/0442",
    currency: "KES",
    primaryColor: "#1E3A8A", // Collegiate Navy
    accentColor: "#C5A059", // Antique Gold
    paymentInstructions: "Payable via M-Pesa Paybill or Direct Bank Deposit. Quote Student Adm No. as Account Reference.",
    mpesaShortcode: "Paybill: 882910 | Acc: ADM-2024-0089",
    bankDetails: "Equity Bank Kenya | Acc: 0180293847102 | Upper Hill Branch",
  };

  // Sample School Fee Invoice Data
  const sampleFeeInvoiceData: InvoiceDocumentData = {
    documentType: "INVOICE",
    templateId: "fee-invoice-academic",
    company: sampleSchoolBranding,
    invoiceNumber: "FEE-2026-TERM1-0089",
    issueDate: "2026-10-18",
    dueDate: "2026-11-15",
    status: "PARTIALLY_PAID",
    orderReference: "TERM 1 (2026/2027 ACADEMIC YEAR)",
    customer: {
      name: "Brian Kiprop Cheruiyot",
      email: "cheruiyot.family@gmail.com",
      phone: "+254 722 345 678",
      billingAddress: "Admission No: ADM-2024-0089 • Grade 8 St. Peters • Guardian: Dr. Raymond Cheruiyot",
    },
    items: [
      { description: "Tuition & Instruction Levy (Term 1)", quantity: 1, unitPrice: 38000, lineTotal: 38000 },
      { description: "Science Laboratory & Practical Materials", quantity: 1, unitPrice: 4500, lineTotal: 4500 },
      { description: "ICT & Digital Learning Resource Center", quantity: 1, unitPrice: 3500, lineTotal: 3500 },
      { description: "Co-Curricular, Sports & Swimming Facility", quantity: 1, unitPrice: 3000, lineTotal: 3000 },
      { description: "Nutritious Mid-Morning Snack & Balanced Lunch", quantity: 1, unitPrice: 12000, lineTotal: 12000 },
      { description: "Annual School Health & Medical Insurance Cover", quantity: 1, unitPrice: 2500, lineTotal: 2500 },
    ],
    subtotal: 63500,
    discountTotal: 0,
    taxTotal: 0,
    grandTotal: 63500,
    amountPaid: 35000,
    amountDue: 28500,
    notes: "Official Fee Assessment for Term 1 (2026/2027). Installment plans must be approved by the Bursar.",
    terms: "All fees must be settled in full before the mid-term assessment. Quote student Admission No. as payment reference.",
    footerText: "Official School Fee Assessment — St. Augustine Premier Academy",
  };

  // Sample School Fee Payment Receipt Data
  const sampleFeeReceiptData: ReceiptDocumentData = {
    documentType: "PAYMENT_RECEIPT",
    templateId: "fee-receipt-standard",
    company: sampleSchoolBranding,
    receiptNumber: "FRCP-2026-00412",
    paymentDate: "2026-10-18",
    paymentMethod: "M-Pesa Express",
    transactionReference: "QJK7849X12",
    invoiceReference: "FEE-2026-TERM1-0089",
    customer: {
      name: "Brian Kiprop Cheruiyot (Adm: ADM-2024-0089)",
      phone: "+254 722 345 678",
      email: "cheruiyot.family@gmail.com",
    },
    items: [
      { description: "Term 1 Tuition Fee Installment (M-Pesa QJK7849X12)", quantity: 1, unitPrice: 35000, lineTotal: 35000 },
    ],
    amountPaid: 35000,
    subtotal: 35000,
    outstandingBalance: 28500,
    cashierName: "Mrs. Caroline Wanjiku (Senior Bursar)",
    notes: "Fee installment credited for student Brian Kiprop (ADM-2024-0089). Remaining balance KES 28,500.",
    footerText: "Official School Fee Payment Receipt — St. Augustine Premier Academy",
  };

  // Sample Academic Report Card Data
  const sampleReportCardData: StudentReportDocumentData = {
    documentType: "STUDENT_REPORT",
    templateId: "student-report-classic",
    school: {
      ...sampleSchoolBranding,
      motto: "Excellence in Knowledge, Character & Service",
      registrationNumber: "MOE/PRI/2018/0442",
      principalName: "Sr. Scholastica Namukolo, Ph.D.",
    },
    student: {
      id: "stu-0089",
      admissionNumber: "ADM-2024-0089",
      name: "Brian Kiprop Cheruiyot",
      currentClass: "Grade 8 St. Peters",
      stream: "St. Peters (East Wing)",
      academicLevel: "JUNIOR_SECONDARY",
      gender: "Male",
      dob: "2012-05-14",
    },
    term: {
      id: "term-1-2026",
      name: "Term 1 Assessment",
      year: "2026",
    },
    results: [
      { subject: "Mathematics & Pre-Algebra", code: "MAT-801", assignmentsScore: 28, examScore: 64, totalScore: 92, grade: "A", description: "Exceptional", teacherRemarks: "Demonstrates advanced analytical & problem-solving abilities." },
      { subject: "Integrated Science & Biology", code: "SCI-802", assignmentsScore: 26, examScore: 61, totalScore: 87, grade: "A", description: "Excellent", teacherRemarks: "Strong conceptual understanding during laboratory practicals." },
      { subject: "English Language & Literature", code: "ENG-803", assignmentsScore: 25, examScore: 57, totalScore: 82, grade: "A", description: "Excellent", teacherRemarks: "Superb essay writing, articulate expression, and extensive vocabulary." },
      { subject: "Kiswahili Lugha na Fasihi", code: "KIS-804", assignmentsScore: 24, examScore: 54, totalScore: 78, grade: "B+", description: "Very Good", teacherRemarks: "Ufahamu na insha vimeimarika sana muhula huu." },
      { subject: "Social Studies & History", code: "SST-805", assignmentsScore: 27, examScore: 58, totalScore: 85, grade: "A", description: "Excellent", teacherRemarks: "Keen interest in civic governance and world historical developments." },
      { subject: "Computer Science & Robotics", code: "ICT-806", assignmentsScore: 30, examScore: 65, totalScore: 95, grade: "A", description: "Exceptional", teacherRemarks: "Top of class in Python logic and microcontroller automation projects." },
      { subject: "Creative Arts, Music & Design", code: "ART-807", assignmentsScore: 25, examScore: 56, totalScore: 81, grade: "A", description: "Excellent", teacherRemarks: "Exemplary precision in technical sketching and design portfolio." },
      { subject: "Physical & Health Education", code: "PHE-808", assignmentsScore: 26, examScore: 62, totalScore: 88, grade: "A", description: "Excellent", teacherRemarks: "Outstanding discipline and sportsmanship on the track and pitch." },
    ],
    summary: {
      totalMarks: 688,
      maxPossibleMarks: 800,
      average: 86.0,
      overallGrade: "A",
      classRank: 2,
      totalStudents: 44,
      attendance: {
        presentDays: 68,
        absentDays: 2,
        totalDays: 70,
        attendanceRate: 97,
      },
      classTeacherComment: "Brian is a stellar, focused, and polite student who consistently leads by example.",
      principalComment: "An outstanding term performance reflecting intellectual rigor, diligence, and fine character. Keep it up!",
      nextTermBegins: "Tuesday, 5th January 2027",
    },
    signatures: {
      classTeacherSignature: "Mr. Dennis Mutua (Class Master)",
      principalSignature: "Sr. Scholastica Namukolo, Ph.D. (Head of Institution)",
      showGuardianAck: true,
    },
    footerText: "Official Academic Report Card — St. Augustine Premier Academy",
  };

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 1: SCHOOL FEE INVOICES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 1] Generating School Fee Invoices...");

  try {
    const resAcademic = await generateDocument({
      type: "STUDENT_FEE_INVOICE",
      companyId: "st-augustine-school",
      sourceId: "inv-fee-001",
      templateId: "fee-invoice-academic",
      sampleData: sampleFeeInvoiceData,
      isPreview: true,
    });

    assert(Buffer.isBuffer(resAcademic.buffer), "Fee Invoice (Academic Classic) generates a valid Buffer");
    assert(resAcademic.buffer.length > 5000, `Fee Invoice size is substantial (${(resAcademic.buffer.length / 1024).toFixed(1)} KB)`);
    assert(resAcademic.contentType === "application/pdf", "Fee Invoice Content-Type is application/pdf");
    assert(resAcademic.fileName.startsWith("SchoolFeeInvoice-"), `File name has proper prefix: ${resAcademic.fileName}`);

    fs.writeFileSync(path.join(outputDir, "SchoolFeeInvoice-AcademicClassic.pdf"), resAcademic.buffer);
  } catch (err: any) {
    assert(false, "Fee Invoice (Academic Classic) execution error", err.message);
  }

  try {
    const resModern = await generateDocument({
      type: "STUDENT_FEE_INVOICE",
      companyId: "st-augustine-school",
      sourceId: "inv-fee-002",
      templateId: "fee-invoice-modern",
      sampleData: sampleFeeInvoiceData,
      isPreview: true,
    });

    assert(Buffer.isBuffer(resModern.buffer), "Fee Invoice (Modern Card) generates a valid Buffer");
    fs.writeFileSync(path.join(outputDir, "SchoolFeeInvoice-ModernCard.pdf"), resModern.buffer);
  } catch (err: any) {
    assert(false, "Fee Invoice (Modern Card) execution error", err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 2: SCHOOL FEE RECEIPTS (A4 & THERMAL ROLL)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 2] Generating School Fee Receipts (A4 & Thermal POS)...");

  try {
    const resReceiptA4 = await generateDocument({
      type: "STUDENT_FEE_RECEIPT",
      companyId: "st-augustine-school",
      sourceId: "rcp-fee-001",
      templateId: "fee-receipt-standard",
      sampleData: sampleFeeReceiptData,
      isPreview: true,
    });

    assert(Buffer.isBuffer(resReceiptA4.buffer), "Fee Receipt (Standard A4) generates a valid Buffer");
    assert(resReceiptA4.fileName.startsWith("SchoolFeeReceipt-"), `File name starts with SchoolFeeReceipt: ${resReceiptA4.fileName}`);
    fs.writeFileSync(path.join(outputDir, "SchoolFeeReceipt-StandardA4.pdf"), resReceiptA4.buffer);
  } catch (err: any) {
    assert(false, "Fee Receipt (Standard A4) execution error", err.message);
  }

  try {
    const resReceipt80mm = await generateDocument({
      type: "STUDENT_FEE_RECEIPT",
      companyId: "st-augustine-school",
      sourceId: "rcp-fee-002",
      templateId: "fee-receipt-thermal",
      pageSize: "THERMAL_80MM",
      sampleData: { ...sampleFeeReceiptData, isThermal: true, paperWidth: "80mm" },
      isPreview: true,
    });

    assert(Buffer.isBuffer(resReceipt80mm.buffer), "Fee Receipt (80mm Thermal Roll) generates a valid Buffer");
    fs.writeFileSync(path.join(outputDir, "SchoolFeeReceipt-Thermal80mm.pdf"), resReceipt80mm.buffer);
  } catch (err: any) {
    assert(false, "Fee Receipt (80mm Thermal Roll) execution error", err.message);
  }

  try {
    const resReceipt58mm = await generateDocument({
      type: "STUDENT_FEE_RECEIPT",
      companyId: "st-augustine-school",
      sourceId: "rcp-fee-003",
      templateId: "fee-receipt-thermal",
      pageSize: "THERMAL_58MM",
      sampleData: { ...sampleFeeReceiptData, isThermal: true, paperWidth: "58mm" },
      isPreview: true,
    });

    assert(Buffer.isBuffer(resReceipt58mm.buffer), "Fee Receipt (58mm Thermal Roll) generates a valid Buffer");
    fs.writeFileSync(path.join(outputDir, "SchoolFeeReceipt-Thermal58mm.pdf"), resReceipt58mm.buffer);
  } catch (err: any) {
    assert(false, "Fee Receipt (58mm Thermal Roll) execution error", err.message);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEST GROUP 3: ACADEMIC REPORT CARDS ACROSS ALL 3 STYLES
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n[TEST GROUP 3] Generating Academic Report Cards (3 Distinct Styles)...");

  try {
    const resClassic = await generateDocument({
      type: "STUDENT_REPORT",
      companyId: "st-augustine-school",
      sourceId: "rep-001",
      templateId: "student-report-classic",
      sampleData: sampleReportCardData,
      isPreview: true,
    });

    assert(Buffer.isBuffer(resClassic.buffer), "Report Card (Classic Academic Crest) generates a valid Buffer");
    assert(resClassic.fileName.startsWith("ReportCard-"), `Report Card filename has correct prefix: ${resClassic.fileName}`);
    fs.writeFileSync(path.join(outputDir, "ReportCard-ClassicCrest.pdf"), resClassic.buffer);
  } catch (err: any) {
    assert(false, "Report Card (Classic Academic Crest) execution error", err.message);
  }

  try {
    const resModern = await generateDocument({
      type: "STUDENT_REPORT",
      companyId: "st-augustine-school",
      sourceId: "rep-002",
      templateId: "student-report-modern",
      sampleData: { ...sampleReportCardData, templateId: "student-report-modern" },
      isPreview: true,
    });

    assert(Buffer.isBuffer(resModern.buffer), "Report Card (Modern CBC Progress) generates a valid Buffer");
    fs.writeFileSync(path.join(outputDir, "ReportCard-ModernCBC.pdf"), resModern.buffer);
  } catch (err: any) {
    assert(false, "Report Card (Modern CBC Progress) execution error", err.message);
  }

  try {
    const resDetailed = await generateDocument({
      type: "STUDENT_REPORT",
      companyId: "st-augustine-school",
      sourceId: "rep-003",
      templateId: "student-report-detailed",
      sampleData: { ...sampleReportCardData, templateId: "student-report-detailed" },
      isPreview: true,
    });

    assert(Buffer.isBuffer(resDetailed.buffer), "Report Card (Comprehensive STEM & Honours) generates a valid Buffer");
    fs.writeFileSync(path.join(outputDir, "ReportCard-ComprehensiveSTEM.pdf"), resDetailed.buffer);
  } catch (err: any) {
    assert(false, "Report Card (Comprehensive STEM & Honours) execution error", err.message);
  }

  console.log("\n===============================================================================");
  console.log(`  SCHOOL PDF TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log("===============================================================================\n");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runSchoolTestSuite().catch((err) => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
