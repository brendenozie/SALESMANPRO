/**
 * Student Report Card PDF Renderers
 * 1. Academic Excellence (Classic Crest) — student-report-classic
 *    - Oxford/Cambridge crest style, navy & gold, embossed border, subject breakdown, class rank, attendance badge, grading scale table, teacher/principal remarks with authorized stamp/signature.
 * 2. Modern Holistic / CBC Progress — student-report-modern
 *    - Contemporary emerald & royal blue, learning areas, formative + summative competencies, proficiency badges, metric cards, radar/performance summary, principal sign-off.
 * 3. Comprehensive Term Assessment & Honours — student-report-detailed
 *    - High visual hierarchy, credit hours, GPA/ranking, grade distribution legend, scannable QR verification code for parent/institution verification, guardian acknowledgment cut-slip.
 */

import { jsPDF } from "jspdf";
import { StudentReportDocumentData } from "../types";
import {
  callAutoTable,
  addPageNumbersAndFooters,
  drawInfoCard,
  drawQrCode,
  drawSignatureBlock,
  hexToRgb,
  generateQrCodeDataUrl,
  resolveImageBase64,
} from "../pdfUtils";

/**
 * 1. Academic Excellence (Classic Crest) School Report
 */
export async function renderStudentReportClassic(data: StudentReportDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = hexToRgb(data.school.primaryColor || "#1E3A8A"); // Collegiate Navy
  const goldColor: [number, number, number] = [197, 160, 89]; // Antique Gold

  // School Crest / Logo (Left) + School Title (Center/Right)
  const logoData = await resolveImageBase64(data.school.logoUrl);
  if (logoData) {
    try {
      doc.addImage(logoData.dataUrl, logoData.format, 14, 10, 22, 22);
    } catch {
      // Fallback: draw gold emblem box
      doc.setFillColor(...primaryColor);
      doc.roundedRect(14, 10, 22, 22, 2, 2, "F");
      doc.setFont("times", "bold");
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text(data.school.name.slice(0, 2).toUpperCase(), 25, 24, { align: "center" });
    }
  } else {
    doc.setFillColor(...primaryColor);
    doc.roundedRect(14, 10, 22, 22, 2, 2, "F");
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(data.school.name.slice(0, 2).toUpperCase(), 25, 24, { align: "center" });
  }

  // School Header
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...primaryColor);
  doc.text(data.school.name.toUpperCase(), 40, 16);

  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.setTextColor(...goldColor);
  if (data.school.motto) {
    doc.text(`"${data.school.motto}"`, 40, 21);
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const schoolContact = [
    data.school.address,
    data.school.contactPhone ? `Tel: ${data.school.contactPhone}` : "",
    data.school.contactEmail ? `Email: ${data.school.contactEmail}` : "",
    data.school.registrationNumber ? `Reg: ${data.school.registrationNumber}` : "",
  ].filter(Boolean).join("  •  ");
  doc.text(schoolContact, 40, 26, { maxWidth: pageWidth - 54 });

  // Subheader banner (Navy with Gold Edge)
  doc.setFillColor(...primaryColor);
  doc.rect(14, 34, pageWidth - 28, 7.5, "F");
  doc.setFillColor(...goldColor);
  doc.rect(14, 41.5, pageWidth - 28, 0.8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `OFFICIAL STUDENT ACADEMIC REPORT CARD — ${data.term.name.toUpperCase()} (${data.term.year})`,
    pageWidth / 2,
    39,
    { align: "center" }
  );

  // Student Profile & Academic Placement Cards
  const studentCol1 = [
    `Student Name: ${data.student.name}`,
    `Admission Number: ${data.student.admissionNumber}`,
    data.student.currentClass ? `Class: ${data.student.currentClass}` : "",
    data.student.dob ? `Date of Birth: ${data.student.dob}` : "",
  ].filter(Boolean);

  const studentCol2 = [
    data.student.stream ? `Stream: ${data.student.stream}` : "",
    data.student.academicLevel ? `Academic Level: ${data.student.academicLevel}` : "",
    `Class Rank: ${data.summary.classRank ? `#${data.summary.classRank} of ${data.summary.totalStudents || "—"}` : "—"}`,
    `Term Attendance: ${data.summary.attendance.attendanceRate}% (${data.summary.attendance.presentDays}/${data.summary.attendance.totalDays} Days)`,
  ].filter(Boolean);

  const cardW = (pageWidth - 32) / 2;
  drawInfoCard(doc, 14, 45, cardW, 25, "Student Identification", studentCol1);
  drawInfoCard(doc, 14 + cardW + 4, 45, cardW, 25, "Academic Placement", studentCol2);

  // Academic Results Table
  const tableRows = data.results.map((r) => [
    r.code || "—",
    r.subject,
    r.assignmentsScore !== undefined ? `${r.assignmentsScore}` : "—",
    r.examScore !== undefined ? `${r.examScore}` : "—",
    `${r.totalScore}%`,
    r.grade,
    r.classAverage !== undefined ? `${r.classAverage}%` : "—",
    r.teacherRemarks || r.description || "Satisfactory",
  ]);

  callAutoTable(doc, {
    startY: 73,
    head: [["Code", "Subject / Learning Area", "CAT", "Exam", "Total", "Grade", "Avg", "Faculty Assessment"]],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 16, font: "courier", fontSize: 7.5 },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 14 },
      7: { cellWidth: 54, fontSize: 7.5 },
    },
    styles: { fontSize: 7.5, cellPadding: 2.1 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Academic Summary Card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const avgText = `Mean Score: ${data.summary.average}%   |   Mean Grade: ${data.summary.overallGrade}   |   Aggregate: ${data.summary.totalMarks}/${data.summary.maxPossibleMarks}`;
  doc.text(avgText, pageWidth / 2, finalY + 5.5, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const attendText = `Days Present: ${data.summary.attendance.presentDays} Days   •   Absences: ${data.summary.attendance.absentDays} Days   •   Attendance Rate: ${data.summary.attendance.attendanceRate}%${
    data.summary.nextTermBegins ? `   •   Next Term Begins: ${data.summary.nextTermBegins}` : ""
  }`;
  doc.text(attendText, pageWidth / 2, finalY + 10.5, { align: "center" });

  // Narrative Comments Area
  let commentY = finalY + 20;

  if (data.summary.classTeacherComment) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text("CLASS TEACHER'S OBSERVATIONS:", 14, commentY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitTeacher = doc.splitTextToSize(`"${data.summary.classTeacherComment}"`, pageWidth - 46);
    doc.text(splitTeacher, 14, commentY + 4);
    commentY += splitTeacher.length * 3.5 + 6;
  }

  if (data.summary.principalComment) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text("PRINCIPAL / HEADTEACHER'S ASSESSMENT:", 14, commentY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    const splitPrin = doc.splitTextToSize(`"${data.summary.principalComment}"`, pageWidth - 46);
    doc.text(splitPrin, 14, commentY + 4);
  }

  // QR Code for Academic Verification (Right side of comments)
  const qrUrl = data.verificationUrl || `https://salesmanpro.com/verify/report-card/${data.student.admissionNumber}?term=${encodeURIComponent(data.term.name)}`;
  const qrDataUrl = await generateQrCodeDataUrl(qrUrl);
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, pageWidth - 36, finalY + 17, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Scan to Verify", pageWidth - 25, finalY + 41, { align: "center" });
  }

  // Dual Signature Lines
  drawSignatureBlock(
    doc,
    14,
    pageHeight - 24,
    pageWidth - 28,
    data.signatures.classTeacherSignature || "Class Teacher Signature",
    data.signatures.principalSignature || "Principal Signature & Stamp"
  );

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 2. Modern Holistic CBC / Competency Progress Report Card
 */
export async function renderStudentReportModern(data: StudentReportDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const royalViolet: [number, number, number] = [126, 34, 206]; // Purple 700

  // Modern Purple Top Header Banner
  doc.setFillColor(...royalViolet);
  doc.rect(0, 0, pageWidth, 34, "F");

  // Logo / Emblem inside header
  const logoData = await resolveImageBase64(data.school.logoUrl);
  if (logoData) {
    try {
      doc.addImage(logoData.dataUrl, logoData.format, 14, 6, 22, 22);
    } catch {}
  }

  const titleX = logoData ? 40 : 14;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text(data.school.name, titleX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(233, 213, 255); // Purple 200
  doc.text(`${data.term.name} • Academic Year ${data.term.year} • Holistic Competency Evaluation`, titleX, 22);

  // Student Hero Badge (Right Header)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(data.student.name, pageWidth - 14, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(233, 213, 255);
  doc.text(`Adm: ${data.student.admissionNumber} | Class: ${data.student.currentClass || "—"}`, pageWidth - 14, 22, {
    align: "right",
  });

  // KPI Metric Cards Strip
  const cardW = (pageWidth - 36) / 3;
  const cardH = 17;
  const cardY = 38;

  // Card 1: Average GPA
  doc.setFillColor(250, 245, 255); // Purple 50
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(126, 34, 206);
  doc.text("MEAN SCORE & GRADE", 18, cardY + 5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.summary.average}% (${data.summary.overallGrade})`, 18, cardY + 12);

  // Card 2: Attendance
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(14 + cardW + 4, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(15, 118, 110);
  doc.text("TERM ATTENDANCE", 18 + cardW + 4, cardY + 5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.summary.attendance.attendanceRate}% (${data.summary.attendance.presentDays} Days)`, 18 + cardW + 4, cardY + 12);

  // Card 3: Class Rank
  doc.setFillColor(255, 251, 235); // Amber 50
  doc.setDrawColor(254, 243, 199);
  doc.roundedRect(14 + (cardW + 4) * 2, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(180, 83, 9);
  doc.text("CLASS RANKING", 18 + (cardW + 4) * 2, cardY + 5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(
    data.summary.classRank ? `Rank #${data.summary.classRank} / ${data.summary.totalStudents || "—"}` : "Unranked",
    18 + (cardW + 4) * 2,
    cardY + 12
  );

  // Subject Table
  const tableRows = data.results.map((r, idx) => [
    (idx + 1).toString(),
    r.subject,
    `${r.totalScore}%`,
    r.grade,
    r.description || "Good",
    r.teacherRemarks || "Consistent progress demonstrated.",
  ]);

  callAutoTable(doc, {
    startY: 60,
    head: [["#", "Learning Area / Subject", "Score", "Level", "Competency Rubric", "Facilitator Remarks"]],
    body: tableRows,
    headStyles: {
      fillColor: royalViolet,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 46, fontStyle: "bold" },
      2: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 32 },
      5: { cellWidth: "auto", fontSize: 7.5 },
    },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Comments & QR Code Box
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...royalViolet);
  doc.text("FACULTY OBSERVATIONS & VALUE ASSESSMENT", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  const narrative = [
    data.summary.classTeacherComment ? `Teacher: "${data.summary.classTeacherComment}"` : "",
    data.summary.principalComment ? `Principal: "${data.summary.principalComment}"` : "",
    data.summary.nextTermBegins ? `Next Academic Term Begins: ${data.summary.nextTermBegins}` : "",
  ].filter(Boolean).join("\n");

  const splitNarrative = doc.splitTextToSize(narrative, pageWidth - 48);
  doc.text(splitNarrative, 14, finalY + 4.5);

  // Scannable Verification QR Code
  const qrDataUrl = await generateQrCodeDataUrl(
    `https://salesmanpro.com/verify/report-card/${data.student.admissionNumber}`
  );
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, pageWidth - 36, finalY - 2, 22);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(5.5);
    doc.setTextColor(148, 163, 184);
    doc.text("Scan to Authenticate", pageWidth - 25, finalY + 22, { align: "center" });
  }

  // Signatures
  drawSignatureBlock(
    doc,
    14,
    pageHeight - 24,
    pageWidth - 28,
    "Class Teacher Endorsement",
    "Head of Institution Stamp & Seal"
  );

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 3. Comprehensive Term Assessment & Honours Transcript (STEM & Detailed)
 */
export async function renderStudentReportDetailed(data: StudentReportDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tealColor: [number, number, number] = [15, 118, 110]; // Teal 700

  // Formal Outer Double Border
  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);
  doc.setLineWidth(0.2);
  doc.rect(9.5, 9.5, pageWidth - 19, pageHeight - 19);

  // Institution Banner with Logo
  const logoData = await resolveImageBase64(data.school.logoUrl);
  if (logoData) {
    try {
      doc.addImage(logoData.dataUrl, logoData.format, 14, 12, 18, 18);
    } catch {}
  }

  const titleX = logoData ? 36 : 14;
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...tealColor);
  doc.text(data.school.name.toUpperCase(), titleX, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Official Comprehensive Academic Transcript • Reg: ${data.school.registrationNumber || "Ministry Approved"} • ${data.term.name} (${data.term.year})`,
    titleX,
    23
  );

  // Student Strip
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.rect(14, 28, pageWidth - 28, 11, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...tealColor);
  doc.text(`CANDIDATE: ${data.student.name}`, 18, 35);
  doc.text(`ADM: ${data.student.admissionNumber}`, 85, 35);
  doc.text(`CLASS: ${data.student.currentClass || "—"}`, 135, 35);
  doc.text(`MEAN: ${data.summary.average}% (${data.summary.overallGrade})`, pageWidth - 18, 35, { align: "right" });

  // Subject Table
  const tableRows = data.results.map((r) => [
    r.code || "—",
    r.subject,
    r.assignmentsScore !== undefined ? `${r.assignmentsScore}` : "—",
    r.examScore !== undefined ? `${r.examScore}` : "—",
    `${r.totalScore}%`,
    r.grade,
    r.classAverage !== undefined ? `${r.classAverage}%` : "—",
    r.teacherRemarks || r.description || "Good",
  ]);

  callAutoTable(doc, {
    startY: 42,
    head: [["Code", "Subject Curriculum", "Coursework", "Final Exam", "Aggregate", "Grade", "Cohort Avg", "Faculty Remarks"]],
    body: tableRows,
    headStyles: {
      fillColor: tealColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 16, font: "courier", fontSize: 7 },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 16 },
      3: { halign: "center", cellWidth: 16 },
      4: { halign: "center", cellWidth: 16, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 16 },
      7: { cellWidth: 50, fontSize: 7 },
    },
    styles: { fontSize: 7.5, cellPadding: 2.1 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Grading Key Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, pageWidth - 28, 9, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "GRADING KEY:  A+ (90-100% Exceptional)  •  A (80-89% Excellent)  •  B+ (75-79% Very Good)  •  B (65-74% Good)  •  C (50-64% Satisfactory)  •  D (40-49% Pass)  •  E/F (<40% Needs Support)",
    pageWidth / 2,
    finalY + 5.5,
    { align: "center" }
  );

  // Verification QR Code
  const qrDataUrl = await generateQrCodeDataUrl(
    `https://salesmanpro.com/verify/transcript/${data.student.admissionNumber}`
  );
  if (qrDataUrl) {
    drawQrCode(doc, qrDataUrl, 14, finalY + 11, 18);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Official electronic institutional assessment record.", 35, finalY + 18);
    doc.text("Tamper-evident verification via SalesmanPro Education Network.", 35, finalY + 22);
  }

  // Parent / Guardian Acknowledgment Perforated Slip at Bottom
  const slipY = pageHeight - 34;
  doc.setDrawColor(180, 180, 180);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(14, slipY - 3, pageWidth - 14, slipY - 3);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6);
  doc.setTextColor(140, 140, 140);
  doc.text("✂ Tear or detach here — Return signed parent/guardian slip to school administration", 14, slipY - 0.5);

  doc.setDrawColor(203, 213, 225);
  doc.line(14, slipY + 16, 65, slipY + 16);
  doc.line(75, slipY + 16, 125, slipY + 16);
  doc.line(135, slipY + 16, pageWidth - 14, slipY + 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Class Teacher Sign & Date", 14, slipY + 20);
  doc.text("Principal / Head of Institution", 75, slipY + 20);
  doc.text("Parent / Guardian Acknowledgment", 135, slipY + 20);

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}
