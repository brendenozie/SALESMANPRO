import cloudinary from "@/server/cloudinary";
import { NextApiRequest, NextApiResponse } from "next";


export default function assetDestroyer(req: NextApiRequest, res: NextApiResponse) {
  
  const public_id = req.query.public_id as string;
  const method = req.method;

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
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
