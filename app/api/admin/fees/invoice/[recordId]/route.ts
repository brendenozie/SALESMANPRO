import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


export async function GET(
  request: Request,
  { params }: { params: { recordId: string } }
) {
  try {
    // 1️⃣ Fetch fee record with required relations
    const record = await prisma.studentFeeRecord.findUnique({
      where: { id: params.recordId },
      include: {
        student: {
          include: {
            user: {
              select: { name: true, email: true, phone: true },
            },
            StudentAcademicLevel: {
              include: {
                classRoom: true,
                academicLevel: true,
              },
            },
          },
        },
      },
    });

    if (!record) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // 2️⃣ Resolve student & academic placement
    const student = record.student;
    const user = student.user;

    const academicLevel =
      student.StudentAcademicLevel.find(
        (l) =>
          l.year === record.academicYear &&
          l.term === record.term
      ) ?? student.StudentAcademicLevel[0];

    const classroom = academicLevel?.classRoom?.name ?? "Unassigned";

    // 3️⃣ Compute totals safely (NO calculatedTotalFeesDue field)
    const feeItems = record.appliedFeeItems as {
      name: string;
      description?: string | null;
      amount: number;
    }[];

    const totalFeesDue = feeItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const amountPaid = record.amountPaid;
    const balance = totalFeesDue - amountPaid;

    // 4️⃣ Determine payment status
    let statusText: string;
    let badgeColor: [number, number, number];

    if (balance === 0) {
      statusText = "PAID";
      badgeColor = [16, 185, 129]; // Green
    } else if (balance < 0) {
      statusText = "OVERPAID";
      badgeColor = [59, 130, 246]; // Blue
    } else {
      statusText = "OUTSTANDING";
      badgeColor = [244, 63, 94]; // Red
    }

    // 5️⃣ Create PDF
    const doc = new jsPDF();

    // ---------- HEADER ----------
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("STUDENT INVOICE", 14, 25);

    doc.setFillColor(...badgeColor);
    doc.rect(160, 15, 35, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text(statusText, 177, 21.5, { align: "center" });

    // ---------- META ----------
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.text(`Invoice #: ${record.invoiceNumber}`, 14, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 40);
    doc.text(`Term: ${record.term} (${record.academicYear})`, 14, 45);

    // ---------- BILL TO ----------
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.text("BILL TO:", 14, 60);

    doc.setFont("helvetica", "bold");
    doc.text(user.name ?? "Student", 14, 67);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Admission No: ${student.admissionNumber}`, 14, 72);
    doc.text(`Class: ${classroom}`, 14, 77);
    if (user.email) doc.text(`Email: ${user.email}`, 14, 82);

    // ---------- FEE ITEMS TABLE ----------
    autoTable(doc, {
      startY: 90,
      head: [["Fee Item", "Description", "Amount (KES)"]],
      body: feeItems.map((item) => [
        item.name,
        item.description ?? "-",
        item.amount.toLocaleString(),
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229], // Indigo
        textColor: 255,
      },
      columnStyles: {
        2: { halign: "right" },
      },
    });


    // const finalY = (doc as any).lastAutoTable.finalY + 15;
    const finalY = (doc as any).lastAutoTable
      ? (doc as any).lastAutoTable.finalY + 15
      : 110;


    // ---------- TOTALS ----------
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Total Fees Due:", 140, finalY);
    doc.text(`KES ${totalFeesDue.toLocaleString()}`, 196, finalY, {
      align: "right",
    });

    doc.text("Amount Paid:", 140, finalY + 7);
    doc.setTextColor(16, 185, 129);
    doc.text(`KES ${amountPaid.toLocaleString()}`, 196, finalY + 7, {
      align: "right",
    });

    doc.setDrawColor(200, 200, 200);
    doc.line(140, finalY + 10, 196, finalY + 10);

    // ---------- BALANCE ----------
    if (balance > 0) {
      doc.setTextColor(244, 63, 94);
      doc.text("BALANCE DUE:", 140, finalY + 17);
      doc.text(`KES ${balance.toLocaleString()}`, 196, finalY + 17, {
        align: "right",
      });
    } else if (balance < 0) {
      doc.setTextColor(59, 130, 246);
      doc.text("CREDIT BALANCE:", 140, finalY + 17);
      doc.text(
        `KES ${Math.abs(balance).toLocaleString()}`,
        196,
        finalY + 17,
        { align: "right" }
      );
    } else {
      doc.setTextColor(16, 185, 129);
      doc.text("BALANCE:", 140, finalY + 17);
      doc.text("KES 0", 196, finalY + 17, { align: "right" });
    }

    // ---------- FOOTER ----------
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text(
      "This is a computer-generated invoice. No signature required.",
      105,
      285,
      { align: "center" }
    );

    // 6️⃣ Return PDF
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=Invoice_${record.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error("Invoice PDF Error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
