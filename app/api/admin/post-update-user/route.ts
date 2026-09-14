import prisma from "@/server/db/prismadb";
import { formatResponse } from "@/lib/formatResponse";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { ROLES } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  role: z.nativeEnum(ROLES).optional(),
  gender: z.string().optional(),
  exerciseGoal: z.string().optional(),
  focusArea: z.string().optional(),
  currentHeightInCm: z.number().optional(),
  currentWeightInKg: z.number().optional(),
  birthYear: z.number().optional(),
  weeklyGoalInKM: z.number().optional(),
  weightInKgGoal: z.number().optional(),
  physicalActivityLevel: z.string().optional(),
  bmiResult: z.number().optional(),
  imgUri: z.string().optional(),
});

async function handlePut(req: Request, context: any) {
  const caller = context.user;
  if (!caller) {
    return formatResponse(false, null, "Authentication required", 401);
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return formatResponse(false, null, "Invalid JSON payload", 400);
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return formatResponse(false, null, parsed.error.errors, 400);
  }

  const { id, password, role, ...fieldsToUpdate } = parsed.data;

  // Retrieve target user to verify tenant and authorization
  const targetUser = await prisma.user.findUnique({
    where: { id },
    select: { id: true, companyId: true, role: true, email: true },
  });

  if (!targetUser) {
    return formatResponse(false, null, "User not found", 404);
  }

  const isSelf = caller.id === targetUser.id;
  const isSuperAdmin = caller.role === "SUPER_ADMIN";
  const isTenantAdmin =
    caller.role === "ADMIN" &&
    caller.companyId &&
    caller.companyId === targetUser.companyId;

  // IDOR & Authorization boundary check
  if (!isSelf && !isSuperAdmin && !isTenantAdmin) {
    return formatResponse(
      false,
      null,
      "Forbidden: You do not have permission to modify this user account",
      403,
    );
  }

  const data: any = { ...fieldsToUpdate };

  // Role Escalation Defense: Only SUPER_ADMIN or authorized tenant ADMIN can modify roles
  if (role !== undefined) {
    if (isSelf && !isSuperAdmin) {
      return formatResponse(
        false,
        null,
        "Forbidden: Users cannot modify their own security roles",
        403,
      );
    }

    if (role === "SUPER_ADMIN" && !isSuperAdmin) {
      return formatResponse(
        false,
        null,
        "Forbidden: Only a Super Admin can grant SUPER_ADMIN privileges",
        403,
      );
    }

    if (!isSuperAdmin && !isTenantAdmin) {
      return formatResponse(
        false,
        null,
        "Forbidden: Insufficient privileges to change user role",
        403,
      );
    }

    data.role = role;
  }

  // Cryptographic Password Hashing (replaces unsafe plaintext storage)
  if (password) {
    data.hashedPassword = await bcrypt.hash(password, 12);
  }

  if (Object.keys(data).length === 0) {
    return formatResponse(false, null, "No fields provided to update", 400);
  }

  data.updatedAt = new Date();

  const updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      companyId: true,
      gender: true,
      imgUri: true,
      updatedAt: true,
    },
  });

  return formatResponse(
    true,
    updatedUser,
    "User account updated successfully",
    200,
  );
}

export const PUT = withApiHandler(handlePut, {
  requireAuth: true,
});
