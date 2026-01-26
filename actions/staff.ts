"use server";

import prisma from "@/server/db/prismadb";
import { revalidatePath } from "next/cache";

export async function addStaffMember(formData: any, companyId: string) {
  try {
    const { name, email, jobTitle, department, role } = formData;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the User
      const user = await tx.user.create({
        data: {
          name,
          email,
          companyId,
          role: role || "ADMIN", // Defaulting to ADMIN per your schema default
          status: "ACTIVE",
          // 2. Create the linked StaffProfile
          staffProfile: {
            create: {
              companyId,
              jobTitle,
              department,
              employmentStatus: "ACTIVE",
              startDate: new Date(),
            },
          },
        },
      });
      return user;
    });

    revalidatePath(`/admin/staff/${companyId}`);
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Staff Creation Error:", error);
    return { success: false, error: error.message };
  }
}