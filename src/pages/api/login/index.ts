import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../server/db/prismadb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method === 'POST') {
    await LoginUser(req, res)
    return;
  } 
  
  return res.status(200).send({headrs:req.headers, bdy: req.body});
}



async function LoginUser(req: NextApiRequest, res: NextApiResponse) {

  const {email, password } = req.body.data;

  if(!email || !password){
    return res.send({status:400,message:"Missing login details"});
  }

  //check to see if user exists5
  const user = await prisma.user.findUnique({
    where : {
      email: email
    }
  });

  if(user){
    
    if(user.hashedPassword){

      let {hashedPassword,...newObject} = user;
      
      if(newObject.emailVerified == null){

        let {emailVerified,...newUser} = newObject;
        
        return res.send({status:200,message:"Success.", body:newUser});
      }
      
      return res.send({status:200,message:"Success.", body:newObject});
    }

    return res.send({status:200,message:"Success", body:user});
  }

  // const hashedPassword = password;

  // const result = await prisma.user.create({
  //   data: {
  //     name:email.substring(0, email.indexOf("@")),
  //     email,
  //     hashedPassword : password,
  //   },
  // });

  // const accountResult = await prisma.account.create({
  //   data: {
  //     userId : `${result.id}`,
  //     type : 'oauth',
  //     provider: "mobile",
  //     providerAccountId : '1111111111111111',
  //     access_token : 'ya29.a0AfB_byAxwTjDvgwdumfbpCo9HT45pg_4lj5EB_pXuby6lN1CdprT-ojCHG1S7b0sFQDrxU57o0CA0F8NRIR1bJEGNqvpB-gurgIYSO92PYdLXL55eLT8vcezwtEi1DYHLIj1-TfSOEm3Utnzk87NbEnFH40MaCgYKAWsSARMSFQHsvYlsY7LJG1u-CgBgsIDGeK5fvg0163',
  //     expires_at : 1692001786,
  //     token_type : 'Bearer',
  //     scope : 'https://www.hobbyhorse.com/auth/userinfo.profile https://www.hobbyhorse.com/auth/userinfo.email',
  //     id_token : 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjdjOWM3OGUzYjAwZTFiYjA5MmQyNDZjODg3YjExMjIwYzg3YjdkMjAiLCJ0eXAiOiJKV1QifQ',
  //   },
  // });

  // if(result.hashedPassword){

  //   let {hashedPassword,...newObject} = result;

  //   if(result.emailVerified == null){

  //     let {emailVerified,...newUser} = newObject;
      
  //     return res.send({status:200,message:"Success.", body:newUser});
  //   }
    
  //    return res.send({status:200,message:"Success.", body:newObject});

  // }

  // if(result) return res.send({status:200,message:"Success.", body:result});
  
  return res.send({status:400,message:"This account does not exist. Create an account by registering", body:null});
  
}