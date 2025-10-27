import nodemailer from "nodemailer";

export async function sendOrderConfirmationEmail(order: any) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT!),
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });

  await transporter.sendMail({
    from: '"Kapu Orders" <no-reply@kapu.com>',
    to: order.email,
    subject: "Your Order Confirmation",
    html: `
      <h3>Order Confirmed</h3>
      <p>Thank you for shopping with us. Your order ID is <b>${order.id}</b>.</p>
      <p>Total: KES ${order.totalFinalPrice}</p>
    `,
  });
}
