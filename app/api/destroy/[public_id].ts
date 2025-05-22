import cloudinary from "../../../server/cloudinary";
import { NextResponse } from "next/server";
import prisma from "../../../../server/db/prismadb"; // Adjust path as needed



export default function assetDestroyer(req: NextApiRequest, res: NextApiResponse) {
  
  const public_id = req.query.public_id as string;
  const method = req.method;

  const { searchParams } = new URL(req.url);
  
    const agentId = searchParams.get("agentId");
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
  
    if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
      return NextResponse.json(
        { message: "Invalid pagination parameters." },
        { status: 400 }
      );
    }
  

  switch (method) {
    case "POST":
      // Get data from your database
      const deestroy = cloudinary.uploader.destroy(
        public_id,
        function (error: any, result: any) {
          console.log(result, error);
          res.statusCode = 200;
          res.json(result);
        }
      );
      break;
    default:
      res.setHeader("Allow", ["GET", "PUT"]);
      NextResponse.end(`Method ${method} Not Allowed`);
  }
}
