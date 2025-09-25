// app/api/admin/[adminSlug]/clients/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import bcrypt from 'bcryptjs';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

// GET /api/admin/[adminSlug]/clients
// Fetches all clients for a specific company.
export async function GET(request: Request) {

   const auth = await verifyAuth(request);
  if (!auth.success) return formatResponse(false, null, auth.error, 401);


  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const clients = await prisma.client.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        user: { // Include the related User model to get name, email, phone
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        joinDate: 'desc', // Order by join date, newest first
      },
    });

    // Map Prisma Client model to a frontend-friendly interface
    const formattedClients = clients.map(client => ({
      id: client.id,
      userId: client.userId,
      name: client.user?.name || 'N/A',
      email: client.user?.email || 'N/A',
      phone: client.user?.phone || 'N/A',
      membershipType: client.membershipType || 'Standard',
      membershipStatus: client.membershipStatus,
      joinDate: client.joinDate.toISOString().split('T')[0], // YYYY-MM-DD
      lastActive: client.lastActive.toISOString().split('T')[0], // YYYY-MM-DD
      photoUrl: client.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
    }));

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ message: 'Failed to fetch clients', error: error.message }, { status: 500 });
  }
}

// POST /api/admin/[adminSlug]/clients
// Creates a new client (including a new user with CLIENT role).
export async function POST(request: Request) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get('companyId');

  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      phone,
      membershipType,
      membershipStatus,
      photoUrl,
    } = body;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    // const companyId = company.id;

    // Basic validation
    if (!name || !email || !password ) { //|| !membershipType || !membershipStatus
      return NextResponse.json({ message: 'Name, email, password, membership type, and status are required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
    }

    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a Prisma transaction to ensure atomicity for creating User and Client
    const newClientData = await prisma.$transaction(async (tx) => {
      // Create the new User with CLIENT role
      const newUser = await tx.user.create({
        data: {
          name: name,
          email: email,
          password: hashedPassword,
          phone: phone || null,
          role: 'CLIENT', // Assign the CLIENT role
          status: 'ACTIVE', // Default status for new users
          company: {
            connect: { id: companyId },
          },
        },
      });

      // Create the Client profile linked to the new User
      const newClient = await tx.client.create({
        data: {
          userId: newUser.id,
          companyId: companyId,
          membershipType: membershipType || "STANDARD",
          membershipStatus: membershipStatus || "ACTIVE",
          photoUrl: photoUrl || null,
          joinDate: new Date(), // Set current date
          lastActive: new Date(), // Set current date
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });
      return newClient;
    });

    // Format the new client data for frontend display
    const formattedNewClient = {
      id: newClientData.id,
      userId: newClientData.userId,
      name: newClientData.user?.name || 'N/A',
      email: newClientData.user?.email || 'N/A',
      phone: newClientData.user?.phone || 'N/A',
      membershipType: newClientData.membershipType || 'Standard',
      membershipStatus: newClientData.membershipStatus,
      joinDate: newClientData.joinDate.toISOString().split('T')[0],
      lastActive: newClientData.lastActive.toISOString().split('T')[0],
      photoUrl: newClientData.photoUrl || 'https://placehold.co/128x128/E0E7FF/4338CA?text=No+Photo',
    };

    return NextResponse.json(formattedNewClient, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    // if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
    //   return NextResponse.json({ message: 'A user with this email already exists.', error: error.message }, { status: 409 });
    // }
    return NextResponse.json({ message: 'Failed to create client', error: "error.message" }, { status: 500 });
  }
}

// // app/api/admin/[adminSlug]/users/route.js
// import { NextResponse } from 'next/server';
// import prisma from '@/server/db/prismadb'; // Adjust this path if your prisma client is elsewhere
// import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

// // GET /api/admin/[adminSlug]/users
// // Fetches all users for a specific company, with optional search.
// export async function GET(request: Request) {
//   // const { adminSlug } = params;
//   const { searchParams } = new URL(request.url);
//   const searchTerm = searchParams.get('search') || '';
//   const companyId = searchParams.get('companyId') || '';

//   try {
//     // 1. Find the company ID based on the adminSlug
//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       select: { id: true },
//     });

//     if (!company) {
//       return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
//     }

//     // const companyId = company.id;

//     // 2. Fetch users belonging to this company, applying search filters
//     const users = await prisma.user.findMany({
//       where: {
//         companyId: companyId,
//         OR: [
//           {
//             name: {
//               contains: searchTerm,
//               mode: 'insensitive', // Case-insensitive search
//             },
//           },
//           {
//             email: {
//               contains: searchTerm,
//               mode: 'insensitive',
//             },
//           },
//         ],
//       },
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         role: true, // Fetch the ROLE enum value
//         status: true, // Fetch the UserStatus enum value
//         createdAt: true, // For the 'registered' date
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });

