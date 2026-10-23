/**
 * Unified Document Architecture — Timetable PDF Renderers
 *
 * 1. timetable-grid   — Landscape A4. Weekly academic grid (Days × Time Periods),
 *                       subject badges, room/educator details, break slots, and official seal.
 * 2. timetable-agenda — Portrait A4. Day-by-day chronological lesson itinerary with
 *                       time pills, subject code tags, educator and room info.
 *
 * Both include complete school branding (logo, name, motto, contacts, primary color).
 */

import { jsPDF } from "jspdf";
import { ClassTimetableDocumentData, ClassTimetableEntry } from "../types";
import {
  callAutoTable,
  addPageNumbersAndFooters,
  drawSignatureBlock,
  hexToRgb,
} from "../pdfUtils";
import { drawSchoolLetterhead, drawKpiTiles } from "./schoolLetterhead";

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function subtitleFor(data: ClassTimetableDocumentData): string {
  const parts = [
    `Schedule: ${data.scheduleFor.name}`,
    data.scheduleFor.academicLevel ? `Level: ${data.scheduleFor.academicLevel}` : "",
    data.termName || "",
    data.academicYear ? `Academic Year: ${data.academicYear}` : "",
    `Generated: ${new Date(data.generatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}`,
  ];
  return parts.filter(Boolean).join("   |   ");
}

