export async function initiatePaystackPayment(order: any, email: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payments/paystack/callback`;

  const amountInKobo = Math.round(order.totalPrice * 100);

  const payload = {
    email,
    amount: amountInKobo,
    reference: order.trackingNumber || `${order.id}-${Date.now()}`,
    callback_url: callbackUrl,
    metadata: {
      orderId: order.id,
      trackingNumber: order.trackingNumber,
      customerEmail: email,
    },
  };

  console.log("🔥 Paystack Init Payload:", payload);

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  console.log("🔁 Paystack Response:", data);

  if (!data.status) {
    throw new Error(data.message || "Paystack initialization failed");
  }

  return {
    authorization_url: data.data.authorization_url,
    access_code: data.data.access_code,
    reference: data.data.reference,
  };
}
