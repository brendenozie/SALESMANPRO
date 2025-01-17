import AddExerciseSchedule from "@/components/AddExerciseSchedule";
import RightSide from "@/components/RightSide";
import UserLayout from "@/components/UserLayout";
import UserNav from "@/components/UserNav";
import UserSide from "@/components/UserSide";
import { ChartPieIcon, CalendarDaysIcon, UserCircleIcon, WrenchIcon, ChatBubbleLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Console } from "console";
import { Suspense } from "react";
// import Chart from "react-apexcharts";

// If you're using Next.js please use the dynamic import for react-apexcharts and remove the import from the top for the react-apexcharts
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { IDailyPlan, IExercise } from "@/types/typings";

import { Session } from "next-auth";
import { getSession } from "next-auth/react";


type Props = {
    exercisesData?: { results: IExercise[] };
    dailyPlanData?: { results: IDailyPlan[] };
    session: Session;
    // stylesData: {results:ITravelStyle[]};
    // getInspiredCities: ICity[];
};

const Dash2 = (props: Props) => {

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <UserLayout>
            <div className="flex flex-col min-h-screen bg-gray-900 text-white lg:w-full">
                <UserNav />
                <div className="container mx-auto">


                    {/* <!-- ====== Error 404 Section Start --> */}
                    <section className="relative z-10 bg-primary py-[120px]">
                        <div className="container mx-auto">
                            <div className="-mx-4 flex">
                                <div className="w-full px-4">
                                    <div className="mx-auto max-w-[400px] text-center">
                                        <h2
                                            className="mb-2 text-[50px] font-bold leading-none text-white sm:text-[80px] md:text-[100px]"
                                        >

                                        </h2>
                                        <h4
                                            className="mb-3 text-[22px] font-semibold leading-tight text-white"
                                        >
                                            Coming soon
                                        </h4>
                                        <p className="mb-8 text-lg text-white">

                                        </p>
                                        <a
                                            href="/dashboard2"
                                            className="inline-block rounded-lg border border-white px-8 py-3 text-center text-base font-semibold text-white transition hover:bg-white hover:text-primary"
                                        >
                                            Go To Home
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div
                            className="absolute top-0 left-0 -z-10 flex h-full w-full items-center justify-between space-x-5 md:space-x-8 lg:space-x-14"
                        >
                            <div
                                className="h-full w-1/3 bg-gradient-to-t from-[#FFFFFF14] to-[#C4C4C400]"
                            ></div>
                            <div className="flex h-full w-1/3">
                                <div
                                    className="h-full w-1/2 bg-gradient-to-b from-[#FFFFFF14] to-[#C4C4C400]"
                                ></div>
                                <div
                                    className="h-full w-1/2 bg-gradient-to-t from-[#FFFFFF14] to-[#C4C4C400]"
                                ></div>
                            </div>
                            <div
                                className="h-full w-1/3 bg-gradient-to-b from-[#FFFFFF14] to-[#C4C4C400]"
                            ></div>
                        </div>
                    </section>
                    {/* <!-- ====== Error 404 Section End --> */}






















                    {/* <div className="flex w-full h-full shadow-lg rounded-3xl">
                <section className="flex flex-col pt-3 w-4/12 bg-gray-50 h-full overflow-y-scroll">
                    <label className="px-3">
                    <input className="rounded-lg p-4 bg-gray-100 transition duration-200 focus:outline-none focus:ring-2 w-full"
                        placeholder="Search..." />
                    </label>

                    <ul className="mt-6 text-black">
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 bg-indigo-600 text-white">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md">23m ago</p>
                        </a>
                        <div className="text-md">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    <li className="py-5 border-b px-3 transition hover:bg-indigo-100">
                        <a href="#" className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Akhil Gautam</h3>
                        <p className="text-md text-gray-400">23m ago</p>
                        </a>
                        <div className="text-md italic text-gray-400">You have been invited!</div>
                    </li>
                    </ul>
                </section>
                <section className="w-8/12 px-4 flex flex-col bg-white rounded-r-3xl">
                    <div className="flex justify-between items-center h-48 border-b-2 mb-8">
                    <div className="flex space-x-4 items-center">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img src="https://bit.ly/2KfKgdy" loading="lazy" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">Akhil Gautam</h3>
                        <p className="text-light text-gray-400">akhil.gautam123@gmail.com</p>
                        </div>
                    </div>
                    <div>
                        <ul className="flex text-gray-400 space-x-4">
                        <li className="w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" />
                            </svg>
                        </li>
                        <li className="w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </li>

                        <li className="w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                        </li>
                        <li className="w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </li>
                        <li className="w-6 h-6">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                        </li>
                        </ul>
                    </div>
                    </div>
                    <section>
                    <h1 className="font-bold text-2xl">We need UI/UX designer</h1>
                    <article className="mt-8 text-gray-500 leading-7 tracking-wider">
                        <p>Hi Akhil,</p>
                        <p>Design and develop enterprise-facing UI and consumer-facing UI as well as
                        REST API
                        backends.Work with
                        Product Managers and User Experience designers to create an appealing user experience for desktop web and
                        mobile web.</p>
                        <footer className="mt-12">
                        <p>Thanks & Regards,</p>
                        <p>Alexandar</p>
                        </footer>
                    </article>
                    <ul className="flex space-x-4 mt-12">
                        <li
                        className="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-indigo-600 hover:bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                        </li>
                        <li
                        className="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-blue-800 hover:bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        </li>
                        <li
                        className="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-pink-400 hover:bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                        </li>
                        <li
                        className="w-10 h-10 border rounded-lg p-1 cursor-pointer transition duration-200 text-yellow-500 hover:bg-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
                            d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                        </svg>
                        </li>
                    </ul>
                    </section>
                    <section className="mt-6 border rounded-xl bg-gray-50 mb-3">
                    <textarea className="w-full bg-gray-50 p-2 rounded-xl" placeholder="Type your reply here..." rows={3}></textarea>
                    <div className="flex items-center justify-between p-2">
                        <button className="h-6 w-6 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        </button>
                        <button className="bg-purple-600 text-white px-6 py-2 rounded-xl">Reply</button>
                    </div>
                    </section>
                </section>
            </div> */}
                </div>

                {/* <div className="lg:flex flex-grow "> */}
                {/* Sidebar */}
                {/* <div className={`fixed top-0 left-0 h-full w-64 bg-orange-500 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-50`}>
            <div className="flex justify-between items-center lg:hidden p-4">
              <h1 className="text-white text-lg font-bold">Menu</h1>
              <button onClick={toggleSidebar} className="text-white focus:outline-none">
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="hidden lg:block mb-20 items-center">
                  <img src="city.png" alt="Logo" className="h-8 w-8" />
              </div>
            <nav className="flex flex-col lg:space-y-6 space-y-4 lg:flex-col items-center justify-around lg:justify-start">
                  <a href="#" className="flex items-center">
                      <ChartPieIcon className="h-6 w-6"/>
                  </a>
                  <a href="#" className="flex items-center">
                      <CalendarDaysIcon className="h-6 w-6"/>
                  </a>
                  <a href="#" className="flex items-center">
                      <CheckCircleIcon className="h-6 w-6"/>
                  </a>
                  <a href="#" className="flex items-center">
                      <ChatBubbleLeftIcon className="h-6 w-6"/>
                  </a>
                  <a href="#" className="flex items-center">
                      <UserCircleIcon className="h-6 w-6"/>
                  </a>
                  <a href="#" className="flex items-center">
                      <WrenchIcon className="h-6 w-6"/>
                  </a>
              </nav>
          </div> */}

                {/* Main Content */}
                {/* <div className="flex-1 lg:ml-64">       

              

          </div> */}


                {/* </div>       */}
            </div>




            <Suspense fallback={<>Loading...</>}>
                <AddExerciseSchedule exercisesData={props.exercisesData} session={props.session} />
            </Suspense>
        </UserLayout>
    );
};

