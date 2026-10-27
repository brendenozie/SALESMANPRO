/**
 * app/api/notifications/vapid-key/route.ts
 *
 * Exposes the public VAPID key for Web Push subscription registration.
 */

import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  process.env.VAPID_PUBLIC_KEY ||
  "BMPcgRURWIEZ1w_-PXGjpWsoyEHAxSaVb1Ij2t3iJe2gu_YHYg8AP0T680sIb3L6J7HiM5fNXOREVzASbHcKZTU";

export async function GET() {
  return NextResponse.json({
    success: true,
    publicKey: VAPID_PUBLIC_KEY,
  });
}
