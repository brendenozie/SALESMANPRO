import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// PATCH /api/exam-submissions/[id]
// (Assuming this already exists from previous steps for updating score/feedback)
// If not, you'd add it here. For context, here's a basic PATCH:

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const body = await request.json();
    const { score, feedback, ...rest } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for exam submission:", rest);
    }

    const updateData: any = {};
    if (score !== undefined) updateData.score = score;
    if (feedback !== undefined) updateData.feedback = feedback;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: "No fields provided for update." }, { status: 400 });
    }

    const updatedSubmission = await prisma.examSubmission.update({
      where: { id },
      data: updateData,
      include: {
        exam: { select: { id: true, title: true, type: true, totalPoints: true, isOnline: true, course: { select: { title: true } } } },
        student: { select: { id: true, user: { select: { name: true, email: true } }, academicLevel: { select: { id: true, name: true } } } },
      },
    });

    const responseData = {
      id: updatedSubmission.id,
      examId: updatedSubmission.examId,
      examTitle: updatedSubmission.exam?.title || 'N/A',
      examType: updatedSubmission.exam?.type || 'N/A',
      examTotalPoints: updatedSubmission.exam?.totalPoints || 0,
      examIsOnline: updatedSubmission.exam?.isOnline || false,
      studentId: updatedSubmission.studentId,
      studentName: updatedSubmission.student?.user?.name || 'N/A',
      studentEmail: updatedSubmission.student?.user?.email || 'N/A',
      studentAcademicLevel: updatedSubmission.student?.academicLevel?.name || null,
      submittedAt: updatedSubmission.submittedAt,
      score: updatedSubmission.score,
      feedback: updatedSubmission.feedback,
      answers: updatedSubmission.answers,
      createdAt: updatedSubmission.createdAt,
      updatedAt: updatedSubmission.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating exam submission with ID ${id}:`, error);
    if (error.code === 'P2025') { // Record not found
      return NextResponse.json({ message: "Exam submission not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to update exam submission", error: error.message }, { status: 500 });
  }
}


// DELETE /api/exam-submissions/[id]
// (Assuming this already exists from previous steps)

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  try {
    const deletedSubmission = await prisma.examSubmission.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Exam submission deleted successfully", deletedId: deletedSubmission.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting exam submission with ID ${id}:`, error);
    if (error.code === 'P2025') {
      return NextResponse.json({ message: "Exam submission not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Failed to delete exam submission", error: error.message }, { status: 500 });
  }
}

