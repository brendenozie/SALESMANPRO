// app/signin/page.tsx
// import SignInClient from "./SignInClient";
import { Suspense } from "react";
import SignInClient from "./SignInClient";

export default function SignInPage() {
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
      <SignInClient />
    </Suspense>
  );
}

// export const metadata = {
//   title: "ghuba – Sign In",
//   description: "Sign in to Ghuba",
// };

// export default function SignInPage() {
//   // ⚡ No async, no getProviders, no force-dynamic
//   return <SignInClient />;
// }