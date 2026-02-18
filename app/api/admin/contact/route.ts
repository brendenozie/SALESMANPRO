import { cacheGet, cacheSet, cacheDel } from "@/lib/cache";
// // app/api/contact/route.ts
import nodemailer from "nodemailer";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// OPTIMIZATION: Move transporter out of the handler to reuse SMTP connections
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.hostinger.com",
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Pool helps with high-frequency requests
  pool: true, 
  maxConnections: 5,
  maxMessages: 100,
});

export const POST = withApiHandler(
  async (request) => {
    const { name, email, message, _honeypot } = await request.json();

    // 1. Spam Prevention: Honeypot check
    // If a bot fills this hidden field, we return a fake success
    if (_honeypot) {
      console.warn("Spam detected via honeypot field.");
      return formatResponse(true, null, "Message sent successfully!");
    }

    // 2. Validation
    if (!name || !email || !message) {
      return formatResponse(false, null, "All fields are required", 400);
    }

    // Simple Email Regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return formatResponse(false, null, "Invalid email address", 400);
    }

    try {
      // 3. Send Mail using the pooled transporter
      await transporter.sendMail({
        from: `"Contact Form" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
        subject: `[Contact Form] ${name}`,
        replyTo: email,
        // Using basic escaping for message to prevent HTML injection in your inbox
        html: `
          <div style="font-family: sans-serif; line-height: 1.5;">
            <h2>New Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          </div>
        `,
      });

      return formatResponse(true, null, "Message sent successfully!");
    } catch (error) {
      console.error("Email send error:", error);
      // We don't throw the error to the client for security reasons
      return formatResponse(false, null, "Internal server error.", 500);
    }
  },
  { requireAuth: false, requireRateLimit: true }
);
// import nodemailer from "nodemailer";
// import { withApiHandler } from "@/lib/hooks/withApiHandler";
// import { formatResponse } from "@/lib/formatResponse";

// // POST /api/contact
// export const POST = withApiHandler(
//   async (request) => {
//     const { name, email, message } = await request.json();

//     if (!name || !email || !message) {
//       return formatResponse(false, null, "All fields are required", 400);
//     }

//     try {
//       const transporter = nodemailer.createTransport({
//         host: process.env.EMAIL_HOST || "smtp.hostinger.com",
//         port: parseInt(process.env.EMAIL_PORT || "465"),
//         secure: true,
//         auth: {
//           user: process.env.EMAIL_USER, // e.g. "mail@gmail.com"
//           pass: process.env.EMAIL_PASS, // use env var, never hardcode
//         },
//       });

//       await transporter.sendMail({
//         from: `"Contact Form" <${process.env.EMAIL_USER}>`,
//         to: process.env.EMAIL_RECEIVER || process.env.EMAIL_USER,
//         subject: "New Contact Form Submission",
//         replyTo: email,
//         html: `
//           <p><strong>Name:</strong> ${name}</p>
//           <p><strong>Email:</strong> ${email}</p>
//           <p><strong>Message:</strong><br>${message}</p>
//         `,
//       });

//       return formatResponse(true, null, "Message sent successfully!");
//     } catch (error) {
//       console.error("Email send error:", error);
//       return formatResponse(false, null, "Something went wrong.", 500);
//     }
//   },
//   { requireAuth: false, requireRateLimit: true } // contact form usually public but rate-limited
// );


// // add a spam-prevention check here (e.g., simple honeypot field or reCAPTCHA validation) to protect the form from abuse?