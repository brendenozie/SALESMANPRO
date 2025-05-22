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
  accessKeyId: process.env.AACCESS_KEY_ID,
  secretAccessKey: process.env.ASECRET_ACCESS_KEY,
  region: process.env.AREGION,
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
    return NextResponse.json({ error: `File upload error ${err}` });
  }
});

// POST handler to handle the file upload
router.post(async (req, res) => {
  const { type } = req.body; // The file type (image or video)

  if (!req.file) {
    return NextResponse.json({ error: 'No file uploaded' });
  }

  try {
    const fileContent = req.file.buffer;
    const fileExtension = req.file.mimetype.split('/')[1];
    const bucketName = process.env.AS3_BUCKET_NAME || 'default-bucket-name';

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
      return NextResponse.json({ error: 'Invalid file type' });
    }

    // Return the uploaded file URL
    res.status(201).json({ url: uploadResult.Location });
  } catch (error) {
    console.error('Error uploading file:', error);
    NextResponse.json({ error: `Failed to upload file ${error}` });
  }
});

// Export the router as the API handler
export default router.handler();
