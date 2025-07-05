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

const projectId = process.env.GCS_PROJECT_ID;
bucketName = process.env.GCS_BUCKET_NAME;
const credentialsJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

const isGcsConfigured = projectId && bucketName && credentialsJson;

if (isGcsConfigured) {
  try {
    storage = new Storage({
      projectId,
      credentials: JSON.parse(credentialsJson),
    });
    console.log('Successfully connected to Google Cloud Storage.');
  } catch (error) {
    console.error("Failed to parse GCS credentials JSON. Check the GOOGLE_APPLICATION_CREDENTIALS_JSON environment variable.", error);
    storage = undefined; // Ensure storage is not used if config is invalid
  }
} else {
  console.warn(`
----------------------------------------------------------------
NOTICE: Google Cloud Storage is not configured. 
The application will use placeholder images for uploads.
To enable real image uploads, set the following environment variables in your .env file:
- GCS_PROJECT_ID
- GCS_BUCKET_NAME
- GOOGLE_APPLICATION_CREDENTIALS_JSON
----------------------------------------------------------------
`);
}


/**
 * Uploads a file to Google Cloud Storage. If GCS is not configured, it returns a placeholder URL.
 * @param formData The FormData object containing the file to upload.
 * It's expected to have a 'file' field.
 * @returns A promise that resolves with the public URL of the uploaded file.
 */
export async function uploadImage(formData: FormData): Promise<{ url: string }> {
  const file = formData.get('file') as File;

  if (!file) {
    throw new Error('No file provided in FormData.');
  }

  // If GCS is not configured, return a placeholder
  if (!storage || !bucketName) {
    console.log('--- SIMULATING GCS FILE UPLOAD (using placeholder) ---');
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

    await new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        console.error('GCS Upload Error:', err);
        reject(new Error('Failed to upload image to Google Cloud Storage.'));
      });

      blobStream.on('finish', async () => {
        try {
          // Make the file public
          await blob.makePublic();
          console.log(`Successfully uploaded ${uniqueFilename} to GCS. Public URL: ${publicUrl}`);
          resolve(publicUrl);
        } catch (err) {
            console.error('GCS makePublic Error:', err);
            reject(new Error('Failed to make image public after upload.'));
        }
      });

      blobStream.end(fileBuffer);
    });

    return { url: publicUrl };

  } catch (error) {
    console.error('An unexpected error occurred during image upload:', error);
    throw new Error('An unexpected error occurred during image upload.');
  }
}
