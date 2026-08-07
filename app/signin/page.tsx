// app/signin/page.tsx
import SignInClient from "./SignInClient";

export const metadata = {
  title: "ghuba – Sign In",
  description: "Sign in to Ghuba",
};

export default function SignInPage() {
  // ⚡ No async, no getProviders, no force-dynamic
  return <SignInClient />;
}