// app/driver/messages/page.tsx
import React from "react";
import MessagesClient from "./MessagesClient";
import { cookies } from "next/headers";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

export default async function DriverMessagesPage() {
  let initialThreads = [];
  const cookieHeader = (await cookies()).toString();

  try {
    const res = await fetch(`${apiBaseUrl}/driver/messages/threads`, {
      cache: 'no-store',
      headers: { Cookie: cookieHeader },
    });

    if (res.ok) {
      const rawData = await res.json();
      initialThreads = rawData.data;
    }
  } catch (err) {
    console.error("Failed to fetch message threads", err);
  }

  return <MessagesClient initialThreads={initialThreads} />;
}