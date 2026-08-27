export async function sendWhatsApp(phone: string, message: string) {
  await fetch(process.env.WHATSAPP_API_URL!, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to: phone, message }),
  });
}
