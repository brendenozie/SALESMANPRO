import prisma from "@/server/db/prismadb";

const MPESA_BASE_URL = process.env.MPESA_BASE_URL!;
const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

async function getMpesaToken() {
  const auth = Buffer.from(
    `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`
  ).toString("base64");

  const res = await fetch(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await res.json();
  return data.access_token;
}

export async function initiateMpesaPayment(order: any, phoneNumber: string) {
  const formattedPhone = formatPhone(phoneNumber);

  const token = await getMpesaToken();
  const timestamp = generateTimestamp();

  const password = Buffer.from( `${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`).toString("base64");

  const payload = {
    BusinessShortCode: process.env.MPESA_SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: 1, // or order.totalFinalPrice
    PartyA: formattedPhone,
    PartyB: process.env.MPESA_SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: process.env.MPESA_CALLBACK_URL,
    AccountReference: String(order.id),
    TransactionDesc: `Payment for order ${order.id}`,
  };

  const res = await fetch(`${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();

  if (result.ResponseCode === "0") {
    await prisma.customerOrder.update({
      where: { id: order.id },
      data: {
        trackingNumber: result.CheckoutRequestID,
        transactionReference: result.MerchantRequestID,
        paymentMethod: "MPESA",
        paymentStatus: "PENDING",
      },
    });
  }

  return result;
}

function generateTimestamp() {
  const date = new Date();
  const tzOffset = date.getTimezoneOffset() * 60000; 
  const kenyaTime = new Date(date.getTime() + 3 * 60 * 60 * 1000); 

  return kenyaTime
    .toISOString()
    .replace(/[-:TZ.]/g, "")
    .slice(0, 14);
}


function formatPhone(phone: string) {
  // Remove spaces
  phone = phone.replace(/\s+/g, "");

  // If starts with +254 → convert to 254
  if (phone.startsWith("+254")) return phone.replace("+254", "254");

  // If starts with 07 → convert to 2547
  if (phone.startsWith("07")) return phone.replace(/^0/, "254");

  // If already 2547XXXXXXXX → keep it
  if (phone.startsWith("2547")) return phone;

  throw new Error("Invalid phone number format");
}
