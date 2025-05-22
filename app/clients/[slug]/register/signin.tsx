import { GetServerSidePropsContext } from "next";
import { getProviders, getSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import Drawer from "../../../components/Drawer";
import Header from "../../../components/Header";
import { provider } from "../../../types/typings";
import { useRouter } from "next/router";

const SignIn = ({ providers }: { providers: provider[] }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({ email: "", password: "" });

  const loginUser = async (e: { preventDefault: () => void }) => {
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
      <Head>
        <title>WorkoutPro - Sign In</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />
      <div className="h-[120px] bg-black"></div>
      <main className="h-[80%] flex flex-col max-w-4xl mx-auto">
        <section className="flex-grow pt-14 px-6">
          <div className="text-center">
            <h2 className="text-base font-semibold text-gray-900">Enter Login Details</h2>
          </div>
          <form onSubmit={loginUser} className="space-y-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                name="email"
                type="text"
                placeholder="Email"
                className="w-full p-3 border rounded focus:outline-none focus:border-gray-500"
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="w-full p-3 border rounded focus:outline-none focus:border-gray-500"
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md font-semibold text-white ${isLoading ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-500"}`}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          {providers &&
            Object.values(providers).map(
              (provider: any) =>
                provider.name !== "credentials" && (
                  <button
                    key={provider.name}
                    className="mt-4 w-full py-2 bg-white border shadow-md rounded-md font-bold hover:shadow-xl transition"
                    onClick={() => signIn(provider.id)}
                  >
                    Sign in with {provider.name}
                  </button>
                )
            )}
        </section>
      </main>
      <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
        <p className="drawer-item">List of Favorites</p>
        <p className="drawer-item">Your Bookings</p>
        <p onClick={() => signOut()} className="drawer-item cursor-pointer text-red-600">Sign out</p>
      </Drawer>
    </div>
  );
};

export default SignIn;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);
  if (session) {
    return { redirect: { destination: "/", permanent: false } };
  }
  return { props: { providers: await getProviders() } };
};
