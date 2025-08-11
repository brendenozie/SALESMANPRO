// lib/data.ts

import { PrismaClient, Student, FeeItem, StudentFeeRecord as PrismaStudentFeeRecord, StudentLevelStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Re-export types from Prisma Client for consistency and direct use in frontend
export type { Student, FeeItem, StudentLevelStatus };

// Define the extended StudentFeeRecord type to include calculated fields
// This type is used on the frontend and in API responses
export type StudentFeeRecord = Omit<PrismaStudentFeeRecord, 'appliedFeeItems' | 'payments'> & {
  // These are derived from 'appliedFeeItems' and 'payments'
  calculatedTotalFeesDue: number;
  calculatedBalanceDue: number;
  // Re-include the JSON types for clarity in our application logic
  appliedFeeItems: Array<{
    feeItemId: string;
    name: string;
    amount: number;
    description?: string;
    isMandatory?: boolean;
  }>;
  payments: Array<{
    paymentId: string;
    amount: number;
    date: string;
    method: string;
    receiptNumber?: string;
  }>;
};

// Helper function to calculate payment status and balance
const calculateFeeStatusAndBalance = (totalFeesDue: number, amountPaid: number): { balanceDue: number; paymentStatus: StudentFeeRecord['paymentStatus'] } => {
  const balanceDue = totalFeesDue - amountPaid;
  let paymentStatus: StudentFeeRecord['paymentStatus'];

  if (balanceDue <= 0) {
    paymentStatus = "Paid";
    if (amountPaid > totalFeesDue) paymentStatus = "Overpaid";
  } else if (amountPaid > 0) {
    paymentStatus = "Partially Paid";
  } else {
    paymentStatus = "Unpaid";
  }
  return { balanceDue, paymentStatus };
};

// Helper to convert Prisma's raw JSON types to our more specific types
const mapPrismaFeeRecordToAppType = (prismaRecord: PrismaStudentFeeRecord): StudentFeeRecord => {
  const appliedFeeItems = (prismaRecord.appliedFeeItems as any[]) || [];
  const payments = (prismaRecord.payments as any[]) || [];

  const calculatedTotalFeesDue = appliedFeeItems.reduce((sum, item) => sum + item.amount, 0);
  const calculatedBalanceDue = calculatedTotalFeesDue - prismaRecord.amountPaid;

  return {
    ...prismaRecord,
    appliedFeeItems,
    payments,
    calculatedTotalFeesDue,
    calculatedBalanceDue,
  };
};

// --- Student Operations ---
export const getStudents = async (): Promise<Student[]> => {
  return prisma.student.findMany();
};

export const getStudentById = async (id: string): Promise<Student | null> => {
  return prisma.student.findUnique({ where: { id } });
};

export const createStudent = async (data: Omit<Student, 'id'>): Promise<Student> => {
  return prisma.student.create({ data });
};

export const updateStudent = async (id: string, data: Partial<Omit<Student, 'id'>>): Promise<Student | null> => {
  try {
    return prisma.student.update({ where: { id }, data });
  } catch (error) {
    console.error("Error updating student:", error);
    return null;
  }
};

export const deleteStudent = async (id: string): Promise<boolean> => {
  try {
    await prisma.student.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting student:", error);
    return false;
  }
};

// --- FeeItem Operations ---
export const getFeeItems = async (): Promise<FeeItem[]> => {
  return prisma.feeItem.findMany();
};

export const getFeeItemById = async (id: string): Promise<FeeItem | null> => {
  return prisma.feeItem.findUnique({ where: { id } });
};

export const createFeeItem = async (data: Omit<FeeItem, 'id'>): Promise<FeeItem> => {
  return prisma.feeItem.create({ data });
};

export const updateFeeItem = async (id: string, data: Partial<Omit<FeeItem, 'id'>>): Promise<FeeItem | null> => {
  try {
    return prisma.feeItem.update({ where: { id }, data });
  } catch (error) {
    console.error("Error updating fee item:", error);
    return null;
  }
};

export const deleteFeeItem = async (id: string): Promise<boolean> => {
  try {
    await prisma.feeItem.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting fee item:", error);
    return false;
  }
};

// --- StudentFeeRecord Operations ---

export const getStudentFeeRecords = async (): Promise<StudentFeeRecord[]> => {
  const records = await prisma.studentFeeRecord.findMany({
    include: {
      student: true, // Include student details if needed for display
    },
  });
  return records.map(mapPrismaFeeRecordToAppType);
};

export const getStudentFeeRecordById = async (id: string): Promise<StudentFeeRecord | null> => {
  const record = await prisma.studentFeeRecord.findUnique({
    where: { id },
    include: {
      student: true,
    },
  });
  return record ? mapPrismaFeeRecordToAppType(record) : null;
};

// Function to create a new StudentFeeRecord by applying FeeItems
export const createStudentFeeRecord = async (
  studentId: string,
  academicYear: string,
  term: string
): Promise<StudentFeeRecord | null> => {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    console.error(`Student with ID ${studentId} not found.`);
    return null;
  }

  // Check if a record for this student, year, and term already exists
  const existingRecord = await prisma.studentFeeRecord.findUnique({
    where: {
      studentId_academicYear_term: {
        studentId,
        academicYear,
        term,
      },
    },
  });

  if (existingRecord) {
    console.warn(`Fee record for student ${student.firstName} ${student.lastName} for ${term}, ${academicYear} already exists. Returning existing record.`);
    return mapPrismaFeeRecordToAppType(existingRecord); // Return existing record
  }

  // Find applicable FeeItems based on student's currentClass and academicLevel
  const applicableFeeItems = await prisma.feeItem.findMany({
    where: {
      OR: [
        { applicableTo: "ALL" },
        {
          applicableTo: "CLASS",
          applicableValue: student.currentClass,
        },
        {
          applicableTo: "ACADEMIC_LEVEL",
          applicableValue: student.academicLevel,
        },
        // Add logic for 'COURSE' if you track student courses
        // {
        //   applicableTo: "COURSE",
        //   applicableValue: { in: student.enrolledCourses }, // Assuming student.enrolledCourses is an array
        // },
      ],
      // Filter by academicYear and term if the FeeItem itself is year/term specific
      AND: [
        {
          OR: [
            { academicYear: null }, // Fee item applies to all years if null
            { academicYear: academicYear },
          ]
        },
        {
          OR: [
            { term: null }, // Fee item applies to all terms if null
            { term: term },
          ]
        }
      ]
    },
  });

  // Construct the appliedFeeItems array (snapshot)
  const appliedFeeItemsSnapshot = applicableFeeItems.map(item => ({
    feeItemId: item.id,
    name: item.name,
    amount: item.defaultAmount,
    description: item.description || null,
    isMandatory: item.isMandatory,
  }));

  const initialTotalFeesDue = appliedFeeItemsSnapshot.reduce((sum, item) => sum + item.amount, 0);
  const initialAmountPaid = 0; // Always 0 when creating a new record
  const { balanceDue, paymentStatus } = calculateFeeStatusAndBalance(initialTotalFeesDue, initialAmountPaid);

  const newRecord = await prisma.studentFeeRecord.create({
    data: {
      studentId: student.id,
      academicYear,
      term,
      amountPaid: initialAmountPaid,
      paymentStatus,
      lastPaymentDate: null,
      dueDate: null, // Admin can set this later or based on school policy
      appliedFeeItems: appliedFeeItemsSnapshot,
      payments: [],
    },
  });

  return mapPrismaFeeRecordToAppType(newRecord);
};


