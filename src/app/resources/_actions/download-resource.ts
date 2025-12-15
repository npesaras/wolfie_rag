"use server";

import { createAdminClient } from "@/appwrite";

/**
 * Download a resource file from Appwrite Storage
 * @param bucketId - The Appwrite storage bucket ID
 * @param fileId - The file ID in the bucket
 * @returns The file download result with blob data
 */
export async function downloadResourceFile(bucketId: string, fileId: string) {
  try {
    console.log("Attempting resource download:", { bucketId, fileId });

    const { storage } = createAdminClient();

    // Get file metadata first to verify it exists
    const fileMetadata = await storage.getFile(bucketId, fileId);
    console.log("Resource file found:", fileMetadata.name);

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
    console.error("Error downloading resource:", error);

    let errorMessage = "Failed to download file";
    if (error.code === 404) {
      errorMessage =
        "File not found in Appwrite Storage. Please check the bucket and file ID.";
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
