import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

// Define valid QuestionTypes (must match your Prisma enum)
const VALID_QUESTION_TYPES = ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "ESSAY", "FILL_IN_THE_BLANK", "MATCHING", "NUMERIC"];

// GET /api/exam-questions/[id]
// Fetches a single ExamQuestion by its ID.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const question = await prisma.examQuestion.findUnique({
      where: { id },
      include: {
        exam: {
          select: {
            id: true,
            title: true,
            courseId: true,
            course: { select: { title: true } },
          },
        },
      },
    });

    if (!question) {
      return NextResponse.json({ message: "Exam question not found" }, { status: 404 });
    }

    // Transform response
    const responseData = {
      id: question.id,
      examId: question.examId,
      examTitle: question.exam?.title || 'N/A',
      examCourseTitle: question.exam?.course?.title || 'N/A',
      questionText: question.questionText,
      imageUrl: question.imageUrl,
      videoUrl: question.videoUrl,
      questionType: question.questionType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      points: question.points,
      order: question.order,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching exam question with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch exam question", error: error.message }, { status: 500 });
  }
}

// PATCH /api/exam-questions/[id]
// Updates an existing ExamQuestion by ID.
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const body = await request.json();
    const {
      examId, // Typically not changed for a question
      questionText,
      imageUrl,
      videoUrl,
      questionType,
      options,
      correctAnswer,
      points,
      order,
      ...rest
    } = body;

    if (Object.keys(rest).length > 0) {
      console.warn("Unexpected fields in PATCH request for exam question:", rest);
    }

    const existingQuestion = await prisma.examQuestion.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ message: "Exam question not found" }, { status: 404 });
    }

    const updateData: any = {};

    if (questionText !== undefined) updateData.questionText = questionText;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (points !== undefined) updateData.points = points;
    if (order !== undefined) updateData.order = order;

    // Validate and update questionType
    if (questionType !== undefined) {
      if (!VALID_QUESTION_TYPES.includes(questionType)) {
        return NextResponse.json({ message: `Invalid question type: ${questionType}. Must be one of ${VALID_QUESTION_TYPES.join(', ')}.` }, { status: 400 });
      }
      updateData.questionType = questionType;
    }

    // Validate and update options
    if (options !== undefined) {
      if (!Array.isArray(options)) {
        return NextResponse.json({ message: "Options must be an array." }, { status: 400 });
      }
      if (updateData.questionType === 'MULTIPLE_CHOICE' && options.length === 0) {
         return NextResponse.json({ message: "Options array cannot be empty for MULTIPLE_CHOICE questions." }, { status: 400 });
      }
      updateData.options = options;
    }

    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;


    const updatedQuestion = await prisma.examQuestion.update({
      where: { id },
      data: updateData,
      include: {
        exam: { select: { id: true, title: true, course: { select: { title: true } } } },
      },
    });

    // Transform response
    const responseData = {
      id: updatedQuestion.id,
      examId: updatedQuestion.examId,
      examTitle: updatedQuestion.exam?.title || 'N/A',
      examCourseTitle: updatedQuestion.exam?.course?.title || 'N/A',
      questionText: updatedQuestion.questionText,
      imageUrl: updatedQuestion.imageUrl,
      videoUrl: updatedQuestion.videoUrl,
      questionType: updatedQuestion.questionType,
      options: updatedQuestion.options,
      correctAnswer: updatedQuestion.correctAnswer,
      points: updatedQuestion.points,
      order: updatedQuestion.order,
      createdAt: updatedQuestion.createdAt,
      updatedAt: updatedQuestion.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating exam question with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to update exam question", error: error.message }, { status: 500 });
  }
}

// DELETE /api/exam-questions/[id]
// Deletes an ExamQuestion by ID.
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const existingQuestion = await prisma.examQuestion.findUnique({
      where: { id },
    });

    if (!existingQuestion) {
      return NextResponse.json({ message: "Exam question not found" }, { status: 404 });
    }

    const deletedQuestion = await prisma.examQuestion.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Exam question deleted successfully", deletedId: deletedQuestion.id }, { status: 200 });
  } catch (error: any) {
    console.error(`Error deleting exam question with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to delete exam question", error: error.message }, { status: 500 });
  }
}
