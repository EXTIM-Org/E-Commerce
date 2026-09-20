"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { Upload, X, Loader2, ChevronDown, Check } from "lucide-react";
import { createProduct, updateProduct } from "@/actions/product";

export function ProductForm({
  categories,
  product = null,
}: {
  categories: any[];
  product?: any | null;
}) {
  const isEditing = !!product;
  const action = isEditing ? updateProduct.bind(null, product.id) : createProduct;
  const [state, formAction, isPending] = useActionState(action, null);

  type MediaItem = 
    | { id: string; type: 'existing'; url: string }
    | { id: string; type: 'new'; file: File; url: string };

  const [media, setMedia] = useState<MediaItem[]>(() => {
    return (product?.images || []).map((url: string, i: number) => ({
      id: `existing-${i}-${Math.random()}`,
      type: 'existing',
      url
    }));
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.categoryId || "");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Clean up object URLs
    return () => {
      media.forEach(m => {
        if (m.type === 'new') URL.revokeObjectURL(m.url);
      });
    };
  }, []);

  // Whenever media changes, sync the new files to the native input
  useEffect(() => {
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      media.filter(m => m.type === 'new').forEach(m => {
        if (m.type === 'new') dt.items.add(m.file);
      });
      fileInputRef.current.files = dt.files;
    }
  }, [media]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const currentNewFiles = media.filter(m => m.type === 'new').map(m => (m as any).file);
      const selectedFiles = Array.from(e.target.files);
      
      const toAdd = selectedFiles.filter(newF => 
        !currentNewFiles.some(existing => existing.name === newF.name && existing.size === newF.size)
      );
      
      if (toAdd.length > 0) {
        const newMediaItems: MediaItem[] = toAdd.map(f => ({
          id: `new-${Math.random()}`,
          type: 'new',
          file: f,
          url: URL.createObjectURL(f)
        }));
        setMedia(prev => [...prev, ...newMediaItems]);
      }
    }
  };

  const removeMedia = (index: number) => {
    const updated = [...media];
    const removed = updated.splice(index, 1)[0];
    if (removed.type === 'new') URL.revokeObjectURL(removed.url);
    setMedia(updated);
  };

  // Drag and Drop handlers
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;

    // Reorder array
    const newMedia = [...media];
    const draggedItem = newMedia[draggedIndex];
    newMedia.splice(draggedIndex, 1);
    newMedia.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setMedia(newMedia);
  };

  const onDragEnd = () => {
    setDraggedIndex(null);
  };

  const finalOrderJson = JSON.stringify(media.map(m => m.type === 'existing' ? m.url : '__NEW_FILE__'));

  return (
    <form action={formAction} className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6">
      
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      {/* Hidden input to pass existing images back for the update action */}
      {isEditing && (
        <input type="hidden" name="existingImages" value={JSON.stringify(media.filter(m => m.type === 'existing').map(m => m.url))} />
      )}
      
      {/* Hidden input to pass the final ordering structure */}
      <input type="hidden" name="finalOrder" value={finalOrderJson} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">نام محصول</label>
            <input 
              type="text" 
              name="name"
              defaultValue={product?.name}
              required
              className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              placeholder="مثلا: کفش ورزشی نایکی"
            />
          </div>

          <div ref={categoryDropdownRef} className="relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">دسته‌بندی</label>
            <input type="hidden" name="categoryId" value={selectedCategoryId} required />
            
            <button
              type="button"
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="w-full flex items-center justify-between bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
            >
              <span className={selectedCategoryId ? "" : "text-gray-500"}>
                {selectedCategoryId 
                  ? categories.find(c => c.id === selectedCategoryId)?.name 
                  : "انتخاب کنید..."}
              </span>
              <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`} />
            </button>

            {isCategoryOpen && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl origin-top animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col py-2 max-h-60 overflow-y-auto">
                  {categories.map((c: any) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategoryId(c.id);
                        setIsCategoryOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-4 py-2.5 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                        selectedCategoryId === c.id
                          ? "text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {c.name}
                      {selectedCategoryId === c.id && <Check className="w-4 h-4 text-violet-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">توضیحات محصول</label>
            <textarea 
              name="description"
              defaultValue={product?.description || ""}
              rows={5}
              className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white resize-none"
              placeholder="توضیحات و ویژگی‌های محصول..."
            ></textarea>
          </div>
        </div>

        {/* Pricing & Media */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">قیمت پایه (تومان)</label>
              <input 
                type="number" 
                name="basePrice"
                defaultValue={product?.basePrice}
                required
                min={0}
                className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تخفیف (درصد)</label>
              <input 
                type="number" 
                name="discount"
                defaultValue={product?.discount || 0}
                min={0}
                max={100}
                className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">تصاویر محصول</label>
            
            <div 
              className="border-2 border-dashed border-black/10 dark:border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 text-violet-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                برای افزودن عکس کلیک کنید (چند عکس مجاز است)
              </p>
            </div>
            
            <input 
              type="file" 
              name="images"
              multiple
              accept="image/*"
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {/* Gallery Preview */}
            {media.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-3">
                {media.map((item, i) => (
                  <div 
                    key={item.id} 
                    draggable
                    onDragStart={(e) => onDragStart(e, i)}
                    onDragOver={(e) => onDragOver(e, i)}
                    onDragEnd={onDragEnd}
                    className={`relative aspect-square rounded-lg overflow-hidden cursor-move border transition-all ${
                      draggedIndex === i ? 'opacity-50 scale-95 border-violet-500' : 'border-black/10 dark:border-white/10 group'
                    }`}
                  >
                    <img 
                      src={item.url} 
                      alt="" 
                      className="w-full h-full object-cover pointer-events-none" 
                    />
                    
                    {item.type === 'new' && (
                      <div className="absolute top-1 right-1 bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">جدید</div>
                    )}
                    
                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">اصلی</div>
                    )}

                    <button 
                      type="button"
                      onClick={() => removeMedia(i)}
                      className="absolute inset-0 bg-red-500/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
        <button 
          type="submit" 
          disabled={isPending}
          className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              در حال ذخیره...
            </>
          ) : (
            isEditing ? "ذخیره تغییرات" : "افزودن محصول"
          )}
        </button>
      </div>

    </form>
  );
}
