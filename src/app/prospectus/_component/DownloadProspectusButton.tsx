"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { downloadProspectusFile } from "../_actions/download-prospectus";

interface DownloadButtonProps {
  programTitle: string;
  prospectusFile?: {
    bucketId: string;
    fileId: string;
  };
}

export function DownloadProspectusButton({
  programTitle,
  prospectusFile,
}: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!prospectusFile) {
      alert("Prospectus file not available for this program.");
      return;
    }

    setIsDownloading(true);

    try {
      const result = await downloadProspectusFile(
        prospectusFile.bucketId,
        prospectusFile.fileId
      );

      if (result.success && result.data) {
        // Convert base64 back to blob
        const byteCharacters = atob(result.data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: result.data.mimeType });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.name || `${programTitle}-Prospectus.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(result.error || "Failed to download prospectus");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred while downloading the prospectus");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleDownload}
        disabled={isDownloading || !prospectusFile}
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        {isDownloading ? (
          <>
            <span className="animate-spin mr-2 text-xl">⏳</span>
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-5 h-5 mr-2" />
            Download Prospectus
          </>
        )}
      </Button>
      {!prospectusFile && (
        <p className="text-sm text-muted-foreground mt-3">
          Prospectus file coming soon
        </p>
      )}
    </>
  );
}
