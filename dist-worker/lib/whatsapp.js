"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsApp = void 0;
async function sendWhatsApp(phone, message) {
    await fetch(process.env.WHATSAPP_API_URL, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ to: phone, message }),
    });
}
exports.sendWhatsApp = sendWhatsApp;
