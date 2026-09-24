"use strict";
/**
 * lib/school/schoolService.ts
 *
 * Canonical school data service — provides shared computation functions used
 * by dashboard APIs, report card generation, and reporting modules.
 *
 * All functions are company-scoped (multi-tenant) and read-only aggregations
 * over authoritative Prisma records. They do NOT generate AI content;
 * see lib/school/schoolAIService.ts for that.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFinancialSummary = exports.getAttendanceSummary = exports.bulkGenerateReportCards = exports.generateReportCard = exports.getParentChildrenSummaries = exports.getStudentOverview = exports.getTeacherWorkload = exports.getSchoolDashboardStats = exports.scoreToLetterGrade = void 0;
const prismadb_1 = __importDefault(require("@/server/db/prismadb"));
// ─────────────────────────────────────────────────────────────────────────────
// GRADE BOUNDARY UTILITY
// ─────────────────────────────────────────────────────────────────────────────
function scoreToLetterGrade(score) {
    if (score >= 90)
        return "A+";
    if (score >= 85)
        return "A";
    if (score >= 80)
        return "A-";
    if (score >= 75)
        return "B+";
    if (score >= 70)
        return "B";
    if (score >= 65)
        return "B-";
    if (score >= 60)
        return "C+";
    if (score >= 55)
        return "C";
    if (score >= 50)
        return "C-";
    if (score >= 45)
        return "D+";
    if (score >= 40)
        return "D";
    return "E";
}
exports.scoreToLetterGrade = scoreToLetterGrade;
// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL ADMIN / PRINCIPAL DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────
async function getSchoolDashboardStats(companyId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const [totalStudents, totalTeachers, totalCourses, totalClassrooms, todayAttendance, todayExpectedAttendance, pendingAssignments, upcomingEvents, outstandingFees,] = await Promise.all([
        prismadb_1.default.student.count({ where: { companyId } }),
        prismadb_1.default.educator.count({ where: { companyId } }),
        prismadb_1.default.course.count({ where: { companyId, status: "PUBLISHED" } }),
        prismadb_1.default.classroom.count({ where: { companyId } }),
        // Attendance: present records today
        prismadb_1.default.attendanceRecord.count({
            where: {
                companyId,
                date: { gte: today, lt: tomorrow },
                status: "PRESENT",
            },
        }),
        // Expected attendance: all students
        prismadb_1.default.student.count({ where: { companyId } }),
        // Assignments due in next 7 days
        prismadb_1.default.courseAssignment.count({
            where: {
                companyId,
                dueDate: { gte: today, lte: nextWeek },
                status: "Published",
            },
        }),
        // Events in next 7 days
        prismadb_1.default.event.count({
            where: {
                companyId,
                startDateTime: { gte: today, lte: nextWeek },
            },
        }),
        // Outstanding fees
        prismadb_1.default.studentFeeRecord.findMany({
            where: { student: { companyId } },
            select: { amountPaid: true, appliedFeeItems: true },
        }),
    ]);
    const attendanceRateToday = todayExpectedAttendance > 0
        ? Math.round((todayAttendance / todayExpectedAttendance) * 100)
        : 0;
    let pendingFees = 0;
    for (const f of outstandingFees) {
        const items = f.appliedFeeItems || [];
        const totalDue = items.reduce((sum, it) => sum + (Number(it?.amount) || 0), 0);
        pendingFees += Math.max(0, totalDue - (f.amountPaid || 0));
    }
    return {
        totalStudents,
        totalTeachers,
        totalCourses,
        totalClassrooms,
        attendanceRateToday,
        pendingAssignments,
        upcomingEvents,
        pendingFees,
    };
}
exports.getSchoolDashboardStats = getSchoolDashboardStats;
// ─────────────────────────────────────────────────────────────────────────────
// TEACHER WORKLOAD SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
async function getTeacherWorkload(educatorId, companyId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    // Courses taught by this educator
    const courseAssignments = await prismadb_1.default.courseEducatorAssignment.findMany({
        where: { educatorId, companyId },
        include: { course: { select: { id: true, title: true } } },
    });
    const courseIds = courseAssignments.map((ca) => ca.courseId);
    const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    const currentDayName = dayNames[today.getDay()];
    const [totalEnrolled, classesCount, pendingGrading, todaySchedule, recentSubmissions,] = await Promise.all([
        prismadb_1.default.courseEnrollment.count({
            where: { courseId: { in: courseIds }, companyId },
        }),
        prismadb_1.default.classroom.count({
            where: {
                companyId,
                classSchedules: { some: { courseId: { in: courseIds } } },
            },
        }),
        prismadb_1.default.assignmentSubmission.count({
            where: {
                courseId: { in: courseIds },
                companyId,
                grade: null,
            },
        }),
        prismadb_1.default.classSchedule.findMany({
            where: {
                companyId,
                dayOfWeek: currentDayName,
                course: { id: { in: courseIds } },
            },
            include: {
                course: { select: { title: true } },
                classroom: { select: { name: true } },
            },
            orderBy: { startTime: "asc" },
            take: 10,
        }),
        prismadb_1.default.assignmentSubmission.findMany({
            where: {
                courseId: { in: courseIds },
                companyId,
            },
            include: {
                student: { select: { firstName: true, lastName: true } },
                assignment: { select: { title: true } },
            },
            orderBy: { submittedAt: "desc" },
            take: 10,
        }),
    ]);
    return {
        totalStudents: totalEnrolled,
        classesCount,
        coursesCount: courseIds.length,
        pendingGrading,
        todaySchedule: todaySchedule.map((s) => ({
            id: s.id,
            subject: s.course?.title ?? "—",
            classroom: s.classroom?.name ?? "—",
            startTime: s.startTime instanceof Date ? s.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : String(s.startTime),
            endTime: s.endTime instanceof Date ? s.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : String(s.endTime),
        })),
        recentSubmissions: recentSubmissions.map((sub) => ({
            id: sub.id,
            studentName: `${sub.student.firstName} ${sub.student.lastName}`,
            assignment: sub.assignment.title,
            submittedAt: sub.submittedAt,
            isGraded: sub.grade !== null,
        })),
    };
}
exports.getTeacherWorkload = getTeacherWorkload;
// ─────────────────────────────────────────────────────────────────────────────
// STUDENT OVERVIEW
// ─────────────────────────────────────────────────────────────────────────────
async function getStudentOverview(studentId, companyId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    // Get enrolled courses
    const enrollments = await prismadb_1.default.courseEnrollment.findMany({
        where: { studentId, companyId },
        select: { courseId: true },
    });
    const courseIds = enrollments.map((e) => e.courseId);
    const [pendingAssignments, grades, attendanceRecords, completedLessons, upcomingAssignments, recentGrades,] = await Promise.all([
        prismadb_1.default.courseAssignment.count({
            where: {
                courseId: { in: courseIds },
                companyId,
                dueDate: { gte: today, lte: nextWeek },
                status: "Published",
                submissions: { none: { studentId } },
            },
        }),
        prismadb_1.default.grade.findMany({
            where: { studentId, companyId },
            select: { score: true },
        }),
        prismadb_1.default.attendanceRecord.findMany({
            where: {
                studentId,
                companyId,
                date: { gte: thirtyDaysAgo },
            },
            select: { status: true },
        }),
        prismadb_1.default.userProgress.count({
            where: {
                userId: studentId,
                companyId,
                progressPercentage: { gte: 100 },
            },
        }),
        prismadb_1.default.courseAssignment.findMany({
            where: {
                courseId: { in: courseIds },
                companyId,
                dueDate: { gte: today, lte: nextWeek },
                status: "Published",
                submissions: { none: { studentId } },
            },
            include: { course: { select: { title: true } } },
            orderBy: { dueDate: "asc" },
            take: 5,
        }),
        prismadb_1.default.grade.findMany({
            where: { studentId, companyId },
            include: { course: { select: { title: true } } },
            orderBy: { createdAt: "desc" },
            take: 5,
        }),
    ]);
    const totalScores = grades.map((g) => g.score).filter(Boolean);
    const averageGrade = totalScores.length > 0
        ? Math.round(totalScores.reduce((a, b) => a + b, 0) / totalScores.length)
        : null;
    const presentDays = attendanceRecords.filter((a) => a.status === "PRESENT").length;
    const attendanceRate = attendanceRecords.length > 0
        ? Math.round((presentDays / attendanceRecords.length) * 100)
        : 100;
    return {
        enrolledCourses: enrollments.length,
        pendingAssignments,
        averageGrade,
        completedLessons,
        attendanceRate,
        upcomingAssignments: upcomingAssignments.map((a) => ({
            id: a.id,
            title: a.title,
            courseName: a.course.title,
            dueDate: a.dueDate,
        })),
        recentGrades: recentGrades.map((g) => ({
            subject: g.course?.title ?? "—",
            score: g.score ?? 0,
            gradedAt: g.createdAt ?? new Date(),
        })),
    };
}
exports.getStudentOverview = getStudentOverview;
// ─────────────────────────────────────────────────────────────────────────────
// PARENT DASHBOARD — CHILDREN SUMMARIES
// ─────────────────────────────────────────────────────────────────────────────
async function getParentChildrenSummaries(parentId, companyId) {
    const children = await prismadb_1.default.student.findMany({
        where: { parentId, companyId },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            admissionNumber: true,
            currentClass: true,
        },
    });
    const summaries = await Promise.all(children.map(async (child) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const [attendanceRecords, grades, feeRecord, enrollments] = await Promise.all([
            prismadb_1.default.attendanceRecord.findMany({
                where: {
                    studentId: child.id,
                    companyId,
                    date: { gte: thirtyDaysAgo },
                },
                select: { status: true },
            }),
            prismadb_1.default.grade.findMany({
                where: { studentId: child.id, companyId },
                include: { course: { select: { title: true } } },
                orderBy: { createdAt: "desc" },
                take: 5,
            }),
            prismadb_1.default.studentFeeRecord.findMany({
                where: {
                    studentId: child.id,
                },
                select: { amountPaid: true, appliedFeeItems: true },
            }),
            prismadb_1.default.courseEnrollment.count({
                where: { studentId: child.id, companyId },
            }),
        ]);
        const presentDays = attendanceRecords.filter((a) => a.status === "PRESENT").length;
        const attendanceRate = attendanceRecords.length > 0
            ? Math.round((presentDays / attendanceRecords.length) * 100)
            : 100;
        const scores = grades.map((g) => g.score).filter(Boolean);
        const averageGrade = scores.length > 0
            ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null;
        let pendingFeeBalance = 0;
        for (const f of feeRecord) {
            const items = f.appliedFeeItems || [];
            const totalDue = items.reduce((sum, it) => sum + (Number(it?.amount) || 0), 0);
            pendingFeeBalance += Math.max(0, totalDue - (f.amountPaid || 0));
        }
        return {
            child: {
                id: child.id,
                firstName: child.firstName,
                lastName: child.lastName,
                admissionNumber: child.admissionNumber,
                currentClass: child.currentClass ?? undefined,
            },
            attendanceRate,
            averageGrade,
            pendingFeeBalance,
            pendingAssignments: enrollments,
            recentGrades: grades.map((g) => ({
                subject: g.course?.title ?? "—",
                score: g.score ?? 0,
                gradedAt: g.createdAt ?? new Date(),
            })),
        };
    }));
    return summaries;
}
exports.getParentChildrenSummaries = getParentChildrenSummaries;
// ─────────────────────────────────────────────────────────────────────────────
// REPORT CARD GENERATION
// ─────────────────────────────────────────────────────────────────────────────
async function generateReportCard(studentId, termId, companyId) {
    const [student, term, enrollments] = await Promise.all([
        prismadb_1.default.student.findUniqueOrThrow({
            where: { id: studentId },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                admissionNumber: true,
                currentClass: true,
            },
        }),
        prismadb_1.default.term.findUniqueOrThrow({
            where: { id: termId },
            select: { id: true, name: true, startDate: true, endDate: true, academicYear: { select: { name: true } } },
        }),
        prismadb_1.default.courseEnrollment.findMany({
            where: { studentId, companyId },
            include: { course: { select: { id: true, title: true } } },
        }),
    ]);
    const subjectResults = await Promise.all(enrollments.map(async (enrollment) => {
        const courseId = enrollment.courseId;
        const [grades, examSubmissions] = await Promise.all([
            prismadb_1.default.grade.findMany({
                where: { studentId, courseId, companyId, termId },
                select: { score: true, comments: true },
            }),
            prismadb_1.default.examSubmission.findMany({
                where: {
                    studentId,
                    exam: { courseId, companyId, termId },
                },
                select: { score: true },
            }),
        ]);
        const allScores = [
            ...grades.map((g) => g.score).filter(Boolean),
            ...examSubmissions.map((e) => e.score).filter(Boolean),
        ];
        const averageScore = allScores.length > 0
            ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
            : 0;
        const teacherComment = grades[0]?.comments ?? undefined;
        return {
            courseId,
            courseName: enrollment.course.title,
            assignments: grades.length,
            exams: examSubmissions.length,
            averageScore,
            letterGrade: scoreToLetterGrade(averageScore),
            teacherComment,
        };
    }));
    const overallScores = subjectResults.map((s) => s.averageScore);
    const overallAverage = overallScores.length > 0
        ? Math.round(overallScores.reduce((a, b) => a + b, 0) / overallScores.length)
        : 0;
    // Attendance for this student in the term period
    const termStart = term.startDate || new Date();
    const absences = await prismadb_1.default.attendanceRecord.count({
        where: { studentId, companyId, status: "ABSENT", date: { gte: termStart } },
    });
    return {
        student: {
            id: student.id,
            firstName: student.firstName,
            lastName: student.lastName,
            admissionNumber: student.admissionNumber,
            currentClass: student.currentClass ?? undefined,
        },
        term: {
            id: term.id,
            name: term.name,
            year: term.academicYear?.name ?? "—",
        },
        subjects: subjectResults,
        overallAverage,
        overallLetterGrade: scoreToLetterGrade(overallAverage),
        totalAbsences: absences,
        classRank: null,
        generatedAt: new Date(),
    };
}
exports.generateReportCard = generateReportCard;
// ─────────────────────────────────────────────────────────────────────────────
// BULK REPORT CARDS — for all students in a classroom
// ─────────────────────────────────────────────────────────────────────────────
async function bulkGenerateReportCards(classroomId, termId, companyId) {
    // Get all students in the classroom via StudentAcademicLevel
    const studentLinks = await prismadb_1.default.studentAcademicLevel.findMany({
        where: { classRoomId: classroomId },
        select: { studentId: true },
    });
    const cards = await Promise.all(studentLinks.map(({ studentId }) => generateReportCard(studentId, termId, companyId)));
    // Compute class rank by overallAverage descending
    const sorted = [...cards].sort((a, b) => b.overallAverage - a.overallAverage);
    sorted.forEach((card, idx) => {
        card.classRank = idx + 1;
    });
    return sorted;
}
exports.bulkGenerateReportCards = bulkGenerateReportCards;
// ─────────────────────────────────────────────────────────────────────────────
// ATTENDANCE SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
async function getAttendanceSummary(companyId, options = {}) {
    const { classroomId, startDate, endDate } = options;
    const where = { companyId };
    if (classroomId)
        where.classroomId = classroomId;
    if (startDate || endDate) {
        where.date = {};
        if (startDate)
            where.date.gte = startDate;
        if (endDate)
            where.date.lte = endDate;
    }
    const [present, absent, late, total] = await Promise.all([
        prismadb_1.default.attendanceRecord.count({ where: { ...where, status: "PRESENT" } }),
        prismadb_1.default.attendanceRecord.count({ where: { ...where, status: "ABSENT" } }),
        prismadb_1.default.attendanceRecord.count({ where: { ...where, status: "TARDY" } }),
        prismadb_1.default.attendanceRecord.count({ where }),
    ]);
    return {
        present,
        absent,
        late,
        total,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
    };
}
exports.getAttendanceSummary = getAttendanceSummary;
// ─────────────────────────────────────────────────────────────────────────────
// FINANCIAL SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
async function getFinancialSummary(companyId, termId) {
    const records = await prismadb_1.default.studentFeeRecord.findMany({
        where: {
            student: { companyId },
            ...(termId ? { term: termId } : {}),
        },
        select: {
            amountPaid: true,
            paymentStatus: true,
            appliedFeeItems: true,
        },
    });
    let totalBilled = 0;
    let totalCollected = 0;
    for (const r of records) {
        totalCollected += r.amountPaid || 0;
        const items = r.appliedFeeItems || [];
        const recordBilled = items.reduce((sum, it) => sum + (Number(it?.amount) || 0), 0);
        totalBilled += recordBilled > 0 ? recordBilled : (r.amountPaid || 0);
    }
    const expensesAgg = await prismadb_1.default.expense.aggregate({
        where: { companyId },
        _sum: { amount: true },
    });
    const totalExpenses = expensesAgg._sum.amount ?? 0;
    return {
        totalBilled,
        totalCollected,
        outstanding: Math.max(0, totalBilled - totalCollected),
        totalExpenses,
        netRevenue: totalCollected - totalExpenses,
    };
}
exports.getFinancialSummary = getFinancialSummary;
