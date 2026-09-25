"use client";

import { useState, useTransition } from "react";
import { Ban, Edit3, MessageSquare, AlertTriangle, MessageCircle } from "lucide-react";
import { updateUserBanStatus, updateUserAdminNotes } from "@/actions/users";
import toast from "react-hot-toast";

export function UserCrmControls({ user }: { user: any }) {
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [banReason, setBanReason] = useState(user.banReason || "");
  const [adminNotes, setAdminNotes] = useState(user.adminNotes || "");

  const handleBanToggle = () => {
    startTransition(async () => {
      const res = await updateUserBanStatus(user.id, !user.isBanned, banReason);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success(user.isBanned ? "کاربر رفع مسدودیت شد" : "کاربر مسدود شد");
        setShowBanModal(false);
      }
    });
  };

  const handleSaveNotes = () => {
    startTransition(async () => {
      const res = await updateUserAdminNotes(user.id, adminNotes);
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("یادداشت ذخیره شد");
        setShowNotesModal(false);
      }
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-black/10 dark:border-white/10">
        {user.role !== "SUPER_ADMIN" && (
          <button
            onClick={() => setShowBanModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              user.isBanned 
              ? "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/20" 
              : "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40"
            }`}
          >
            <Ban className="w-4 h-4" />
            {user.isBanned ? "رفع مسدودی" : "مسدود کردن کاربر"}
          </button>
        )}

        <button
          onClick={() => setShowNotesModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/40 rounded-xl text-sm font-medium transition-colors"
        >
          <Edit3 className="w-4 h-4" />
          یادداشت ادمین
        </button>

        <button
          onClick={() => toast("این قابلیت در اتصال با پنل پیامکی فعال می‌شود", { icon: "📱" })}
          className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:hover:bg-amber-900/40 rounded-xl text-sm font-medium transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          ارسال پیامک
        </button>
      </div>

      {user.adminNotes && (
        <div className="mt-4 p-4 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl relative group">
          <div className="absolute top-4 left-4"><MessageSquare className="w-5 h-5 text-blue-300 dark:text-blue-700" /></div>
          <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-2">یادداشت داخلی (مدیریت)</h4>
          <p className="text-sm text-blue-800 dark:text-blue-400 whitespace-pre-wrap">{user.adminNotes}</p>
        </div>
      )}

      {user.isBanned && (
        <div className="mt-4 p-4 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-900 dark:text-red-300 mb-1">این کاربر مسدود شده است</h4>
            {user.banReason && <p className="text-sm text-red-800 dark:text-red-400">علت: {user.banReason}</p>}
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isPending && setShowNotesModal(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1b26] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4 dark:text-white">یادداشت داخلی برای کاربر</h3>
            <textarea
              className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 h-32 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:text-white"
              placeholder="نکاتی که فقط ادمین‌ها می‌بینند..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
            />
            <div className="flex gap-3 mt-4">
              <button disabled={isPending} onClick={handleSaveNotes} className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors">ذخیره یادداشت</button>
              <button disabled={isPending} onClick={() => setShowNotesModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">انصراف</button>
            </div>
          </div>
        </div>
      )}

      {showBanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isPending && setShowBanModal(false)}></div>
          <div className="relative bg-white dark:bg-[#1a1b26] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className={`text-lg font-bold mb-4 ${user.isBanned ? 'text-gray-900 dark:text-white' : 'text-red-600'}`}>
              {user.isBanned ? "رفع مسدودی کاربر" : "مسدود کردن کاربر"}
            </h3>
            
            {!user.isBanned && (
              <div className="mb-4">
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">علت مسدودی (اختیاری):</label>
                <input
                  type="text"
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
                  placeholder="مثلا: ثبت سفارشات فیک مکرر"
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                />
              </div>
            )}
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {user.isBanned ? "با این کار کاربر مجدداً قادر به خرید و ثبت تیکت خواهد بود." : "کاربر مسدود شده امکان ثبت سفارش یا تیکت جدید را نخواهد داشت."}
            </p>

            <div className="flex gap-3">
              <button disabled={isPending} onClick={handleBanToggle} className={`px-4 py-2 text-white rounded-xl text-sm font-medium transition-colors ${user.isBanned ? 'bg-gray-800 hover:bg-gray-900' : 'bg-red-500 hover:bg-red-600'}`}>
                {user.isBanned ? "تایید رفع مسدودی" : "اعمال مسدودی"}
              </button>
              <button disabled={isPending} onClick={() => setShowBanModal(false)} className="px-4 py-2 bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 rounded-xl text-sm font-medium transition-colors">انصراف</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
