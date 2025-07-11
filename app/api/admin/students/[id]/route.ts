import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { EnrollmentStatus, StudentLevelStatus, ROLE } from "@prisma/client"; // Import StudentLevelStatus and ROLE


// GET /api/students/[id]
// Fetches a single student by ID, including associated User data, academic levels, and calculated counts.
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            emailVerified: true,
          },
        },
        parent: {
          select: {
            id: true,
            phone: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        // NEW: Include StudentAcademicLevel to get academic level details via the junction table
        StudentAcademicLevel: {
          include: {
            academicLevel: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrolledCourses: true,
            assignmentSubmission: true, // Renamed from 'submissions'
            AttendanceRecord: true,
            ExamSubmission: true,
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ message: "Student not found" }, { status: 404 });
    }

    // Transform the data to match the UI's StudentType
    const academicLevelsResponse = student.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
    }));

    const responseData = {
      id: student.id,
      userId: student.userId,
      loginCode: student.loginCode,
      name: student.user?.name,
      email: student.user?.email,
      profilePicture: student.profilePicture || student.user?.image,
      phone: student.phone,
      bio: student.bio,
      address: student.address,
      companyId: student.companyId,
      // studentGrade removed as it's no longer a direct field
      parentId: student.parentId,
      parentName: student.parent?.user.name,
      parentEmail: student.parent?.user.email,
      parentPhone: student.parent?.phone,
      academicLevels: academicLevelsResponse, // Changed to array
      totalCourses: student._count.enrolledCourses,
      completedCourses: 0, // Not stored directly in model, set to 0 for consistency with GET /students
      certificatesEarned: 0, // Not stored directly in model, set to 0 for consistency with GET /students
      averageProgress: 0.0, // Not stored directly in model, set to 0.0 for consistency with GET /students
      totalAssignmentSubmissions: student._count.assignmentSubmission, // Renamed
      totalAttendanceRecords: student._count.AttendanceRecord,
      totalExamSubmissions: student._count.ExamSubmission,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error(`Error fetching student with ID ${id}:`, error);
    return NextResponse.json({ message: "Failed to fetch student", error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/students/[id]
// Updates an existing Student profile.
// Handles updating basic student fields, their primary academic level association,
// and their specific student level status (Junior/Senior).
// PATCH /api/admin/students/[id]
export async function PATCH(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const studentId = pathname.split('/').pop();

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is required." }, { status: 400 });
    }

    const body = await request.json();
    const {
      name, email, phone, bio, address, profilePicture, parentId, academicLevelId, levelStatus,
      userId, companyId, userRole,
      ...rest
    } = body;

    if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
        return NextResponse.json({ message: "Invalid levelStatus provided." }, { status: 400 });
    }

    const updatedStudentResult = await prisma.$transaction(async (tx) => {
      const existingStudent = await tx.student.findUnique({
        where: { id: studentId },
        include: { user: true, StudentAcademicLevel: { include: { academicLevel: true } } },
      });

      if (!existingStudent) {
        throw new Error("Student not found.");
      }

      let updatedUser = existingStudent.user;
      let role = levelStatus.toString().toUpperCase();

      if (name !== existingStudent.user?.name || email !== existingStudent.user?.email) {
        updatedUser = await tx.user.update({
          where: { id: existingStudent.userId },
          data: { name, 
                  email, 
                  role: role
                },
        });
      }

      // Validate parent existence if parentId is provided and not null/empty
      if (parentId !== undefined && parentId !== null && parentId !== '') {
        const existingParent = await tx.parent.findUnique({
          where: { id: parentId },
        });
        if (!existingParent) {
          throw new Error("Provided parentId does not exist.");
        }
      }

        // Conditionally prepare parent data for Prisma update
        let parentUpdateData: { connect: { id: string } } | { disconnect: boolean } | undefined;
        if (parentId !== undefined) { // Check if parentId was provided in the request body
          if (parentId === null || parentId === '') {
            parentUpdateData = { disconnect: true }; // Disconnect if parentId is explicitly null or empty
          } else {
            // Only connect if a valid parentId is provided and different from existing
            // You've already validated parentId existence above, so no need to re-validate here.
            parentUpdateData = { connect: { id: parentId } };
          }
        }

        console.log(rest);

        const updatedStudent = await tx.student.update({
          where: { id: studentId },
          data: {
            phone: phone === '' ? null : phone,
            bio: bio === '' ? null : bio,
            address: address === '' ? null : address,
            profilePicture: profilePicture === '' ? null : profilePicture,
            // Apply the parent update data here
            ...(parentUpdateData ? { parent: parentUpdateData } : {}), // Conditionally add 'parent' field
            levelStatus: levelStatus === '' ? null : levelStatus,
            // ...rest,
          },
          include: { // <--- This include block is correct for what you want to fetch back
            user: {
              select: { id: true, name: true, email: true, image: true, role: true },
            },
            parent: {
              select: {
                id: true,
                phone: true,
                user: {
                  select: { id: true, name: true, email: true, phone: true },
                },
              },
            },
            StudentAcademicLevel: {
              include: {
                academicLevel: true,
              },
            },
          },
        });

      // IMPORTANT: Include parent and user in the update operation if you need their data immediately
      // const updatedStudent = await tx.student.update({
      //   where: { id: studentId },
      //   data: {
      //     phone: phone === '' ? null : phone,
      //     bio: bio === '' ? null : bio,
      //     address: address === '' ? null : address,
      //     profilePicture: profilePicture === '' ? null : profilePicture,
      //     parentId: parentId === '' ? null : parentId,
          
      //     levelStatus: levelStatus === '' ? null : levelStatus,
      //     ...rest,
      //   },
      //   include: { // <--- ADDED INCLUDE HERE
      //     user: {
      //       select: { id: true, name: true, email: true, image: true, role: true },
      //     },
      //     parent: {
      //       select: {
      //         id: true,
      //         phone: true,
      //         user: {
      //           select: { id: true, name: true, email: true, phone: true },
      //         },
      //       },
      //     },
      //     StudentAcademicLevel: {
      //       include: {
      //         academicLevel: true, // No need for specific select here, as it's included below.
      //       },
      //     },
      //   },
      // });

      if (academicLevelId !== undefined) {
        if (academicLevelId === null || academicLevelId === '') {
          await tx.studentAcademicLevel.deleteMany({
            where: { studentId: studentId },
          });
        } else {
          const newAcademicLevel = await tx.academicLevel.findUnique({
            where: { id: academicLevelId },
          });
          if (!newAcademicLevel) {
            throw new Error("Provided academicLevelId does not exist.");
          }

          const currentAssociations = existingStudent.StudentAcademicLevel.map(sal => sal.academicLevelId);
          const isAlreadyAssociated = currentAssociations.includes(academicLevelId);

          if (!isAlreadyAssociated || existingStudent.StudentAcademicLevel.length > 1) {
            await tx.studentAcademicLevel.deleteMany({
              where: { studentId: studentId },
            });
            await tx.studentAcademicLevel.create({
              data: {
                studentId: studentId,
                academicLevelId: academicLevelId,
              },
            });
            console.log(`Student ${studentId} academic level updated to ${academicLevelId}.`);
          } else {
             console.log(`Student ${studentId} already associated with academic level ${academicLevelId}. No change needed.`);
          }
        }
      }

      // Re-fetch the student with all necessary includes, crucial for consistent response
      const finalStudent = await tx.student.findUnique({
        where: { id: studentId },
        include: {
          user: {
            select: { id: true, name: true, email: true, image: true, role: true },
          },
          parent: {
            select: {
              id: true,
              phone: true,
              user: {
                select: { id: true, name: true, email: true, phone: true },
              },
            },
          },
          StudentAcademicLevel: {
            include: {
              academicLevel: {
                select: { id: true, name: true, sortOrder: true },
              },
            },
          },
          _count: {
            select: {
              enrolledCourses: true,
              assignmentSubmission: true,
              AttendanceRecord: true,
              ExamSubmission: true,
            },
          },
        },
      });

      return finalStudent; // Return the fully included student
    });

    const studentResponse = updatedStudentResult; // Renamed for clarity

    if (!studentResponse) {
      throw new Error("Student Response does not exist.");
    }

    const academicLevels = studentResponse.StudentAcademicLevel.map(sal => ({
      id: sal.academicLevel.id,
      name: sal.academicLevel.name,
      sortOrder: sal.academicLevel.sortOrder || 0,
    })).sort((a, b) => a.sortOrder - b.sortOrder);

    const responseData = {
      id: studentResponse.id,
      userId: studentResponse.userId,
      loginCode: studentResponse.loginCode,
      name: studentResponse.user?.name,
      email: studentResponse.user?.email,
      profilePicture: studentResponse.profilePicture || studentResponse.user?.image,
      phone: studentResponse.phone,
      bio: studentResponse.bio,
      address: studentResponse.address,
      companyId: studentResponse.companyId,
      parentId: studentResponse.parentId,
      parentName: studentResponse.parent?.user.name,
      parentEmail: studentResponse.parent?.user.email,
      parentPhone: studentResponse.parent?.phone,
      academicLevels: academicLevels,
      userRole: studentResponse.user?.role,
      levelStatus: studentResponse.levelStatus,
      totalCourses: studentResponse._count.enrolledCourses,
      completedCourses: 0,
      certificatesEarned: 0,
      averageProgress: 0.0,
      totalAssignmentSubmissions: 0,
      totalAttendanceRecords: 0,
      totalExamSubmissions: 0,
      createdAt: studentResponse.createdAt,
      updatedAt: studentResponse.updatedAt,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error: any) {
    console.error("Error updating student:", error);
    let statusCode = 500;
    let errorMessage = "Failed to update student";

    if (error.message.includes("Student not found.")) {
      statusCode = 404;
      errorMessage = error.message;
    } else if (error.message.includes("Provided parentId does not exist.")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("Provided academicLevelId does not exist.")) {
      statusCode = 400;
      errorMessage = error.message;
    } else if (error.message.includes("Invalid levelStatus provided.")) {
        statusCode = 400;
        errorMessage = error.message;
    }

    return NextResponse.json({ message: errorMessage, error: error.message }, { status: statusCode });
  }
}

// export async function PATCH(request: Request) {
//   try {
//     const { pathname } = new URL(request.url);
//     const studentId = pathname.split('/').pop();

//     if (!studentId) {
//       return NextResponse.json({ message: "Student ID is required." }, { status: 400 });
//     }

//     const body = await request.json();
//     const {
//       name, email, phone, bio, address, profilePicture, parentId, academicLevelId, levelStatus, // Add levelStatus
//       userId, companyId, userRole, // Exclude userRole from direct update via student patch
//       ...rest
//     } = body;

//     // Validate levelStatus if provided
//     if (levelStatus && !Object.values(StudentLevelStatus).includes(levelStatus)) {
//         return NextResponse.json({ message: "Invalid levelStatus provided." }, { status: 400 });
//     }

//     const updatedStudentResult = await prisma.$transaction(async (tx) => {
//       const existingStudent = await tx.student.findUnique({
//         where: { id: studentId },
//         include: { user: true, StudentAcademicLevel: { include: { academicLevel: true } } },
//       });

//       if (!existingStudent) {
//         throw new Error("Student not found.");
//       }

//       let updatedUser = existingStudent.user;
//       if (name !== existingStudent.user?.name || email !== existingStudent.user?.email) {
//         updatedUser = await tx.user.update({
//           where: { id: existingStudent.userId },
//           data: { name, email },
//         });
//       }

//       if (parentId !== undefined && parentId !== null && parentId !== '') {
//         const existingParent = await tx.parent.findUnique({
//           where: { id: parentId },
//         });
//         if (!existingParent) {
//           throw new Error("Provided parentId does not exist.");
//         }
//       }

//       const updatedStudent = await tx.student.update({
//         where: { id: studentId },
//         data: {
//           phone: phone === '' ? null : phone,
//           bio: bio === '' ? null : bio,
//           address: address === '' ? null : address,
//           profilePicture: profilePicture === '' ? null : profilePicture,
//           parentId: parentId === '' ? null : parentId,
//           levelStatus: levelStatus === '' ? null : levelStatus, // Update the specific student level status
//           ...rest,
//         },
//       });

//       if (academicLevelId !== undefined) {
//         if (academicLevelId === null || academicLevelId === '') {
//           await tx.studentAcademicLevel.deleteMany({
//             where: { studentId: studentId },
//           });
//         } else {
//           const newAcademicLevel = await tx.academicLevel.findUnique({
//             where: { id: academicLevelId },
//           });
//           if (!newAcademicLevel) {
//             throw new Error("Provided academicLevelId does not exist.");
//           }

//           const currentAssociations = existingStudent.StudentAcademicLevel.map(sal => sal.academicLevelId);
//           const isAlreadyAssociated = currentAssociations.includes(academicLevelId);

//           if (!isAlreadyAssociated || existingStudent.StudentAcademicLevel.length > 1) {
//             await tx.studentAcademicLevel.deleteMany({
//               where: { studentId: studentId },
//             });
//             await tx.studentAcademicLevel.create({
//               data: {
//                 studentId: studentId,
//                 academicLevelId: academicLevelId,
//               },
//             });
//             console.log(`Student ${studentId} academic level updated to ${academicLevelId}.`);
//           } else {
//              console.log(`Student ${studentId} already associated with academic level ${academicLevelId}. No change needed.`);
//           }
//         }
//       }

//       const finalStudent = await tx.student.findUnique({
//         where: { id: studentId },
//         include: {
//           user: true,
//           parent: { include: { user: true } },
//           StudentAcademicLevel: { include: { academicLevel: true } },
//           _count: {
//             select: {
//               enrolledCourses: true,
//               assignmentSubmission: true,
//               AttendanceRecord: true,
//               ExamSubmission: true,
//             },
//           },
//         },
//       });

//       return finalStudent;
//     });

//     if (!updatedStudentResult) {
//       return NextResponse.json({ message: "Failed to retrieve updated student data." }, { status: 500 });
//     }

//     const academicLevels = updatedStudentResult.StudentAcademicLevel.map(sal => ({
//       id: sal.academicLevel.id,
//       name: sal.academicLevel.name,
//       sortOrder: sal.academicLevel.sortOrder || 0,
//     })).sort((a, b) => a.sortOrder - b.sortOrder);

//     const responseData = {
//       id: updatedStudentResult.id,
//       userId: updatedStudentResult.userId,
//       loginCode: updatedStudentResult.loginCode,
//       name: updatedStudentResult.user?.name,
//       email: updatedStudentResult.user?.email,
//       profilePicture: updatedStudentResult.profilePicture || updatedStudentResult.user?.image,
//       phone: updatedStudentResult.phone,
//       bio: updatedStudentResult.bio,
//       address: updatedStudentResult.address,
//       companyId: updatedStudentResult.companyId,
//       parentId: updatedStudentResult.parentId,
//       parentName: updatedStudentResult.parent?.user.name,
//       parentEmail: updatedStudentResult.parent?.user.email,
//       parentPhone: updatedStudentResult.parent?.phone,
//       academicLevels: academicLevels,
//       userRole: updatedStudentResult.user?.role, // Include the general user role
//       levelStatus: updatedStudentResult.levelStatus, // NEW: Include the specific student level status
//       totalCourses: updatedStudentResult._count.enrolledCourses,
//       completedCourses: 0,
//       certificatesEarned: 0,
//       averageProgress: 0.0,
//       totalAssignmentSubmissions: updatedStudentResult._count.assignmentSubmission,
//       totalAttendanceRecords: updatedStudentResult._count.AttendanceRecord,
//       totalExamSubmissions: updatedStudentResult._count.ExamSubmission,
//       createdAt: updatedStudentResult.createdAt,
//       updatedAt: updatedStudentResult.updatedAt,
//     };

//     return NextResponse.json(responseData, { status: 200 });
//   } catch (error: any) {
//     console.error("Error updating student:", error);
//     let statusCode = 500;
//     let errorMessage = "Failed to update student";

//     if (error.message.includes("Student not found.")) {
//       statusCode = 404;
//       errorMessage = error.message;
//     } else if (error.message.includes("Provided parentId does not exist.")) {
//       statusCode = 400;
//       errorMessage = error.message;
//     } else if (error.message.includes("Provided academicLevelId does not exist.")) {
//       statusCode = 400;
//       errorMessage = error.message;
//     } else if (error.message.includes("Invalid levelStatus provided.")) {
//         statusCode = 400;
//         errorMessage = error.message;
//     }

//     return NextResponse.json({ message: errorMessage, error: error.message }, { status: statusCode });
//   }
// }


// DELETE /api/admin/students/[id]

// (No changes needed for DELETE related to levelStatus)
export async function DELETE(request: Request) {
  try {
    const { pathname } = new URL(request.url);
    const studentId = pathname.split('/').pop();

    if (!studentId) {
      return NextResponse.json({ message: "Student ID is required." }, { status: 400 });
    }

    const studentToDelete = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        parent:true,
        enrolledCourses:true
      },
    });

    if (!studentToDelete) {
      return NextResponse.json({ message: "Student not found." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.studentAcademicLevel.deleteMany({
        where: { studentId: studentId },
      });

      await tx.courseEnrollment.deleteMany({
        where: { studentId: studentId },
      });

      await tx.student.delete({
        where: { id: studentId },
      });

      const user = studentToDelete.user;
      if (user) {
        const hasOtherProfiles =  studentToDelete.parent != null ||   studentToDelete.enrolledCourses.length > 0;

        if (!hasOtherProfiles) {
          await tx.user.delete({
            where: { id: user.id },
          });
        } else if (user.role === ROLE.STUDENT) {
            // If the user was primarily a student and now that profile is deleted,
            // consider updating their user role if no other primary roles exist.
            // For example, if they're also a parent, maybe their role should become PARENT.
            // This is complex and depends on your business logic for multi-role users.
            // For now, we only delete the user if no other profiles exist.
            // If the user has other profiles, their general ROLE is maintained.
        }
      }
    });

    return NextResponse.json({ message: "Student and associated data deleted successfully." }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ message: "Failed to delete student", error: error.message }, { status: 500 });
  }
}
// PATCH /api/students/[id]
// Updates an existing Student profile by ID, including managing academic level assignments.
// export async function PATCH(request: Request, { params }: { params: { id: string } }) {
//   const { id } = params;

