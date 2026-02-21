import { cacheDel } from "@/lib/cache";
import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";

// ✅ PUT: Update an Exam Category
const updateExamCategory = async (request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;
  const body = await request.json();
  const { name, description, companyId } = body;

  try {
    // 1. Check if the category exists
    const existingCategory = await prisma.examCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json({ message: "Exam Category not found." }, { status: 404 });
    }

    // 2. If name or companyId is changing, check for uniqueness conflict
    if (name || companyId) {
      const conflictCheck = await prisma.examCategory.findFirst({
        where: {
          companyId: companyId || existingCategory.companyId,
          name: name || existingCategory.name,
          NOT: { id }, // Ensure we aren't flagging the current record
        },
      });

      if (conflictCheck) {
        return NextResponse.json(
          { message: "A category with this name already exists for this company." },
          { status: 409 }
        );
      }
    }

    // 3. Perform the update
    const updatedCategory = await prisma.examCategory.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        companyId: companyId ?? undefined,
      },
    });

    // Invalidate caches
    try { await cacheDel(`admin:exam-categories:school:${updatedCategory.companyId}`); } catch (e) {}

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Update failed", error: error.message }, { status: 500 });
  }
};

// ✅ DELETE: Remove an Exam Category
const deleteExamCategory = async (_request: Request, { params }: { params: { id: string } }) => {
  const { id } = params;

  try {
    // 1. Check if the category has related exams (Prevent accidental orphaned data)
    const categoryWithExams = await prisma.examCategory.findUnique({
      where: { id },
      include: { _count: { select: { exams: true } } },
    });

    if (!categoryWithExams) {
      return NextResponse.json({ message: "Exam Category not found." }, { status: 404 });
    }

    if (categoryWithExams._count.exams > 0) {
      return NextResponse.json(
        { message: "Cannot delete category: It contains active exams. Delete or reassign exams first." },
        { status: 400 }
      );
    }

    // 2. Delete the record
    await prisma.examCategory.delete({
      where: { id },
    });

    // Invalidate caches
    try { await cacheDel(`admin:exam-categories:school:${categoryWithExams.companyId}`); } catch (e) {}

    return NextResponse.json({ message: "Category deleted successfully." }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: "Delete failed", error: error.message }, { status: 500 });
  }
};

// ✅ Export wrapped handlers
export const PUT = withApiHandler(updateExamCategory, { requireAuth: true, requireRateLimit: true });
export const DELETE = withApiHandler(deleteExamCategory, { requireAuth: true, requireRateLimit: true });