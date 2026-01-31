import { v2 as cloudinary } from 'cloudinary'

// Support CLOUDINARY_URL (e.g. cloudinary://api_key:api_secret@cloud_name) or separate env vars
const url = process.env.CLOUDINARY_URL
if (url) {
  cloudinary.config({ url })
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

export default cloudinary

export async function uploadImage(file: File | Buffer, folder?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error)
        } else {
          resolve(result?.secure_url || '')
        }
      }
    )

    if (Buffer.isBuffer(file)) {
      uploadStream.end(file)
    } else if (file instanceof File) {
      // For File objects, we need to convert to buffer
      file.arrayBuffer().then(buffer => {
        uploadStream.end(Buffer.from(buffer))
      }).catch(reject)
    } else {
      reject(new Error('Invalid file type'))
    }
  })
}
