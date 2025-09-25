import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import bcrypt from "bcryptjs";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";
// import jwt from "jsonwebtoken";

// In-memory rate limiter (for demo purposes)
const loginAttempts: Record<string, { count: number; lastAttempt: number }> = {};
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

// JWT Secret (store securely in env variables)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const JWT_EXPIRES_IN = "1h";

// POST /api/login
export async function POST(req: Request) {
  try {
    
       const auth = await verifyAuth(req);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    // Rate limiting per IP
    const record = loginAttempts[ip] || { count: 0, lastAttempt: now };
    if (now - record.lastAttempt < WINDOW_MS && record.count >= MAX_ATTEMPTS) {
      return NextResponse.json(
        { status: 429, message: "Too many login attempts. Please try again later." },
        { status: 429 }
      );
    }
    if (now - record.lastAttempt > WINDOW_MS) {
      record.count = 0;
    }
    record.count += 1;
    record.lastAttempt = now;
    loginAttempts[ip] = record;

    // Parse credentials
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { status: 400, message: "Missing login details" },
        { status: 400 }
      );
    }

    // Check user models
    const userTypes = [
      { model: prisma.consumer, role: "CONSUMER" },
      { model: prisma.salesAgent, role: "SALES_AGENT" },
      { model: prisma.client, role: "CLIENT" },
      { model: prisma.user, role: "ADMIN" },
    ];

    let foundUser: any = null;
    let userRole: string | null = null;

    for (const { model, role } of userTypes) {
      // Use type assertion to resolve union callable issue
      const u = await (model as { findUnique: (args: any) => Promise<any> }).findUnique({ where: { email } });
      if (u) {
        foundUser = u;
        userRole = role;
        break;
      }
    }

    // Log attempt
    // await prisma.loginAttempt.create({
    //   data: {
    //     email,
    //     success: !!foundUser,
    //     attemptedAt: new Date(),
    //     ipAddress: ip,
    //   },
    // });

    if (!foundUser) {
      return NextResponse.json(
        { status: 404, message: "Account not found. Please register first." },
        { status: 404 }
      );
    }

    // Verify password
    // const pwHash = foundUser.password;
    // const valid = await bcrypt.compare(password, pwHash);
    // if (!valid) {
    //   return NextResponse.json(
    //     { status: 401, message: "Invalid credentials" },
    //     { status: 401 }
    //   );
    // }

    // Generate JWT
    // const token = jwt.sign(
    //   { userId: foundUser.id, role: userRole },
    //   JWT_SECRET,
    //   { expiresIn: JWT_EXPIRES_IN }
    // );

    // Exclude password
    const { password: _pw, ...safeUser } = foundUser;

    return NextResponse.json(
      {
        status: 200,
        message: "Login successful",
        body: { ...safeUser, role: userRole, token : "xxmega" }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { status: 500, message: "Internal server error", detail: error.message },
      { status: 500 }
    );
  }
}
