import { GetServerSidePropsContext } from "next";
import { getProviders, getSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import Drawer from "../components/Drawer";
import Header from "../components/Header";

type Props = {
  providers: Record<string, any>;
};

const Register = ({ providers }: Props) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    provider: "web",
  });

  const registerUser = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      });

      const res = await response.json();

      if (res?.error) {
        console.log(res.error);
        setIsLoading(false);
        return;
      }

      router.push("/signin");
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen">
      <Head>
        <title>Ghuba - Register</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div className="bg-black h-[120px]"></div>

      <main className="h-[80%] flex justify-center items-center">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg">
          <h2 className="text-center text-xl font-semibold text-gray-900 dark:text-white">
            Create an Account
          </h2>

          <form className="mt-6 space-y-4" onSubmit={registerUser}>
            <div>
              <label className="block text-gray-700 dark:text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your name"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                onChange={(e) => setData({ ...data, name: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Your email"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                onChange={(e) => setData({ ...data, email: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                className="w-full px-3 py-2 border rounded-lg focus:ring focus:ring-indigo-300"
                onChange={(e) => setData({ ...data, password: e.target.value })}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2 rounded-md text-white font-semibold ${
                isLoading ? "bg-gray-600" : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              {isLoading ? "Registering..." : "Sign Up"}
            </button>
          </form>

          <div className="my-4 text-center text-gray-500">OR</div>

          {providers &&
            Object.values(providers).map((provider: any) =>
              provider.name !== "credentials" ? (
                <button
                  key={provider.id}
                  className="w-full py-2 text-red-600 border rounded-md shadow-md hover:shadow-lg"
                  onClick={() => signIn(provider.id)}
                >
                  Sign up with {provider.name}
                </button>
              ) : null
            )}

          <p className="text-center text-gray-600 dark:text-gray-400 mt-4 text-sm">
            Already have an account?{" "}
            <a href="/signin" className="text-blue-500 hover:underline">
              Sign in
            </a>
          </p>
        </div>
      </main>

      <Drawer isOpen={isOpen} setIsOpen={setIsOpen}>
        <p className="drawer-item">List of Favorites</p>
        <p className="drawer-item">Your Bookings</p>
        <p onClick={() => signOut()} className="drawer-item">
          Sign out
        </p>
      </Drawer>
    </div>
  );
};

export default Register;

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: { destination: "/", permanent: false },
    };
  }

  return {
    props: { providers: await getProviders() },
  };
};
