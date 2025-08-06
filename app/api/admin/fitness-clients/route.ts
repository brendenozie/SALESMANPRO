// app/api/admin/[adminSlug]/clients/route.js
import { NextResponse } from 'next/server';
import prisma from '@/server/db/prismadb'; // Adjust this path
import bcrypt from 'bcryptjs';

// GET /api/admin/[adminSlug]/clients
// Fetches all clients for a specific company.
export async function GET(request, { params }) {
  const { adminSlug } = params;

  try {
    const company = await prisma.company.findUnique({
      where: { slug: adminSlug },
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
export async function POST(request, { params }) {
  const { adminSlug } = params;

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
      where: { slug: adminSlug },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json({ message: 'Company not found for the given slug.' }, { status: 404 });
    }

    const companyId = company.id;

    // Basic validation
    if (!name || !email || !password || !membershipType || !membershipStatus) {
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
          membershipType: membershipType,
          membershipStatus: membershipStatus,
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
    if (error.code === 'P2002') { // Unique constraint violation (e.g., email already exists)
      return NextResponse.json({ message: 'A user with this email already exists.', error: error.message }, { status: 409 });
    }
    return NextResponse.json({ message: 'Failed to create client', error: error.message }, { status: 500 });
  }
}
