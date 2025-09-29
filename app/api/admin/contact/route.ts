// app/api/contact/route.ts
import nodemailer from "nodemailer";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// POST /api/contact
export const POST = withApiHandler(
  async (request) => {
    const { name, email, message } = await request.json();

    if (!name || !email || !message) {
      return formatResponse(false, null, "All fields are required", 400);
    }

    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.hostinger.com",
        port: parseInt(process.env.EMAIL_PORT || "465"),
        secure: true,
        auth: {
          user: process.env.EMAIL_USER, // e.g. "mail@gmail.com"
          pass: process.env.EMAIL_PASS, // use env var, never hardcode
        },
      });

      await transporter.sendMail({
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
        subject: "New Contact Form Submission",
        replyTo: email,
        html: `
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong><br>${message}</p>
        `,
      });

      return formatResponse(true, null, "Message sent successfully!");
    } catch (error) {
      console.error("Email send error:", error);
      return formatResponse(false, null, "Something went wrong.", 500);
    }
  },
  { requireAuth: false, requireRateLimit: true } // contact form usually public but rate-limited
);


// add a spam-prevention check here (e.g., simple honeypot field or reCAPTCHA validation) to protect the form from abuse?