function timeToMinutes(t: string): number {
  if (!t) return 0;
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * 1. Weekly Grid Timetable (Landscape A4)
 */
export async function renderClassTimetableGrid(data: ClassTimetableDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "landscape" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primary = hexToRgb(data.school.primaryColor || "#1E3A8A");

  let y = await drawSchoolLetterhead(doc, data.school, {
    title: `Official Weekly Timetable — ${data.scheduleFor.name}`,
    subtitle: subtitleFor(data),
    motto: data.school.motto,
  });

  y = drawKpiTiles(
    doc,
    y,
    [
      { label: "Target", value: data.scheduleFor.name },
      { label: "Total Lessons", value: String(data.summary.totalLessons) },
      { label: "Active Days", value: `${data.summary.activeDays} Days` },
      { label: "Subjects", value: String(data.summary.uniqueSubjects) },
      { label: "Earliest Start", value: data.summary.earliestStart || "08:00" },
      { label: "Latest End", value: data.summary.latestEnd || "16:30" },
    ],
    primary
  );

  // Determine active days (include Saturday if any entry exists for Saturday)
  const hasSaturday = data.entries.some((e) => e.dayOfWeek === "Saturday");
  const activeDays = hasSaturday ? DAYS_OF_WEEK : DAYS_OF_WEEK.slice(0, 5);

  // Build unified unique time slots across entries
  let timeSlots = data.timeSlots && data.timeSlots.length > 0 ? [...data.timeSlots] : [];
  if (timeSlots.length === 0) {
    const rawSlots = Array.from(new Set(data.entries.map((e) => `${e.startTime} - ${e.endTime}`)));
    rawSlots.sort((a, b) => timeToMinutes(a.split(" - ")[0]) - timeToMinutes(b.split(" - ")[0]));
    timeSlots = rawSlots.length > 0 ? rawSlots : [
      "08:00 - 09:00",
      "09:00 - 10:00",
      "10:00 - 11:00",
      "11:00 - 12:00",
      "12:00 - 13:00",
      "14:00 - 15:00",
      "15:00 - 16:00",
    ];
  }

  // Build grid table body: each row is a time slot, each column is a day
  const tableHead = [["Time Period", ...activeDays]];

  const tableBody = timeSlots.map((slot) => {
    const [slotStart, slotEnd] = slot.split(" - ").map((s) => s?.trim());

    const row = [slot];

    activeDays.forEach((day) => {
      // Find matching lesson
      const matches = data.entries.filter((e) => {
        if (e.dayOfWeek.toLowerCase() !== day.toLowerCase()) return false;
        if (slotStart && slotEnd) {
          // Exact or overlapping slot
          return (
            (e.startTime >= slotStart && e.startTime < slotEnd) ||
            (e.endTime > slotStart && e.endTime <= slotEnd) ||
            `${e.startTime} - ${e.endTime}` === slot
          );
        }
        return false;
      });

      if (matches.length === 0) {
        row.push("—");
      } else {
        const text = matches
          .map((m) => {
            const sub = m.courseCode ? `${m.courseCode}: ${m.courseTitle}` : m.courseTitle;
            const extra = [m.roomName ? `Rm: ${m.roomName}` : "", m.educatorName || ""].filter(Boolean).join(" • ");
            return extra ? `${sub}\n(${extra})` : sub;
          })
          .join("\n\n");
        row.push(text);
      }
    });

    return row;
  });

  const dayColWidth = (pageWidth - 28 - 26) / activeDays.length;
  const colStyles: Record<number, any> = {
    0: { cellWidth: 26, halign: "center", fontStyle: "bold" },
  };
  for (let i = 1; i <= activeDays.length; i++) {
    colStyles[i] = { cellWidth: dayColWidth, halign: "center" };
  }

  callAutoTable(doc, {
    startY: y,
    head: tableHead,
    body: tableBody,
    theme: "grid",
    margin: { left: 14, right: 14, top: 16, bottom: 20 },
    styles: {
      font: "helvetica",
      fontSize: 7.2,
      cellPadding: 2,
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: colStyles,
    didParseCell: (hook: any) => {
      if (hook.section === "body" && hook.column.index > 0) {
        const content = String(hook.cell.raw ?? "");
        if (content !== "—" && content.trim().length > 0) {
          hook.cell.styles.fillColor = [238, 242, 255]; // Soft indigo/blue tint for scheduled lesson
          hook.cell.styles.textColor = [30, 27, 75];
          hook.cell.styles.fontStyle = "bold";
        } else {
          hook.cell.styles.textColor = [148, 163, 184];
        }
      }
    },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 8;

  // Ensure signatures fit on current page or start on clean page
  if (y + 30 > pageHeight - 16) {
    doc.addPage();
    y = 20;
  }

  const sigWidth = (pageWidth - 28 - 20) / 2;
  drawSignatureBlock(
    doc,
    14,
    y,
    sigWidth,
    "Dean of Studies / Timetable Master",
    data.scheduleFor.educatorName || "Director of Academics"
  );
  drawSignatureBlock(
    doc,
    14 + sigWidth + 20,
    y,
    sigWidth,
    "Head Teacher / Principal",
    data.school.principalName || "The Principal"
  );

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}

/**
 * 2. Chronological Daily Agenda Timetable (Portrait A4)
 */
export async function renderClassTimetableAgenda(data: ClassTimetableDocumentData): Promise<jsPDF> {
  const doc = new jsPDF({ format: "a4", unit: "mm", orientation: "portrait" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const primary = hexToRgb(data.school.primaryColor || "#1E3A8A");

  let y = await drawSchoolLetterhead(doc, data.school, {
    title: `Academic Schedule — ${data.scheduleFor.name}`,
    subtitle: subtitleFor(data),
    motto: data.school.motto,
  });

  y = drawKpiTiles(
    doc,
    y,
    [
      { label: "Weekly Lessons", value: String(data.summary.totalLessons) },
      { label: "Active Days", value: `${data.summary.activeDays}` },
      { label: "Subjects", value: String(data.summary.uniqueSubjects) },
      { label: "Day Span", value: `${data.summary.earliestStart || "08:00"} - ${data.summary.latestEnd || "16:00"}` },
    ],
    primary
  );

  // Group entries by day
  const grouped: Record<string, ClassTimetableEntry[]> = {};
  DAYS_OF_WEEK.forEach((d) => {
    grouped[d] = [];
  });

  data.entries.forEach((e) => {
    if (!grouped[e.dayOfWeek]) grouped[e.dayOfWeek] = [];
    grouped[e.dayOfWeek].push(e);
  });

  Object.keys(grouped).forEach((d) => {
    grouped[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  });

  const tableBody: any[] = [];
  DAYS_OF_WEEK.forEach((day) => {
    const dayEntries = grouped[day] || [];
    if (dayEntries.length === 0) return;

    // Day Header Row spanning all columns
    tableBody.push([
      {
        content: `${day.toUpperCase()} (${dayEntries.length} Lessons)`,
        colSpan: 4,
        styles: {
          fillColor: [241, 245, 249],
          textColor: primary,
          fontStyle: "bold" as const,
          halign: "left" as const,
        },
      },
    ]);

    dayEntries.forEach((entry) => {
      tableBody.push([
        `${entry.startTime} - ${entry.endTime}`,
        entry.courseCode ? `${entry.courseCode}: ${entry.courseTitle}` : entry.courseTitle,
        entry.educatorName || "Teacher assigned",
        entry.roomName || entry.topic || "Main Hall",
      ]);
    });
  });

  if (tableBody.length === 0) {
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, y, pageWidth - 28, 20, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text("No scheduled lessons found for this class / educator.", pageWidth / 2, y + 12, { align: "center" });
    addPageNumbersAndFooters(doc, data.footerText, data.school.name);
    return doc;
  }

  callAutoTable(doc, {
    startY: y,
    head: [["Time Period", "Subject / Learning Area", "Educator / Lecturer", "Room / Topic"]],
    body: tableBody,
    theme: "grid",
    margin: { left: 14, right: 14, top: 16, bottom: 20 },
    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2.2,
      valign: "middle",
      lineColor: [226, 232, 240],
      lineWidth: 0.25,
      textColor: [30, 41, 59],
    },
    headStyles: {
      fillColor: primary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 30, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 60, fontStyle: "bold" },
      2: { cellWidth: 44 },
      3: { halign: "left" },
    },
  });

  y = ((doc as any).lastAutoTable?.finalY || y) + 10;
  if (y + 30 > pageHeight - 16) {
    doc.addPage();
    y = 20;
  }

  const sigWidth = (pageWidth - 28 - 20) / 2;
  drawSignatureBlock(doc, 14, y, sigWidth, "Dean of Studies / Timetable Master");
  drawSignatureBlock(doc, 14 + sigWidth + 20, y, sigWidth, "Head Teacher / Principal", data.school.principalName);

  addPageNumbersAndFooters(doc, data.footerText, data.school.name);
  return doc;
}
