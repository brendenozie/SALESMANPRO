import { useEffect, useRef, useState } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { GetServerSidePropsContext } from "next";
// import { FaPlay, FaPause, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import {
    PlayIcon,
    PauseIcon,
    CheckCircleIcon,
    ClockIcon
} from "@heroicons/react/24/solid";
import UserLayout from '@/components/UserLayout';
import UserNav from '@/components/UserNav';

import Image from "next/image";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";

import img from "../../assets/image2.png";
import { IExercise } from '@/types/typings';
import axios from 'axios';

const imageTypeRegex = /image\/(png|jpg|jpeg)/gm;

type Props = {
    session: Session;
    exercise: IExercise;
};

const loaderProp = ({ src }: any) => {
    return src;
}

const addDestination = ({ session, exercise }: Props) => {

    const [time, setTime] = useState(60);

    const [isActive, setIsActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isStarted, setIsStarted] = useState(false);

    const [totalReps, setTotalReps] = useState(Number.parseInt(`${exercise.reps}`));
    const [reps, setReps] = useState(0);
    const [totalSets, setTotalSets] = useState(Number.parseInt(`${exercise.sets}`));
    const [sets, setSets] = useState(1);

    const [exerciseId, setExerciseId] = useState(`${exercise.id}`);
    const [acDate, setAcDate] = useState(`${Date.now()}`);
    const [acTime, setAcTime] = useState("1:00 P.M");
    const [acDuration, setAcDuration] = useState(exercise.exDuration);

    const intervalRef = useRef<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const radius = 50;
    const duration = Number.parseInt(exercise.exDuration?.replace("s", ""));
    const circumference = 2 * Math.PI * radius;

    const [timeLeft, setTimeLeft] = useState(0);

    const progress = (timeLeft / time) * circumference;

    useEffect(() => {

        if (isStarted && !isActive && !isPaused && timeLeft === 0) {
            onPostExerciseActivity();
        }

        if (isActive && !isPaused && timeLeft < duration) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(timeLeft + 1);
            }, 1000);
        } else if (isActive && isPaused) {
            clearInterval(intervalRef.current);
        } else {
            if (timeLeft === duration) {
                setReps(reps + 1);
            }

            if (reps == totalReps) {
                setSets(sets + 1);
                setReps(0);
            }

            setIsActive(false);
            setIsPaused(false);
            setTimeLeft(0)
        }

        return () => clearInterval(intervalRef.current);

    }, [isActive, isPaused, timeLeft]);

    const handleStart = () => {
        if (isActive && isPaused == false) {
            setIsPaused(true);
            return;
        }
        setIsActive(true);
        setIsStarted(true);
        setIsPaused(false);
    };

    const handleReset = () => {
        setIsActive(false);
        setIsPaused(false);
        setTimeLeft(0);
    };

    const formatTime = (time: any) => {
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const onPostExerciseActivity = async () => {

        // if (!props.session) {
        //     return {
        //         redirect: {
        //             destination: "/signin",
        //             permanent: false,
        //         },
        //     };
        // }

        setIsLoading(true);

        const ur_l = `${process.env.NEXT_PUBLIC_API_URL}/post-exercise-activity`;

        await axios.post(ur_l, {
            exerciseId,
            acDate,
            acTime,
            acDuration,
            acReps: `${reps}`,
            acSets: `${sets}`
        }).then(() => {

            // router.push(pathname);
            setIsStarted(false);
            setIsLoading(false);

        }).catch(() => {
            alert('Something went wrong.');
            setIsLoading(false);
        });
    };

    return (

        <UserLayout>
            <div className="flex flex-col min-h-screen bg-gray-900 text-white lg:w-full">
                <UserNav />
                <div className="flex flex-col lg:flex-row p-4">
                    {/* Middle part */}
                    <div className="flex flex-col items-center bg-white rounded-lg shadow-lg p-6 w-full lg:w-2/3 m-2">

                        <div className="relative w-full h-96 bg-gray-200 rounded-md mb-4">
                            <div className="absolute bg-slate-900 bg-opaexercise-80 rounded-md top-4 left-4 text-white p-2">
                                <h2 className="text-2xl font-bold mb-2">{exercise.exName}</h2>
                                <p className="text-gray-400 mb-2">Exercise Reps {exercise.reps} Sets {exercise.sets}</p>
                            </div>
                            <div className="absolute bg-slate-900 bg-opaexercise-80 rounded-md bottom-4 right-4 text-white p-2">
                                <h2 className="text-gray-400 mb-2">Rep Count: {reps}</h2>
                                <p className="text-gray-400 mb-2">Set Count: {sets}</p>
                            </div>
                            <Image
                                src={img}
                                alt="calories"
                                fill={false}
                                loader={loaderProp}
                                className="w-full h-full object-cover rounded-md"
                            />
                            {/* <button onClick={startTimer} className="absolute bottom-4 left-4 bg-red-500 text-white p-8 rounded-full">
                            {isActive ? <PauseIcon className='h-6 w-6' /> : <PlayIcon className='h-6 w-6'/>}
                        </button> */}
                            <div className="absolute bottom-4 left-4 text-white ">
                                <div className="flex flex-col items-center bg-slate-900 bg-opaexercise-80 rounded-full">
                                    <button onClick={handleStart} className="items-center justify-center text-white  rounded-full">
                                        <svg className="transform -rotate-90" width="120" height="120">
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r={radius}
                                                stroke="#e5e7eb"
                                                strokeWidth="8"
                                                fill="transparent"
                                            />
                                            <circle
                                                cx="60"
                                                cy="60"
                                                r={radius}
                                                stroke="#3b82f6"
                                                strokeWidth="8"
                                                fill="transparent"
                                                strokeDasharray={circumference}
                                                strokeDashoffset={circumference - progress}
                                            />
                                        </svg>
                                        {isActive && !isPaused ? <PauseIcon className='absolute top-[25%] left-[25%] h-16 w-16' /> : <PlayIcon className='absolute top-[25%] left-[25%] h-16 w-16' />}
                                    </button>
                                    {/* <div className="mt-4 text-2xl">
                                    {timeLeft}s
                                </div> */}
                                </div>
                                {/* <Timer duration={60} /> */}
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-4 w-full text-black">
                            <div className="flex flex-col items-center">
                                <p className="w-12 h-12 bg-purple-500 rounded-full  justify-center items-center font-bold content-center text-center">{exercise.reps}</p>
                                <p className="font-bold text-center text-sm">Reps</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="w-12 h-12 bg-purple-500 rounded-full  justify-center items-center font-bold content-center text-center">{exercise.sets}</p>
                                <p className="font-bold text-center text-sm">Sets</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="w-12 h-12 bg-purple-500 rounded-full  justify-center items-center font-bold content-center text-center">{formatTime(duration)}s</p>
                                <p className="font-bold text-center text-sm">Duration</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <p className="w-12 h-12 bg-purple-500 rounded-full  justify-center content-center font-bold items-center text-center">{formatTime(timeLeft)}</p>
                                <p className="font-bold text-center text-sm">Timer</p>
                            </div>
                        </div>
                        <div className="w-full space-y-6 mt-12">
                            {/* Hero text */}
                            <div className="w-full lg:mt-0 text-center md:text-start text-4xl lg:text-4xl font-bold gap-6 uppercase text-black text-clip overflow-hidden">
                                Your Next Exercise
                            </div>

                            <div className=" w-full items-center justify-center bg-white ">
                                <div className="space-y-6 border-l-2 border-dashed">
                                    {exercise.exSteps &&
                                        exercise.exSteps?.map((item: any) => (
                                            <div className="relative w-full">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="absolute -top-0.5 z-10 -ml-3.5 h-7 w-7 rounded-full text-blue-500">
                                                    <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                                </svg>
                                                <div className="ml-6">
                                                    <h4 className="font-bold text-blue-500">{item.name}</h4>
                                                    <p className="mt-2 max-w-screen-sm text-sm text-gray-500">{item.description}</p>
                                                    <span className="mt-1 block text-sm font-semibold text-blue-500"></span>
                                                </div>
                                            </div>
                                        ))}

                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Right part */}
                    <div className="flex flex-col bg-white rounded-lg shadow-lg p-6 w-full lg:w-1/3 m-2 text-black">
                        <h2 className="text-2xl font-bold mb-4">Exercises</h2>
                        <div className="flex flex-col space-y-2">
                            <div className="flex items-center justify-between">
                                <Image
                                    src={img}
                                    alt="calories"
                                    fill={false}
                                    loader={loaderProp}
                                    className="w-32 h-24 object-cover rounded-md"
                                />
                                <div className='w-full px-1'>
                                    <p className="text-black font-bold">Abdominal muscles</p>
                                    <p className="text-gray-500">10 mins 40Kcal</p>
                                </div>

                                <CheckCircleIcon className="text-green-500 h-12 w-12" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Image
                                    src={img}
                                    alt="calories"
                                    fill={false}
                                    loader={loaderProp}
                                    className="w-32 h-24 object-cover rounded-md"
                                />
                                <div className='w-full px-1'>
                                    <p className="text-black font-bold">Jumping on ball</p>
                                    <p className="text-gray-500">15 mins 90Kcal</p>
                                </div>

                                <CheckCircleIcon className="text-green-500 h-12 w-12" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Image
                                    src={img}
                                    alt="calories"
                                    fill={false}
                                    loader={loaderProp}
                                    className="w-32 h-24 object-cover rounded-md"
                                />
                                <div className='w-full px-1'>
                                    <p className="text-black font-bold">With dumbbells</p>
                                    <p className="text-gray-500">10 mins 50Kcal</p>
                                </div>

                                <CheckCircleIcon className="text-green-500 h-12 w-12" />
                            </div>
                            <div className="flex items-center justify-between">
                                <Image
                                    src={img}
                                    alt="calories"
                                    fill={false}
                                    loader={loaderProp}
                                    className="w-32 h-24 object-cover rounded-md"
                                />
                                <div className='w-full px-1'>
                                    <p className="text-black font-bold">Jumping</p>
                                    <p className="text-gray-500">10 mins 110Kcal</p>
                                </div>

                                <ClockIcon className="text-red-500 h-12 w-12" />
                            </div>
                        </div>
                        <div className="mt-6 p-4 bg-purple-100 rounded-lg">
                            <h3 className="text-lg font-semibold">BEGINNER</h3>
                            <p className="text-gray-500">Your Level</p>
                            <p className="text-xl font-bold">1021</p>
                        </div>
                    </div>
                </div>
            </div>
        </UserLayout>



    );
};

export default addDestination;


export const getServerSideProps = async (
    context: GetServerSidePropsContext
) => {
    const { id, } = context.query;
    const session = await getSession(context);
    // const userEmail = session?.user?.email;

    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
        };
    }

    let exerciseUrl = `${process.env.NEXT_PUBLIC_API_URL}/get-exercise/${id}`;
    const exercise = await fetch(exerciseUrl).then((res) => res.json());

    return {
        props: {
            session,
            exercise: exercise
        },
    };

};


