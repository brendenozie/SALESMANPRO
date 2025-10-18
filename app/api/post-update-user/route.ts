// app/api/users/update/route.ts
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// PUT /api/users/update
// Updates user details
async function PUT(request: Request) {
  try {
    
    const body = await request.json();
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
      return formatResponse(false, null, "User ID is required", 400);
    }

    // Build only the fields provided
    const dataToUpdate: any = {};
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.hashedPassword = password; // should be hashed before save
    if (role) dataToUpdate.role = role;
    if (gender) dataToUpdate.gender = gender;
    if (exerciseGoal) dataToUpdate.exerciseGoal = exerciseGoal;
    if (focusArea) dataToUpdate.focusArea = focusArea;
    if (currentHeightInCm) dataToUpdate.currentHeightInCm = Number(currentHeightInCm);
    if (currentWeightInKg) dataToUpdate.currentWeightInKg = Number(currentWeightInKg);
    if (birthYear) dataToUpdate.birthYear = Number(birthYear);
    if (weeklyGoalInKM) dataToUpdate.weeklyGoalInKM = Number(weeklyGoalInKM);
    if (weightInKgGoal) dataToUpdate.weightInKgGoal = Number(weightInKgGoal);
    if (physicalActivityLevel) dataToUpdate.physicalActivityLevel = physicalActivityLevel;
    if (bmiResult) dataToUpdate.bmiResult = Number(bmiResult);
    if (imgUri) dataToUpdate.imgUri = imgUri;

    if (Object.keys(dataToUpdate).length === 0) {
      return formatResponse(false, null, "No fields provided to update", 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(id) },
      data: dataToUpdate,
    });

    return formatResponse(true, updatedUser, "User updated successfully", 200);
  } catch (err: any) {
    console.error("PUT /api/users/update error:", err);
    return formatResponse(false, null, err.message || "Failed to update user", 500);
  } finally {
    await prisma.$disconnect();
  }
}

export const PUTHandler = withApiHandler(PUT);
