"use client";

import { useState, useRef } from "react";
import { User, Camera, Loader2 } from "lucide-react";
import { uploadProfileImage } from "@/actions/upload";

interface AvatarUploadProps {
  currentImage?: string | null;
}

export function AvatarUpload({ currentImage }: AvatarUploadProps) {
  const [image, setImage] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("لطفا یک فایل تصویری معتبر انتخاب کنید");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("حجم فایل نباید بیشتر از 10 مگابایت باشد");
      return;
    }

    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append("image", file);

      const result = await uploadProfileImage(formData);

      if (result.success && result.imageUrl) {
        setImage(result.imageUrl);
      } else {
        alert(result.error || "خطایی در آپلود فایل رخ داد");
      }
    } catch (error) {
      alert("خطایی در آپلود فایل رخ داد");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
      <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 p-[2px]">
        <div className="w-full h-full bg-background rounded-full overflow-hidden flex items-center justify-center relative">
          {image ? (
            <img src={image} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User className="w-10 h-10 text-gray-500 dark:text-gray-400" />
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            {isUploading ? (
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            ) : (
              <Camera className="w-6 h-6 text-white" />
            )}
          </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
}
