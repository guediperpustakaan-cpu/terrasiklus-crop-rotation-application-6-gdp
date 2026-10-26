"use client";

import { Download } from "lucide-react";
import { Button } from "./ui";
import { useState } from "react";

const GITHUB_REPO = "https://github.com/username/terra-siklus-crop-rotation";
const GITHUB_API_URL = "https://api.github.com/repos/username/terra-siklus-crop-rotation/zipball/main";

export function DownloadSourceButton() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const fetchDownloadUrl = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(GITHUB_API_URL, {
        headers: {
          Accept: "application/zip",
          "User-Agent": "Mozilla/5.0",
        },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Gagal mengambil source code");
      }
      setDownloadUrl(`${GITHUB_REPO}/actions/runs?check_suppressed_meta=latest`);
      return;
    } catch (e) {
      console.error("Download error:", e);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClick = async () => {
    await fetchDownloadUrl();
  };

  return (
    <Button
      variant="outline"
      className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-12 h-12 rounded-full flex items-center justify-center shadow-lg shadow-leaf-600/30 transition hover:bg-leaf-50"
      onClick={handleClick}
      disabled={isDownloading}
      aria-label="Download source code"
    >
      {isDownloading ? (
        <>
          <Download className="h-5 w-5 animate-spin text-leaf-500" />
        </>
      ) : (
        <Download className="h-5 w-5 text-leaf-600" />
      )}
    </Button>
  );
}