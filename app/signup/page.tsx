// // File: app/signin/page.tsx
import { Suspense } from "react";
import SignUpClient from "./SignUpClient";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="animate-pulse text-gray-400 text-sm font-medium">
            Loading...
          </div>
        </div>
      }
    >
      <SignUpClient />
    </Suspense>
  );
}
// import SignUpClient from "./SignUpClient";

// export default async function SignInPage() {
//   return <SignUpClient />;
// }

// export const metadata = {
//   title: "ghuba – Sign Up",
//   description: "Sign up for Ghuba",
// };