export default Dash2;

export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {

    const session = await getSession(context);

    // const userEmail = session?.user?.email;

    let url = process.env.NEXT_PUBLIC_API_URL;

    const exercisesData = await fetch(url + `/get-exercise`).then((res) => res.json());
    const dailyPlanData = await fetch(url + `/get-daily-plan`).then((res) => res.json());

    return {
        props: {
            session,
            exercisesData,
            dailyPlanData
        },
    };
};



{/* <div className="container mx-auto">

<div className="flex flex-wrap items-center"> */}

{/* <!-- component --> */ }

{/* <div className="w-full"> */ }

{/* <!--- more free and premium Tailwind CSS components at https://tailwinduikit.com/ ---> */ }

{/* <div className="px-4 md:px-10 py-4 md:py-7">
          <div className="flex items-center justify-between">
              <p tabIndex={0} className="focus:outline-none text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-normal text-gray-500">My Exercise Schedule</p>
              <div className="py-3 px-4 flex items-center text-sm font-medium leading-none text-gray-600 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded">
                  <p>Sort By:</p>
                  <select aria-label="select" className="focus:text-indigo-600 focus:outline-none bg-transparent ml-1">
                      <option className="text-sm text-indigo-800">Latest</option>
                      <option className="text-sm text-indigo-800">Oldest</option>
                      <option className="text-sm text-indigo-800">Latest</option>
                  </select>
              </div>
          </div>
      </div> */}
{/* <div className="bg-white py-4 md:py-7 px-4 md:px-8">
          <div className="sm:flex items-center justify-end"> */}
{/* <div className="flex items-center">
                  <a className="rounded-full focus:outline-none focus:ring-2  focus:bg-indigo-50 focus:ring-indigo-800" href=" javascript:void(0)">
                      <div className="py-2 px-8 bg-indigo-100 text-indigo-700 rounded-full">
                          <p>All</p>
                      </div>
                  </a>
                  <a className="rounded-full focus:outline-none focus:ring-2 focus:bg-indigo-50 focus:ring-indigo-800 ml-4 sm:ml-8" href="javascript:void(0)">
                      <div className="py-2 px-8 text-gray-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-full ">
                          <p>Done</p>
                      </div>
                  </a>
                  <a className="rounded-full focus:outline-none focus:ring-2 focus:bg-indigo-50 focus:ring-indigo-800 ml-4 sm:ml-8" href="javascript:void(0)">
                      <div className="py-2 px-8 text-gray-600 hover:text-indigo-700 hover:bg-indigo-100 rounded-full ">
                          <p>Pending</p>
                      </div>
                  </a>
              </div> */}
{/* <Link href="?modal=true">
              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 mt-4 sm:mt-0 inline-flex items-start justify-start px-6 py-3 bg-indigo-700 hover:bg-indigo-600 focus:outline-none rounded">
                  <p className="text-sm font-medium leading-none text-white">Add Exercise </p>
              </button>
              </Link>
          </div>
          <div className="p-6"> */}
{/* <!-- { /*variation dark set*/ }
{/* <div  className='flex justify-start md:justify-evenly overflow-x-scroll mx-auto py-4 px-2'>
                
                  <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300'> Sun </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 11 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300'> Mon </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 12 </p>
                          </div>
                      </div>
                  </div> */}

