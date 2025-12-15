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
        className="bg-sidebar text-sidebar-foreground hover:bg-sidebar/90 disabled:opacity-50"
      >
        {isDownloading ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Downloading...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Download Prospectus
          </>
        )}
      </Button>
      {!prospectusFile && (
        <p className="text-xs text-muted-foreground mt-2">
          Prospectus file coming soon
        </p>
      )}
    </>
  );
}
