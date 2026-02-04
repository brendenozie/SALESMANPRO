import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/server/db/prismadb";
import jsPDF from "jspdf";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  { params }: { params: { recordId: string } } // Change param to recordId
) {
  try {
    const { searchParams } = new URL(req.url);
    const paymentId = searchParams.get("paymentId"); // Optional: get specific payment

    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Find by ID - This is lightning fast because it's indexed
    const feeRecord = await prisma.studentFeeRecord.findUnique({
      where: { id: params.recordId },
      include: {
        student: {
          include: { user: { select: { name: true, email: true, phone: true } } },
        },
      },
    });

    if (!feeRecord) return NextResponse.json({ error: "Record not found" }, { status: 404 });

    // 2. Find the specific payment in the JSON array
    const payments = feeRecord.payments as any[];
    
    // If paymentId is provided, find it. Otherwise, take the most recent payment.
    const payment = paymentId 
      ? payments.find((p) => p.paymentId === paymentId)
      : payments[payments.length - 1]; 

    if (!payment) return NextResponse.json({ error: "No payment found" }, { status: 404 });

    /* ---------------------------
       Compute totals
    ---------------------------- */
    const appliedFeeItems = feeRecord.appliedFeeItems as {
      amount: number;
    }[];

    const totalFeesDue = appliedFeeItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const amountPaid = feeRecord.amountPaid;
    const balance = totalFeesDue - amountPaid;

    /* ---------------------------
       PDF setup
    ---------------------------- */
    const doc = new jsPDF();

    const PRIMARY: [number, number, number] = [37, 99, 235];
    const SUCCESS: [number, number, number] = [16, 185, 129];
    const DANGER: [number, number, number] = [244, 63, 94];
    const TEXT: [number, number, number] = [31, 41, 55];

    /* ---------------------------
       Logo
    ---------------------------- */
    const logoPath = path.join(process.cwd(), "public", "school-logo.png");
    if (fs.existsSync(logoPath)) {
      const logo = fs.readFileSync(logoPath, "base64");
      doc.addImage(`data:image/png;base64,${logo}`, "PNG", 14, 10, 26, 26);
    }

    /* ---------------------------
       Header
    ---------------------------- */
    doc.setFontSize(18);
    doc.setTextColor(...PRIMARY);
    doc.text("PAYMENT RECEIPT", 105, 22, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(...TEXT);
    doc.text(`Receipt ID: ${payment.paymentId}`, 196, 16, { align: "right" });
    doc.text(
      `Invoice: ${payment.invoiceNumber ?? feeRecord.invoiceNumber ?? "-"}`,
      196,
      22,
      { align: "right" }
    );

    doc.line(14, 42, 196, 42);

    /* ---------------------------
       Student Info
    ---------------------------- */
    doc.setFontSize(11);
    doc.text("Student Information", 14, 52);

    doc.setFontSize(10);
    doc.text(`Name: ${feeRecord.student.user.name ?? "-"}`, 14, 60);
    doc.text(`Email: ${feeRecord.student.user.email ?? "-"}`, 14, 66);
    doc.text(`Phone: ${feeRecord.student.user.phone ?? "-"}`, 14, 72);

    /* ---------------------------
       Payment Details
    ---------------------------- */
    doc.setFontSize(11);
    doc.text("Payment Details", 14, 86);

    doc.setFontSize(10);
    doc.text("Description", 14, 96);
    doc.text("Amount (KES)", 196, 96, { align: "right" });

    doc.line(14, 98, 196, 98);

    doc.text(
      `Fee Payment (${payment.method})`,
      14,
      106
    );
    doc.text(payment.amount.toLocaleString(), 196, 106, {
      align: "right",
    });

    doc.line(14, 110, 196, 110);

    /* ---------------------------
       Totals
    ---------------------------- */
    let y = 122;

    doc.setTextColor(...TEXT);
    doc.text("Total Fees Due:", 140, y);
    doc.text(totalFeesDue.toLocaleString(), 196, y, { align: "right" });

    y += 8;
    doc.setTextColor(...SUCCESS);
    doc.text("Total Paid:", 140, y);
    doc.text(amountPaid.toLocaleString(), 196, y, { align: "right" });

    y += 8;
    doc.line(140, y - 4, 196, y - 4);

    if (balance < 0) {
      doc.setTextColor(...PRIMARY);
      doc.text("Credit Balance:", 140, y);
      doc.text(Math.abs(balance).toLocaleString(), 196, y, {
        align: "right",
      });
    } else if (balance === 0) {
      doc.setTextColor(...SUCCESS);
      doc.text("Balance:", 140, y);
      doc.text("0", 196, y, { align: "right" });
    } else {
      doc.setTextColor(...DANGER);
      doc.text("Balance Due:", 140, y);
      doc.text(balance.toLocaleString(), 196, y, {
        align: "right",
      });
    }

    /* ---------------------------
       Footer
    ---------------------------- */
    doc.setFontSize(9);
    doc.setTextColor(107, 114, 128);
    doc.text(
      "Official receipt generated by the school system",
      105,
      280,
      { align: "center" }
    );

    /* ---------------------------
       Return PDF
    ---------------------------- */
    const pdfBuffer = doc.output("arraybuffer");

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=receipt-${payment.paymentId}.pdf`,
      },
    });
  } catch (error) {
    console.error("Receipt PDF Error:", error);
    return NextResponse.json(
      { error: "Failed to generate receipt" },
      { status: 500 }
    );
  }
}
