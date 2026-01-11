"use client";

import { useState } from "react";

import { UploadDropzone } from "@/lib/uploadthing";
import { twMerge } from "tailwind-merge";
// import "@uploadthing/react/styles.css";

import { X } from "lucide-react";
import Image from "next/image";
import { toast } from "@/hooks/use-toast";

interface FileUploadProps {
  endpoint: "messageFile" | "classImage";
  value: string;
  onChange: (url: string) => void;
}

function FileUpload({ endpoint, value, onChange }: FileUploadProps) {
  const [dropzoneKey, setDropzoneKey] = useState(0);

  const fileType = value.split(".").pop();
  if (value && fileType !== "pdf") {
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
  }
  return (
    <div>
      <UploadDropzone
        config={{ cn: twMerge }}
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
        onClientUploadComplete={(res: { url: string }[]) =>
          onChange(res?.[0]?.url)
        }
        onUploadError={(error: Error) => {
          onChange("");
          setDropzoneKey((prev) => prev + 1);
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
