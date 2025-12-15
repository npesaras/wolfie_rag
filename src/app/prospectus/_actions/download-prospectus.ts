"use server";

import { createAdminClient } from "@/appwrite";

/**
 * Download a prospectus file from Appwrite Storage
 * @param bucketId - The Appwrite storage bucket ID
 * @param fileId - The file ID in the bucket
 * @returns The file download result with blob data
 */
export async function downloadProspectusFile(
  bucketId: string,
  fileId: string
) {
  try {
    console.log("Attempting download:", { bucketId, fileId });

    // createAdminClient will validate environment variables
    const { storage } = createAdminClient();

    // Get file metadata first to verify it exists
    const fileMetadata = await storage.getFile(bucketId, fileId);
    console.log("File found:", fileMetadata.name);

    // Download the file as ArrayBuffer
    const fileArrayBuffer = await storage.getFileDownload(bucketId, fileId);

    // Convert to base64 for transmission to client
    const buffer = Buffer.from(fileArrayBuffer);
    const base64 = buffer.toString("base64");

    return {
      success: true,
      data: {
        base64,
        name: fileMetadata.name,
        mimeType: fileMetadata.mimeType,
        size: fileMetadata.sizeOriginal,
      },
    };
  } catch (error: any) {
    console.error("Error downloading prospectus:", error);

    // Provide more specific error messages
    let errorMessage = "Failed to download file";
    if (error.code === 404) {
      errorMessage = "File not found in Appwrite Storage. Please check the bucket and file ID.";
    } else if (error.code === 401) {
      errorMessage = "Authentication failed. Check your APPWRITE_API_KEY.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Verify Appwrite connection and file existence
 */
export async function verifyProspectusFile(bucketId: string, fileId: string) {
  try {
    const { storage } = createAdminClient();
    const fileMetadata = await storage.getFile(bucketId, fileId);

    return {
      success: true,
      exists: true,
      file: {
        name: fileMetadata.name,
        size: fileMetadata.sizeOriginal,
        mimeType: fileMetadata.mimeType,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      exists: false,
      error: error.message || "File not found",
    };
  }
}
