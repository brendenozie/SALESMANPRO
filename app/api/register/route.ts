import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered." },
        { status: 409 }
      );
    }

    const origin = req.headers.get("origin") || "";
    const isSalesmanPro = origin.includes("salesmanpro.site");

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password:hashedPassword,
        role: isSalesmanPro ? "ADMIN" : "USER",
      },
    });

    return NextResponse.json(
      { message: "User registered successfully.", user: { id: newUser.id, email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error." },
      { status: 500 }
    );
  }
}
