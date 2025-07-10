'use server';

/**
 * @fileOverview A service for handling file uploads to Google Cloud Storage.
 * In a production environment, this would integrate with Google Cloud Storage.
 * It's designed to fall back gracefully to placeholder URLs if GCS is not configured.
 */
import { Storage } from '@google-cloud/storage';
import { randomUUID } from 'crypto';

// Initialize GCS client if configured
let storage: Storage | undefined;
let bucketName: string | undefined;

// Reconstruct credentials from individual environment variables for robustness
const gcsCredentials = {
  projectId: process.env.GCS_PROJECT_ID,
  private_key: (process.env.FIREBASE_ADMIN_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
};
bucketName = process.env.GCS_BUCKET_NAME;

const isGcsConfigured = gcsCredentials.projectId && gcsCredentials.private_key && gcsCredentials.client_email && bucketName;

if (isGcsConfigured) {
  try {
    storage = new Storage({
      projectId: gcsCredentials.projectId,
      credentials: {
        private_key: gcsCredentials.private_key,
        client_email: gcsCredentials.client_email,
      },
    });
    // Only log success in dev
    if (process.env.NODE_ENV !== 'production') {
      console.log('Successfully connected to Google Cloud Storage.');
    }
  } catch (error: unknown) {
    let errorMessage = 'Failed to initialize GCS client.';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    console.error(errorMessage, error);
    storage = undefined; // Ensure storage is not used if config is invalid
  }
} else {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`
----------------------------------------------------------------
NOTICE: Google Cloud Storage is not configured. 
The application will use placeholder images for uploads.
To enable real image uploads, set the required environment variables in your .env file.
See HANDOFF.md for details.
----------------------------------------------------------------
`);
  }
}

/**
 * Uploads a file to Google Cloud Storage. If GCS is not configured, it returns a placeholder URL.
 * @param formData The FormData object containing the file to upload.
 * @param fileKey The key in formData that holds the file. Defaults to 'file'.
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export async function uploadImage(formData: FormData, fileKey: string = 'file'): Promise<{ url: string }> {
  const file = formData.get(fileKey) as File;

  if (!file) {
    throw new Error(`No file provided in FormData with key '${fileKey}'.`);
  }

  // If GCS is not configured, return a placeholder
  if (!storage || !bucketName) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`--- SIMULATING GCS FILE UPLOAD (using placeholder for key: ${fileKey}) ---`);
    }
    // Simulate a delay for the upload process.
    await new Promise(resolve => setTimeout(resolve, 500));
    const placeholderUrl = `https://placehold.co/600x400.png`;
    return { url: placeholderUrl };
  }

  // --- Real GCS Upload Logic ---
  try {
    const bucket = storage.bucket(bucketName);
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Generate a unique filename
    const extension = file.name.split('.').pop() || 'jpg';
    const uniqueFilename = `${randomUUID()}.${extension}`;

    // Create a new blob in the bucket and upload the file data.
    const blob = bucket.file(uniqueFilename);
    const blobStream = blob.createWriteStream({
      resumable: false,
      contentType: file.type,
    });

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${uniqueFilename}`;

    await new Promise<void>((resolve, reject) => {
      blobStream.on('error', (err: unknown) => {
        let errorMessage = 'Failed to upload image to Google Cloud Storage.';
        if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
          errorMessage = (err as { message: string }).message;
        }
        console.error('GCS Upload Error:', errorMessage, err);
        reject(new Error(errorMessage));
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file public
          await blob.makePublic();
          if (process.env.NODE_ENV !== 'production') {
            console.log(`Successfully uploaded ${uniqueFilename} to GCS. Public URL: ${publicUrl}`);
          }
          resolve();
        } catch (err: unknown) {
          let errorMessage = 'Failed to make image public after upload.';
          if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
            errorMessage = (err as { message: string }).message;
          }
          console.error('GCS makePublic Error:', errorMessage, err);
          reject(new Error(errorMessage));
        }
      });

      blobStream.end(fileBuffer);
    });

    return { url: publicUrl };

  } catch (error: unknown) {
    let errorMessage = 'An unexpected error occurred during image upload.';
    if (typeof error === 'object' && error && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
      errorMessage = (error as { message: string }).message;
    }
    console.error(errorMessage, error);
    throw new Error(errorMessage);
  }
}
