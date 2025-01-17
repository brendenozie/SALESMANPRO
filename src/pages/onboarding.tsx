import { useState } from "react";
import { GetServerSidePropsContext } from "next";
import { getProviders, getSession, signIn, signOut } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Drawer from "../components/Drawer";
import Header from "../components/Header";
import { ISuggestionFormatted, provider } from "../types/typings";
import travelsignin from "../../public/travel-signin.svg";
import { useRouter } from "next/router";

type Props = {
  providers: provider[];
};

const PageOne = ({ user, handleInputChange, nextPage }:any) => (
  <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
  {/* Heading */}
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
    Basic Info
  </h2>

  {/* Full Name Input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Full Name
    </label>
    <input
      name="name"
      value={user.name}
      onChange={handleInputChange}
      placeholder="Enter your full name"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Gender Selection */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Gender
    </label>
    <select
      name="gender"
      value={user.gender}
      onChange={handleInputChange}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    >
      <option value="person">Person</option>
      <option value="male">Male</option>
      <option value="female">Female</option>
    </select>
  </div>

  {/* Next Button */}
  <div className="text-center">
    <button
      onClick={nextPage}
      className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
    >
      Next
    </button>
  </div>
</div>

);

const PageTwo = ({ user, handleInputChange, nextPage, prevPage } : any) => (
  <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
  {/* Heading */}
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
    Fitness Info
  </h2>

  {/* Exercise Goal Input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Exercise Goal
    </label>
    <input
      name="exerciseGoal"
      value={user.exerciseGoal}
      onChange={handleInputChange}
      placeholder="What's your exercise goal?"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Focus Area Input */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Focus Area
    </label>
    <input
      name="focusArea"
      value={user.focusArea}
      onChange={handleInputChange}
      placeholder="Which area are you focusing on?"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-between">
    <button
      onClick={prevPage}
      className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition-all duration-300"
    >
      Back
    </button>
    <button
      onClick={nextPage}
      className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
    >
      Next
    </button>
  </div>
</div>

);

const PageThree = ({ user, handleInputChange, nextPage, prevPage, submitForm } : any) => (
  <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
  {/* Heading */}
  <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
    Physical Stats
  </h2>

  {/* Height Input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Height (cm)
    </label>
    <input
      type="number"
      name="currentHeightInCm"
      value={user.currentHeightInCm}
      onChange={handleInputChange}
      placeholder="Enter your height in cm"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Weight Input */}
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Weight (kg)
    </label>
    <input
      type="number"
      name="currentWeightInKg"
      value={user.currentWeightInKg}
      onChange={handleInputChange}
      placeholder="Enter your weight in kg"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Birth Year Input */}
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      Birth Year
    </label>
    <input
      type="number"
      name="birthYear"
      value={user.birthYear}
      onChange={handleInputChange}
      placeholder="Enter your birth year"
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
    />
  </div>

  {/* Buttons */}
  <div className="flex justify-between">
    <button
      onClick={prevPage}
      className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition-all duration-300"
    >
      Back
    </button>
    <button
      onClick={nextPage}
      className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow hover:bg-indigo-700 transition-all duration-300"
    >
      Next
    </button>
  </div>
</div>

);

const PageFour = ({ user, handleInputChange, prevPage, submitForm, providers } : any) => (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg">
        <div className="flex justify-between">
            {/* Email Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
                </label>
                <input
                name="email"
                value={user.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
            </div>
            <button onClick={prevPage}  className="px-6 py-2 bg-gray-300 text-gray-800 font-semibold rounded-lg shadow hover:bg-gray-400 transition-all duration-300"
                >Back</button>
            {providers && Object.values(providers).map((provider :any) => (
                (provider.name !="credentials" && <div className="top-[78%] w-full text-center" key={provider.name}>
                    <button
                        className="text-red-600 bg-white border px-10 py-4 shadow-md rounded-md w-full font-bold my-3 hover:shadow-xl active:scale-90 transition duration-150"
                        onClick={() => signIn(provider.id)}
                    >
                        Register with {provider.name}
                    </button>
                </div>)
            ))}
        </div>
    </div>
);

const Onboarding = ({ providers }: Props) => {
  const [user, setUser] = useState({
    id: '',
    name: '',
    email: '',
    password: 'random$123%$^&',
    gender: 'person',
    exerciseGoal: 'Lose Weight',
    focusArea: 'Arms',
    currentHeightInCm: 0,
    currentWeightInKg: 0.0,
    birthYear: 0,
    weeklyGoalInKM: 0.0,
    weightInKgGoal: 0.0,
    physicalActivityLevel: 'Beginner',
    bmiResult: 0.0,
    imgUri: '',
    role: 'user',
    provider: 'mobile',
    img: 'mobile',
  });

  const [page, setPage] = useState(0);

  const nextPage = () => setPage((prevPage) => prevPage + 1);
  const prevPage = () => setPage((prevPage) => prevPage - 1);

  const handleInputChange = (e : any) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      [name]: value,
    });
  };

  const submitForm = () => {
    // Add your form submission logic here
    console.log('User Data:', user);
  };

  const pages = [
    <PageOne user={user} handleInputChange={handleInputChange} nextPage={nextPage} />,
    <PageTwo user={user} handleInputChange={handleInputChange} nextPage={nextPage} prevPage={prevPage} />,
    <PageThree user={user} handleInputChange={handleInputChange} nextPage={nextPage} prevPage={prevPage} submitForm={submitForm} />,
    <PageFour user={user} handleInputChange={handleInputChange} prevPage={prevPage} submitForm={submitForm} providers={providers}/>,
  ];

  return (
    <div>
      {pages[page]}
    </div>
  );
};

export default Onboarding;


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

async function getCsrfSignature() {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/auth/csrf`;
  const response = await fetch(url);
  const data = await response.json();
  const { signature, timestamp } = data;
  return { signature, timestamp };
}
