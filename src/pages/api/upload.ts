// import { NextApiRequestWithFile } from 'Nex'; // Import the custom type
import { NextApiResponse } from 'next';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { createRouter } from 'next-connect';
import { NextApiRequestWithFile } from './NextApiRequestWithFile';
import { IncomingMessage, ServerResponse } from 'http';

// Set up AWS S3
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Set up multer for file uploads with a size limit (10 MB)
const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

export const config = {
  api: {
    bodyParser: false, // Disable Next.js default body parser
  },
};

// Middleware to handle multipart form data with multer
const multerMiddleware = upload.single('file');

// Utility to run middleware
function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

// Create a router using next-connect
const router = createRouter<NextApiRequestWithFile, NextApiResponse>();

// Middleware to process file uploads using multer
router.use(async (req, res, next) => {
  try {
    // Use multer to parse the file
    await runMiddleware(req, res, multerMiddleware);
    next();
  } catch (err) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'File upload error' });
  }
});

// POST handler to handle the file upload
router.post(async (req, res) => {
  const { type } = req.body; // The file type (image or video)

  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer;
    const fileExtension = req.file.mimetype.split('/')[1];
    const bucketName = process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name';

    let uploadResult;

    // Upload file to S3 based on the type
    if (type === 'image') {
      const imageParams = {
        Bucket: bucketName,
        Key: `images/${uuidv4()}.${fileExtension}`, // unique filename
        Body: fileContent,
        ContentType: req.file.mimetype,
      };
      uploadResult = await s3.upload(imageParams).promise();
    } else if (type === 'video') {
      const videoParams = {
        Bucket: bucketName,
        Key: `videos/${uuidv4()}.${fileExtension}`, // unique filename
        Body: fileContent,
        ContentType: req.file.mimetype,
      };
      uploadResult = await s3.upload(videoParams).promise();
    } else {
      return res.status(400).json({ error: 'Invalid file type' });
    }

    // Return the uploaded file URL
    res.status(201).json({ url: uploadResult.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Export the router as the API handler
export default router.handler();


// import { NextApiRequest, NextApiResponse } from 'next';
// import AWS from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import multer from 'multer';
// import { createRouter } from 'next-connect';
// import { IncomingMessage, ServerResponse } from 'http';

// // Set up AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Set up multer for file uploads with a size limit (10 MB)
// const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js default body parser
//   },
// };

// // Middleware to handle multipart form data with multer
// const multerMiddleware = upload.single('file');

// // Utility to run middleware
// function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: Function) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

// // Create a router using next-connect
// const router = createRouter<NextApiRequest, NextApiResponse>();

// // Middleware to process file uploads using multer
// router.use(async (req, res, next) => {
//   try {
//     // Use multer to parse the file
//     await runMiddleware(req, res, multerMiddleware);
//     next();
//   } catch (err) {
//     console.error('File upload error:', err);
//     return res.status(500).json({ error: 'File upload error' });
//   }
// });

// // POST handler to handle the file upload
// router.post(async (req, res) => {
//   const { type } = req.body; // The file type (image or video)

//   if (!req.file) {
//     return res.status(400).json({ error: 'No file uploaded' });
//   }

//   try {
//     const fileContent = req.file.buffer;
//     const fileExtension = req.file.mimetype.split('/')[1];
//     const bucketName = process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name';

//     let uploadResult;

//     // Upload file to S3 based on the type
//     if (type === 'image') {
//       const imageParams = {
//         Bucket: bucketName,
//         Key: `images/${uuidv4()}.${fileExtension}`, // unique filename
//         Body: fileContent,
//         ContentType: req.file.mimetype,
//       };
//       uploadResult = await s3.upload(imageParams).promise();
//     } else if (type === 'video') {
//       const videoParams = {
//         Bucket: bucketName,
//         Key: `videos/${uuidv4()}.${fileExtension}`, // unique filename
//         Body: fileContent,
//         ContentType: req.file.mimetype,
//       };
//       uploadResult = await s3.upload(videoParams).promise();
//     } else {
//       return res.status(400).json({ error: 'Invalid file type' });
//     }

//     // Return the uploaded file URL
//     res.status(201).json({ url: uploadResult.Location });
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: 'Failed to upload file' });
//   }
// });

// // Export the router as the API handler
// export default router.handler();










// import { NextApiRequest, NextApiResponse } from 'next';
// import AWS from 'aws-sdk';
// import { v4 as uuidv4 } from 'uuid';
// import multer from 'multer';
// import { createRouter } from 'next-connect';
// import { IncomingMessage, ServerResponse } from 'http';

// // Configure AWS S3
// const s3 = new AWS.S3({
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   region: process.env.AWS_REGION,
// });

// // Set up multer for file uploads with a size limit (10 MB)
// const upload = multer({ limits: { fileSize: 10 * 1024 * 1024 } });

// export const config = {
//   api: {
//     bodyParser: false, // Disable body parsing to handle the file upload with multer
//   },
// };

// // Middleware to handle multipart form data
// const multerMiddleware = upload.fields([{ name: 'newPic' }, { name: 'newVideo' }]);

// function runMiddleware(req: IncomingMessage, res: ServerResponse, fn: Function) {
//   return new Promise((resolve, reject) => {
//     fn(req, res, (result: any) => {
//       if (result instanceof Error) {
//         return reject(result);
//       }
//       return resolve(result);
//     });
//   });
// }

// // Create a router using next-connect
// const router = createRouter<NextApiRequest, NextApiResponse>();

// // Middleware to process file uploads using multer
// router.use(async (req, res, next) => {
//   try {
//     // Use multer to parse the files
//     await runMiddleware(req, res, multerMiddleware);
    
//     next();
//   } catch (err) {
//     console.error('File upload error:', err);
//     return res.status(500).json({ error: 'File upload error' });
//   }
// });


// // PUT handler to update exercise data
// router.post(async (req, res) => {
//   const { id } = req.query;
//   const { exName, exDesc, exPic, exVideo, newPic, newVideo } = req.body;

//   try {
    
//      const { file, type } = req.body;

//       // Validate that the required fields are present
//       if (!file || !type) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       const bucketName = process.env.AWS_S3_BUCKET_NAME || 'default-bucket-name';
//       let uploadResult;

//       // Upload image or video to S3 based on the type
//       if (type === "image") {
//         const picParams = {
//           Bucket: bucketName,
//           Key: `images/${uuidv4()}.jpg`, // unique filename for the image
//           Body: Buffer.from(file, "base64"), // Assuming base64 encoded image
//           ContentEncoding: "base64",
//           ContentType: "image/jpeg",
//         };
//         uploadResult = await s3.upload(picParams).promise();
//       } else if (type === "video") {
//         const videoParams = {
//           Bucket: bucketName,
//           Key: `videos/${uuidv4()}.mp4`, // unique filename for the video
//           Body: Buffer.from(file, "base64"), // Assuming base64 encoded video
//           ContentEncoding: "base64",
//           ContentType: "video/mp4",
//         };
//         uploadResult = await s3.upload(videoParams).promise();
//       } else {
//         return res.status(400).json({ error: "Invalid file type" });
//       }

//       // Return the uploaded file URL
//       return res.status(201).json({ url: uploadResult.Location });

//   } catch (error) {
//     console.error('Error updating exercise:', error);
//     res.status(500).json({ error: 'Failed to update exercise' });
//   }
// });

// // Export the router as the API handler
// export default router.handler();
















































































// import { NextApiRequest, NextApiResponse } from "next";
// import prisma from "../../../server/db/prismadb";

// export default async function handle(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === "POST") {
//     try {
//       const {
//         exName,
//         exDesc,
//         exPic,
//         exVideo,
//         exDuration,
//         exSteps,
//         reps,
//         sets,
//         weightPerRepInKg,
//         weightPerSetInKg,
//         breakSet,
//         status,
//         exerciseCategoryId,
//         userId,
//         exCalories,
//         exHeartBeat,
//         focusArea,
//         type,
//         level,
//         caloriesPerRep,
//         // lastSet,
//         // lastRep,
//       } = req.body;

//       // Validate that the required fields are present
//       if (!exName || !exDesc || !exerciseCategoryId || !reps || !sets) {
//         return res.status(400).json({ error: "Missing required fields" });
//       }

//       // Create the exercise in the database using Prisma
//       const result = await prisma.exercise.create({
//         data: {
//           exName,
//           exDesc,
//           exPic,
//           exVideo,
//           exDuration,
//           exSteps, // Assuming this is an array of ExSteps, properly handled by Prisma
//           reps,
//           sets,
//           weightPerRepInKg: weightPerRepInKg || 0.0, // Default to 0 if not provided
//           weightPerSetInKg: weightPerSetInKg || 0.0, // Default to 0 if not provided
//           breakSet: breakSet || "5s", // Default break set to "5s"
//           status,
//           exerciseCategoryId,
//           userId: userId || null, // If userId is not provided, set to null
//           exCalories,
//           exHeartBeat,
//           focusArea,
//           type: type || "others", // Default to "others" if not provided
//           level: level || "Beginner", // Default to "Beginner" if not provided
//           caloriesPerRep: caloriesPerRep || "0.0 kcal", // Default if not provided
//           // lastSet,
//           // lastRep,
//         },
//       });

//       return res.status(201).json(result);
//     } catch (error) {
//       console.error("Error creating exercise:", error);
//       return res.status(500).json({ error: "Failed to create exercise" });
//     }
//   } else {
//     // Method not allowed
//     return res.status(405).json({ error: "Method not allowed" });
//   }
// }
