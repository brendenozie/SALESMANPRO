export async function initiatePaystackPayment(order: any, email: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/payments/paystack/callback`;

  // const amountInKobo = Math.round(order.totalPrice * 100);

  // const payload = {
  //   email,
  //   amount: amountInKobo,
  //   reference: order.trackingNumber || `${order.id}-${Date.now()}`,
  //   callback_url: callbackUrl,
  //   metadata: {
  //     orderId: order.id,
  //     trackingNumber: order.trackingNumber,
  //     customerEmail: email,
  //   },
  // };

  // Ensure amount is strictly an integer to avoid float errors on Paystack's end
  const amountInBaseUnit = Math.round(Number(order.totalPrice) * 100);

  // Default to KES or pull from the order/merchant config
  const currency = order.currency || "KES";

  const payload = {
    email,
    amount: amountInBaseUnit,
    currency: currency,
    reference: order.trackingNumber || `REF-${order.id}-${Date.now()}`,
    callback_url: callbackUrl,
    metadata: {
      orderId: order.id,
      companyId: order.companyId, // Crucial for multi-tenant webhook mapping later
      trackingNumber: order.trackingNumber,
      customerEmail: email,
    },
  };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);

  let data: any;
  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    data = await res.json();
  } catch (err: any) {
    clearTimeout(timer);
    throw new Error(`Paystack request error: ${err.message}`);
  }

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
