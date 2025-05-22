import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions"; // Your NextAuth config

export async function requireAuth(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return session.user;
}