//   try {
//     const body = await request.json();
//     // Removed studentGrade from destructuring as it's no longer a direct field
//     const { phone, bio, address, profilePicture, name, email, loginCode, parentId, academicLevelId, ...rest } = body;

//     if (Object.keys(rest).length > 0) {
//       console.warn("Unexpected fields in PATCH request for student:", rest);
//     }

//     const existingStudent = await prisma.student.findUnique({
//       where: { id },
//     });

//     if (!existingStudent) {
//       return NextResponse.json({ message: "Student not found" }, { status: 404 });
//     }

//     // Validate ParentId if provided and it's changing
//     if (parentId !== undefined && parentId !== existingStudent.parentId) {
//       if (parentId !== null) { // Allow setting to null to unassign parent
//         const existingParent = await prisma.parent.findUnique({
//           where: { id: parentId },
//         });
//         if (!existingParent) {
//           return NextResponse.json({ message: "Provided parentId does not exist." }, { status: 400 });
//         }
//       }
//     }

//     // Handle academicLevelId update via StudentAcademicLevel junction
//     if (academicLevelId !== undefined) {
//       // If a new academicLevelId is provided (not null/empty string)
//       if (academicLevelId) {
//         const existingAcademicLevel = await prisma.academicLevel.findUnique({
//           where: { id: academicLevelId },
//         });
//         if (!existingAcademicLevel) {
//           return NextResponse.json({ message: "Provided academicLevelId does not exist." }, { status: 400 });
//         }

