"use client";

import { useState, useEffect, useRef } from "react";
import { createReturnRequest } from "@/actions/returns";
import { Loader2, UploadCloud, X, AlertCircle, ChevronDown, Check } from "lucide-react";
import toast from "react-hot-toast";

const returnReasons = [
  { id: "DEFECTIVE", name: "کالا معیوب است" },
  { id: "WRONG_ITEM", name: "کالای اشتباه ارسال شده" },
  { id: "NOT_AS_DESCRIBED", name: "مغایرت با توضیحات سایت" },
  { id: "OTHER", name: "دلایل دیگر (انصراف از خرید)" },
];

export function ReturnRequestModal({
  isOpen,
  onClose,
  orderItemId,
  productName
}: {
  isOpen: boolean;
  onClose: () => void;
  orderItemId: string;
  productName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const [reasonPosition, setReasonPosition] = useState<"bottom" | "top">("bottom");
  const reasonDropdownRef = useRef<HTMLDivElement>(null);
  const reasonBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        reasonDropdownRef.current &&
        !reasonDropdownRef.current.contains(event.target as Node)
      ) {
        setIsReasonOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleReasonDropdown = () => {
    if (!isReasonOpen && reasonBtnRef.current) {
      const rect = reasonBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setReasonPosition(spaceBelow < 250 ? "top" : "bottom");
    }
    setIsReasonOpen(!isReasonOpen);
  };

  if (!isOpen) return null;

  // Secure image upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const validFiles: string[] = [];
    let hasError = false;

    // Validate size (max 10MB) and type
    const MAX_SIZE_MB = 10;
    const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast.error(`فرمت فایل ${file.name} مجاز نیست.`);
        hasError = true;
      } else if (file.size > MAX_SIZE_BYTES) {
        toast.error(`حجم تصویر ${file.name} نباید بیشتر از ${MAX_SIZE_MB} مگابایت باشد.`);
        hasError = true;
      } else {
        validFiles.push(URL.createObjectURL(file));
      }
    });

    if (validFiles.length > 0) {
      setImages(prev => {
        const newImages = [...prev, ...validFiles];
        return newImages.slice(0, 4); // Limit to max 4 images
      });
    }

    if (hasError) {
      // Reset input to allow selecting same file again if they want
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      setError("لطفاً دلیل مرجوعی را انتخاب کنید.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("orderItemId", orderItemId);
    formData.append("reason", reason);
    if (description) formData.append("description", description);
    
    // In a real app we'd upload the files first, then append their URLs.
    // Here we're appending the mock local URLs.
    images.forEach(img => formData.append("images", img));

    const result = await createReturnRequest(null, formData);
    
    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.success) {
      toast.success(result.message || "درخواست ثبت شد");
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">ثبت درخواست مرجوعی</h2>
            <p className="text-gray-500 text-sm">شما در حال ثبت درخواست برای «{productName}» هستید.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div ref={reasonDropdownRef} className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                دلیل مرجوعی *
              </label>

              <button
                ref={reasonBtnRef}
                type="button"
                onClick={toggleReasonDropdown}
                className="w-full flex items-center justify-between bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              >
                <span className={reason ? "" : "text-gray-500"}>
                  {reason
                    ? returnReasons.find((r) => r.id === reason)?.name
                    : "انتخاب کنید..."}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isReasonOpen ? "rotate-180" : ""}`}
                />
              </button>

              {isReasonOpen && (
                <div
                  className={`absolute left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl duration-200 ${
                    reasonPosition === "top"
                      ? "bottom-full mb-2 origin-bottom animate-in fade-in zoom-in-95"
                      : "top-full mt-2 origin-top animate-in fade-in zoom-in-95"
                  }`}
                >
                  <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
                    {returnReasons.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setReason(r.id);
                          setIsReasonOpen(false);
                        }}
                        className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                          reason === r.id
                            ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {r.name}
                        {reason === r.id && (
                          <Check className="w-4 h-4 text-violet-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">توضیحات تکمیلی</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white resize-none"
                placeholder="توضیحات بیشتر درباره مشکل..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تصاویر (اختیاری)</label>
              <div className="grid grid-cols-4 gap-3 mb-3">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img src={img} alt="upload preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                      className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-black/70"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                {images.length < 4 && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-black/10 dark:border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <UploadCloud className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">آپلود</span>
                    <input type="file" multiple accept="image/jpeg, image/png, image/jpg, image/webp" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading || !reason}
              className="w-full py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-medium text-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "ثبت درخواست مرجوعی"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