{/* <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all font-normal group-hover:font-semibold	duration-300'> Tue </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 13</p>
                          </div>
                      </div>
                  </div>
                
                  <div className='flex group bg-purple-600 shadow-lg dark-shadow rounded-full mx-1 cursor-pointer justify-center relative  w-16'>
                    <span className="flex h-2 w-2 absolute bottom-1.5 ">
                      <span className="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-purple-400 "></span>
                      <span className="relative inline-flex rounded-full h- w-3 bg-purple-100"></span>
                    </span>
                      <div className='flex items-center px-4 my-2 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-100 text-sm font-semibold'> Wed </p>
                            <p className='text-gray-100  mt-3 font-bold'> 14 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300'> Thu </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 15 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300'> Fri </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 16 </p>
                          </div>
                      </div>
                  </div>
                  
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-full mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all  group-hover:font-semibold duration-300'> Sat </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 17 </p>
                          </div>
                      </div>
                  </div>
                  
                
              </div> */}
{/* <!-- { /*variation dark set*/ }
{/* <div  className='flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-scroll mx-auto py-4 px-2  md:mx-12'>
                
                  <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Sun </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 11 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Mon </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 12 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Tue </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 13</p>
                          </div>
                      </div>
                  </div>
                
                  <div className='flex group bg-purple-600 shadow-lg dark-shadow rounded-lg mx-1 cursor-pointer justify-center relative  w-16'>
                    <span className="flex h-3 w-3 absolute -top-1 -right-1">
                      <span className="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-purple-400 "></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-100"></span>
                    </span>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-100 text-sm'> Wed </p>
                            <p className='text-gray-100  mt-3 font-bold'> 14 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Thu </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 15 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center  w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Fri </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 16 </p>
                          </div>
                      </div>
                  </div>
                  
                <div className='flex group hover:bg-purple-500 hover:shadow-lg hover-dark-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-gray-100 text-sm transition-all	duration-300'> Sat </p>
                            <p className='text-gray-900 group-hover:text-gray-100 mt-3 group-hover:font-bold transition-all	duration-300'> 17 </p>
                          </div>
                      </div>
                  </div>
                  
                
              </div>
              
              <br/><br/> */}