//         // Use a transaction for atomicity: delete existing links, then create new one
//         await prisma.$transaction(async (tx) => {
//           // Delete all existing academic level links for this student
//           await tx.studentAcademicLevel.deleteMany({
//             where: { studentId: existingStudent.id },
//           });
//           // Create the new link
//           await tx.studentAcademicLevel.create({
//             data: {
//               studentId: existingStudent.id,
//               academicLevelId: academicLevelId,
//             },
//           });
//         });
//       } else { // academicLevelId is null or empty string, meaning unassign all academic levels
//         await prisma.studentAcademicLevel.deleteMany({
//           where: { studentId: existingStudent.id },
//         });
//       }
//     }

//     // Prepare data for Student update (only direct fields on Student model)
//     const studentUpdateData: any = {};
//     if (phone !== undefined) studentUpdateData.phone = phone;
//     if (bio !== undefined) studentUpdateData.bio = bio;
//     if (address !== undefined) studentUpdateData.address = address;
//     if (profilePicture !== undefined) studentUpdateData.profilePicture = profilePicture;
//     if (parentId !== undefined) studentUpdateData.parentId = parentId;

//     // Perform the student update for direct fields
//     // Note: academicLevelId is handled separately via the junction table logic above
//     const updatedStudent = await prisma.student.update({
//       where: { id },
//       data: studentUpdateData,
//       include: {
//         user: {
//           select: { id: true, name: true, email: true, image: true },
//         },
//         parent: { // Include parent for response
//           select: {
//             id: true, phone: true,
//             user: {
//               select: {
//                 id: true, name: true, email: true, phone: true
//               }
//             }
//           },
//         },
//         // Include the junction table for academic levels in the response
//         StudentAcademicLevel: {
//           include: {
//             academicLevel: {
//               select: { id: true, name: true },
//             },
//           },
//         },
//       },
//     });

