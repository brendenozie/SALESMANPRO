import { NextApiRequest, NextApiResponse } from "next";
import SendMail from "../../../service/mailservice";

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
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