"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, X, RefreshCw, Upload, Image as ImageIcon } from "lucide-react";
import { createCategory, updateCategory, deleteCategory, uploadCategoryImage } from "@/actions/category";
import * as Icons from "lucide-react";

export function CategoryClient({ categories }: { categories: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({ name: "", slug: "", iconName: "", colorGradient: "", image: "" });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const gradients = [
    "from-pink-500 to-rose-500",
    "from-purple-500 to-indigo-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-orange-500",
    "from-fuchsia-500 to-pink-500",
    "from-blue-600 to-violet-600",
    "from-lime-400 to-green-500",
  ];

  const popularIcons = [
    "Smartphone", "Monitor", "Headphones", "Camera", "Watch", 
    "Shirt", "Utensils", "Gamepad2", "BookOpen", "Home", "ShoppingBag"
  ];

  const openNew = () => {
    setFormData({ name: "", slug: "", iconName: "", colorGradient: "", image: "" });
    setImageFile(null);
    setImagePreview(null);
    setIsEdit(false);
    setError("");
    setIsOpen(true);
  };

  const openEdit = (cat: any) => {
    setFormData({ 
      name: cat.name, 
      slug: cat.slug, 
      iconName: cat.iconName || "", 
      colorGradient: cat.colorGradient || "",
      image: cat.image || "",
    });
    setImageFile(null);
    setImagePreview(cat.image || null);
    setCurrentId(cat.id);
    setIsEdit(true);
    setError("");
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    let imageUrl = formData.image;
    
    if (imageFile) {
      const uploadForm = new FormData();
      uploadForm.append("image", imageFile);
      const res = await uploadCategoryImage(uploadForm);
      if (!res.success) {
        setError(res.error || "خطا در آپلود عکس");
        setLoading(false);
        return;
      }
      imageUrl = res.imageUrl as string;
    }

    const submitData = { ...formData, image: imageUrl };
    
    const res = isEdit 
      ? await updateCategory(currentId, submitData)
      : await createCategory(submitData);
      
    setLoading(false);
    
    if (res.success) {
      setIsOpen(false);
    } else {
      setError(res.error || "خطایی رخ داد.");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("آیا از حذف این دسته‌بندی اطمینان دارید؟")) {
      const res = await deleteCategory(id);
      if (!res.success) {
        alert(res.error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">مدیریت دسته‌بندی‌ها</h1>
          <p className="text-gray-600 dark:text-gray-400">مشاهده، ایجاد و ویرایش دسته‌بندی محصولات</p>
        </div>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity font-medium"
        >
          <Plus className="w-5 h-5" />
          افزودن دسته‌بندی
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => {
          const Icon = cat.iconName && (Icons as any)[cat.iconName] 
            ? (Icons as any)[cat.iconName] 
            : Icons.ShoppingBag;
            
          return (
            <div key={cat.id} className="relative p-6 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden group">
              {cat.colorGradient && (
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${cat.colorGradient}`} />
              )}
              
              <div className="flex items-start justify-between mb-4 mt-2">
                <div className={`w-12 h-12 flex items-center justify-center rounded-xl overflow-hidden ${cat.colorGradient ? 'text-white bg-gradient-to-br ' + cat.colorGradient : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{cat.name}</h3>
              <p className="text-gray-500 text-sm">/{cat.slug}</p>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{isEdit ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی"}</h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">عنوان</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="مثال: محصولات الکترونیکی"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">نامک (Slug)</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
                    placeholder="مثال: electronics"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">نام آیکون (اختیاری - از کتابخانه Lucide)</label>
                <div className="grid grid-cols-6 gap-2">
                  {popularIcons.map((icon) => {
                    const Icon = (Icons as any)[icon];
                    return (
                      <button
                        type="button"
                        key={icon}
                        onClick={() => setFormData({...formData, iconName: icon})}
                        className={`p-3 flex justify-center items-center rounded-xl border transition-all ${formData.iconName === icon ? 'border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-600' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                      >
                        <Icon className="w-5 h-5" />
                      </button>
                    );
                  })}
                </div>
                <input
                  type="text"
                  value={formData.iconName}
                  onChange={(e) => setFormData({...formData, iconName: e.target.value})}
                  className="w-full mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none"
                  placeholder="یا نام آیکون را تایپ کنید (مثال: Camera)"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">تصویر/آیکون اختصاصی (اختیاری)</label>
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-gray-50 dark:bg-gray-800">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {imageFile ? imageFile.name : 'انتخاب تصویر...'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setImageFile(file);
                            setImagePreview(URL.createObjectURL(file));
                          }
                        }}
                      />
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setFormData({ ...formData, image: "" });
                        }}
                        className="flex items-center gap-2 mt-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف تصویر
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر 10MB)</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">رنگ پس‌زمینه (اختیاری)</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {gradients.map((grad) => (
                    <button
                      type="button"
                      key={grad}
                      onClick={() => setFormData({...formData, colorGradient: grad})}
                      className={`w-full aspect-square rounded-xl bg-gradient-to-br ${grad} ring-offset-2 dark:ring-offset-gray-900 transition-all ${formData.colorGradient === grad ? 'ring-2 ring-violet-500 scale-110' : 'hover:scale-105'}`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.colorGradient}
                  onChange={(e) => setFormData({...formData, colorGradient: e.target.value})}
                  className="w-full mt-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 outline-none"
                  placeholder="کلاس گرادیان سفارشی (مثال: from-red-500 to-orange-500)"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-violet-600 text-white rounded-xl py-3 font-medium hover:bg-violet-700 transition-colors flex justify-center items-center disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'ذخیره'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl py-3 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
