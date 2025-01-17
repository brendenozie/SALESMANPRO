import { User } from "@prisma/client";
import "next-auth";


export interface IStyleData {
  img: string;
  title: string;
}

export interface IOptions {
  method: string;
  headers: {
    "X-RapidAPI-Key": string;
    "X-RapidAPI-Host": string;
    "content-type"?: string;
  };
  body?: string;
}

export interface ISuggestion {
  regionNames: {
    shortName: string;
    displayName: string;
  };
  gaiaId: number;
  type: string;
}

export interface ISuggestionFormatted {
  shortName: string;
  displayName: string;
  id: number;
  type: string;
  img?: string;
  location?: string;
  province?: string;
}

export interface provider {
  name: string;
  id: string;
}

export interface IReservation {
  price_data: {
    currency: string;
    unit_amount: number;
    product_data: {
      name: string;
      description: string;
      images: string[];
    };
  };
  quantity: number;
}

export interface ILocation {
  lat: any;
  lng: any;
}
export interface uploadImage {
  publicId: string;
  url: string;
  status: string;
}

export interface IUser {
  id: string = "",
  name: string = "",
  email: string = "",
  password: string = "random$123%$^&",
  gender: string = "person",
  exerciseGoal: string = "Lose Weight",
  focusArea: string = "Arms",
  currentHeightInCm: Int = 0,
  currentWeightInKg: Float = 0.0,
  birthYear: Int = 0,
  weeklyGoalInKM: Float = 0.0,//steps
  weightInKgGoal: Float = 0.0,
  physicalActivityLevel: string = "Beginner",
  bmiResult: Double = 0.0,
  imgUri: string = "",
  role: string = "user",
  provider: string = "mobile",
  img: string = "mobile"
  // id: string;
  // name: string;
  // email: string;
  // image: string;
  // role: string;
}


export type IExercise = {
  [x: string]: any;
  results: any[];

  id     :            string,
  exName         :    string,
  exDesc          :   string,
  exPic           :   string,
  exVideo        :    string,
  exDuration    :     string,
  exSteps        :   ArrayList<ExSteps>,
  reps          :     string,
  sets          :     string,
  weightPerRepInKg  : Float? = 0.0,
  userId  : string? = "",
  weightPerSetInKg  : Float? = 0.0,
  breakSet        :     string,
  status        :     string,
  exerciseCategoryId : string,
  exCalories        :    string,
  exHeartBeat    :     string,
  focusArea    :     List<string>,
  caloriesPerRep : string,
  type : string,
  level : string,
  lastSet : Int=1,
  lastRep : Int=1,
  isPremium : Boolean = false

  // id: string;

  // exName: string;
  // exDesc: string;
  // exPic: string;
  // exSteps: string[];
  // exVideo: string;
  // exDuration: string;
  // status: string;
  // // ExerciseCategory   ExerciseCategory? @relation(fields: [exerciseCategoryId], references: [id])
  // exerciseCategoryId: string;          // @db.ObjectId
  // // DailyPlan          DailyPlan?        @relation(fields: [dailyPlanId], references: [id])
  // dailyPlanId: string;          // @db.ObjectId
  // // TrainingProgram    TrainingProgram?  @relation(fields: [trainingProgramId], references: [id])
  // trainingProgramId: string;
  // reps: string;
  // sets: string;
}

export type IDailyPlan = {
  [x: string]: any;
  results: any[];
  id      :  string,
  dpDay   :   string,
  dpTime  :   string,
  dpDuration : string,
  status   :  string,
  exercises : IExercise[],
  exerciseId  : string[],
  userId  : string?
  // id: string;

  // dpDay: string;
  // dpTime: string;
  // dpDuration: string;
  // status: string;
  // exerciseId: string;
  // exercise: IExercise;

}

export type IProgramsCategory = {
  [x: string]: any;
  results: any[];
  id     :            string,
  pcName    :            string,
  pcDesc    :            string,
  image    :            string,
  status    :            string,
  // id: string;
  // pcName: string;
  // pcDesc: string;
  // image: string;
  // status: string;
}

export type ITrainingProgram = {
  [x: string]: any;
  results: any[];
  id     :            string,
  trainingName: string,
  trainingDesc: string,
  trainingDay: string,
  trainingTime: string,
  trainingDuration: string,
  trainingPeriod: string,
  status: string,
  trainingImage: string,
  trainingCalories: string,
  trainer: ArrayList<IUser>,
  programsCategoryId: string,
  exercises: ArrayList<IExercise>,
  // id: string;
  // trainingName: string;
  // trainingDesc: string;
  // trainingDay: string;
  // trainingTime: string;
  // traingDuration: string;
  // trainingPeriod: string;
  // status: string;
  // trainer: IUser[];
  // programsCategoryId: string;
  // trainees: IUser;[]
  // exercises: IExercise[];
}

export type IFoodPlanCategory = {
  [x: string]: any;
  results: any[];
  id: string;

  fpc_name: string;

}

export type IFoodPlan = {
  [x: string]: any;
  results: any[];
  id: string;

  dpDay: string;
  dpTime: string;
  dpDuration: string;
  status: string;
  fpc_id: string;
  exercise: IFoodPlanCategory;

}


export type IWaterIntake = {
  [x: string]: any;
  results: any[];
  id : string,
  wiAmount : string,
  wiDate : string,
  type : string,
  challengeId : string,
  userId : string,
  // id: string;
  // wi_amount: string;
  // wi_date: string;
  // wi_time: string;
}


export type IExerciseActivity = {
  [x: string]: any;
  results: any[];
  id  :  string,
  exercise : ResultExercise?,
  exerciseId : string,
  acRepCount  :   string,
  acCalories : Int,
  acSetCount:string,
  timestamp: string,
  avgSpeedInKMH: Float = 0,
  weightPerRepInKg  : Float = 0.0,
  weightPerSetInKg  : Float = 0.0,
  distanceInMeters: Int = 0,
  durationInMillis: Long = 0,
  type:string = "other",
  stepsCount: Int = 0,
  userId : string = ""
  // id: string;
  // exerciseId: string;
  // exercise: IExercise;
  // acDate: string;
  // acTime: string;
  // acDuration: string;
  // acReps: string;
  // acSets: string;
}


export type IExerciseCategory = {
  [x: string]: any;
  results: any[];
  id     :            string,
  excName     :            string,
  image       :            string,
  status      :            string,
  // id: string;
  // excName: string;
  // image: string;
  // status: string;
}

export type IBpm = {
  [x: string]: any;
  results: any[];
  id: string;
  beats: string;
  bpmResult: string;
  date: string;
  userId: string
}

export type IBmi = {
  [x: string]: any;
  results: any[];
  id     :            string,
  height    :            string,
  weight    :            string,
  bmi    :            string,
  date    :            string,
  userId    :            string,
  // id: string;
  // height: string;
  // weight: string;
  // bmi: string;
  // date: string
  // userId: string;
}

export type ISleep = {
  [x: string]: any;
  results: any[];
  id     :            string,
  slDuration: string,
  slSleepDateTime: string,
  slWakeDateTime: string,
  status: string,
  userId: string,
  createdAt: string,
  // id: string;
  // slDuration: string;
  // slStartTime: string;
  // slEndTime: string;
  // slDate: string;
  // status: string;
  // userId: string;
  // createdAt: string;
}

export type ISteps = {
  [x: string]: any;
  results: any[];
  id : string,
  stepsCount  :  string,
  duration :   string,
  distanceCovered  :  string,
  date : string,
  userId : string,
  // id: string;
  // stepsCount: string;
  // duration: string;
  // distanceCovered: string;
  // date: string;
  // userId

}

export type IAverageStepsSummary = {
    totalSteps: Int,
    averageSteps: Float
}

export type IAverageSleepSummary = {
    totalSleepDuration: Int,
    averageSleepDuration: Float
}

export type IAverageSummaryBpm = {
    totalBpm: Int,
    averageBpmResult: Float
}

export type IAverageWaterSummary = {
    totalWaterIntake: Int,
    averageWaterIntake: Float
}

export type IAverageCaloriesSummary = {
    totalCalories: Int,
    averageCalories: Float
}

export type IAverageSummaryBmi = {
    totalWeight: Int,
    averageBmiResult: Float
}

export type ISubscritption = {
    id:string,
    name: string,
    description: string,
    price: Float,
    duration: String
}


//new update 


// Type representing daily sales performance
export type IDailySales = {
  [x: string]: any;
  results: any[];
  id: string;
  salesUnits: number; // Units sold
  salesValue: number; // Total sales in monetary value
  date: string;
  userId: string;
};

// Type representing leads
export type ILead = {
  [x: string]: any;
  results: any[];
  id: string;
  leadName: string;
  status: "New" | "Contacted" | "Qualified" | "Closed"; // Status of the lead
  conversionProbability: number; // Conversion probability in percentage
  dateContacted?: string; // Date when the lead was contacted
  userId: string;
};

// Type representing sales targets
export type ISalesTarget = {
  [x: string]: any;
  results: any[];
  id: string;
  targetName: string;
  targetValue: number; // Target monetary value or units
  achievedValue: number; // Value achieved so far
  startDate: string;
  endDate: string;
  userId: string;
};

// Type representing product demos
export type IProductDemo = {
  [x: string]: any;
  results: any[];
  id: string;
  demoName: string;
  product: string; // Name of the product being demonstrated
  date: string;
  outcome: "Success" | "Pending" | "No Interest"; // Outcome of the demo
  userId: string;
};

// Type representing commissions
export type ICommission = {
  [x: string]: any;
  results: any[];
  id: string;
  salesValue: number; // Sales value contributing to the commission
  commissionPercentage: number; // Percentage of the commission
  commissionEarned: number; // Commission earned in monetary value
  date: string;
  userId: string;
};

// Average sales summary type
export type IAverageSalesSummary = {
  totalSalesValue: number; // Total sales value over a period
  averageDailySales: number; // Average daily sales value
};

// Average commission summary type
export type IAverageCommissionSummary = {
  totalCommissionEarned: number; // Total commission earned
  averageCommission: number; // Average commission per transaction
};

// Subscription type (unchanged as it's generic)
export type ISubscription = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "1 Month", "1 Year"
};
