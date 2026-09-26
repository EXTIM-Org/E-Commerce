"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  Loader2,
  ChevronDown,
  Check,
  Plus,
  Trash2,
} from "lucide-react";
import { createProduct, updateProduct } from "@/actions/product";
import { p2e } from "@/lib/persian";
import { RichTextEditor } from "./RichTextEditor";

export function ProductForm({
  categories,
  product = null,
}: {
  categories: any[];
  product?: any | null;
}) {
  const isEditing = !!product;
  const action = isEditing
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const [state, formAction, isPending] = useActionState(action, null);

  const [basePrice, setBasePrice] = useState(product?.basePrice?.toString() || "");
  const [discount, setDiscount] = useState(product?.discount?.toString() || "0");
  const [introduction, setIntroduction] = useState(product?.introduction || "");
  
  const parsedBasePrice = parseFloat(p2e(basePrice)) || 0;
  const parsedDiscount = parseFloat(p2e(discount)) || 0;
  const finalPrice = Math.max(0, parsedBasePrice - (parsedBasePrice * parsedDiscount) / 100);

  type MediaItem =
    | { id: string; type: "existing"; url: string }
    | { id: string; type: "new"; file: File; url: string };

  const [media, setMedia] = useState<MediaItem[]>(() => {
    return (product?.images || []).map((url: string, i: number) => ({
      id: `existing-${i}-${Math.random()}`,
      type: "existing",
      url,
    }));
  });

  type VariantState = {
    id: string;
    name: string;
    sku: string;
    price: number | "";
    stockQuantity: number;
    isNew?: boolean;
  };

  const [variants, setVariants] = useState<VariantState[]>(() => {
    if (product?.variants && product.variants.length > 0) {
      return product.variants.map((v: any) => ({
        id: v.id,
        name: v.name || "پیش‌فرض",
        sku: v.sku,
        price: v.price ?? "",
        stockQuantity: v.inventory?.stockQuantity || 0,
        isNew: false,
      }));
    }
    return [
      {
        id: `new-var-${Math.random()}`,
        name: "پیش‌فرض",
        sku: `SKU-${Date.now()}`,
        price: "",
        stockQuantity: 10,
        isNew: true,
      },
    ];
  });

  const addVariant = () => {
    setVariants([
      ...variants,
      {
        id: `new-var-${Math.random()}`,
        name: "",
        sku: `SKU-${Date.now()}`,
        price: "",
        stockQuantity: 0,
        isNew: true,
      },
    ]);
  };

  const updateVariant = (
    index: number,
    field: keyof VariantState,
    value: string | number,
  ) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 1) {
      alert("هر محصول باید حداقل یک متغیر داشته باشد.");
      return;
    }
    const updated = [...variants];
    updated.splice(index, 1);
    setVariants(updated);
  };

  type SpecificationState = {
    id: string;
    name: string;
    value: string;
  };

  const [specifications, setSpecifications] = useState<SpecificationState[]>(
    () => {
      if (product?.specifications && product.specifications.length > 0) {
        return product.specifications.map((s: any) => ({
          id: s.id,
          name: s.name,
          value: s.value,
        }));
      }
      return [
        { id: `spec-weight-${Math.random()}`, name: "وزن (کیلوگرم)", value: "" },
        { id: `spec-length-${Math.random()}`, name: "طول (سانتی‌متر)", value: "" },
        { id: `spec-width-${Math.random()}`, name: "عرض (سانتی‌متر)", value: "" },
        { id: `spec-height-${Math.random()}`, name: "ارتفاع (سانتی‌متر)", value: "" },
      ];
    },
  );

  const addSpecification = () => {
    setSpecifications([
      ...specifications,
      {
        id: `new-spec-${Math.random()}`,
        name: "",
        value: "",
      },
    ]);
  };

  const updateSpecification = (
    index: number,
    field: keyof SpecificationState,
    val: string,
  ) => {
    const updated = [...specifications];
    updated[index] = { ...updated[index], [field]: val };
    setSpecifications(updated);
  };

  const removeSpecification = (index: number) => {
    const updated = [...specifications];
    updated.splice(index, 1);
    setSpecifications(updated);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    product?.categoryId || "",
  );
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [categoryPosition, setCategoryPosition] = useState<"bottom" | "top">(
    "bottom",
  );
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
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

  useEffect(() => {
    // Clean up object URLs
    return () => {
      media.forEach((m) => {
        if (m.type === "new") URL.revokeObjectURL(m.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Whenever media changes, sync the new files to the native input
  useEffect(() => {
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      media
        .filter((m) => m.type === "new")
        .forEach((m) => {
          if (m.type === "new") dt.items.add(m.file);
        });
      fileInputRef.current.files = dt.files;
    }
  }, [media]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const currentNewFiles = media
        .filter((m) => m.type === "new")
        .map((m) => (m as any).file);
      const selectedFiles = Array.from(e.target.files);

      const maxAllowed = 5 - media.length;
      const toAdd = selectedFiles
        .filter(
          (newF) =>
            !currentNewFiles.some(
              (existing) =>
                existing.name === newF.name && existing.size === newF.size,
            ),
        )
        .slice(0, maxAllowed);

      if (toAdd.length > 0) {
        const newMediaItems: MediaItem[] = toAdd.map((f) => ({
          id: `new-${Math.random()}`,
          type: "new",
          file: f,
          url: URL.createObjectURL(f),
        }));
        setMedia((prev) => [...prev, ...newMediaItems]);
      }
    }
  };

  const removeMedia = (index: number) => {
    const updated = [...media];
    const removed = updated.splice(index, 1)[0];
    if (removed.type === "new") URL.revokeObjectURL(removed.url);
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

  const finalOrderJson = JSON.stringify(
    media.map((m) => (m.type === "existing" ? m.url : "__NEW_FILE__")),
  );

  return (
    <form
      action={formAction}
      className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-6"
    >
      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm">
          {state.error}
        </div>
      )}

      {/* Hidden input to pass existing images back for the update action */}
      {isEditing && (
        <input
          type="hidden"
          name="existingImages"
          value={JSON.stringify(
            media.filter((m) => m.type === "existing").map((m) => m.url),
          )}
        />
      )}

      {/* Hidden input to pass the final ordering structure */}
      <input type="hidden" name="finalOrder" value={finalOrderJson} />

      {/* Hidden input for variants */}
      <input
        type="hidden"
        name="variantsJson"
        value={JSON.stringify(variants)}
      />

      {/* Hidden input for specifications */}
      <input
        type="hidden"
        name="specificationsJson"
        value={JSON.stringify(specifications)}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              نام محصول
            </label>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              دسته‌بندی
            </label>
            <input
              type="hidden"
              name="categoryId"
              value={selectedCategoryId}
              required
            />

            <button
              ref={categoryBtnRef}
              type="button"
              onClick={toggleCategoryDropdown}
              className="w-full flex items-center justify-between bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
            >
              <span className={selectedCategoryId ? "" : "text-gray-500"}>
                {selectedCategoryId
                  ? categories.find((c) => c.id === selectedCategoryId)?.name
                  : "انتخاب کنید..."}
              </span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isCategoryOpen ? "rotate-180" : ""}`}
              />
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
                      {selectedCategoryId === c.id && (
                        <Check className="w-4 h-4 text-violet-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                قیمت پایه (تومان)
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="basePrice"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                required
                className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                تخفیف (درصد)
              </label>
              <input
                type="text"
                inputMode="numeric"
                name="discount"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-transparent mb-2 select-none" aria-hidden="true">
              تراز
            </label>
            <div className="bg-violet-500/10 border border-violet-500/20 text-violet-700 dark:text-violet-300 p-4 rounded-xl flex items-center justify-between">
              <span className="font-medium">قیمت نهایی پس از تخفیف:</span>
              <span className="text-xl font-bold">{finalPrice.toLocaleString('fa-IR')} تومان</span>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="flex flex-col h-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            توضیحات محصول
          </label>
          <textarea
            name="description"
            defaultValue={product?.description || ""}
            className="w-full flex-1 bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all text-gray-900 dark:text-white resize-none"
            placeholder="توضیحات و ویژگی‌های محصول..."
          ></textarea>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex flex-col h-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              تصاویر محصول
            </label>

            {media.length < 5 && (
              <>
                <div
                  className="flex-1 border-2 border-dashed border-black/10 dark:border-white/20 rounded-xl p-8 text-center cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex flex-col justify-center items-center min-h-[140px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 text-violet-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    برای افزودن عکس کلیک کنید (حداکثر ۵ تصویر مجاز است)
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
              </>
            )}
            {media.length >= 5 && (
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm mb-4">
                شما به سقف مجاز آپلود تصویر (۵ تصویر) رسیده‌اید. برای افزودن
                تصویر جدید، ابتدا یکی از تصاویر فعلی را حذف کنید.
              </div>
            )}

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
                      draggedIndex === i
                        ? "opacity-50 scale-95 border-violet-500"
                        : "border-black/10 dark:border-white/10 group"
                    }`}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover pointer-events-none"
                    />

                    {item.type === "new" && (
                      <div className="absolute top-1 right-1 bg-violet-500 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                        جدید
                      </div>
                    )}

                    {i === 0 && (
                      <div className="absolute top-1 left-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded pointer-events-none">
                        اصلی
                      </div>
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

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            معرفی محصول
          </label>
          <input type="hidden" name="introduction" value={introduction} />
          <RichTextEditor 
            content={introduction} 
            onChange={setIntroduction} 
            placeholder="معرفی محصول..." 
          />
        </div>
      </div>

            {/* Variants */}
      <div className="border-t border-black/10 dark:border-white/10 pt-6 mt-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            مدیریت متغیرها (Variants)
          </h3>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-2 bg-violet-100 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 px-4 py-2 rounded-xl text-sm font-bold hover:bg-violet-200 dark:hover:bg-violet-600/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن متغیر
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start bg-white/30 dark:bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5"
            >
              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  نام متغیر (الزامی)
                </label>
                <input
                  type="text"
                  value={variant.name}
                  onChange={(e) => updateVariant(index, "name", e.target.value)}
                  placeholder="سفید - L"
                  required
                  className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  شناسه یکتا (SKU)
                </label>
                <input
                  type="text"
                  value={variant.sku}
                  onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  required
                  className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  موجودی انبار
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={variant.stockQuantity}
                  onChange={(e) =>
                    updateVariant(
                      index,
                      "stockQuantity",
                      e.target.value
                    )
                  }
                  required
                  className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  قیمت اختصاصی
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={variant.price}
                  onChange={(e) =>
                    updateVariant(
                      index,
                      "price",
                      e.target.value
                    )
                  }
                  placeholder="بدون تغییر"
                  className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

              <div className="md:col-span-1 flex items-end justify-end h-full pt-6">
                {variants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors"
                    title="حذف متغیر"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div className="pt-8 border-t border-black/10 dark:border-white/10 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            مشخصات
          </h3>
          <button
            type="button"
            onClick={addSpecification}
            className="flex items-center gap-1.5 text-sm bg-violet-500 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            افزودن مشخصه
          </button>
        </div>

        <div className="space-y-3">
          {specifications.length === 0 ? (
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4 bg-black/5 dark:bg-white/5 rounded-2xl">
              هیچ مشخصه‌ای اضافه نشده است. (مانند وزن، ابعاد، رنگ، جنس و ...)
            </div>
          ) : (
            specifications.map((spec, index) => (
              <div
                key={spec.id}
                className="flex items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-2xl relative group"
              >
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.name}
                    onChange={(e) =>
                      updateSpecification(index, "name", e.target.value)
                    }
                    placeholder="نام مشخصه (مثال: وزن)"
                    className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      updateSpecification(index, "value", e.target.value)
                    }
                    placeholder={
                      spec.name?.includes("وزن")
                        ? "مقدار (مثال: ۱.۵ کیلوگرم)"
                        : spec.name?.includes("طول") || spec.name?.includes("عرض") || spec.name?.includes("ارتفاع")
                        ? "مقدار (مثال: ۲۰ سانتی‌متر)"
                        : "مقدار"
                    }
                    className="w-full bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSpecification(index)}
                  className="text-red-500 hover:bg-red-500/10 p-2 rounded-xl transition-colors"
                  title="حذف مشخصه"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
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
          ) : isEditing ? (
            "ذخیره تغییرات"
          ) : (
            "افزودن محصول"
          )}
        </button>
      </div>
    </form>
  );
}
