"use client";

import { UploadDropzone } from "@/lib/uploadthing";
import { twMerge } from "tailwind-merge";
// import "@uploadthing/react/styles.css";

import { X, FileIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  endpoint: "messageFile" | "classImage";
  value: string;
  onChange: (url: string) => void;
}

function FileUpload({ endpoint, value, onChange }: FileUploadProps) {

  const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg", "jfif", "avif", "bmp", "ico", "tiff"];

  function getFileName(url: string) {
    try {
      const urlObj = new URL(url);
      const nameStr = urlObj.searchParams.get("name");
      if (nameStr) return nameStr;
    } catch {}
    return url.split("/").pop()?.split("-").slice(1).join("-") || url.split("/").pop() || "file";
  }

  const name = getFileName(value);
  const fileType = name.split(".").pop()?.toLowerCase().split("?")[0];
  const isImageFile = fileType ? IMAGE_EXTENSIONS.includes(fileType) : false;

  if (value && isImageFile) {
    return (
      <div className="relative h-40 w-40">
        <Image
          fill
          src={value}
          alt="Uploaded file preview"
          className="rounded-md"
        />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 p-1 rounded-full text-white absolute top-[-5px] right-[-5px] shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  } else if (value && !isImageFile) {
    return (
      <div className="relative h-40 w-40 flex items-center justify-center bg-card border border-border rounded-md">
        <FileIcon className="w-12 h-12 text-muted-foreground" />
        <button
          onClick={() => onChange("")}
          className="bg-rose-500 p-1 rounded-full text-white absolute top-[-5px] right-[-5px] shadow-sm"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div>
      <UploadDropzone
        config={{ mode: "auto", cn: twMerge }}
        appearance={{
          container:
            "bg-background border-2 border-dashed border-border rounded-xl",
          button:
            "border border-border border-2 rounded-lg px-4 py-2 mt-2 cursor-pointer",
          allowedContent: "text-xs text-gray-500 mb-2",
          label: "font-bold text-lg mb-2",
          uploadIcon: "text-primary w-8 h-8 mb-2",
        }}
        endpoint={endpoint}
        onClientUploadComplete={(res: { url: string; name: string }[]) => {
          if (res?.[0]) {
            const fileUrl = new URL(res[0].url);
            if (res[0].name) {
              fileUrl.searchParams.set("name", res[0].name);
            }
            onChange(fileUrl.toString());
          }
        }}
        onUploadError={(error: Error) => {
          onChange("");
          toast({
            title: "Upload failed",
            description: error.message,
            variant: "destructive",
          });
        }}
      />
    </div>
  );
}

export default FileUpload;
