"use client";

import { useState, useRef, useEffect } from "react";
import { saveArticle } from "@/actions/blog";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Save, ArrowLeft, Image as ImageIcon, ChevronDown, Check, Bold, Italic, Heading, List, ListOrdered, Link as LinkIcon, Code, Quote, Trash2 } from "lucide-react";

const ToolbarButton = ({ icon: Icon, onClick, title }: { icon: any, onClick: () => void, title: string }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors"
  >
    <Icon className="w-4 h-4" />
  </button>
);
import Link from "next/link";

interface ArticleFormProps {
  categories: any[];
  initialData?: any;
}

export function ArticleForm({ categories, initialData }: ArticleFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState(initialData?.content || "");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(initialData?.coverImage || null);
  const [isCoverDeleted, setIsCoverDeleted] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const text = content;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);
    
    const newText = before + prefix + selection + suffix + after;
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initialData?.status || "DRAFT");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(initialData?.categoryId || "");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const [categoryPosition, setCategoryPosition] = useState<"bottom" | "top">("bottom");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleCategoryDropdown = () => {
    if (!isCategoryOpen && categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setCategoryPosition(spaceBelow < 250 ? "top" : "bottom");
    }
    setIsCategoryOpen(!isCategoryOpen);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (initialData?.id) {
      formData.append("id", initialData.id);
    }
    if (coverFile) {
      formData.append("coverImageFile", coverFile);
    }
    
    try {
      const response = await saveArticle(formData);
      
      if (response && response.error) {
        toast.error(response.error);
        return;
      }
      
      toast.success(initialData ? "مقاله ویرایش شد" : "مقاله با موفقیت ایجاد شد");
      router.push("/admin/blog");
    } catch (error) {
      toast.error("خطا در برقراری ارتباط با سرور");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center bg-white/50 dark:bg-black/20 p-4 rounded-3xl border border-gray-200 dark:border-white/10 backdrop-blur-xl sticky top-6 z-10 shadow-sm">
        <Link
          href="/admin/blog"
          className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-xl transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex gap-3">
          <div ref={statusDropdownRef} className="relative">
            <input type="hidden" name="status" value={status} />
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className="flex items-center gap-2 bg-white dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50 min-w-[140px] justify-between"
            >
              <span>{status === "PUBLISHED" ? "انتشار عمومی" : "پیش‌نویس"}</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`} />
            </button>
            {isStatusOpen && (
              <div className="absolute top-full mt-2 right-0 w-full min-w-[140px] z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-xl shadow-xl animate-in fade-in zoom-in-95">
                <div className="flex flex-col py-1">
                  <button
                    type="button"
                    onClick={() => { setStatus("DRAFT"); setIsStatusOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${status === "DRAFT" ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    پیش‌نویس
                    {status === "DRAFT" && <Check className="w-4 h-4 text-purple-500" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setStatus("PUBLISHED"); setIsStatusOpen(false); }}
                    className={`flex items-center justify-between px-3 py-2 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${status === "PUBLISHED" ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    انتشار عمومی
                    {status === "PUBLISHED" && <Check className="w-4 h-4 text-purple-500" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? "در حال ذخیره..." : "ذخیره مقاله"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">عنوان مقاله</label>
                <input
                  type="text"
                  name="title"
                  defaultValue={initialData?.title}
                  required
                  placeholder="تیتر جذاب برای مقاله..."
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none text-lg font-medium transition-all"
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">محتوای مقاله (Markdown)</label>
                </div>
                
                <div className="flex flex-wrap items-center gap-1 bg-gray-50/80 dark:bg-black/40 border border-b-0 border-gray-200 dark:border-white/10 rounded-t-2xl px-3 py-2">
                  <ToolbarButton icon={Bold} onClick={() => insertMarkdown("**", "**")} title="ضخیم (Bold)" />
                  <ToolbarButton icon={Italic} onClick={() => insertMarkdown("*", "*")} title="مورب (Italic)" />
                  <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />
                  <ToolbarButton icon={Heading} onClick={() => insertMarkdown("### ", "")} title="تیتر (Heading)" />
                  <ToolbarButton icon={Quote} onClick={() => insertMarkdown("> ", "")} title="نقل قول (Quote)" />
                  <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />
                  <ToolbarButton icon={List} onClick={() => insertMarkdown("- ", "")} title="لیست نقطه‌ای" />
                  <ToolbarButton icon={ListOrdered} onClick={() => insertMarkdown("1. ", "")} title="لیست عددی" />
                  <div className="w-px h-6 bg-gray-300 dark:bg-white/10 mx-1" />
                  <ToolbarButton icon={LinkIcon} onClick={() => insertMarkdown("[", "](url)")} title="لینک" />
                  <ToolbarButton icon={ImageIcon} onClick={() => insertMarkdown("![توضیح عکس](", ")")} title="عکس" />
                  <ToolbarButton icon={Code} onClick={() => insertMarkdown("`", "`")} title="کد" />
                </div>
                
                <textarea
                  ref={textareaRef}
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={20}
                  placeholder="شروع به نوشتن کنید... (پشتیبانی از Markdown)"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-b-2xl rounded-t-none px-4 py-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none font-mono text-sm leading-relaxed transition-all resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">تنظیمات انتشار</h3>
            
            <div className="space-y-4">
              <div ref={categoryDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">دسته‌بندی</label>
                <div className="relative">
                  <input type="hidden" name="categoryId" value={selectedCategoryId} required />
                  <button
                    ref={categoryBtnRef}
                    type="button"
                    onClick={toggleCategoryDropdown}
                    className="w-full flex items-center justify-between bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                  >
                    <span className={selectedCategoryId ? "" : "text-gray-500"}>
                      {selectedCategoryId
                        ? categories.find((c: any) => c.id === selectedCategoryId)?.name
                        : "انتخاب کنید..."}
                    </span>
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isCategoryOpen && (
                    <div
                      className={`absolute left-0 right-0 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl duration-200 ${
                        categoryPosition === "top"
                          ? "bottom-full mb-2 origin-bottom animate-in fade-in zoom-in-95"
                          : "top-full mt-2 origin-top animate-in fade-in zoom-in-95"
                      }`}
                    >
                      <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
                        {categories.map((cat: any) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { setSelectedCategoryId(cat.id); setIsCategoryOpen(false); }}
                            className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                              selectedCategoryId === cat.id
                                ? "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {cat.name}
                            {selectedCategoryId === cat.id && <Check className="w-4 h-4 text-purple-500" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نامک (Slug)</label>
                <input
                  type="text"
                  name="slug"
                  defaultValue={initialData?.slug}
                  required
                  dir="ltr"
                  placeholder="how-to-buy-phone"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">خلاصه (Excerpt)</label>
                <textarea
                  name="excerpt"
                  defaultValue={initialData?.excerpt}
                  rows={3}
                  placeholder="توضیح کوتاه برای نمایش در کارت مقاله (SEO)"
                  className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تصویر کاور</label>
                <div className="space-y-3">
                  <input type="hidden" name="coverImage" value={isCoverDeleted ? "" : (initialData?.coverImage || "")} />
                  
                  {!coverPreview ? (
                    <>
                      <div
                        className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        onClick={() => coverInputRef.current?.click()}
                      >
                        <ImageIcon className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          برای افزودن تصویر کاور کلیک کنید
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={coverInputRef}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 10 * 1024 * 1024) {
                              toast.error("حجم تصویر نباید بیشتر از ۱۰ مگابایت باشد.");
                              return;
                            }
                            setCoverFile(file);
                            setCoverPreview(URL.createObjectURL(file));
                            setIsCoverDeleted(false);
                          }
                        }}
                      />
                    </>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-white/10 aspect-video group">
                      <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setCoverFile(null);
                          setCoverPreview(null);
                          setIsCoverDeleted(true);
                          if (coverInputRef.current) coverInputRef.current.value = "";
                        }}
                        className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">فقط فرمت‌های تصویر مجاز است (حداکثر ۱۰ مگابایت)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