{ /*variation light set*/ }
{/* <div  className='flex bg-white shadow-md justify-start md:justify-center rounded-lg overflow-x-scroll mx-auto py-4 px-2  md:mx-12'>
                
                  <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Sun </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 11 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Mon </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 12 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Tue </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 13</p>
                          </div>
                      </div>
                  </div>
                
                  <div className='flex group bg-purple-300 shadow-lg light-shadow rounded-lg mx-1 cursor-pointer justify-center relative w-16 content-center'>
                    <span className="flex h-3 w-3 absolute -top-1 -right-1">
                      <span className="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-purple-400 "></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                    </span>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-purple-900 text-sm'> Wed </p>
                            <p className='text-purple-900  mt-3 font-bold'> 14 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300 content-center	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Thu </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 15 </p>
                          </div>
                      </div>
                  </div>
                
                <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Fri </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 16 </p>
                          </div>
                      </div>
                  </div>
                  
                <div className='flex group hover:bg-purple-100 hover:shadow-lg hover-light-shadow rounded-lg mx-1 transition-all	duration-300	 cursor-pointer justify-center w-16'>
                      <div className='flex items-center px-4 py-4'>
                          <div className='text-center'>
                            <p className='text-gray-900 group-hover:text-purple-900 text-sm transition-all	duration-300'> Sat </p>
                            <p className='text-gray-900 group-hover:text-purple-900 mt-3 group-hover:font-bold transition-all	duration-300'> 17 </p>
                          </div>
                      </div>
                  </div>
                  
                
              </div> */}


{/* </div>
          <div className="mt-7 overflow-x-auto">
              <table className="w-full whitespace-nowrap  justify-stretch">
                  <tbody>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Full Body Exercise</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                                                             
                          <td className="pl-5">
                            <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          
                          <td className="pl-5">
                              <button className="py-3 px-3 text-sm focus:outline-none leading-none text-red-700 bg-red-100 rounded">Mark As Done</button>
                          </td>                                    
                          <td className="pl-5">
                            <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">Reschedule</button>
                          </td>
                      </tr>
                      
                  </tbody>
              </table> */}