export const updateStudentFeeRecord = async (id: string, data: Partial<Omit<PrismaStudentFeeRecord, 'id' | 'studentId' | 'payments' | 'appliedFeeItems'>>): Promise<StudentFeeRecord | null> => {
  try {
    const currentRecord = await prisma.studentFeeRecord.findUnique({ where: { id } });
    if (!currentRecord) return null;

    // Only update fields that are not automatically calculated or managed by payments
    const updatedPrismaRecord = await prisma.studentFeeRecord.update({
      where: { id },
      data: {
        dueDate: data.dueDate,
        invoiceNumber: data.invoiceNumber,
        // Do NOT directly update amountPaid, balanceDue, paymentStatus, appliedFeeItems here
        // These are managed by addPaymentToRecord or createStudentFeeRecord
      },
    });

    return mapPrismaFeeRecordToAppType(updatedPrismaRecord);
  } catch (error) {
    console.error("Error updating student fee record:", error);
    return null;
  }
};

export const addPaymentToStudentFeeRecord = async (
  recordId: string,
  payment: { amount: number; date: string; method: string; receiptNumber?: string }
): Promise<StudentFeeRecord | null> => {
  const record = await prisma.studentFeeRecord.findUnique({ where: { id: recordId } });
  if (!record) return null;

  const newPaymentEntry = { ...payment, paymentId: uuidv4() };
  // Ensure payments is treated as an array of JSON objects
  const existingPayments = (record.payments || []) as any[]; // Cast to any[] for array methods
  const updatedPayments = [...existingPayments, newPaymentEntry];

  const newAmountPaid = record.amountPaid + payment.amount;
  const calculatedTotalFeesDue = (record.appliedFeeItems as any[]).reduce((sum, item) => sum + item.amount, 0);
  const { balanceDue, paymentStatus } = calculateFeeStatusAndBalance(calculatedTotalFeesDue, newAmountPaid);

  const updatedPrismaRecord = await prisma.studentFeeRecord.update({
    where: { id: recordId },
    data: {
      amountPaid: newAmountPaid,
      // balanceDue: balanceDue, // Store calculated balance for easier querying (optional, but good for performance)
      paymentStatus,
      lastPaymentDate: payment.date,
      payments: updatedPayments, // Update the array of embedded documents
    },
  });

  return mapPrismaFeeRecordToAppType(updatedPrismaRecord);
};

