import prisma from "@/server/db/prismadb";
import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { formatResponse } from "@/lib/formatResponse";

const postHandler = async (request: Request) => {
  const body = await request.json();
  const { parentId, educatorId, studentId, message } = body;

  try {
    // This assumes you have a 'Communication' or 'Message' model
    const newMessage = await prisma.notification.create({
      data: {
        // userId: educatorId, // Sending to teacher
        title: `Message from Parent regarding Student`,
        message: message,
        // type: "INBOX",
        // status: "Unread",
        // Metadata to link the conversation
        // metadata: { parentId, studentId }
      }
    });

    return formatResponse(true, newMessage, "Message sent to teacher", 201);
  } catch (error) {
    return formatResponse(false, null, "Failed to send message", 500);
  }
};

export const POST = withApiHandler(postHandler);