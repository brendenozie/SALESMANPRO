// File: app/signin/page.tsx
import { getProviders, type ClientSafeProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import SignInClient from "./SignInClient";
import { authOptions, getAuthSession } from "../../lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  const session = await getAuthSession();
  if (session) {
    redirect("/");
  }

  const raw = await getProviders();
  const providers: ClientSafeProvider[] = raw ? Object.values(raw) : [];

  return <SignInClient providers={providers} />;
}

export const metadata = {
  title: "ghuba – Sign In",
  description: "Sign in to Ghuba",
};