export const deleteStudentFeeRecord = async (id: string): Promise<boolean> => {
  try {
    await prisma.studentFeeRecord.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error("Error deleting student fee record:", error);
    return false;
  }
};

// --- NEW: Batch Fee Application Logic ---
export type BatchApplyFeeParams = {
  academicYear: string;
  term: string;
  targetType: "CLASS" | "ACADEMIC_LEVEL" | "ALL";
  targetValue?: string; // e.g., "Grade 10A", "SENIOR"
};

export const applyFeeItemsToStudentsInBatch = async (params: BatchApplyFeeParams): Promise<{ created: number; existing: number; failed: number; }> => {
  const { academicYear, term, targetType, targetValue } = params;

  let studentsToTarget: Student[] = [];

  if (targetType === "ALL") {
    studentsToTarget = await prisma.student.findMany();
  } else if (targetType === "CLASS" && targetValue) {
    studentsToTarget = await prisma.student.findMany({
      where: { currentClass: targetValue },
    });
  } else if (targetType === "ACADEMIC_LEVEL" && targetValue) {
    // Ensure targetValue matches StudentLevelStatus enum values
    if (Object.values(StudentLevelStatus).includes(targetValue as StudentLevelStatus)) {
      studentsToTarget = await prisma.student.findMany({
        where: { academicLevel: targetValue as StudentLevelStatus },
      });
    } else {
      console.warn(`Invalid academic level provided: ${targetValue}`);
      return { created: 0, existing: 0, failed: studentsToTarget.length };
    }
  } else {
    console.warn("Invalid targetType or missing targetValue for batch fee application.");
    return { created: 0, existing: 0, failed: 0 };
  }

  let createdCount = 0;
  let existingCount = 0;
  let failedCount = 0;

  for (const student of studentsToTarget) {
    try {
      const result = await createStudentFeeRecord(student.id, academicYear, term);
      if (result) {
        // createStudentFeeRecord returns existing record if it already exists
        const existingRecord = await prisma.studentFeeRecord.findUnique({
          where: { studentId_academicYear_term: { studentId: student.id, academicYear, term } }
        });
        if (existingRecord && existingRecord.id === result.id) { // Check if it's the same record, implying it existed
            existingCount++;
        } else {
            createdCount++;
        }
      } else {
        failedCount++;
      }
    } catch (error) {
      console.error(`Failed to apply fee for student ${student.id}:`, error);
      failedCount++;
    }
  }

  return { created: createdCount, existing: existingCount, failed: failedCount };
};


// Disconnect Prisma Client when the process exits
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
