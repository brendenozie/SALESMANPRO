/**
 * Class / Stream Grade Broadsheet & Merit List PDF Renderers
 *
 * 1. broadsheet-matrix    — Landscape A4. Every student × every subject score grid,
 *                           ranked, with subject means footer, subject key and grade distribution.
 * 2. broadsheet-merit-list — Portrait A4. Ranked merit list with podium, deviation from
 *                           class mean, remarks and grade distribution chart.
 *
 * Both carry full school branding (logo, name, motto, contacts, primary colour).
 */

import { jsPDF } from "jspdf";
import { ClassBroadsheetDocumentData } from "../types";
import {
  callAutoTable,
  addPageNumbersAndFooters,
  drawSignatureBlock,
  hexToRgb,
} from "../pdfUtils";
import { drawSchoolLetterhead, drawKpiTiles } from "./schoolLetterhead";

const GOLD: [number, number, number] = [197, 160, 89];

function gradeColor(grade: string): [number, number, number] {
  const g = (grade || "").charAt(0);
  if (g === "A") return [5, 150, 105];
  if (g === "B") return [37, 99, 235];
  if (g === "C") return [217, 119, 6];
  if (g === "D") return [234, 88, 12];
  return [225, 29, 72];
}

function remarkFor(avg: number): string {
  if (avg >= 80) return "Excellent";
  if (avg >= 70) return "Very Good";
  if (avg >= 60) return "Good";
  if (avg >= 50) return "Average";
  if (avg >= 40) return "Below Average";
  return "Needs Support";
}

function fmtScore(v: number | null | undefined): string {
  return typeof v === "number" ? String(Math.round(v)) : "—";
}

