import { withApiHandler } from "@/lib/hooks/withApiHandler";
import { getCookie } from "cookies-next";
import { NextResponse } from "next/server";

const getHandler = async (req: Request) => {

  if (req.method !== "GET") {
    return NextResponse.json({ message: "Method Not Allowed" });
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

  return NextResponse.json({ role });
}

export const GET = withApiHandler(getHandler);