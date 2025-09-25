import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// PUT /api/user?agentId=&limit=&offset=
export async function PUT(req: Request) {

     const auth = await verifyAuth(req);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agentId");
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const offset = parseInt(searchParams.get("offset") || "0", 10);

  if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
    return NextResponse.json(
      { message: "Invalid pagination parameters." },
      { status: 400 }
    );
  }

  try {
    const body = await req.json();
    const {
      id,
      name,
      email,
      password,
      role,
      gender,
      exerciseGoal,
      focusArea,
      currentHeightInCm,
      currentWeightInKg,
      birthYear,
      weeklyGoalInKM,
      weightInKgGoal,
      physicalActivityLevel,
      bmiResult,
      imgUri,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing user ID." },
        { status: 400 }
      );
    }

    // Build update payload
    const dataToUpdate: any = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (email !== undefined) dataToUpdate.email = email;
    if (password !== undefined) dataToUpdate.hashedPassword = password;
    if (role !== undefined) dataToUpdate.role = role;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (exerciseGoal !== undefined) dataToUpdate.exerciseGoal = exerciseGoal;
    if (focusArea !== undefined) dataToUpdate.focusArea = focusArea;
    if (currentHeightInCm !== undefined)
      dataToUpdate.currentHeightInCm = Number(currentHeightInCm);
    if (currentWeightInKg !== undefined)
      dataToUpdate.currentWeightInKg = Number(currentWeightInKg);
    if (birthYear !== undefined) dataToUpdate.birthYear = Number(birthYear);
    if (weeklyGoalInKM !== undefined)
      dataToUpdate.weeklyGoalInKM = Number(weeklyGoalInKM);
    if (weightInKgGoal !== undefined)
      dataToUpdate.weightInKgGoal = Number(weightInKgGoal);
    if (physicalActivityLevel !== undefined)
      dataToUpdate.physicalActivityLevel = physicalActivityLevel;
    if (bmiResult !== undefined) dataToUpdate.bmiResult = Number(bmiResult);
    if (imgUri !== undefined) dataToUpdate.imgUri = imgUri;

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json(
        { error: "No fields provided to update." },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user.", detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}