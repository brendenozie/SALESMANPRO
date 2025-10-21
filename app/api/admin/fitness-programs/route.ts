

import prisma from '@/server/db/prismadb';
// New Imports
import { withApiHandler } from '@/lib/hooks/withApiHandler';
import { formatResponse } from '@/lib/formatResponse';

// Type definition for the context object
type RouteContext = {
    params: {
        adminSlug: string; // The dynamic part of the URL: /admin/[adminSlug]
    };
};

// --- GET Handler Logic (Fetch All Programs/Classes for a Company) ---
const getProgramsLogic = async (request: Request, context: RouteContext) => {
    // Note: Original code pulls 'id' from searchParams and uses it as companyId.
    
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('id');

    if (!companyId) {
        return formatResponse(false, null, 'companyId query parameter is required.', 400);
    }

    if (!companyId) {
        return formatResponse(false, null, 'The "id" query parameter (company ID) is required.', 400);
    }

    // 1. Find the company ID
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 2. Fetch courses (programs) for this company
    const courses = await prisma.course.findMany({
        where: {
            companyId: company.id,
        },
        include: {
            CourseEducatorAssignment: {
                include: {
                    educator: {
                        include: {
                            user: {
                                select: { name: true }, // Select only the user's name
                            },
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    // 3. Map Prisma Course model to the frontend Program interface
    const programs = courses.map(course => {
        const instructorName = course.CourseEducatorAssignment.length > 0
            ? course.CourseEducatorAssignment[0].educator.user?.name || 'N/A'
            : 'N/A';

        // Ensure status is lowercase for frontend enum matching
        const status = course.status ? course.status.toLowerCase() : 'draft';

        return {
            id: course.id,
            name: course.title,
            description: course.description || '',
            status: status,
            type: 'class',
            instructor: instructorName,
            duration: course.duration || 'N/A',
            price: course.price || 0,
        };
    });

    // Use formatResponse for success
    return formatResponse(true, programs, 'Programs retrieved successfully', 200);
};

// Export the wrapped GET function
export const GET = withApiHandler(getProgramsLogic);


// --- POST Handler Logic (Create New Program/Class) ---
const postProgramsLogic = async (request: Request, context: RouteContext) => {
    // Note: Original code pulls 'id' from searchParams and uses it as companyId.
    
    const { searchParams } = new URL(request.url);

    const companyId = searchParams.get('id');

    if (!companyId) {
        return formatResponse(false, null, 'The "id" query parameter (company ID) is required.', 400);
    }

    const body = await request.json();
    const { name, description, instructorId, duration, price } = body;

    // 1. Find the company
    const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { id: true },
    });

    if (!company) {
        return formatResponse(false, null, 'Company not found.', 404);
    }

    // 2. Basic validation for required fields
    if (!name || !description || !instructorId || !duration || price === undefined) {
        return formatResponse(false, null, 'Missing required fields for new program.', 400);
    }

    // 3. Find the educator to link
    const educator = await prisma.educator.findUnique({
        where: { id: instructorId },
        select: { id: true, userId: true },
    });

    if (!educator) {
        return formatResponse(false, null, 'Instructor not found.', 404);
    }

    // 4. Create the new Course record using a transaction for atomicity
    const newCourse = await prisma.$transaction(async (tx) => {
        const createdCourse = await tx.course.create({
            data: {
                title: name,
                description: description,
                duration: duration,
                price: parseFloat(price),
                company: { connect: { id: companyId } },
                credits: 0,
                code: `COURSE-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                status: 'DRAFT',
                CourseEducatorAssignment: {
                    create: {
                        educator: { connect: { id: educator.id } },
                        company: { connect: { id: companyId } },
                        roleInCourse: 'Lead Educator',
                    },
                },
            },
        });

        // 5. Fetch the instructor's name for the response (if available)
        let instructorUser = null;
        if (educator.userId) {
            instructorUser = await tx.user.findUnique({
                where: { id: educator.userId },
                select: { name: true },
            });
        }

        return { createdCourse, instructorUser };
    });

    // 6. Map the newly created course to the frontend Program interface
    const createdProgram = {
        id: newCourse.createdCourse.id,
        name: newCourse.createdCourse.title,
        description: newCourse.createdCourse.description || '',
        status: newCourse.createdCourse.status.toLowerCase(),
        type: 'class',
        instructor: newCourse.instructorUser?.name || 'N/A',
        duration: newCourse.createdCourse.duration || 'N/A',
        price: newCourse.createdCourse.price || 0,
    };

    // Use formatResponse for success
    return formatResponse(true, createdProgram, 'Program created successfully', 201);
};

// Export the wrapped POST function
export const POST = withApiHandler(postProgramsLogic);
