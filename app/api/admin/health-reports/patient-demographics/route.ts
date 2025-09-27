import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";
import { Role } from "@prisma/client"; // Assuming Role enum is available

/**
 * GET Handler: Generates a patient demographics report for the specified company.
 */
async function getPatientDemographicsReport(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  const { adminSlug } = params;
  const { searchParams } = new URL(request.url);

  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");

  // 1. Find Company
  const company = await prisma.company.findUnique({
    where: { slug: adminSlug },
    select: { id: true }
  });

  if (!company) {
    return formatResponse(false, null, "Company not found", 404);
  }

  const companyId = company.id;

  let dateFilter: any = {};
  if (startDateParam) {
    dateFilter.gte = new Date(startDateParam);
  }
  if (endDateParam) {
    dateFilter.lte = new Date(endDateParam);
  }

  const patientRoles: Role[] = ["CLIENT", "CONSUMER", "STUDENT", "PARENT"] as Role[];

  // 2. Fetch all relevant patient data
  const patients = await prisma.user.findMany({
    where: {
      Company: { some: { id: companyId } },
      role: { in: patientRoles },
      createdAt: dateFilter,
    },
    select: {
      id: true,
      gender: true, // Assuming `gender` is a string field on User
      dateOfBirth: true, // Assuming `dateOfBirth` is a Date field on User
      createdAt: true,
    },
  });

  const totalPatients = patients.length;

  // 3. Calculate Demographics
  const genderDistribution = patients.reduce((acc, patient) => {
    const genderKey = patient.gender || 'Unknown';
    acc[genderKey] = (acc[genderKey] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const getAge = (dob: Date | null): number | null => {
    if (!dob) return null;
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const ageGroups = patients.reduce((acc, patient) => {
    const age = getAge(patient.dateOfBirth);
    let group: string = 'Unknown';

    if (age !== null) {
      if (age < 18) group = '<18';
      else if (age <= 35) group = '18-35';
      else if (age <= 60) group = '36-60';
      else group = '>60';
    }

    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });


  // 4. Calculate New Patients Last Month
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const newPatientsLastMonth = await prisma.user.count({
    where: {
      Company: { some: { id: companyId } },
      role: { in: patientRoles },
      createdAt: {
        gte: oneMonthAgo,
      },
    },
  });

  // 5. Return formatted success response
  return formatResponse(true, {
    reportName: "Patient Demographics",
    period: startDateParam && endDateParam ? `${startDateParam} to ${endDateParam}` : "All Time",
    data: {
      totalPatients,
      genderDistribution,
      ageGroups,
      newPatientsLastMonth,
    },
  }, "Patient demographics report generated successfully", 200);
}

// Wrap the core logic with the API handler middleware
export const GET = withApiHandler(getPatientDemographicsReport);
