/**
 * Student Report Card PDF Renderers (3 Distinct Professional School Report Designs)
 * 1. Academic Excellence (Classic Crest) — student-report-classic
 * 2. Modern Holistic Progress — student-report-modern
 * 3. Comprehensive Term Assessment — student-report-detailed
 */

import { jsPDF } from "jspdf";
import { StudentReportDocumentData } from "../types";
import {
  callAutoTable,
  addPageNumbersAndFooters,
  drawInfoCard,
  hexToRgb,
} from "../pdfUtils";

/**
 * 1. Academic Excellence (Classic Crest) School Report
 */
export function renderStudentReportClassic(data: StudentReportDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primaryColor = hexToRgb(data.school.primaryColor || "#1E3A8A"); // Navy Blue

  // Formal School Crest Header
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(data.school.name.toUpperCase(), pageWidth / 2, 18, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (data.school.motto) {
    doc.text(`"${data.school.motto}"`, pageWidth / 2, 23, { align: "center" });
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    `${data.school.address || ""} • Tel: ${data.school.contactPhone || ""} • Email: ${data.school.contactEmail || ""}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );

  // Subheader banner
  doc.setFillColor(...primaryColor);
  doc.rect(14, 32, pageWidth - 28, 8, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(255, 255, 255);
  doc.text(
    `OFFICIAL STUDENT ACADEMIC REPORT CARD — ${data.term.name.toUpperCase()} (${data.term.year})`,
    pageWidth / 2,
    37.5,
    { align: "center" }
  );

  // Student Profile Info Box
  const studentCol1 = [
    `Student Name: ${data.student.name}`,
    `Admission Number: ${data.student.admissionNumber}`,
    data.student.currentClass ? `Class: ${data.student.currentClass}` : "",
  ].filter(Boolean);

  const studentCol2 = [
    data.student.stream ? `Stream: ${data.student.stream}` : "",
    data.student.academicLevel ? `Level: ${data.student.academicLevel}` : "",
    `Class Rank: ${data.summary.classRank ? `${data.summary.classRank} of ${data.summary.totalStudents || "—"}` : "—"}`,
    `Term Attendance: ${data.summary.attendance.attendanceRate}% (${data.summary.attendance.presentDays}/${data.summary.attendance.totalDays} Days)`,
  ].filter(Boolean);

  drawInfoCard(doc, 14, 43, (pageWidth - 32) / 2, 24, "Student Profile", studentCol1);
  drawInfoCard(
    doc,
    14 + (pageWidth - 32) / 2 + 4,
    43,
    (pageWidth - 32) / 2,
    24,
    "Academic Placement",
    studentCol2
  );

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
    startY: 70,
    head: [["Code", "Subject / Learning Area", "Assgn", "Exam", "Total", "Grade", "Avg", "Teacher Remarks"]],
    body: tableRows,
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "left",
    },
    columnStyles: {
      0: { cellWidth: 18, font: "courier", fontSize: 7.5 },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { halign: "center", cellWidth: 14 },
      3: { halign: "center", cellWidth: 14 },
      4: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      5: { halign: "center", cellWidth: 14, fontStyle: "bold" },
      6: { halign: "center", cellWidth: 14 },
      7: { cellWidth: 55, fontSize: 7.5 },
    },
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 5;

  // Academic Summary Card
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, finalY, pageWidth - 28, 14, 1.5, 1.5, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  const avgText = `Overall Mean Score: ${data.summary.average}%   |   Mean Grade: ${data.summary.overallGrade}   |   Total Marks: ${data.summary.totalMarks}/${data.summary.maxPossibleMarks}`;
  doc.text(avgText, pageWidth / 2, finalY + 6, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const attendText = `Days Present: ${data.summary.attendance.presentDays} Days   •   Days Absent: ${data.summary.attendance.absentDays} Days   •   Term Attendance Rate: ${data.summary.attendance.attendanceRate}%`;
  doc.text(attendText, pageWidth / 2, finalY + 11, { align: "center" });

  // Narrative Comments Area
  let commentY = finalY + 22;

  if (data.summary.classTeacherComment) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text("CLASS TEACHER'S REMARKS:", 14, commentY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitTeacher = doc.splitTextToSize(`"${data.summary.classTeacherComment}"`, pageWidth - 28);
    doc.text(splitTeacher, 14, commentY + 4.5);
    commentY += splitTeacher.length * 4 + 7;
  }

  if (data.summary.principalComment) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...primaryColor);
    doc.text("PRINCIPAL / HEADTEACHER'S ASSESSMENT:", 14, commentY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitPrin = doc.splitTextToSize(`"${data.summary.principalComment}"`, pageWidth - 28);
    doc.text(splitPrin, 14, commentY + 4.5);
  }

  // Dual Signature Lines
  const signY = pageHeight - 30;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.line(14, signY, 70, signY);
  doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(data.signatures.classTeacherSignature || "Class Teacher Signature", 14, signY + 4);
  doc.text(data.signatures.principalSignature || "Principal Signature & Stamp", pageWidth - 14, signY + 4, {
    align: "right",
  });

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 2. Modern Holistic Progress Report Card
 */
export function renderStudentReportModern(data: StudentReportDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Modern Purple Top Header Banner
  doc.setFillColor(126, 34, 206); // Purple 700
  doc.rect(0, 0, pageWidth, 36, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(data.school.name, 14, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(233, 213, 255); // Purple 200
  doc.text(`${data.term.name} • Academic Year ${data.term.year}`, 14, 23);

  // Student Hero Badge (Right Header)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text(data.student.name, pageWidth - 14, 16, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(233, 213, 255);
  doc.text(`Adm: ${data.student.admissionNumber} | ${data.student.currentClass || ""}`, pageWidth - 14, 23, {
    align: "right",
  });

  // KPI Metric Cards Strip
  const cardW = (pageWidth - 36) / 3;
  const cardH = 18;
  const cardY = 42;

  // Card 1: Average GPA
  doc.setFillColor(250, 245, 255); // Purple 50
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(126, 34, 206);
  doc.text("MEAN SCORE & GRADE", 18, cardY + 5);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.summary.average}% (${data.summary.overallGrade})`, 18, cardY + 13);

  // Card 2: Attendance
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.setDrawColor(204, 251, 241);
  doc.roundedRect(14 + cardW + 4, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(15, 118, 110);
  doc.text("ATTENDANCE RATE", 18 + cardW + 4, cardY + 5);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(`${data.summary.attendance.attendanceRate}%`, 18 + cardW + 4, cardY + 13);

  // Card 3: Class Rank
  doc.setFillColor(255, 251, 235); // Amber 50
  doc.setDrawColor(254, 243, 199);
  doc.roundedRect(14 + (cardW + 4) * 2, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(180, 83, 9);
  doc.text("CLASS RANK", 18 + (cardW + 4) * 2, cardY + 5);

  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(
    data.summary.classRank ? `Rank ${data.summary.classRank} / ${data.summary.totalStudents || "—"}` : "—",
    18 + (cardW + 4) * 2,
    cardY + 13
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
    startY: 66,
    head: [["#", "Course / Subject", "Score", "Grade", "Evaluation", "Teacher Remarks"]],
    body: tableRows,
    headStyles: {
      fillColor: [126, 34, 206],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 45, fontStyle: "bold" },
      2: { cellWidth: 18, halign: "center", fontStyle: "bold" },
      3: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 26 },
      5: { cellWidth: "auto", fontSize: 7.5 },
    },
    styles: { fontSize: 8, cellPadding: 2.5 },
    alternateRowStyles: { fillColor: [250, 245, 255] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 6;

  // Comments & Signatures
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(126, 34, 206);
  doc.text("FACULTY OBSERVATIONS", 14, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const narrative = [
    data.summary.classTeacherComment ? `Teacher: "${data.summary.classTeacherComment}"` : "",
    data.summary.principalComment ? `Principal: "${data.summary.principalComment}"` : "",
  ].filter(Boolean).join("\n");

  const splitNarrative = doc.splitTextToSize(narrative, pageWidth - 28);
  doc.text(splitNarrative, 14, finalY + 5);

  const signY = pageHeight - 25;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, signY, 70, signY);
  doc.line(pageWidth - 70, signY, pageWidth - 14, signY);

  doc.setFontSize(7);
  doc.text("Head of School Signature", 14, signY + 4);
  doc.text("Official Stamp", pageWidth - 14, signY + 4, { align: "right" });

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 3. Comprehensive Term Assessment Report Card
 */
export function renderStudentReportDetailed(data: StudentReportDocumentData): jsPDF {
  const doc = new jsPDF({ format: "a4", unit: "mm" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const tealColor: [number, number, number] = [15, 118, 110]; // Teal 700

  // Formal Border
  doc.setDrawColor(...tealColor);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16);

  // Institution Banner
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...tealColor);
  doc.text(data.school.name.toUpperCase(), 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text(
    `Comprehensive Academic Assessment • Reg: ${data.school.registrationNumber || "Govt Approved"} • Term: ${data.term.name}`,
    14,
    23
  );

  // Student Row
  doc.setFillColor(240, 253, 250); // Teal 50
  doc.rect(14, 27, pageWidth - 28, 12, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...tealColor);
  doc.text(`CANDIDATE: ${data.student.name}`, 18, 33);
  doc.text(`ADM: ${data.student.admissionNumber}`, 85, 33);
  doc.text(`CLASS: ${data.student.currentClass || "—"}`, 135, 33);
  doc.text(`MEAN: ${data.summary.average}% (${data.summary.overallGrade})`, pageWidth - 18, 33, { align: "right" });

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
    styles: { fontSize: 7.5, cellPadding: 2.2 },
    alternateRowStyles: { fillColor: [248, 250, 250] },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 4;

  // Grading Key Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, finalY, pageWidth - 28, 10, 1, 1, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    "GRADING SCALE KEY:  A+ (90-100% Exceptional)  •  A (80-89% Excellent)  •  B+ (75-79% Very Good)  •  B (65-74% Good)  •  C (50-64% Satisfactory)  •  D (40-49% Pass)  •  E/F (<40% Needs Support)",
    pageWidth / 2,
    finalY + 6,
    { align: "center" }
  );

  // Signatures & Guardian Acknowledgment
  const signY = pageHeight - 34;
  doc.setDrawColor(203, 213, 225);
  doc.line(14, signY, 65, signY);
  doc.line(75, signY, 125, signY);
  doc.line(135, signY, pageWidth - 14, signY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105);
  doc.text("Class Teacher Sign & Date", 14, signY + 4);
  doc.text("Principal / Head of Institution", 75, signY + 4);
  doc.text("Parent / Guardian Acknowledgment", 135, signY + 4);

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}
