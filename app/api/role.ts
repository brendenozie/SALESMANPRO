import { getCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const signupPath = getCookie("signup_path", { req }) || "";

  let role = "USER";
  if (signupPath.includes("/admin") || signupPath.includes("/dashboard")) {
    role = "ADMIN";
  } else if (signupPath.includes("/client")) {
    role = "CLIENT";
  } else if (signupPath.includes("/agent")) {
    role = "AGENT";
  }

  return res.status(200).json({ role });
}
