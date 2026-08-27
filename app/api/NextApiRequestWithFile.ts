import { NextApiRequest } from 'next';

// Extend NextApiRequest to handle file uploads
export interface NextApiRequestWithFile extends NextApiRequest {
  file?: Express.Multer.File;
  files?: Express.Multer.File[];
}
