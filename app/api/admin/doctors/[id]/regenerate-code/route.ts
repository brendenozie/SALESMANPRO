import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// PATCH: Regenerate loginCode for a doctor (and sync staffProfile)
// =======================================================================
async function regenerateLoginCode(req: Request, { params }: { params: { id: string } }) {
  const doctorId = params.id;

  if (!doctorId) {
    return formatResponse(false, null, "Missing doctorId", 400);
  }

  // Generate unique loginCode
  let loginCode: string;
  let unique = false;
  do {
    loginCode = Math.floor(100000 + Math.random() * 900000).toString();
    const existingDoctor = await prisma.doctor.findUnique({ where: { loginCode } });
    const existingStaff = await prisma.staffProfile.findUnique({ where: { loginCode } });
    if (!existingDoctor && !existingStaff) unique = true;
  } while (!unique);

  // Update doctor
  const updatedDoctor = await prisma.doctor.update({
    where: { id: doctorId },
    data: { loginCode },
    include: { User: true, StaffProfile: true },
  });

  // Sync staffProfile
  if (updatedDoctor.StaffProfile && Array.isArray(updatedDoctor.StaffProfile)) {
    for (const staff of updatedDoctor.StaffProfile) {
      await prisma.staffProfile.update({
        where: { id: staff.id },
        data: { loginCode },
      });
    }
  }

  return formatResponse(true, { data: { ...updatedDoctor, loginCode } }, null, 200);
}

export const PATCH = withApiHandler(regenerateLoginCode);