//     // Handle User model updates (name, email, profilePicture)
//     if (name !== undefined || email !== undefined || profilePicture !== undefined) {
//       const userUpdateData: any = {};
//       if (name !== undefined) userUpdateData.name = name;
//       if (email !== undefined) {
//         if (email !== updatedStudent.user?.email) {
//           const existingUserWithNewEmail = await prisma.user.findUnique({ where: { email } });
//           if (existingUserWithNewEmail && existingUserWithNewEmail.id !== updatedStudent.userId) {
//             return NextResponse.json({ message: "The provided email is already in use by another user." }, { status: 409 });
//           }
//         }
//         userUpdateData.email = email;
//       }
//       if (profilePicture !== undefined) userUpdateData.image = profilePicture; // Update user's image if profilePicture is provided

//       if (Object.keys(userUpdateData).length > 0) {
//         await prisma.user.update({
//           where: { id: updatedStudent.userId },
//           data: userUpdateData,
//         });
//       }
//     }

//     // Fetch the final student data with all relations for the response
//     // This re-fetches to ensure consistency after all updates (Student, User, StudentAcademicLevel)
//     const finalStudent = await prisma.student.findUnique({
//       where: { id },
//       include: {
//         user: {
//           select: { id: true, name: true, email: true, image: true },
//         },
//         parent: {
//           select: {
//             id: true, phone: true,
//             user: {
//               select: {
//                 id: true, name: true, email: true, phone: true
//               }
//             }
//           },
//         },
//         StudentAcademicLevel: { // Include the junction table for final response
//           include: {
//             academicLevel: { // And the academic level through it
//               select: { id: true, name: true },
//             },
//           },
//         },
//         _count: {
//           select: {
//             enrolledCourses: true,
//             assignmentSubmission: true, // Renamed
//             AttendanceRecord: true,
//             ExamSubmission: true,
//           },
//         },
//       },
//     });

