"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { downloadResourceFile } from "../_actions/download-resource";

interface ResourceCardProps {
  title: string;
  fileId: string;
  bucketId: string;
  code: string;
}

export function ResourceCard({ title, fileId, bucketId, code }: ResourceCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      const result = await downloadResourceFile(bucketId, fileId);

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
        link.download = result.data.name || `${title}.docx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        alert(result.error || "Failed to download resource");
      }
    } catch (error) {
      console.error("Download error:", error);
      alert("An error occurred while downloading the resource");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full overflow-hidden border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4 pt-6">
        <CardTitle className="text-xl font-bold text-foreground leading-tight">
          {title}
        </CardTitle>
        <p className="text-sm text-primary font-medium mt-2">{code}</p>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-center items-center pb-8 pt-4">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 w-full"
          size="lg"
        >
          {isDownloading ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Downloading...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Download
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