{/* BACKUP TABLE */ }
{/* <table className="w-full whitespace-nowrap overflow-hidden overflow-scroll">
                  <tbody>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Marketing Keynote Presentation</p>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M6.66669 9.33342C6.88394 9.55515 7.14325 9.73131 7.42944 9.85156C7.71562 9.97182 8.02293 10.0338 8.33335 10.0338C8.64378 10.0338 8.95108 9.97182 9.23727 9.85156C9.52345 9.73131 9.78277 9.55515 10 9.33342L12.6667 6.66676C13.1087 6.22473 13.357 5.62521 13.357 5.00009C13.357 4.37497 13.1087 3.77545 12.6667 3.33342C12.2247 2.89139 11.6251 2.64307 11 2.64307C10.3749 2.64307 9.77538 2.89139 9.33335 3.33342L9.00002 3.66676" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M9.33336 6.66665C9.11611 6.44492 8.8568 6.26876 8.57061 6.14851C8.28442 6.02825 7.97712 5.96631 7.66669 5.96631C7.35627 5.96631 7.04897 6.02825 6.76278 6.14851C6.47659 6.26876 6.21728 6.44492 6.00003 6.66665L3.33336 9.33332C2.89133 9.77534 2.64301 10.3749 2.64301 11C2.64301 11.6251 2.89133 12.2246 3.33336 12.6666C3.77539 13.1087 4.37491 13.357 5.00003 13.357C5.62515 13.357 6.22467 13.1087 6.66669 12.6666L7.00003 12.3333" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                              </div>
                          </td>
                          <td className="pl-24">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-3 text-sm focus:outline-none leading-none text-red-700 bg-red-100 rounded">Due today at 18:00</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none  h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td  className="focus:text-indigo-600 ">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">UX Wireframes</p>
                              </div>
                          </td>
                          <td className="pl-24">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-6 focus:outline-none text-sm leading-none text-gray-700 bg-gray-100 rounded">Due on 21.02.21</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none focus:text-indigo-600 h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Marketing Keynote Presentation</p>
                              </div>
                          </td>
                          <td className="pl-24"></td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-7 text-sm leading-none text-gray-700 bg-gray-100 rounded focus:outline-none">Due tomorrow</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2  focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" checked={false} type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Development Phase 1</p>
                              </div>
                          </td>
                          <td className="pl-24"></td>
                          <td className="pl-5"></td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-red-300 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-red-300 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Marketing Keynote Presentation</p>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M6.66669 9.33342C6.88394 9.55515 7.14325 9.73131 7.42944 9.85156C7.71562 9.97182 8.02293 10.0338 8.33335 10.0338C8.64378 10.0338 8.95108 9.97182 9.23727 9.85156C9.52345 9.73131 9.78277 9.55515 10 9.33342L12.6667 6.66676C13.1087 6.22473 13.357 5.62521 13.357 5.00009C13.357 4.37497 13.1087 3.77545 12.6667 3.33342C12.2247 2.89139 11.6251 2.64307 11 2.64307C10.3749 2.64307 9.77538 2.89139 9.33335 3.33342L9.00002 3.66676" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M9.33336 6.66665C9.11611 6.44492 8.8568 6.26876 8.57061 6.14851C8.28442 6.02825 7.97712 5.96631 7.66669 5.96631C7.35627 5.96631 7.04897 6.02825 6.76278 6.14851C6.47659 6.26876 6.21728 6.44492 6.00003 6.66665L3.33336 9.33332C2.89133 9.77534 2.64301 10.3749 2.64301 11C2.64301 11.6251 2.89133 12.2246 3.33336 12.6666C3.77539 13.1087 4.37491 13.357 5.00003 13.357C5.62515 13.357 6.22467 13.1087 6.66669 12.6666L7.00003 12.3333" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                              </div>
                          </td>
                          <td className="pl-24">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-7 text-sm leading-none text-gray-700 bg-gray-100 rounded focus:outline-none">Due tomorrow</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" checked={false} type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Marketing Keynote Presentation</p>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M6.66669 9.33342C6.88394 9.55515 7.14325 9.73131 7.42944 9.85156C7.71562 9.97182 8.02293 10.0338 8.33335 10.0338C8.64378 10.0338 8.95108 9.97182 9.23727 9.85156C9.52345 9.73131 9.78277 9.55515 10 9.33342L12.6667 6.66676C13.1087 6.22473 13.357 5.62521 13.357 5.00009C13.357 4.37497 13.1087 3.77545 12.6667 3.33342C12.2247 2.89139 11.6251 2.64307 11 2.64307C10.3749 2.64307 9.77538 2.89139 9.33335 3.33342L9.00002 3.66676" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M9.33336 6.66665C9.11611 6.44492 8.8568 6.26876 8.57061 6.14851C8.28442 6.02825 7.97712 5.96631 7.66669 5.96631C7.35627 5.96631 7.04897 6.02825 6.76278 6.14851C6.47659 6.26876 6.21728 6.44492 6.00003 6.66665L3.33336 9.33332C2.89133 9.77534 2.64301 10.3749 2.64301 11C2.64301 11.6251 2.89133 12.2246 3.33336 12.6666C3.77539 13.1087 4.37491 13.357 5.00003 13.357C5.62515 13.357 6.22467 13.1087 6.66669 12.6666L7.00003 12.3333" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                              </div>
                          </td>
                          <td className="pl-24"></td>
                          <td className="pl-5"></td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">CSS and functionality</p>
                              </div>
                          </td>
                          <td className="pl-24">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-3 text-sm leading-none text-red-700 bg-red-100 rounded focus:outline-none">Due Today at 18:00</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" checked={false} type="checkbox" className="checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Marketing Keynote Presentation</p>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                                      <path d="M6.66669 9.33342C6.88394 9.55515 7.14325 9.73131 7.42944 9.85156C7.71562 9.97182 8.02293 10.0338 8.33335 10.0338C8.64378 10.0338 8.95108 9.97182 9.23727 9.85156C9.52345 9.73131 9.78277 9.55515 10 9.33342L12.6667 6.66676C13.1087 6.22473 13.357 5.62521 13.357 5.00009C13.357 4.37497 13.1087 3.77545 12.6667 3.33342C12.2247 2.89139 11.6251 2.64307 11 2.64307C10.3749 2.64307 9.77538 2.89139 9.33335 3.33342L9.00002 3.66676" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M9.33336 6.66665C9.11611 6.44492 8.8568 6.26876 8.57061 6.14851C8.28442 6.02825 7.97712 5.96631 7.66669 5.96631C7.35627 5.96631 7.04897 6.02825 6.76278 6.14851C6.47659 6.26876 6.21728 6.44492 6.00003 6.66665L3.33336 9.33332C2.89133 9.77534 2.64301 10.3749 2.64301 11C2.64301 11.6251 2.89133 12.2246 3.33336 12.6666C3.77539 13.1087 4.37491 13.357 5.00003 13.357C5.62515 13.357 6.22467 13.1087 6.66669 12.6666L7.00003 12.3333" stroke="#3B82F6" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                              </div>
                          </td>
                          <td className="pl-24"></td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                      <tr className="h-3"></tr>
                      <tr tabIndex={0} className="focus:outline-none h-16 border border-gray-100 rounded">
                          <td>
                              <div className="ml-5">
                                  <div className="bg-gray-200 rounded-sm w-5 h-5 flex flex-shrink-0 justify-center items-center relative">
                                      <input placeholder="checkbox" type="checkbox" className="focus:opacity-100 checkbox opacity-0 absolute cursor-pointer w-full h-full" />
                                      <div className="check-icon hidden bg-indigo-700 text-white rounded-sm">
                                          <svg className="icon icon-tabler icon-tabler-check" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
                                              <path stroke="none" d="M0 0h24v24H0z"></path>
                                              <path d="M5 12l5 5l10 -10"></path>
                                          </svg>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="">
                              <div className="flex items-center pl-5">
                                  <p className="text-base font-medium leading-none text-gray-700 mr-2">Vue integration</p>
                              </div>
                          </td>
                          <td className="pl-24">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M9.16667 2.5L16.6667 10C17.0911 10.4745 17.0911 11.1922 16.6667 11.6667L11.6667 16.6667C11.1922 17.0911 10.4745 17.0911 10 16.6667L2.5 9.16667V5.83333C2.5 3.99238 3.99238 2.5 5.83333 2.5H9.16667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <circle cx="7.50004" cy="7.49967" r="1.66667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></circle>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">Urgent</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M7.5 5H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 10H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M7.5 15H16.6667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 5V5.00667" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 10V10.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M4.16669 15V15.0067" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path d="M3.33331 17.4998V6.6665C3.33331 6.00346 3.59671 5.36758 4.06555 4.89874C4.53439 4.4299 5.17027 4.1665 5.83331 4.1665H14.1666C14.8297 4.1665 15.4656 4.4299 15.9344 4.89874C16.4033 5.36758 16.6666 6.00346 16.6666 6.6665V11.6665C16.6666 12.3295 16.4033 12.9654 15.9344 13.4343C15.4656 13.9031 14.8297 14.1665 14.1666 14.1665H6.66665L3.33331 17.4998Z" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M10 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M6.66669 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      <path d="M13.3333 9.1665V9.17484" stroke="#52525B" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">23</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <div className="flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                      <path
                                          d="M12.5 5.83339L7.08333 11.2501C6.75181 11.5816 6.56556 12.0312 6.56556 12.5001C6.56556 12.9689 6.75181 13.4185 7.08333 13.7501C7.41485 14.0816 7.86449 14.2678 8.33333 14.2678C8.80217 14.2678 9.25181 14.0816 9.58333 13.7501L15 8.33339C15.663 7.67034 16.0355 6.77107 16.0355 5.83339C16.0355 4.8957 15.663 3.99643 15 3.33339C14.337 2.67034 13.4377 2.29785 12.5 2.29785C11.5623 2.29785 10.663 2.67034 10 3.33339L4.58333 8.75005C3.58877 9.74461 3.03003 11.0935 3.03003 12.5001C3.03003 13.9066 3.58877 15.2555 4.58333 16.2501C5.57789 17.2446 6.92681 17.8034 8.33333 17.8034C9.73985 17.8034 11.0888 17.2446 12.0833 16.2501L17.5 10.8334"
                                          stroke="#52525B"
                                          stroke-width="1.25"
                                          stroke-linecap="round"
                                          stroke-linejoin="round"
                                      ></path>
                                  </svg>
                                  <p className="text-sm leading-none text-gray-600 ml-2">04/07</p>
                              </div>
                          </td>
                          <td className="pl-5">
                              <button className="py-3 px-3 text-sm leading-none text-gray-700 bg-gray-100 hover:bg-gray-200 rounded focus:outline-none">Due Today at 18:00</button>
                          </td>
                          <td className="pl-4">
                              <button className="focus:ring-2 focus:ring-offset-2 focus:ring-red-300 text-sm leading-none text-gray-600 py-3 px-5 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none">View</button>
                          </td>
                          <td>
                              <div className="relative px-5 pt-2">
                                  <button className="focus:ring-2 rounded-md focus:outline-none"  role="button" aria-label="option">
                                      <svg className="dropbtn"  xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                          <path d="M4.16667 10.8332C4.62691 10.8332 5 10.4601 5 9.99984C5 9.5396 4.62691 9.1665 4.16667 9.1665C3.70643 9.1665 3.33334 9.5396 3.33334 9.99984C3.33334 10.4601 3.70643 10.8332 4.16667 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M10 10.8332C10.4602 10.8332 10.8333 10.4601 10.8333 9.99984C10.8333 9.5396 10.4602 9.1665 10 9.1665C9.53976 9.1665 9.16666 9.5396 9.16666 9.99984C9.16666 10.4601 9.53976 10.8332 10 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                          <path d="M15.8333 10.8332C16.2936 10.8332 16.6667 10.4601 16.6667 9.99984C16.6667 9.5396 16.2936 9.1665 15.8333 9.1665C15.3731 9.1665 15 9.5396 15 9.99984C15 10.4601 15.3731 10.8332 15.8333 10.8332Z" stroke="#9CA3AF" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"></path>
                                      </svg>
                                  </button>
                                  <div className="dropdown-content bg-white shadow w-24 absolute z-30 right-0 mr-6 hidden">
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Edit</p>
                                      </div>
                                      <div tabIndex={0} className="focus:outline-none focus:text-indigo-600 text-xs w-full hover:bg-indigo-700 py-4 px-4 cursor-pointer hover:text-white">
                                          <p>Delete</p>
                                      </div>
                                  </div>
                              </div>
                          </td>
                      </tr>
                  </tbody>
              </table> 
            </div> 
      </div>
  </div>  

</div>
</div> */}
