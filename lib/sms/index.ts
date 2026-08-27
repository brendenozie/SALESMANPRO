export function formatKenyanPhone(phone: string) {
    let value = phone.trim().replace(/\s+/g, "");
  
    if (value.startsWith("+")) value = value.slice(1);
    if (value.startsWith("0")) value = `254${value.slice(1)}`;
  
    if (!/^2547\d{8}$/.test(value)) {
      throw new Error("Invalid Kenyan phone number");
    }
  
    return value;
  }
  
  export async function sendSms({
    mobile,
    message,
  }: {
    mobile: string;
    message: string;
  }) {
    const apikey = process.env.SMS_API_KEY;
    const partnerID = process.env.SMS_PARTNER_ID;
    const shortcode = process.env.SMS_SENDER_ID;
    const baseUrl = process.env.SMS_BASE_URL || "https://sms.textsms.co.ke/api/services";
  
    if (!apikey || !partnerID || !shortcode) {
      throw new Error("SMS environment variables are missing");
    }
  
    const formattedPhone = formatKenyanPhone(mobile);
  
    const res = await fetch(`${baseUrl}/sendsms/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apikey,
        partnerID,
        message,
        shortcode,
        mobile: formattedPhone,
      }),
      cache: "no-store",
    });
  
    const data = await res.json();
  
    return {
      ok: res.ok,
      data,
    };
  }