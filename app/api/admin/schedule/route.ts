import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";

// app/api/admin/[adminSlug]/schedule/route.ts


// The GET function remains the same as before, fetching and merging content.
export async function GET(
  request: Request,
  { params }: { params: { adminSlug: string } }
) {
  try {
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  
    const isAdmin = true; // Placeholder for real authentication
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const articles = await prisma.content.findMany({
      where: {
        status: {
          in: ['Scheduled', 'Draft'],
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        status: true,
        publishDate: true,
      },
    });

    const videos = await prisma.video.findMany({
      where: {
        status: {
          in: ['PUBLISHED', 'PROCESSING', 'DRAFT'],
        },
      },
      select: {
        id: true,
        title: true,
        status: true,
        date: true,
      },
    });

    const formattedArticles = articles.map(item => ({
      ...item,
      date: item.publishDate ? item.publishDate.toISOString().split('T')[0] : 'N/A',
      type: 'Article',
    }));

    const formattedVideos = videos.map(item => ({
      ...item,
      date: item.date ? item.date.toISOString().split('T')[0] : 'N/A',
      type: 'Video',
      status: item.status === 'PUBLISHED' ? 'Scheduled' : item.status,
    }));

    const mergedContent = [...formattedArticles, ...formattedVideos];
    mergedContent.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(mergedContent, { status: 200 });

  } catch (error) {
    console.error('Failed to fetch schedule:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// NEW: PATCH function to handle updates
export async function PATCH(
    request: Request,
    { params }: { params: { adminSlug: string } }
) {
    try {
        const isAdmin = true; // Placeholder for real authentication
        if (!isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { id, type, title, status, date } = body;

        let updatedItem;

        if (type === 'Article') {
            updatedItem = await prisma.content.update({
                where: { id: id },
                data: {
                    title: title,
                    status: status,
                    publishDate: date ? new Date(date) : undefined,
                },
            });
        } else if (type === 'Video') {
            updatedItem = await prisma.video.update({
                where: { id: id },
                data: {
                    title: title,
                    status: status,
                    date: date ? new Date(date) : undefined,
                },
            });
        } else {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        return NextResponse.json(updatedItem, { status: 200 });
        
    } catch (error) {
        console.error('Failed to update item:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// export async function GET(
//   request: Request,
//   { params }: { params: { adminSlug: string } }
// ) {
//   try {
//     // NOTE: This is a placeholder for real authentication logic.
//     // In a production app, you would verify the admin's session or token.
//     // const isAdmin = true;

//     // if (!isAdmin) {
//     //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
//     // }

//     const { searchParams } = new URL(request.url);
//     const companyId = searchParams.get('companyId');

//     // 1. Fetch content from the Content model
//     const articles = await prisma.content.findMany({
//       where: {
//         status: {
//           in: ['Scheduled', 'Draft'],
//         },
//       },
//       select: {
//         id: true,
//         title: true,
//         type: true,
//         status: true,
//         publishDate: true,
//       },
//     });

//     // 2. Fetch content from the Video model
//     const videos = await prisma.video.findMany({
//       where: {
//         status: {
//           in: ['PUBLISHED', 'PROCESSING', 'DRAFT'],
//         },
//       },
//       select: {
//         id: true,
//         title: true,
//         status: true,
//         date: true, // Renamed from publishDate to match the schema
//       },
//     });

//     // 3. Format and merge the data from both models
//     const formattedArticles = articles.map(item => ({
//       ...item,
//       date: item.publishDate ? item.publishDate.toISOString().split('T')[0] : 'N/A',
//       type: 'Article', // Explicitly set the type
//     }));

//     const formattedVideos = videos.map(item => ({
//       ...item,
//       date: item.date ? item.date.toISOString().split('T')[0] : 'N/A',
//       type: 'Video', // Explicitly set the type
//       status: item.status === 'PUBLISHED' ? 'Scheduled' : item.status, // Map status to frontend type
//     }));

//     const mergedContent = [...formattedArticles, ...formattedVideos];

//     // Sort all content by date
//     mergedContent.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

//     return NextResponse.json(mergedContent, { status: 200 });

//   } catch (error) {
//     console.error('Failed to fetch schedule:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }
