import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import prisma from "../../../server/db/prismadb";


// POST /api/post

export default async function handle(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    await RegisterUser(req, res);
    return;
  } 

  var payloadObj = JSON.parse(req.body);

  return res.send({status:401,message:req.method, dt:payloadObj});
}

async function RegisterUser(req: NextApiRequest, res: NextApiResponse) {
  
  const {name, email, password,
    birthYear,
    bmiResult,
    currentHeightInCm,
    currentWeightInKg,
    exerciseGoal,
    focusArea,
    gender,
    img,
    physicalActivityLevel,
    weeklyGoalInKM,
    weightInKgGoal, 
    provider} = req.body.data;

  if(!email || !password || !name){
    return res.send({status:400,message:"Missing Registration details"});
  }

  //check to see if user exists
  const user = await prisma.user.findUnique({
    where : {
      email: email
    }
  });

  if(user){
    return res.send({status:200,message:"User already Exists", body:user});
  }

  // const hashedPassword = password;

  const result = await prisma.user.create({
    data: {
      name,
      email,
      hashedPassword : password,
      birthYear,
      bmiResult,
      currentHeightInCm,
      currentWeightInKg,
      exerciseGoal,
      focusArea,
      gender,
      // img,
      physicalActivityLevel,
      weeklyGoalInKM,
      weightInKgGoal, 
      // provider
    },
  });

  const accountResult = await prisma.account.create({
    data: {
      userId : `${result.id}`,
      type : 'oauth',
      provider,
      providerAccountId : '1111111111111111',
      access_token : 'ya29.a0AfB_byAxwTjDvgwdumfbpCo9HT45pg_4lj5EB_pXuby6lN1CdprT-ojCHG1S7b0sFQDrxU57o0CA0F8NRIR1bJEGNqvpB-gurgIYSO92PYdLXL55eLT8vcezwtEi1DYHLIj1-TfSOEm3Utnzk87NbEnFH40MaCgYKAWsSARMSFQHsvYlsY7LJG1u-CgBgsIDGeK5fvg0163',
      expires_at : 1692001786,
      token_type : 'Bearer',
      scope : 'https://www.hobbyhorse.com/auth/userinfo.profile https://www.hobbyhorse.com/auth/userinfo.email',
      id_token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjOWM3OGUzYjAwZTFiYjA5MmQyNDZjODg3YjExMjIwYzg3YjdkMjAiLCJ0eXAiOiJKV1QifQ',
    },
  });

  if(result.hashedPassword){

    let {hashedPassword,...newObject} = result;

    if(result.emailVerified == null){

      let {emailVerified,...newUser} = newObject;
      
      return res.send({status:200,message:"Success.", body:newUser});
    }
    
     return res.send({status:200,message:"Success.", body:newObject});

  }

  if(result) return res.send({status:200,message:"Success.", body:result});
  
  return res.send({status:400,message:"This account does not exist. Create an account by registering"});
  
  
}

