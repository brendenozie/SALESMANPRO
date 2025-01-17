"use client";
import {useSearchParams, usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import { IExercise, uploadImage } from "../types/typings";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect, useState } from "react";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import axios from "axios";
import TimePicker from 'react-time-picker';

type Props = {
    exercisesData?: {results:IExercise[]};
    session: Session;
  };

  
const imageTypeRegex = /image\/(png|jpg|jpeg)/gm;

function AddExerciseSchedule({ exercisesData, session }: Props) {

    
//   const [selectedExercise, setSelectedExercise] = useState<String | null>(null);
  const [dpName,setSelectedDpName] = useState<String | null>(null);
  const [dpDay,setSelectedDpDay] = useState<String>("Sunday");
  const [dpTime,setSelectedDpTime] = useState<any>("1:00");
  const [dpTimeHr,setSelectedDpTimeHr] = useState<any>("1");
  const [dpTimeMin,setSelectedDpTimeMin] = useState<any>("00");
  const [dpTimePeriod,setSelectedDpTimePeriod] = useState<any>("AM");

  const [dpDuration,setSelectedDpDuration] = useState<String>("10");
  const [status,setSelectedDpStatus] = useState<String>("active");
  const [exerciseId,setSelectedExerciseId] = useState<String | null>(null);
  
  const [files, setFile] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<any[]>([]);
  const [images, setImages] = useState<uploadImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  //Message incase an error is encountered when selecting the images
  const [message, setMessage] = useState("");

  const router = useRouter();

  useEffect(() => {

      const update: any[] = [...images];
      // const images = [],
      const fileReaders: any[] = [];
      let isCancel = false;
      if (imageFiles.length) {
          imageFiles.forEach((file) => {

              new Compressor(file, {
                  quality: 0.8, // 0.6 can also be used, but its not recommended to go below.
                  success: (compressedResult) => {
                      // compressedResult has the compressed file.
                      // Use the compressed file to upload the images to your server.  
                      const fileReader = new FileReader();
                      fileReaders.push(fileReader);
                      fileReader.onload = (e: any) => {
                          const { result } = e.target;
                          if (result) {
                              update.push({publicId: "-1", url: result, status: 'local' });
                          }
                          if (update.length < 5) {
                              setImages(update);
                              setImageFiles([]);
                          }
                      }
                      fileReader.readAsDataURL(compressedResult);
                  },
              });

          })

      };
      return () => {
          isCancel = true;
          fileReaders.forEach(fileReader => {
              if (fileReader.readyState === 1) {
                  fileReader.abort()
              }
          })
      }
  }, [imageFiles]);

  const removeImage = (i: any) => {
      setFile(files.filter(x => x.name !== i));
  }

  const changeHandler = async (e: any) => {
      const { files } = e.target;
      const validImageFiles: any[] = [];
      for (let i = 0; i < files.length; i++) {
          const file = files[i];
          if (file.type.match(imageTypeRegex)) {
              validImageFiles.push(file);
          }
      }
      if (validImageFiles.length && validImageFiles.length < 2 && images.length < 2) {
          setImageFiles(validImageFiles);
          return;
      }
      setMessage("Selected images are not of valid type\nOr\nImage Count is above allowed limit!");
  };

  const onCreateCity = useCallback(async () => {

      if (!session) {
          return {
              redirect: {
                  destination: "/signin",
                  permanent: false,
              },
          };
      }

      setIsLoading(true);

      const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`;

      let notUploadedImages = images.filter(itm => itm.status !== 'uploaded');

      let list = await Promise.all(            
                      notUploadedImages.map(async (imge) => {            
                          const { signature, timestamp } = await getSignature();
                          const formData = new FormData();
                          formData.append("file", imge.url);
                          formData.append("signature", signature);
                          formData.append("timestamp", timestamp);
                          formData.append("api_key", `${process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY}`);

                          const response = await fetch(url, {
                              method: "post",
                              body: formData,
                          });

                          const data = await response.json();

                          return [...images, {publicId: data.public_id, url: data.secure_url, status: "uploaded"}];
                      })
                  ).then((response) =>{
                      const filteredData = response[0].filter((cat: any) => cat.status === "uploaded");
                      return filteredData;
                  });

                //   selectedExercise.publicId = list[0].publicId;
                //   selectedExercise.url      = list[0].url;
                //   selectedExercise.status   = list[0].status;

                  const ur_l =`${process.env.NEXT_PUBLIC_API_URL}/post-exercise`
      await axios.post(ur_l, exerciseId).then(() => {
              router.push("/exercise");
          }).catch(() => {
              alert('Something went wrong.');
              setIsLoading(false);
          });
      },
      [
        exerciseId,
          images,
      ]);

    const onPostExercise = useCallback(async () => {

    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
        };
    }

    setIsLoading(true);

    const ur_l =`${process.env.NEXT_PUBLIC_API_URL}/post-daily-plan`;

    await axios.post(ur_l, {dpName,
                            dpDay,
                            dpTime:`${dpTimeHr}:${dpTimeMin} ${dpTimePeriod}`,
                            dpDuration,
                            status,
                            exerciseId}).then(() => {
            router.push(pathname);
        }).catch(() => {
            alert('Something went wrong.');
            setIsLoading(false);
        });
    },
    [
        dpName,
        dpDay,
        dpTime,
        dpDuration,
        status,
        exerciseId,
        images,
    ]);

    const searchParams = useSearchParams();
    const modal = searchParams.get("modal");
    const pathname = usePathname();

    return (
        <>
            {modal &&
                <dialog
                    className="fixed left-0 top-0 w-full h-full bg-black bg-opacity-50 z-50 overflow-auto backdrop-blur flex justify-center items-center">
                   <div className="min-h-screen py-6 flex flex-col justify-center sm:py-12">
                        <div className="relative py-3 sm:max-w-xl sm:mx-auto">
                            <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                            <div className="max-w-md mx-auto">
                                <div className="flex items-center space-x-5">
                                <div className="h-14 w-14 bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">i</div>
                                <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                                    <h2 className="leading-relaxed">Schedule Exercise</h2>
                                    <p className="text-sm text-gray-500 font-normal leading-relaxed">Have your workout schedule for each new day</p>
                                </div>
                                </div>
                                <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div className="flex flex-col">
                                    <label className="leading-loose">Pick Exercise</label>
                                        <div className="relative focus-within:text-gray-600 text-gray-400">
                                            <div className="pr-4 pl-10 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm flex items-center text-sm font-medium leading-none text-gray-600 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded">
                                                <select id="exercise" name="exercise" defaultValue={"Pick Exercise"} className="focus:text-indigo-600 focus:outline-none bg-transparent ml-1 w-full" 
                    onChange={(e) => {setSelectedExerciseId(JSON.parse(e.target.value).id);
                                                    }}>
                                                        <option value="Pick Exercise" className="text-sm text-indigo-800">Pick Exercise</option>
                                                        {exercisesData?.results.map((exercise) => (
                                                            <option className="text-sm text-indigo-800" value={JSON.stringify(exercise)} >{exercise.exName}</option>
                                                            ))}
                  </select>
                                            </div>
                                            <div className="absolute left-3 top-2">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Set Day</label>
                                        <div className="relative focus-within:text-gray-600 text-gray-400">
                                        <div className="relative focus-within:text-gray-600 text-gray-400">
                                            <div className="mt-0 p-5 w-40 bg-white rounded-lg shadow-xl">
                                                <div className="flex">
                                                    <select name="hours" aria-label="select" className="text-xl appearance-none outline-none focus:text-indigo-600 focus:outline-none bg-transparent ml-1" onChange={(e) => {setSelectedDpDay(e.target.value)}}>
                                                    <option className="text-sm text-indigo-800">Sunday</option>
                                                        <option className="text-sm text-indigo-800">Monday</option>
                                                        <option className="text-sm text-indigo-800">Tuesday</option>
                                                        <option className="text-sm text-indigo-800">Wednesday</option>
                                                        <option className="text-sm text-indigo-800">Thursday</option>
                                                        <option className="text-sm text-indigo-800">Friday</option>
                                                        <option className="text-sm text-indigo-800">Saturday</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Set Time</label>
                                        <div className="relative focus-within:text-gray-600 text-gray-400">
                                        <div className="mt-0 p-5 w-40 bg-white rounded-lg shadow-xl">
                                            <div className="flex">
                                                <select name="hours" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedDpTimeHr(e.target.value)}}>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                                <option value="7">7</option>
                                                <option value="8">8</option>
                                                <option value="9">9</option>
                                                <option value="10">10</option>
                                                <option value="11">11</option>
                                                <option value="12">12</option>
                                                </select>
                                                <span className="text-xl mr-3">:</span>
                                                <select name="minutes" className="bg-transparent text-xl appearance-none outline-none mr-4"  onChange={(e) => {setSelectedDpTimeMin(e.target.value)}}>
                                                <option value="0">00</option>
                                                <option value="30">30</option>
                                                </select>
                                                <select name="ampm" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedDpTimePeriod(e.target.value)}}>
                                                <option value="am">AM</option>
                                                <option value="pm">PM</option>
                                                </select>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                    </div>
                                    <div className="flex flex-col">
                                    <label className="leading-loose">Set Duration</label>
                                    <div className="relative focus-within:text-gray-600 text-gray-400">
                                        <div className="mt-0 p-5 w-40 bg-white rounded-lg shadow-xl">
                                            <div className="flex">
                                                <select name="hours" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedDpDuration(e.target.value)}}>
                                                    <option value="10">10 minutes</option>
                                                    <option value="20">20 minutes</option>
                                                    <option value="30">30 minutes</option>
                                                    <option value="60">1 hour</option>
                                                    <option value="120">2 hours</option>
                                                    <option value="180">3 hours</option>
                                                </select>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex items-center space-x-4">
                                    <Link href={pathname}>
                                        <button className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none">
                                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Cancel
                                        </button>
                                    </Link>
                                    <button onClick={onPostExercise} disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-blue-500' }  flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none`}>Create</button>
                                </div>
                                </div>
                            </div>
                            </div>
                        </div>
                    </div>
                    {/* <div className="bg-white m-auto p-8">
                        <div className="flex flex-col items-center">
                            <p>Modal content</p>
                            <br/>
                            <Link href={pathname}>
                                <button type="button" className="bg-red-500 text-white p-2">Close Modal</button>
                            </Link>
                        </div>
                    </div> */}
                </dialog>
            }
        </>
    );
}

export default AddExerciseSchedule;

async function getSignature() {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/sign`;
    const response = await fetch(url);
    const data = await response.json();
    const { signature, timestamp } = data;
    return { signature, timestamp };
  }

  