//     // Transform the final data for the response
//     const finalAcademicLevelsResponse = finalStudent?.StudentAcademicLevel.map(sal => ({
//       id: sal.academicLevel.id,
//       name: sal.academicLevel.name,
//     })) || [];

//     const responseData = {
//       id: finalStudent!.id,
//       userId: finalStudent!.userId,
//       loginCode: finalStudent!.loginCode,
//       name: finalStudent!.user?.name,
//       email: finalStudent!.user?.email,
//       profilePicture: finalStudent!.profilePicture || finalStudent!.user?.image,
//       phone: finalStudent!.phone,
//       bio: finalStudent!.bio,
//       address: finalStudent!.address,
//       companyId: finalStudent!.companyId,
//       // studentGrade removed
//       parentId: finalStudent!.parentId,
//       parentName: finalStudent!.parent?.user.name,
//       parentEmail: finalStudent!.parent?.user.email,
//       parentPhone: finalStudent!.parent?.phone,
//       academicLevels: finalAcademicLevelsResponse, // Changed to array
//       totalCourses: finalStudent!._count.enrolledCourses,
//       completedCourses: 0, // Not stored directly
//       certificatesEarned: 0, // Not stored directly
//       averageProgress: 0.0, // Not stored directly
//       totalAssignmentSubmissions: finalStudent!._count.assignmentSubmission, // Renamed
//       totalAttendanceRecords: finalStudent!._count.AttendanceRecord,
//       totalExamSubmissions: finalStudent!._count.ExamSubmission,
//       createdAt: finalStudent!.createdAt,
//       updatedAt: finalStudent!.updatedAt,
//     };

