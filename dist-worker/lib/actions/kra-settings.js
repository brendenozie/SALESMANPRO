"use server";
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveKraConfiguration = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
const cache_1 = require("next/cache");
const aes_1 = require("../crypto/aes");
async function saveKraConfiguration(companyId, formData) {
    const kraPin = formData.get("kraPin");
    const branchId = formData.get("branchId") || "00";
    const managerKey = formData.get("managerKey");
    const environment = formData.get("environment");
    const etimsEnabled = formData.get("etimsEnabled") === "true";
    // Basic validation
    if (!kraPin || !companyId) {
        return { success: false, message: "Missing required fields" };
    }
    // Encrypt the manager key if provided
    const encryptedManagerKey = managerKey ? (0, aes_1.encryptKRA)(managerKey) : null;
    try {
        // Upsert ensures we either update the existing config or create a new one
        await prismadb_1.default.kraConfiguration.upsert({
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
        (0, cache_1.revalidatePath)("/settings/kra"); // Revalidates the page to show fresh data
        return { success: true, message: "KRA Configuration saved successfully" };
    }
    catch (error) {
        console.error("KRA Save Error:", error);
        return {
            success: false,
            message: "Failed to save configuration to database",
        };
    }
}
exports.saveKraConfiguration = saveKraConfiguration;
