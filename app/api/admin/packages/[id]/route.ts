
// pages/api/packages/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import { verifyAuth, formatResponse } from '@/lib/verifyAuth';

const prisma = new PrismaClient();

// export async function GET(req: Request, res: NextApiResponse) {
export async function GET(request: Request, { params }: { params: { id: string } }) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const { id } = params;
  // const { id } = req.query;

  if (request.method === 'GET') {
    try {
      const pkg = await prisma.package.findUnique({
        where: { id: String(id) },
      });
      if (!pkg) {
        // return res.status(404).json({ error: 'Package not found' });
        return NextResponse.json({ message: "Parent not found" }, { status: 404 });
      }
      return NextResponse.json(pkg, { status: 200 });
    } catch (error) {
      console.error('Failed to fetch package:', error);
      return NextResponse.json({ error: 'Failed to fetch package' }, { status: 500 });
    }

  } 
}
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    
       const auth = await verifyAuth(request);
      if (!auth.success) return formatResponse(false, null, auth.error, 401);
    
    const { id } = params;
  
    try {
      const body = await request.json();
  //     const { phone, bio, address, profilePicture, name, email, loginCode, ...rest } = body; // Exclude loginCode from direct update
  
  // // else if (req.method === 'PUT') {
  //   try {
      const { title, price, frequency, features, status, isFeatured } = body;
      const updatedPackage = await prisma.package.update({
        where: { id: String(id) },
        data: {
          title,
          price,
          frequency,
          features,
          status,
          isFeatured,
        },
      });
      return NextResponse.json(updatedPackage, { status: 200 });
    } catch (error) {
      console.error('Failed to update package:', error);
      return NextResponse.json({ error: 'Failed to update package' }, { status: 500 });
    }
  } 
  
  export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
  
  // else if (req.method === '') {
    try {
      await prisma.package.delete({
        where: { id: String(id) },
      });
      return NextResponse.json({ message: 'Package deleted successfully' }, { status: 200 });
      // res.status(200).json({ message: 'Package deleted successfully' });

    } catch (error) {
      console.error('Failed to delete package:', error);
      return NextResponse.json({ error: 'Failed to delete package' }, { status: 500 });
    }
  } 

