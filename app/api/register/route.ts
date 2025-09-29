// app/api/post/route.ts
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

async function registerUser(req: Request) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      password,
      birthYear,
      bmiResult,
      currentHeightInCm,
      currentWeightInKg,
      exerciseGoal,
      focusArea,
      gender,
      img,
      physicalActivityLevel,
      weeklyGoalInKM,
      weightInKgGoal,
      provider,
    } = body.data || {};

    if (!email || !password || !name) {
      return formatResponse(false, null, "Missing registration details", 400);
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return formatResponse(true, existingUser, "User already exists", 200);
    }

    // Example: creating a user (uncomment when ready to store password)
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const newUser = await prisma.user.create({
    //   data: {
    //     name,
    //     email,
    //     hashedPassword,
    //     birthYear,
    //     bmiResult,
    //     currentHeightInCm,
    //     currentWeightInKg,
    //     exerciseGoal,
    //     focusArea,
    //     gender,
    //     img,
    //     physicalActivityLevel,
    //     weeklyGoalInKM,
    //     weightInKgGoal,
    //     provider,
    //   },
    // });

    return formatResponse(false, null, "This account does not exist. Please register.", 404);
  } catch (error: any) {
    console.error(error);
    return formatResponse(false, null, "Internal server error", 500);
  }
}

export const POST = withApiHandler(registerUser);
