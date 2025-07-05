// src/lib/cloudinary.ts
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  fileBuffer: Buffer,
  folder: string = 'fishnfresh'
): Promise<UploadApiResponse | UploadApiErrorResponse> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result!);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
}

/**
 * Optimizes a Cloudinary URL with transformations for better performance
 * @param url - The original Cloudinary URL
 * @param options - Transformation options
 */
export function optimizeCloudinaryImage(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
    crop?: string;
  } = {}
): string {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  // Extract the parts of the Cloudinary URL
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url;
  }

  const [baseUrl, imagePath] = urlParts;
  
  // Build transformation string
  const transformations = [];
  
  if (width || height) {
    const sizeTransform = [];
    if (width) sizeTransform.push(`w_${width}`);
    if (height) sizeTransform.push(`h_${height}`);
    if (crop) sizeTransform.push(`c_${crop}`);
    transformations.push(sizeTransform.join(','));
  }
  
  // Always add quality and format optimizations
  transformations.push(`q_${quality}`, `f_${format}`);
  
  const transformString = transformations.join('/');
  
  return `${baseUrl}/upload/${transformString}/${imagePath}`;
}

/**
 * Generates optimized Cloudinary URLs for common use cases
 */
export const cloudinaryPresets = {
  /**
   * For banner images in event headers (large, wide)
   */
  bannerImage: (url: string) => optimizeCloudinaryImage(url, {
    width: 1920,
    height: 800,
    quality: 'auto:good',
    crop: 'fill'
  }),
  
  /**
   * For event card thumbnails (medium, square-ish)
   */
  thumbnail: (url: string) => optimizeCloudinaryImage(url, {
    width: 400,
    height: 300,
    quality: 'auto',
    crop: 'fill'
  }),
  
  /**
   * For mobile banner images (smaller, optimized)
   */
  mobileBanner: (url: string) => optimizeCloudinaryImage(url, {
    width: 768,
    height: 400,
    quality: 'auto',
    crop: 'fill'
  })
};