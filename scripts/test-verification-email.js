const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const nodemailer = require('nodemailer');

async function main() {
  const targetEmail = process.argv[2] || process.env.ADMIN_EMAIL || process.env.SMTP_USER;

  console.log('--- Testing Gmail SMTP Configuration ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('Secure:', process.env.SMTP_SECURE);
  console.log('Recipient:', targetEmail);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true' || parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    pool: false,
    tls: {
      rejectUnauthorized: false
    }
  });

  console.log('\n[1/2] Verifying SMTP credentials with Gmail...');
  await transporter.verify();
  console.log('✓ SMTP Connection & Authentication Successful!');

  console.log('\n[2/2] Sending Verification Email Test...');
  const testVerificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/verify-email?token=test_token_${Date.now()}&email=${encodeURIComponent(targetEmail)}`;

  const brandName = (process.env.DEFAULT_FROM_NAME || 'SalesmanPro').replace(/"/g, '');
  const fromEmail = process.env.DEFAULT_FROM_EMAIL || process.env.SMTP_USER;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0f172a; text-align: center;">Verify your email address</h2>
      <p style="color: #475569; font-size: 15px; line-height: 1.6;">
        Welcome to <strong>${brandName}</strong>! This is an automated test confirming that your Gmail App Password configuration is working properly.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${testVerificationUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #64748b; font-size: 13px;">
        Link: <a href="${testVerificationUrl}" style="color: #ea580c;">${testVerificationUrl}</a>
      </p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        Sent via Gmail SMTP with App Password &bull; ${new Date().toISOString()}
      </p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: `"${brandName}" <${fromEmail}>`,
    to: targetEmail,
    subject: `Verify your ${brandName} email (SMTP Test)`,
    html: html,
    text: `Verify your email by visiting: ${testVerificationUrl}`,
  });

  console.log('✓ Verification Email successfully sent!');
  console.log('  Message ID:', info.messageId);
  console.log('  Accepted:', info.accepted);
  console.log('  Response:', info.response);
}

main().catch(err => {
  console.error('✗ Email test failed:', err);
  process.exit(1);
});
