// File: app/signin/page.tsx

import SignUpClient from "./SignUpClient";

export default async function SignInPage() {
  return <SignUpClient />;
}

export const metadata = {
  title: "ghuba – Sign Up",
  description: "Sign up for Ghuba",
};