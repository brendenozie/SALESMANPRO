// -----------------------------
// Shared Helpers
import { NextResponse } from "next/server";
export const formatResponse = (
  success: boolean,
  data?: any,
  error?: any,
  status = 200
) => NextResponse.json({ success, data, error }, { status });