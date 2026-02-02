import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb";

export async function POST(req: Request) {
  try {
    const { companyId, roleName, baseTemplate, permissions } = await req.json();

    let finalPermissions;

    if (permissions) {
      // Use the duplicated permissions
      finalPermissions = permissions;
    } else {
      // Use the template logic (Standard, Elevated, etc.)
      const categories = ['Staff Records', 'Financials', 'Student Data', 'Reports'];
      const getInitialStatus = (template: string) => {
        if (template === 'elevated') return [true, true, true];
        if (template === 'standard') return [true, false, false];
        return [false, false, false];
      };

      finalPermissions = categories.map(cat => ({
        category: cat,
        actions: cat === 'Reports' ? ['Daily', 'Annual', 'Strategic'] : ['View', 'Edit', 'Delete'],
        status: getInitialStatus(baseTemplate)
      }));
    }

    const newRole = await prisma.role.create({
      data: {
        name: roleName,
        companyId: companyId,
        permissions: finalPermissions,
      }
    });

    return NextResponse.json({ success: true, role: newRole });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create/duplicate role" }, { status: 500 });
  }
}
// export async function POST(req: Request) {
//   try {
//     const { companyId, roleName, baseTemplate } = await req.json();

//     // 1. Define the default categories
//     const categories = ['Staff Records', 'Financials', 'Student Data', 'Reports'];
    
//     // 2. Logic to determine initial status based on template
//     const getInitialStatus = (template: string) => {
//       if (template === 'elevated') return [true, true, true];
//       if (template === 'standard') return [true, false, false];
//       return [false, false, false];
//     };

//     // 3. Construct the matrix JSON
//     const initialPermissions = categories.map(cat => ({
//       category: cat,
//       actions: cat === 'Reports' ? ['Daily', 'Annual', 'Strategic'] : ['View', 'Edit', 'Delete'],
//       status: getInitialStatus(baseTemplate)
//     }));

//     // 4. Create in Database
//     const newRole = await db.role.create({
//       data: {
//         name: roleName,
//         companyId: companyId,
//         permissions: initialPermissions, // Saves as JSON in MongoDB
//       }
//     });

//     return NextResponse.json({ success: true, role: newRole });
//   } catch (error: any) {
//     if (error.code === 'P2002') {
//       return NextResponse.json({ error: "A role with this name already exists." }, { status: 400 });
//     }
//     return NextResponse.json({ error: "Failed to create role." }, { status: 500 });
//   }
// }