//     return NextResponse.json(responseData, { status: 200 });
//   } catch (error: any) {
//     console.error(`Error updating student with ID ${id}:`, error);
//     return NextResponse.json({ message: "Failed to update student", error: error.message }, { status: 500 });
//   }
// }

// DELETE /api/students/[id]
// Deletes a Student profile by ID.
// export async function DELETE(request: Request, { params }: { params: { id: string } }) {
//   const { id } = params;

//   try {
//     const existingStudent = await prisma.student.findUnique({
//       where: { id },
//     });

//     if (!existingStudent) {
//       return NextResponse.json({ message: "Student not found" }, { status: 404 });
//     }

//     // Before deleting the student, delete all associated StudentAcademicLevel entries
//     await prisma.studentAcademicLevel.deleteMany({
//       where: { studentId: id },
//     });

//     const deletedStudent = await prisma.student.delete({
//       where: { id },
//     });

//     return NextResponse.json({ message: "Student deleted successfully", deletedId: deletedStudent.id }, { status: 200 });
//   } catch (error: any) {
//     console.error(`Error deleting student with ID ${id}:`, error);
//     if (error.code === 'P2003') {
//       return NextResponse.json({ message: "Cannot delete student: They are linked to existing enrollments, submissions, or other records. Please reassign or delete associated records first." }, { status: 409 });
//     }
//     return NextResponse.json({ message: "Failed to delete student", error: error.message }, { status: 500 });
//   }
// }
