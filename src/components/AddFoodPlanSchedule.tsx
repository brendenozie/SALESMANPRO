"use client";
import {useSearchParams, usePathname, useRouter} from "next/navigation";
import Link from "next/link";
import {  IExercise, IFoodPlanCategory, uploadImage } from "../types/typings";
import { GetServerSidePropsContext } from "next";
import { useCallback, useEffect, useState } from "react";
import { Session } from "next-auth";
import { getSession } from "next-auth/react";
import axios from "axios";
import TimePicker from 'react-time-picker';

type Props = {
    foodPlanCategoryData?: {results:IFoodPlanCategory[]};
    session: Session;
  };

  
const imageTypeRegex = /image\/(png|jpg|jpeg)/gm;

function AddFoodPlanSchedule({ foodPlanCategoryData, session }: Props) {

    
//   const [selectedExercise, setSelectedExercise] = useState<String | null>(null);
  const [fp_name,setSelectedFpName] = useState<String>("");
  const [fp_description,setSelectedFpDescription] = useState<String>(""); 

  const [fp_ingredient_single,setSelectedFpIngredientSingle] = useState<String>("");
  const [fp_ingredients,setSelectedFpIngredients] = useState<any[]>([]);

  const [fpc_id,setSelectedFpcId] = useState<any>("");

  const [fpc_day,setSelectedFpDay] = useState<any>("");
  const [fpc_timehr,setSelectedFpTimeHr] = useState<any>("1");
  const [fpc_timemin,setSelectedFpTimeMin] = useState<any>("00");
  const [fpc_timeampm,setSelectedFpTimeAmPm] = useState<any>("Am");
  const [fp_period,setSelectedFpPeriod] = useState<any>("snack");

  const [fp_prep_time,setSelectedFpPrepTime] = useState<any>("10");
    const [ fp_cook_time,setSelectedCookTime] = useState<any>("10");

  const [fp_nutriton_name,setSelectedFpNutritionName] = useState<String>("");
  const [fp_nutriton_weight,setSelectedFpNutritionWeight] = useState<String>("");
  const [fp_nutriton,setSelectedFpNutrition] = useState<any[]>([]);

  const [fp_recipe_single,setSelectedFpRecipeSingle] = useState<String>("");
  const [fp_recipe,setSelectedFpRecipe] = useState<String[]>([]);

  const [status,setSelectedDpStatus] = useState<String>("active");
  
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

  const changeHandlerIngrediants = async (e: any) => {
    
    const validImageFiles: any[] = fp_ingredients.length >0 ? fp_ingredients : [];

    validImageFiles.push(fp_ingredient_single);
       

    if (validImageFiles.length) {
        setSelectedFpIngredients(validImageFiles);
        setSelectedFpIngredientSingle("");
        return;
    }

    setMessage("Set Ingredients");
};

const removeIngredients = (i: any) => {
    setFile(fp_ingredients.filter(x => x !== i));
}

const changeHandlerNutrition = async (e: any) => {
    

    const validImageFiles: any[] = fp_nutriton.length > 0 ? fp_nutriton : [];

    validImageFiles.push(`${fp_nutriton_name} ${fp_nutriton_weight}`);       

    if (validImageFiles.length) {
        setSelectedFpNutrition(validImageFiles);
        setSelectedFpNutritionName("");
        setSelectedFpNutritionWeight("");
        return;
    }

    setMessage("Set Nutrition");
};

const removeNutrition = (i: any) => {
    setFile(fp_nutriton.filter(x => x.name !== i));
}

const changeHandlerRecipe = async (e: any) => {

    const validImageFiles: any[] = fp_recipe.length >0 ? fp_recipe : [];

    validImageFiles.push(fp_recipe_single);
       
    if (validImageFiles.length) {
        setSelectedFpRecipe(validImageFiles);
        setSelectedFpRecipeSingle("");
        return;
    }

    setMessage("Set Recipe");
};

const removeRecipe = (i: any) => {
    setFile(fp_recipe.filter(x => x !== i));
}


const onPostFoodPlan = useCallback(async () => {

    if (!session) {
        return {
            redirect: {
                destination: "/signin",
                permanent: false,
            },
        };
    }

    setIsLoading(true);

    const ur_l =`${process.env.NEXT_PUBLIC_API_URL}/post-food-plan`;

    await axios.post(ur_l, {fp_name,
                            fp_description,
                            fp_period,
                            fp_day:fpc_day,
                            fp_time:`${fpc_timehr}:${fpc_timehr} ${fpc_timeampm}`,
                            foodPlanCategoryId : fpc_id,
                            fp_ingredients,
                            fp_prep_time,
                            fp_cook_time,
                            fp_nutriton,
                            fp_recipe,
                            status
                        }).then(() => {
            router.push(pathname);
        }).catch(() => {
            alert('Something went wrong.');
            setIsLoading(false);
        });
    },
    [
        fp_name,
        fp_description,
        fp_period,
        fpc_day,
        fpc_timehr,
        fpc_timemin,
        fpc_timeampm,
        fp_prep_time,
        fp_cook_time,
        fpc_id,
        fp_ingredients,
        fp_nutriton,
        fp_recipe,
        status,
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
                   <div className="min-h-full py-6 flex flex-col justify-center sm:py-12">
                        <div className="fixed left-0 lg:left-1/3 top-0 py-3 sm:max-w-xl sm:mx-auto">
                            <div className="relative px-4 py-10 bg-white mx-8 md:mx-0 shadow rounded-3xl sm:p-10">
                            <div className="max-w-md mx-auto">
                                <div className="flex items-center space-x-5">
                                <div className="h-14 w-14 bg-yellow-200 rounded-full flex flex-shrink-0 justify-center items-center text-yellow-500 text-2xl font-mono">i</div>
                                <div className="block pl-2 font-semibold text-xl self-start text-gray-700">
                                    <h2 className="leading-relaxed">Set Food Plan</h2>
                                    <p className="text-sm text-gray-500 font-normal leading-relaxed">Control your daily meal calories intake by setting yourself a plan</p>
                                </div>
                                </div>
                                <div className="divide-y divide-gray-200">
                                <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Plan Name</label>
                                        <input type="text" className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="" onChange={(e) => {setSelectedFpName(e.target.value)}}/>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Plan Description</label>
                                        <input type="text" className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="desctiption" onChange={(e) => {setSelectedFpDescription(e.target.value)}}/>
                                    </div>
                                    <div className="flex flex-col">
                                    <label className="leading-loose">Set Period</label>
                                    <div className="relative focus-within:text-gray-600 text-gray-400">
                                        <div className="mt-0 p-5 w-full bg-white rounded-lg shadow-xl">
                                            <div className="flex ">
                                                <select name="hours" className="bg-transparent text-xl appearance-none outline-none w-full"  onChange={(e) => {setSelectedFpPeriod(e.target.value)}}>
                                                    <option value="snack">Snack</option>
                                                    <option value="breakfast">Breakfast</option>
                                                    <option value="lunch">Lunch</option>
                                                    <option value="dinner">Dinner</option>
                                                </select>
                                            </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-1 ">
                                        <div className="flex flex-col w-1/2">
                                            <label className="leading-loose">Set Day</label>
                                            <div className="relative focus-within:text-gray-600 text-gray-400">
                                                <div className="relative focus-within:text-gray-600 text-gray-400">
                                                    <div className="mt-0 p-5 w-full bg-white rounded-lg shadow-xl">
                                                        <div className="flex">
                                                            <select name="hours" aria-label="select" className="text-xl appearance-none outline-none focus:text-indigo-600 focus:outline-none bg-transparent ml-1" onChange={(e) => {setSelectedFpDay(e.target.value)}}>
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
                                        <div className="flex flex-col w-1/2">
                                            <label className="leading-loose">Set Time</label>
                                            <div className="relative focus-within:text-gray-600 text-gray-400">
                                            <div className="mt-0 p-5 w-full bg-white rounded-lg shadow-xl">
                                                <div className="flex">
                                                    <select name="hours" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedFpTimeHr(e.target.value)}}>
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
                                                    <select name="minutes" className="bg-transparent text-xl appearance-none outline-none mr-4"  onChange={(e) => {setSelectedFpTimeMin(e.target.value)}}>
                                                        <option value="0">00</option>
                                                        <option value="30">30</option>
                                                    </select>
                                                    <select name="ampm" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedFpTimeAmPm(e.target.value)}}>
                                                        <option value="am">AM</option>
                                                        <option value="pm">PM</option>
                                                    </select>
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>                                    
                                    <div className="flex flex-col">
                                    <label className="leading-loose">Type of meal</label>
                                        <div className="relative focus-within:text-gray-600 text-gray-400">
                                            <div className="pr-4 pl-10 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm flex items-center text-sm font-medium leading-none text-gray-600 bg-gray-200 hover:bg-gray-300 cursor-pointer rounded">
                                                <select id="exercise" name="exercise" defaultValue={"Pick Type"} className="focus:text-indigo-600 focus:outline-none bg-transparent ml-1 w-full" onChange={(e) => {setSelectedFpcId(JSON.parse(e.target.value).id);
                                                    }}>
                                                        <option value="Pick Exercise" className="text-sm text-indigo-800">Pick Type</option>
                                                        {foodPlanCategoryData?.results.map((foodPlanCategory) => (
                                                            <option className="text-sm text-indigo-800" value={JSON.stringify(foodPlanCategory)} >{foodPlanCategory.fpc_name}</option>
                                                            ))}
                                                </select>
                                            </div>
                                            <div className="absolute left-3 top-2">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-1 ">
                                        <div className="flex flex-col w-1/2">
                                            <label className="leading-loose">Set Prep Time</label>
                                            <div className="relative focus-within:text-gray-600 text-gray-400">
                                                <div className="relative focus-within:text-gray-600 text-gray-400">
                                                    <div className="mt-0 p-5 w-full bg-white rounded-lg shadow-xl">
                                                        <div className="flex">
                                                            <select name="hours" aria-label="select" className="text-xl appearance-none outline-none focus:text-indigo-600 focus:outline-none bg-transparent ml-1" onChange={(e) => {setSelectedFpPrepTime(e.target.value)}}>
                                                                <option className="text-sm text-indigo-800" value="10">10 minutes</option>
                                                                <option className="text-sm text-indigo-800" value="20">20 minutes</option>
                                                                <option className="text-sm text-indigo-800" value="30">30 minutes</option>
                                                                <option className="text-sm text-indigo-800" value="60">1 hour</option>
                                                                <option className="text-sm text-indigo-800" value="120">2 hours</option>
                                                                <option className="text-sm text-indigo-800" value="180">3 hours</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col w-1/2">
                                            <label className="leading-loose">Set Cook time</label>
                                            <div className="relative focus-within:text-gray-600 text-gray-400">
                                            <div className="mt-0 p-5 w-full bg-white rounded-lg shadow-xl">
                                                <div className="flex">
                                                    <select name="hours" className="bg-transparent text-xl appearance-none outline-none"  onChange={(e) => {setSelectedCookTime(e.target.value)}}>
                                                        <option value="10">10 minutes</option>
                                                        <option value="20">20 minutes</option>
                                                        <option value="30">30 minutes</option>
                                                        <option value="60">1 hour</option>
                                                        <option value="120">2 hours</option>
                                                        <option value="180">3 hours</option>
                                                        <option value="1440">24 hours</option>
                                                    </select>
                                                </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Add Ingredients List</label>
                                        {fp_ingredients?.map((ingredient) => (
                                            <div className="px-4 pt-4">
                                                <div className="border-b pb-4 border-gray-400 border-dashed">
                                                    <p className="text-xs font-light leading-3 text-gray-500 dark:text-gray-300 pb-4"> </p>
                                                    <a tabIndex={0} className="focus:outline-none text-lg font-medium leading-5 text-gray-800 dark:text-gray-500 mt-2">{ingredient}</a>
                                                    <p className="text-sm pt-2 leading-4 leading-none text-gray-600 dark:text-gray-300"></p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex flex-row gap-1">
                                            <input type="text" value={fp_ingredient_single as string} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="4 tbcp Chopped Onions" onChange={(e) => {setSelectedFpIngredientSingle(e.target.value)}}/>
                                            <button onClick={changeHandlerIngrediants} disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-blue-500' }  flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none`}>Add</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Add Nutrition List</label>
                                        {fp_nutriton.map((nutrition) => (
                                            <div className="px-4 pt-4">
                                                <div className="border-b pb-4 border-gray-400 border-dashed">
                                                    <p className="text-xs font-light leading-3 text-gray-500 dark:text-gray-300 pb-4"></p>
                                                    <a tabIndex={0} className="focus:outline-none text-lg font-medium leading-5 text-gray-800 dark:text-gray-500 mt-2">{nutrition}</a>
                                                    <p className="text-sm pt-2 leading-4 leading-none text-gray-600 dark:text-gray-300"></p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex flex-row gap-1">
                                            <input type="text" value={fp_nutriton_name as string} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="Protein/Cabs" onChange={(e) => {setSelectedFpNutritionName(e.target.value)}}/>
                                            <input type="text" value={fp_nutriton_weight as string} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="16.8g" onChange={(e) => {setSelectedFpNutritionWeight(e.target.value)}}/>
                                            <button onClick={changeHandlerNutrition} disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-blue-500' }  flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none`}>Add</button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="leading-loose">Add Recipe</label>
                                        {fp_recipe.map((receipe) => (
                                            <div className="px-4 pt-4">
                                                <div className="border-b pb-4 border-gray-400 border-dashed">
                                                    <p className="text-xs font-light leading-3 text-gray-500 dark:text-gray-300 pb-4"> </p>
                                                    <a tabIndex={0} className="focus:outline-none text-lg font-medium leading-5 text-gray-800 dark:text-gray-500 mt-2">{receipe}</a>
                                                    <p className="text-sm pt-2 leading-4 leading-none text-gray-600 dark:text-gray-300"></p>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex flex-row gap-1">
                                            <input type="text"  value={fp_recipe_single as string} className="px-4 py-2 border focus:ring-gray-500 focus:border-gray-900 w-full sm:text-sm border-gray-300 rounded-md focus:outline-none text-gray-600" placeholder="Boil eggs for 2 minutes" onChange={(e) => {setSelectedFpRecipeSingle(e.target.value)}}/>
                                            <button onClick={changeHandlerRecipe} disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-blue-500' }  flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none`}>Add</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 flex items-center space-x-4">
                                    <Link href={pathname}>
                                        <button className="flex justify-center items-center w-full text-gray-900 px-4 py-3 rounded-md focus:outline-none">
                                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Cancel
                                        </button>
                                    </Link>
                                    <button onClick={onPostFoodPlan} disabled={isLoading} className={`w-full rounded-md ${ isLoading ? 'bg-gray-600' : 'bg-blue-500' }  flex justify-center items-center w-full text-white px-4 py-3 rounded-md focus:outline-none`}>Create</button>
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

export default AddFoodPlanSchedule;

async function getSignature() {
    let url = `${process.env.NEXT_PUBLIC_API_URL}/sign`;
    const response = await fetch(url);
    const data = await response.json();
    const { signature, timestamp } = data;
    return { signature, timestamp };
  }

  