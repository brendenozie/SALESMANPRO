// -----------------------------
// lib/formatResponse.ts
// Standardized API Response Engine for SalesmanPro
// -----------------------------

import { NextResponse } from "next/server";

export interface StandardApiResponse<T = any> {
  success: boolean;
  data: T | null;
  message?: string;
  error?: any;
  meta?: Record<string, any>;
  requestId?: string;
}

/**
 * Standard response formatter with backward compatibility:
 * - If success is true, treats string 'error' argument as 'message' rather than an error object.
 * - If success is false, treats string 'error' argument as the actionable error message.
 */
export function formatResponse(
  success: boolean,
  data?: any,
  errorOrMessage?: any,
  status = 200,
  meta?: Record<string, any>,
  requestId?: string,
): NextResponse {
  if (success) {
    const isStringMessage = typeof errorOrMessage === "string";
    const payload: StandardApiResponse = {
      success: true,
      data: data !== undefined ? data : null,
      message: isStringMessage ? errorOrMessage : undefined,
      error: null,
      ...(meta ? { meta } : {}),
      ...(requestId ? { requestId } : {}),
    };
    return NextResponse.json(payload, { status });
  }

  // Error case
  const isStringError = typeof errorOrMessage === "string";
  const errorMessage = isStringError
    ? errorOrMessage
    : errorOrMessage?.message || "An unexpected error occurred";

  const payload: StandardApiResponse = {
    success: false,
    data: data !== undefined ? data : null,
    message: errorMessage,
    error: isStringError
      ? { message: errorOrMessage }
      : errorOrMessage || { message: errorMessage },
    ...(requestId ? { requestId } : {}),
  };

  return NextResponse.json(payload, { status: status >= 400 ? status : 400 });
}

/**
 * Canonical success response helper
 */
export function formatSuccess<T = any>(
  data: T,
  message?: string,
  meta?: Record<string, any>,
  status = 200,
  requestId?: string,
): NextResponse {
  return formatResponse(true, data, message, status, meta, requestId);
}

/**
 * Canonical error response helper
 */
export function formatError(
  message: string,
  code = "BAD_REQUEST",
  status = 400,
  details?: any,
  requestId?: string,
): NextResponse {
  return formatResponse(
    false,
    null,
    { code, message, details },
    status,
    undefined,
    requestId,
  );
}