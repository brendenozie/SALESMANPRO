// File: app/signin/page.tsx
import { getProviders, type ClientSafeProvider } from "next-auth/react";
import { redirect } from "next/navigation";
import SignUpClient from "./SignUpClient";
import { authOptions, getAuthSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
  // const session = await getAuthSession();
  // if (session) {
  //   redirect("/");
  // }

  const raw = await getProviders();
  const providers: ClientSafeProvider[] = raw ? Object.values(raw) : [];

  return <SignUpClient providers={providers} />;
}

export const metadata = {
  title: "ghuba – Sign Up",
  description: "Sign up for Ghuba",
};