// app/signin/SignInClient.tsx
"use client";

import { signIn, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Drawer from "@/components/Drawer";
import Header from "@/components/Header";

export type Provider = { id: string; name: string };

export default function SignInClient({ providers }: { providers: Provider[] }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await signIn("credentials", { ...data, redirect: false });
    setIsLoading(false);

    if (res?.error) {
      console.error(res.error);
      return;
    }
    router.push("/");
  };

  return (
    <div className="h-screen">
      <Header />
      <div className="h-[120px] bg-black" />

      <main className="h-[80%] flex flex-col max-w-4xl mx-auto">
        <section className="flex-grow pt-14 px-6">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">
              Enter Login Details
            </h2>
          </div>

          <form onSubmit={loginUser} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email
              </label>
              <input
                name="email"
                type="text"
                placeholder="Email"
                className="w-full p-3 border rounded focus:outline-none focus:border-gray-500"
                onChange={(e) =>
                  setData((d) => ({ ...d, email: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded focus:outline-none focus:border-gray-500"
                onChange={(e) =>
                  setData((d) => ({ ...d, password: e.target.value }))
                }
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md font-semibold text-white ${
                isLoading
                  ? "bg-gray-600"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {providers.map((prov) =>
            prov.id !== "credentials" ? (
              <button
                key={prov.id}
                className="mt-4 w-full py-2 bg-white border shadow-md rounded-md font-bold hover:shadow-xl transition"
                onClick={() => signIn(prov.id)}
              >
                Sign in with {prov.name}
              </button>
            ) : null
          )}
        </section>
      </main>

      <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
        <p className="drawer-item">List of Favorites</p>
        <p className="drawer-item">Your Bookings</p>
        <p onClick={() => signOut({ redirect: false })}
          className="drawer-item cursor-pointer text-red-600" >
          Sign out
        </p>
      </Drawer>
    </div>
  );
}
