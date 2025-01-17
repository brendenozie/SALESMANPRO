import { v2 as cloudinary } from 'cloudinary'

const { NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_API_KEY, NEXT_PUBLIC_CLOUDINARY_API_SECRET } =
  process.env

cloudinary.config({
  cloud_name: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true,
})

export default cloudinary
