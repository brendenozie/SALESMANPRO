"use server";

import prisma from "@/server/db/prismadb";
import { revalidatePath } from "next/cache";
import { encryptKRA } from "../crypto/aes";

export async function saveKraConfiguration(
  companyId: string,
  formData: FormData,
) {
  const kraPin = formData.get("kraPin") as string;
  const branchId = (formData.get("branchId") as string) || "00";
  const managerKey = formData.get("managerKey") as string;
  const environment = formData.get("environment") as string;
  const etimsEnabled = formData.get("etimsEnabled") === "true";

  // Basic validation
  if (!kraPin || !companyId) {
    return { success: false, message: "Missing required fields" };
  }

  // Encrypt the manager key if provided
  const encryptedManagerKey = managerKey ? encryptKRA(managerKey) : null;

  try {
    // Upsert ensures we either update the existing config or create a new one
    await prisma.kraConfiguration.upsert({
      where: { companyId },
      update: {
        kraPin,
        branchId,
        managerKey: encryptedManagerKey,
        environment,
        etimsEnabled,
        updatedAt: new Date(),
      },
      create: {
        companyId,
        kraPin,
        branchId,
        managerKey: encryptedManagerKey,
        environment,
        etimsEnabled,
      },
    });

    revalidatePath("/settings/kra"); // Revalidates the page to show fresh data
    return { success: true, message: "KRA Configuration saved successfully" };
  } catch (error) {
    console.error("KRA Save Error:", error);
    return {
      success: false,
      message: "Failed to save configuration to database",
    };
  }
}
