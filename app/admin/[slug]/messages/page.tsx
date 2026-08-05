import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getAuthSession } from "@/lib/auth";
import MessagesPageClient, {
  ConversationData,
  UserData,
} from "./MessagesPageClient";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Server Component: Fetches messages and users at request-time.
 * Strictly uses no-store caching to ensure messages are always up-to-date.
 */
export default async function MessagesManagerPage({ params }: Props) {
  // 1. Await params in Next.js 15+
  const { slug: companyId } = await params;
  
  // 2. Enforce Authentication
  const session = await getAuthSession();
  const currentUserId = session?.user?.role?.toLowerCase() === "admin" ? session?.user?.id : '';
  
  // const router = useRouter();
  // const pathname = usePathname();
  // const searchParams = useSearchParams();

  // if (!currentUserId) {
  //   // Prevent rendering and unauthorized API calls if there's no valid session
  //   redirect(`/signin?callbackUrl=${encodeURIComponent(pathname + searchParams.toString())}`);
  // }

  // 3. Extract Cookies for Authenticated API Requests
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let initialConversations: ConversationData[] = [];
  let allUsers: UserData[] = [];

  try {
    // 4. Fetch Data Concurrently for optimized load times
    const [conversationsRes, usersRes] = await Promise.all([
      fetch(
        `${apiBaseUrl}/admin/conversations?userId=${encodeURIComponent(currentUserId)}&companyId=${encodeURIComponent(companyId)}`,
        { 
          cache: "no-store", // Crucial for a messaging app to avoid stale inboxes
          headers: { cookie: cookieHeader } 
        }
      ),
      fetch(
        `${apiBaseUrl}/admin/users?companyId=${encodeURIComponent(companyId)}`,
        { 
          cache: "no-store", 
          headers: { cookie: cookieHeader } 
        }
      )
    ]);

    // 5. Parse Data Safely
    if (conversationsRes.ok) {
      const dataConvers = await conversationsRes.json();
      // Handle potential API response wrappers (e.g., { data: [...] } vs [...])
      initialConversations = (dataConvers.data || dataConvers) as ConversationData[];
    } else {
      console.error(`[Messages] Failed to fetch conversations: ${conversationsRes.status}`);
    }

    if (usersRes.ok) {
      const dataUsers = await usersRes.json();
      allUsers = (dataUsers.data || dataUsers) as UserData[];
    } else {
      console.error(`[Messages] Failed to fetch users: ${usersRes.status}`);
    }

  } catch (err: any) {
    console.error("[MessagesManagerPage] Network/Parsing error:", err.message);
    // Note: We swallow the error here so the Client Component can mount and 
    // potentially retry fetching via its built-in useEffect if needed.
  }

  // 6. Render the Client Component
  return (
    <MessagesPageClient
      initialConversations={initialConversations}
      allUsers={allUsers}
      currentUserId={currentUserId}
      companyId={companyId}
    />
  );
}