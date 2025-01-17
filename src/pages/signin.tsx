import { GetServerSidePropsContext } from "next";
import { getProviders, getSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import Drawer from "../components/Drawer";
import Header from "../components/Header";
import { ISuggestionFormatted, provider } from "../types/typings";
import travelsignin from "../../public/travel-signin.svg";
import { useRouter } from "next/router";

const loaderProp =({ src  } :any) => {
  return src;
}

type Props = {
  providers: provider[];
};

const SignIn = ({ providers }: Props) => {
  
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [selectedCity, setSelectedCity] = useState<ISuggestionFormatted | null>(
    null
  );

  const [data,setData] = useState({
                                    email:'',
                                    password:''
                                  });

  const loginUser = async (e: { preventDefault: () => void; }) =>{
    e.preventDefault();

    const res = await signIn('credentials',{
                          ...data,
                          redirect: false });

    if (res?.error) {  console.log(res.error); return; }

    console.log(res);

    router.push('/');  
    
  }



  return (
    <div className="h-screen">
      <Head>
        <title>WorkoutPro - Sign In</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Header */}
      <Header />
      {/* Main */}
      <div className=" h-[120px] sm:h-[120px] lg:h-[120px] xl-h-[120px] 2xl:h-[120px] bg-black"></div>
      <main className="h-[80%]">
        <div className="relative h-[80%]">

        <main className="flex flex-col max-w-4xl mx-auto">
          <section className="flex-grow pt-14 px-6">
            {/* <div className="relative -translate-y-[55px] max-w-xl p-5 mx-auto">
              <Image
                className="-translate-y-[55px] max-w-xl p-5 mx-auto"
                src={travelsignin}
                fill
                alt="Travel"
                loader={loaderProp}
              />
            </div> */}
            <div className="top-[78%] w-full text-center">
                <div className="space-y-12">
                    <div className="border-b border-gray-900/10 pb-12">
                        <h2 className="text-base font-semibold leading-7 text-gray-900">Enter Login Details</h2>
                        <p className="mt-1 text-sm leading-6 text-gray-600"></p>
                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
                            Email
                        </label>
                        <input name="email" className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-title" type="text" placeholder="Email" 
                        onChange={(e) => { setData({...data, email: e.target.value}) }}/>

                    </div>
                </div>
                <div className="flex flex-wrap -mx-3 mb-6">
                    <div className="w-full px-3">
                        <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2" htmlFor="grid-password">
                            Password
                        </label>
                        <input name="password" className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500" id="grid-title" type="password" placeholder="password" 
                        onChange={(e) => {setData({...data, password: e.target.value})}}/>

                    </div>
                </div>
                <div className="mt-6 flex items-center justify-end gap-x-6">
                    <button onClick={loginUser}  type="submit" disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-indigo-600' } px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}>Save</button>
                </div>

            </div>

            {providers && Object.values(providers).map((provider :any) => (
              (provider.name !="credentials" && <div className="top-[78%] w-full text-center" key={provider.name}>
                <button
                  className="text-red-600 bg-white border px-10 py-4 shadow-md rounded-md w-full font-bold my-3 hover:shadow-xl active:scale-90 transition duration-150"
                  onClick={() => signIn(provider.id)}
                >
                  Sign in with {provider.name}
                </button>
              </div>)
            ))}

          </section>
        </main>

          
        </div>
      </main>
      {/* Drawer */}
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

export default SignIn;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {
      providers: await getProviders(),
    },
  };
};
