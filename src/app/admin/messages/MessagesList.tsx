"use client";

import { useState } from "react";
import { markMessageAsRead, deleteMessage } from "@/actions/contact";
import { MailOpen, Trash2, CheckCircle2, User, Clock } from "lucide-react";
import toast from "react-hot-toast";

interface Message {
  id: string;
  name: string;
  contact: string;
  subject: string;
  message: string;
  userId: string | null;
  isRead: boolean;
  createdAt: string | Date;
}

const SUBJECT_LABELS: Record<string, string> = {
  support: "پشتیبانی و پیگیری سفارش",
  sales: "مشاوره پیش از خرید",
  complaint: "انتقادات و شکایات",
  partnership: "همکاری با ما",
};

export function MessagesList({ initialMessages, isSuperAdmin }: { initialMessages: Message[], isSuperAdmin: boolean }) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);

  const handleMarkAsRead = async (id: string) => {
    const prev = [...messages];
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
    
    const res = await markMessageAsRead(id);
    if (!res.success) {
      toast.error("خطا در تغییر وضعیت پیام");
      setMessages(prev); // Revert
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پیام مطمئن هستید؟")) return;
    
    const prev = [...messages];
    setMessages(msgs => msgs.filter(m => m.id !== id));
    
    const res = await deleteMessage(id);
    if (!res.success) {
      toast.error("خطا در حذف پیام");
      setMessages(prev); // Revert
    } else {
      toast.success("پیام حذف شد");
    }
  };

  if (messages.length === 0) {
    return (
      <div className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
        <MailOpen className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">صندوق پیام‌ها خالی است</h3>
        <p className="text-gray-500 dark:text-gray-400">هیچ پیامی از سوی کاربران ارسال نشده است.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`relative p-6 rounded-3xl border transition-all duration-300 ${
            msg.isRead 
              ? "bg-white/50 dark:bg-white/5 border-black/5 dark:border-white/5 opacity-80" 
              : "bg-white dark:bg-[#1a1b26] border-teal-200 dark:border-teal-900/50 shadow-lg shadow-teal-500/5 dark:shadow-none"
          }`}
        >
          {/* Unread Badge */}
          {!msg.isRead && (
            <div className="absolute top-0 right-0 translate-x-2 -translate-y-2 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-[#1a1b26] animate-pulse"></div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            
            {/* Meta Info */}
            <div className="lg:w-1/4 space-y-4 border-l border-black/5 dark:border-white/5 pl-6 rtl:border-l-0 rtl:border-r rtl:pr-0 rtl:pl-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-bold text-gray-900 dark:text-white">{msg.name}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {msg.contact}
                </div>
                {msg.userId ? (
                  <span className="inline-block mt-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-lg font-bold">
                    کاربر عضو
                  </span>
                ) : (
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg">
                    مهمان
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">تاریخ ارسال:</span>
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {new Date(msg.createdAt).toLocaleDateString("fa-IR")} - {new Date(msg.createdAt).toLocaleTimeString("fa-IR", { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Message Content */}
            <div className="lg:w-3/4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-3 py-1 bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 rounded-full text-xs font-bold border border-teal-100 dark:border-teal-500/20">
                    {SUBJECT_LABELS[msg.subject] || msg.subject}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-loose whitespace-pre-line text-sm md:text-base">
                  {msg.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-black/5 dark:border-white/5">
                {!msg.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(msg.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-500/10 rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    علامت‌گذاری به عنوان خوانده شده
                  </button>
                )}
                
                {isSuperAdmin && (
                  <button
                    onClick={() => handleDelete(msg.id)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    حذف پیام
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
