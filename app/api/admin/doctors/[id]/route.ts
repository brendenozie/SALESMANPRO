import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

// =======================================================================
// Reuse the formatter
// =======================================================================
async function formatDoctorData(doctor: any) {
  return {
    id: doctor.id,
    userId: doctor.userId,
    name: doctor.User?.name || "N/A",
    email: doctor.User?.email || "N/A",
    phone: doctor.User?.phone || "N/A",
    profilePicture:
      doctor.User?.profilePicture ||
      "https://placehold.co/100x100/A7F3D0/0D9488?text=DR",
    specialty: doctor.specialty || "N/A",
    status: doctor.status,
    createdAt: doctor.createdAt
      ? new Date(doctor.createdAt).toLocaleDateString()
      : "N/A",
    loginCode: doctor.loginCode,
    staffProfile: doctor.StaffProfile
      ? {
          id: doctor.StaffProfile.id,
          jobTitle: doctor.StaffProfile.jobTitle,
          department: doctor.StaffProfile.department,
          employmentStatus: doctor.StaffProfile.employmentStatus,
        }
      : null,
  };
}

// =======================================================================
// GET: Fetch single doctor
// =======================================================================
async function getDoctor(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: {
      User: { select: { id: true, name: true, email: true, phone: true, profilePicture: true } },
      StaffProfile: true,
    },
  });

  if (!doctor) return formatResponse(false, null, "Doctor not found", 404);

  const formatted = await formatDoctorData(doctor);
  return formatResponse(true, formatted, "Doctor fetched successfully", 200);
}

// =======================================================================
// PUT: Update doctor (+ user + staff profile)
// =======================================================================
async function updateDoctor(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const body = await req.json();
  const { name, email, phone, profilePicture, specialty, status, jobTitle, department, employmentStatus } = body;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { User: true, StaffProfile: {
      select: { id: true, jobTitle: true, department: true, employmentStatus: true }
    } },
  });

  if (!doctor) return formatResponse(false, null, "Doctor not found", 404);

  try {
    // Update related User
    if (doctor.userId) {
      await prisma.user.update({
        where: { id: doctor.userId },
        data: { name, email, phone, profilePicture },
      });
    }

    // Update Doctor profile
    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: { specialty, status, phone, profilePicture },
      include: { User: true, StaffProfile: {
        select: { id: true, jobTitle: true, department: true, employmentStatus: true }
      } },
    });

    // Update StaffProfile(s) if exist
    if (doctor.StaffProfile && Array.isArray(doctor.StaffProfile)) {
      for (const staff of doctor.StaffProfile) {
        await prisma.staffProfile.update({
          where: { id: staff.id },
          data: { jobTitle, department, employmentStatus },
        });
      }
    }

    const formatted = await formatDoctorData(updatedDoctor);
    return formatResponse(true, formatted, "Doctor updated successfully", 200);
  } catch (err: any) {
    if (err.code === "P2002" && err.meta?.target?.includes("email")) {
      return formatResponse(false, null, "Email already exists.", 409);
    }
    throw err;
  }
}

// =======================================================================
// DELETE: Remove doctor (+ user + staffProfile)
// =======================================================================
async function deleteDoctor(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { StaffProfile: {
      select: { id: true }
    } },
  });

  if (!doctor) return formatResponse(false, null, "Doctor not found", 404);

  // Delete staff profiles if exist
  if (doctor.StaffProfile && Array.isArray(doctor.StaffProfile)) {
    for (const staff of doctor.StaffProfile) {
      await prisma.staffProfile.delete({ where: { id: staff.id } });
    }
  }

  // Delete doctor
  await prisma.doctor.delete({ where: { id } });

  // Optionally delete User (only if not tied to other roles)
  if (doctor.userId) {
    const userLinks = await prisma.doctor.count({ where: { userId: doctor.userId } });
    if (userLinks === 0) {
      await prisma.user.delete({ where: { id: doctor.userId } });
    }
  }

  return formatResponse(true, { deletedId: id }, "Doctor deleted successfully", 200);
}

// =======================================================================
// Exports
// =======================================================================
export const GET = withApiHandler(getDoctor);
export const PUT = withApiHandler(updateDoctor);
export const DELETE = withApiHandler(deleteDoctor);
