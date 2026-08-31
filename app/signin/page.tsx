// app/signin/page.tsx
import SignInClient from "./SignInClient";

export const metadata = {
  title: "SalesmanPro – Sign In",
  description: "Sign in to SalesmanPro",
};

export default function SignInPage() {
  // ⚡ No async, no getProviders, no force-dynamic
  return <SignInClient />;
}