function subtitleFor(data: ClassBroadsheetDocumentData): string {
  return [
    `Class / Stream: ${data.classroom.name}`,
    data.classroom.academicLevel ? `Level: ${data.classroom.academicLevel}` : "",
    `${data.term.name} (${data.term.year})`,
    `Generated: ${new Date(data.generatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
  ]
    .filter(Boolean)
    .join("   |   ");
}

/**
 * Draws grade distribution as horizontal mini bars. Returns Y after block.
 */
function drawGradeDistribution(
  doc: jsPDF,
  data: ClassBroadsheetDocumentData,
  x: number,
  y: number,
  width: number,
  primary: [number, number, number]
): number {
  const rows = data.summary.gradeDistribution.filter((g) => g.count > 0);
  const list = rows.length ? rows : data.summary.gradeDistribution.slice(0, 6);
  const max = Math.max(1, ...list.map((g) => g.count));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...primary);
  doc.text("GRADE DISTRIBUTION", x, y);
  y += 3;

  const barAreaW = width - 22;
  list.forEach((g) => {
    y += 4.6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(51, 65, 85);
    doc.text(g.grade, x, y);

    doc.setFillColor(241, 245, 249);
    doc.roundedRect(x + 8, y - 2.6, barAreaW, 3.2, 1, 1, "F");
    const w = (g.count / max) * barAreaW;
    if (w > 0) {
      doc.setFillColor(...gradeColor(g.grade));
      doc.roundedRect(x + 8, y - 2.6, Math.max(w, 1.5), 3.2, 1, 1, "F");
    }
    doc.setFont("helvetica", "normal");
    doc.setTextColor(71, 85, 105);
    doc.text(String(g.count), x + 10 + barAreaW, y);
  });

  return y + 4;
}

function drawEmptyState(doc: jsPDF, y: number, message: string) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, y, pageWidth - 28, 22, 2, 2, "FD");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(message, pageWidth / 2, y + 13, { align: "center" });
}

/**
 * 1. Landscape Subject Matrix Broadsheet
 */
export async function renderClassBroadsheetMatrix(data: ClassBroadsheetDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primary = hexToRgb(data.school.primaryColor || "#1E3A8A");

  let y = await drawSchoolLetterhead(doc, data.school, {
    title: `Class Academic Broadsheet — ${data.classroom.name} — ${data.term.name} ${data.term.year}`,
    subtitle: subtitleFor(data),
    motto: data.school.motto,
  });

  y = drawKpiTiles(
    doc,
    y,
    [
      { label: "Students Ranked", value: String(data.summary.totalStudents) },
      { label: "Subjects", value: String(data.subjects.length) },
      { label: "Class Mean", value: `${data.summary.classMean}%` },
      { label: "Mean Grade", value: data.summary.meanGrade },
      { label: "Highest Avg", value: `${data.summary.highestAverage}%` },
      { label: "Lowest Avg", value: `${data.summary.lowestAverage}%` },
    ],
    primary
  );

  if (data.students.length === 0) {
    drawEmptyState(doc, y, "No graded students found for this class / stream and term.");
    addPageNumbersAndFooters(doc, data.footerText, data.school.name);
    return doc;
  }

  const subjectCount = data.subjects.length;
  const fontSize = subjectCount > 14 ? 6 : subjectCount > 10 ? 6.6 : 7.2;

  const head = [
    ["Pos", "Adm No.", "Student Name", ...data.subjects.map((s) => s.code), "Total", "Avg %", "Grade", "Abs"],
  ];

  const body = data.students.map((s) => [
    s.rank ? String(s.rank) : "—",
    s.admissionNumber,
    s.name,
    ...data.subjects.map((sub) => fmtScore(s.scores[sub.code])),
    String(s.totalMarks),
    String(s.average),
    s.grade,
    String(s.absences),
  ]);

  const foot = [
    [
      { content: "SUBJECT MEAN", colSpan: 3, styles: { halign: "right" as const } },
      ...data.subjects.map((s) => String(s.classMean)),
      "",
      String(data.summary.classMean),
      data.summary.meanGrade,
      "",
    ],
  ];

  const firstSubjectCol = 3;
  const lastSubjectCol = firstSubjectCol + subjectCount - 1;
  const gradeCol = lastSubjectCol + 3;

  callAutoTable(doc, {
    startY: y,
    head,
    body,
    foot: foot as any,
    showFoot: "lastPage",
    theme: "grid",
    margin: { left: 14, right: 14, top: 16, bottom: 18 },
    styles: {
      font: "helvetica",
      fontSize,
      cellPadding: 1.4,
      halign: "center",
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: fontSize + 0.3,
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: primary,
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 9, fontStyle: "bold" },
      1: { cellWidth: 20 },
      2: { cellWidth: 44, halign: "left" },
    },
    didParseCell: (hook: any) => {
      if (hook.section !== "body") return;
      const col = hook.column.index;
      const raw = String(hook.cell.raw ?? "");

      if (col >= firstSubjectCol && col <= lastSubjectCol) {
        const n = Number(raw);
        if (!isNaN(n)) {
          if (n < 40) hook.cell.styles.textColor = [225, 29, 72];
          else if (n >= 80) {
            hook.cell.styles.textColor = [5, 150, 105];
            hook.cell.styles.fontStyle = "bold";
          }
        }
      }
      if (col === gradeCol) {
        hook.cell.styles.textColor = gradeColor(raw);
        hook.cell.styles.fontStyle = "bold";
      }
      if (col === 0) {
        const rank = Number(raw);
        if (rank >= 1 && rank <= 3) {
          hook.cell.styles.fillColor = [254, 249, 195];
          hook.cell.styles.textColor = [161, 98, 7];
        }
      }
    },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 6;

  // Bottom section: subject key | grade distribution | signatures
  const blockHeight = Math.max(40, Math.ceil(subjectCount / 2) * 4 + 14);
  if (y + blockHeight > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  const colW = (pageWidth - 28 - 12) / 3;

  // Subject key with stats
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(...primary);
  doc.text("SUBJECT KEY  (Mean / High / Low)", 14, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.8);
  doc.setTextColor(51, 65, 85);
  const half = Math.ceil(subjectCount / 2);
  data.subjects.forEach((s, i) => {
    const cx = 14 + (i < half ? 0 : colW / 2);
    const cy = y + 5 + (i % half) * 4;
    const label = `${s.code} – ${s.name}`;
    const clipped = label.length > 22 ? `${label.slice(0, 21)}…` : label;
    doc.text(`${clipped}  ${s.classMean}/${s.highest}/${s.lowest}`, cx, cy);
  });

  drawGradeDistribution(doc, data, 14 + colW + 6, y, colW, primary);

  const sigX = 14 + (colW + 6) * 2;
  drawSignatureBlock(doc, sigX, y - 4, colW - 4, "Class Teacher", data.classroom.classTeacher);
  drawSignatureBlock(doc, sigX, y + 18, colW - 4, "Principal / Head Teacher", data.school.principalName);

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 2. Portrait Ranked Merit List
 */
export async function renderClassMeritList(data: ClassBroadsheetDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primary = hexToRgb(data.school.primaryColor || "#1E3A8A");

  let y = await drawSchoolLetterhead(doc, data.school, {
    title: `Official Merit List — ${data.classroom.name} — ${data.term.name} ${data.term.year}`,
    subtitle: subtitleFor(data),
    motto: data.school.motto,
  });

  y = drawKpiTiles(
    doc,
    y,
    [
      { label: "Students", value: String(data.summary.totalStudents) },
      { label: "Class Mean", value: `${data.summary.classMean}%` },
      { label: "Mean Grade", value: data.summary.meanGrade },
      { label: "Top Average", value: `${data.summary.highestAverage}%` },
    ],
    primary
  );

  if (data.students.length === 0) {
    drawEmptyState(doc, y, "No graded students found for this class / stream and term.");
    addPageNumbersAndFooters(doc, data.footerText, data.school.name);
    return doc;
  }

  // Podium — top 3
  const top = data.students.slice(0, 3);
  if (top.length) {
    const podiumW = (pageWidth - 28 - 8) / 3;
    const medals: { label: string; fill: [number, number, number]; text: [number, number, number] }[] = [
      { label: "1st", fill: [254, 249, 195], text: [161, 98, 7] },
      { label: "2nd", fill: [241, 245, 249], text: [71, 85, 105] },
      { label: "3rd", fill: [255, 237, 213], text: [154, 52, 18] },
    ];
    top.forEach((s, i) => {
      const x = 14 + i * (podiumW + 4);
      const m = medals[i];
      doc.setFillColor(...m.fill);
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.3);
      doc.roundedRect(x, y, podiumW, 18, 2, 2, "FD");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(...m.text);
      doc.text(m.label, x + 4, y + 8);

      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(s.name, x + 16, y + 7, { maxWidth: podiumW - 18 });
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(`Adm: ${s.admissionNumber}`, x + 16, y + 11.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...gradeColor(s.grade));
      doc.text(`${s.average}%  •  ${s.grade}`, x + 16, y + 15.5);
    });
    y += 24;
  }

  const body = data.students.map((s) => {
    const dev = Math.round((s.average - data.summary.classMean) * 10) / 10;
    return [
      s.rank ? String(s.rank) : "—",
      s.admissionNumber,
      s.name,
      String(Object.values(s.scores).filter((v) => typeof v === "number").length),
      String(s.totalMarks),
      `${s.average}`,
      s.grade,
      `${dev > 0 ? "+" : ""}${dev}`,
      remarkFor(s.average),
    ];
  });

  callAutoTable(doc, {
    startY: y,
    head: [["Pos", "Adm No.", "Student Name", "Subj.", "Total", "Mean %", "Grade", "± Mean", "Remark"]],
    body,
    theme: "grid",
    margin: { left: 14, right: 14, top: 16, bottom: 18 },
    styles: {
      font: "helvetica",
      fontSize: 7.8,
      cellPadding: 1.8,
      halign: "center",
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      textColor: [30, 41, 59],
    },
    headStyles: { fillColor: primary, textColor: [255, 255, 255], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 11, fontStyle: "bold" },
      1: { cellWidth: 22 },
      2: { halign: "left" },
      8: { cellWidth: 26, halign: "left" },
    },
    didParseCell: (hook: any) => {
      if (hook.section !== "body") return;
      const col = hook.column.index;
      const raw = String(hook.cell.raw ?? "");
      if (col === 6) {
        hook.cell.styles.textColor = gradeColor(raw);
        hook.cell.styles.fontStyle = "bold";
      }
      if (col === 7) {
        hook.cell.styles.textColor = raw.startsWith("+") ? [5, 150, 105] : raw.startsWith("-") ? [225, 29, 72] : [71, 85, 105];
      }
      if (col === 0) {
        const rank = Number(raw);
        if (rank >= 1 && rank <= 3) {
          hook.cell.styles.fillColor = [254, 249, 195];
          hook.cell.styles.textColor = [161, 98, 7];
        }
      }
    },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 8;
  if (y + 48 > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  const halfW = (pageWidth - 28 - 10) / 2;
  drawGradeDistribution(doc, data, 14, y, halfW, primary);
  drawSignatureBlock(doc, 14 + halfW + 10, y - 4, halfW, "Class Teacher", data.classroom.classTeacher);
  drawSignatureBlock(doc, 14 + halfW + 10, y + 18, halfW, "Principal / Head Teacher", data.school.principalName);

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}
