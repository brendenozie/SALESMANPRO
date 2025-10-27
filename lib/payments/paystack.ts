export async function initiatePaystackPayment(order: any, email: string) {
  const secret = process.env.PAYSTACK_SECRET_KEY!;
  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: order.totalFinalPrice * 100,
      reference: order.id,
      callback_url: `${process.env.APP_URL}/payments/paystack/callback`,
    }),
  });

  return await res.json();
}