//     // 3. Map Prisma User model to the frontend UserData interface
//     const formattedUsers = users.map(user => ({
//       id: user.id,
//       name: user.name || 'N/A',
//       email: user.email,
//       phone: user.phone || 'N/A',
//       role: user.role || 'USER', // Default to 'USER' if role is null
//       status: user.status || 'ACTIVE', // Default to 'ACTIVE' if status is null
//       registered: user.createdAt ? user.createdAt.toISOString().split('T')[0] : 'N/A', // Format date as YYYY-MM-DD
//     }));

//     return NextResponse.json(formattedUsers);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     return NextResponse.json({ message: 'Failed to fetch users', error: "error.message" }, { status: 500 });
//   }
// }

// // POST /api/admin/[adminSlug]/users
// // Creates a new user for a specific company.
// export async function POST(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const searchTerm = searchParams.get('search') || '';
//   const companyId = searchParams.get('companyId') || '';

//   try {
//     const body = await request.json();
//     const { name, email, phone, role, status, password } = body;

//     // 1. Find the company ID based on the adminSlug
//     const company = await prisma.company.findUnique({
//       where: { id: companyId },
//       select: { id: true },
//     });

//     if (!company) {
//       return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
//     }

//     // const companyId = company.id;

//     // 2. Basic validation
//     if (!name || !email || !password) {
//       return NextResponse.json({ message: 'Name, email, and password are required.' }, { status: 400 });
//     }
//     if (password.length < 8) {
//       return NextResponse.json({ message: 'Password must be at least 8 characters long.' }, { status: 400 });
//     }

//     // 3. Check if user with this email already exists
//     const existingUser = await prisma.user.findUnique({
//       where: { email: email },
//     });
//     if (existingUser) {
//       return NextResponse.json({ message: 'User with this email already exists.' }, { status: 409 });
//     }

//     // 4. Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

//     // 5. Create the new user
//     const newUser = await prisma.user.create({
//       data: {
//         name: name,
//         email: email,
//         password: hashedPassword,
//         phone: phone || null, // Allow phone to be optional
//         role: role || 'USER', // Default role if not provided
//         status: status || 'ACTIVE', // Default status if not provided
//         company: {
//           connect: { id: companyId },
//         },
//       },
//       select: { // Select fields to return to the frontend
//         id: true,
//         name: true,
//         email: true,
//         phone: true,
//         role: true,
//         status: true,
//         createdAt: true,
//       },
//     });

//     // 6. Format the new user data for frontend display
//     const formattedNewUser = {
//       id: newUser.id,
//       name: newUser.name || 'N/A',
//       email: newUser.email,
//       phone: newUser.phone || 'N/A',
//       role: newUser.role,
//       status: newUser.status,
//       registered: newUser.createdAt ? newUser.createdAt.toISOString().split('T')[0] : 'N/A',
//     };

//     return NextResponse.json(formattedNewUser, { status: 201 });
//   } catch (error) {
//     console.error('Error creating user:', error);
//     // Handle specific Prisma errors if needed, e.g., unique constraint violations
//     // if (error.code === 'P2002') {
//     //   return NextResponse.json({ message: 'A user with this email already exists.' }, { status: 409 });
//     // }
//     return NextResponse.json({ message: 'Failed to create user', error: "error.message" }, { status: 500 });
//   }
// }
