import { NextResponse } from "next/server";
import prisma from "@/server/db/prismadb"; // Adjust path as needed

import SendMail from "../../../service/mailservice";
import { verifyAuth, formatResponse } from "@/lib/verifyAuth";
import { request } from "http";

export default async function GET( req : Request ) {
  
     const auth = await verifyAuth(request);
    if (!auth.success) return formatResponse(false, null, auth.error, 401);
  
  const {
    fname,
    lname,
    email,
    phone,
    company,
    message,
  } = req.body;

  const result = SendMail({
    to: email, subject: '', text: '', html: '', fname: fname,
    lname: lname, email: email, phone: phone,
    company: company, message: message,
  })
    
   
  res.json(result);

  };