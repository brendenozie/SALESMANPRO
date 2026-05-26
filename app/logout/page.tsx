import { redirect } from "next/navigation";

// const ALLOWED_DOMAINS = [
//   "salesmanpro.site",
//   "duka.com",
// ];

export default function LogoutPage({
  searchParams,
}: {
  searchParams: { returnTo?: string };
}) {
  const returnTo = searchParams.returnTo;

  if (returnTo) {
    try {
      const url = new URL(returnTo);
      // if (ALLOWED_DOMAINS.includes(url.hostname)) {
        redirect(url.origin);
      // }
    } catch {}
  }

  // Fallback (never strand user)
  redirect("https://salesmanpro.site");
}