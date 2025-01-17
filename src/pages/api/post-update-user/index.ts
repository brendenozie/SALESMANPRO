import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../server/db/prismadb";

// POST /api/post

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  // const { id } = req.query;

  // Ensure it's a PUT request
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
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
      imgUri
    } = req.body;


    // Create a data object with only the fields that are present
    const dataToUpdate: any = {};
    if (name && name !== undefined) dataToUpdate.name = name;
    if (email && email !== undefined) dataToUpdate.email = email;
    if (password && password !== undefined) dataToUpdate.hashedPassword = password;
    if (role && role !== undefined) dataToUpdate.role = role;
    if (gender && gender !== undefined) dataToUpdate.gender = gender;
    if (exerciseGoal && exerciseGoal !== undefined) dataToUpdate.exerciseGoal = exerciseGoal;
    if (focusArea && focusArea !== undefined) dataToUpdate.focusArea = focusArea;
    if (currentHeightInCm && currentHeightInCm !== undefined) dataToUpdate.currentHeightInCm = Number(currentHeightInCm);
    if (currentWeightInKg && currentWeightInKg !== undefined) dataToUpdate.currentWeightInKg = Number(currentWeightInKg);
    if (birthYear && birthYear !== undefined) dataToUpdate.birthYear = Number(birthYear);
    if (weeklyGoalInKM && weeklyGoalInKM !== undefined) dataToUpdate.weeklyGoalInKM = Number(weeklyGoalInKM);
    if (weightInKgGoal && weightInKgGoal !== undefined) dataToUpdate.weightInKgGoal = Number(weightInKgGoal);
    if (physicalActivityLevel && physicalActivityLevel !== undefined) dataToUpdate.physicalActivityLevel = physicalActivityLevel;
    if (bmiResult && bmiResult !== undefined) dataToUpdate.bmiResult = Number(bmiResult);
    if (imgUri && imgUri !== undefined) dataToUpdate.imgUri = imgUri;

    // Check if there's anything to update
    if (Object.keys(dataToUpdate).length === 0) {
      return res.status(400).json({ error: 'No fields provided to update' });
    }

    // Update user in the database using Prisma
    const updatedUser = await prisma.user.update({
      where: {
        id: String(id), // Assuming ID is an ObjectId string
      },
      data: dataToUpdate,
    });

    // Update user in the database using Prisma
    // const updatedUser = await prisma.user.update({
    //   where: {
    //     id: String(id), // Assuming ID is an ObjectId string
    //   },
    //   data: {
    //     name,
    //     email,
    //     hashedPassword,
    //     role,
    //     gender,
    //     exerciseGoal,
    //     focusArea,
    //     currentHeightInCm: Number(currentHeightInCm),
    //     currentWeightInKg: Number(currentWeightInKg),
    //     birthYear: Number(birthYear),
    //     weeklyGoalInKM: Number(weeklyGoalInKM),
    //     weightInKgGoal: Number(weightInKgGoal),
    //     physicalActivityLevel,
    //     bmiResult: Number(bmiResult),
    //     imgUri,
    //   },
    // });

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    await prisma.$disconnect();
  }
}