import Layout from "@/components/AdminLayout";
import Picard from "@/components/Picard";
import Sidebar from "@/components/sidebar";
import { IUser } from "@/types/typings";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";

type Props = {
  usersData: IUser[];
};

const Users = (props: Props) => {

  return (
    <Layout>
        <main>
          {/* <!-- component --> */}
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <div className="mx-auto sm:flex sm:items-center sm:justify-between">
              <div>
                  <div className="mx-auto flex items-center gap-x-3">
                      <h2 className="text-lg font-medium text-gray-800 text-black">Users</h2>

                      <span className="px-3 py-1 text-xs text-blue-600 bg-blue-100 rounded-full dark:bg-gray-800 dark:text-blue-400">0</span>
                  </div>

                  <p className="mx-auto mt-1 text-sm text-gray-500 dark:text-gray-300">.</p>
              </div>

              <div className=" flex items-center mt-4 gap-x-3">
                  
              </div>
            </div>

            <div className="mt-6 mb-6 md:flex md:items-center md:justify-between">
                <div className="inline-flex overflow-hidden bg-white border divide-x rounded-lg dark:bg-gray-900 rtl:flex-row-reverse dark:border-gray-700 dark:divide-gray-700">
                    <button className="px-5 py-2 text-xs font-medium text-gray-600 transition-colors duration-200 bg-gray-100 sm:text-sm dark:bg-gray-800 dark:text-gray-300">
                        View all
                    </button>

                    <button className="px-5 py-2 text-xs font-medium text-gray-600 transition-colors duration-200 sm:text-sm dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                        
                    </button>

                    <button className="px-5 py-2 text-xs font-medium text-gray-600 transition-colors duration-200 sm:text-sm dark:hover:bg-gray-800 dark:text-gray-300 hover:bg-gray-100">
                        
                    </button>
                </div>

                <div className="relative flex items-center mt-4 md:mt-0">
                    <span className="absolute">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 mx-3 text-gray-400 dark:text-gray-600">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </span>

                    <input type="text" placeholder="Search" className="block w-full py-1.5 pr-5 text-gray-700 bg-white border border-gray-200 rounded-lg md:w-80 placeholder-gray-400/70 pl-11 rtl:pr-11 rtl:pl-5 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-300 focus:ring-blue-300 focus:outline-none focus:ring focus:ring-opacity-40"/>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead className="ltr:text-left rtl:text-right">
                    <tr>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        Name
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        
                      </th>
                      <th className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                        
                      </th>
                      <th className="px-4 py-2"></th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                  {props.usersData.map((user) => (
                    <tr>
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-900">
                      {user.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700"></td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700"></td>
                      <td className="whitespace-nowrap px-4 py-2 text-gray-700"></td>
                      <td className="whitespace-nowrap px-4 py-2">
                      <Link href={`/user/${user.id}`} className="inline-block rounded bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
)                 )}
                  </tbody>
                </table>
          </div>
          </div>
        </main>
     </Layout>
  );
};

export default Users;
export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
 
  let url = process.env.NEXT_PUBLIC_API_URL;
  const usersData =  await fetch(url+`/get-user`).then(
                        (res) => res.json()
                      );

  return {
    props: {
      usersData,
    },
  };
};
