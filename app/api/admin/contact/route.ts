import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';
import { request } from 'http';


export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' });
  }

  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return NextResponse.json({ message: 'All fields are required' });
  }

  try {
    // Transporter settings for your Hostinger email
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: "sales@jasirihomes.com", // Your email
        pass: "YOUR_EMAIL_PASSWORD",   // Replace with your actual password or App Password
      },
    });

    // Email details
    // await transporter.sendMail({
    //   from: `"${name}" <${email}>`,
    //   to: "sales@jasirihomes.com",
    //   subject: "New Contact Form Submission",
    //   html: `
    //     <p><strong>Name:</strong> ${name}</p>
    //     <p><strong>Email:</strong> ${email}</p>
    //     <p><strong>Message:</strong><br>${message}</p>
    //   `,
    // });

    await transporter.sendMail({
  from: `"Jasiri Homes Contact Form" <${process.env.EMAIL_SERVER}>`, // Always use your authenticated email
  to: `${process.env.EMAIL_SERVER}`,
  subject: "New Contact Form Submission",
  replyTo: email, // Allows you to reply directly to the user's email
  html: `
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong><br>${message}</p>
  `,
});


    return NextResponse.json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Something went wrong." });
  }
}
