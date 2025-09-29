// app/api/contact/route.ts
import prisma from "@/server/db/prismadb"; // Adjust if not used
import SendMail from "@/service/mailservice";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

async function GET(request: Request) {
  try {
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return formatResponse(false, null, auth.error, 401);
    }

    const body = await request.json();
    const { fname, lname, email, phone, company, message } = body;

    if (!email || !message) {
      return formatResponse(false, null, "Email and message are required", 400);
    }

    const result = await SendMail({
      to: email,
      subject: "Contact Form Submission",
      text: message,
      html: `<p>${message}</p>`,
      fname,
      lname,
      email,
      phone,
      company,
      message,
    });

    return formatResponse(true, result, "Message sent successfully");
  } catch (err: any) {
    console.error("GET /api/contact error:", err);
    return formatResponse(
      false,
      null,
      err.message || "Internal server error",
      500
    );
  }
}

export const GETHandler = withApiHandler(GET);
