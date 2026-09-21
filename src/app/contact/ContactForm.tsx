"use client";

import { useState, useRef, useEffect } from "react";
import { Send, CheckCircle2, ChevronDown, Check } from "lucide-react";
import { submitContactMessage } from "@/actions/contact";

const SUBJECT_OPTIONS = [
  { value: "support", label: "پشتیبانی و پیگیری سفارش" },
  { value: "sales", label: "مشاوره پیش از خرید" },
  { value: "complaint", label: "انتقادات و شکایات" },
  { value: "partnership", label: "همکاری با ما" },
];

interface ContactFormProps {
  initialName?: string;
  initialContact?: string;
}

export function ContactForm({ initialName = "", initialContact = "" }: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Form fields
  const [name, setName] = useState(initialName);
  const [contact, setContact] = useState(initialContact);
  const [message, setMessage] = useState("");
  
  // Custom dropdown states
  const [subject, setSubject] = useState("support");
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const subjectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (subjectRef.current && !subjectRef.current.contains(event.target as Node)) {
        setIsSubjectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
    
    const formData = new FormData();
    formData.append("name", name);
    formData.append("contact", contact);
    formData.append("subject", subject);
    formData.append("message", message);

    const result = await submitContactMessage(formData);

    setIsSubmitting(false);

    if (result.success) {
      setIsSubmitted(true);
      setName(initialName);
      setContact(initialContact);
      setMessage("");
      
      // Reset success state after 4 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 4000);
    } else {
      setErrorMsg(result.error || "مشکلی پیش آمد.");
    }
  };

  const currentSubjectLabel = SUBJECT_OPTIONS.find(o => o.value === subject)?.label || "موضوع پیام";

  return (
    <div className="bg-white/70 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-3xl p-8 md:p-12 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.03)] dark:shadow-none">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">فرم ارسال پیام</h2>
      
      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">نام و نام خانوادگی</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: علی رضایی"
              className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:text-white font-vazirmatn"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300">شماره تماس یا ایمیل</label>
            <input 
              type="text" 
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="جهت پاسخگویی به شما"
              className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:text-white font-vazirmatn text-left rtl:text-right"
            />
          </div>
        </div>

        <div className="space-y-2 relative" ref={subjectRef}>
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">موضوع پیام</label>
          <button
            type="button"
            onClick={() => setIsSubjectOpen(!isSubjectOpen)}
            className="w-full flex items-center justify-between px-5 py-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all text-gray-900 dark:text-white font-vazirmatn"
          >
            <span>{currentSubjectLabel}</span>
            <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isSubjectOpen ? "rotate-180" : ""}`} />
          </button>
          
          {isSubjectOpen && (
            <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden bg-white dark:bg-[#1a1b26] backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl dark:shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex flex-col py-2">
                {SUBJECT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setSubject(opt.value);
                      setIsSubjectOpen(false);
                    }}
                    className={`flex items-center justify-between w-full px-5 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/10 ${
                      subject === opt.value
                        ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-500/10"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {opt.label}
                    {subject === opt.value && <Check className="w-4 h-4 text-teal-500" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 dark:text-gray-300">متن پیام</label>
          <textarea 
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="پیام خود را اینجا بنویسید..."
            className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all dark:text-white font-vazirmatn resize-none"
          ></textarea>
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting || isSubmitted}
          className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
            isSubmitted 
              ? "bg-emerald-500 text-white shadow-emerald-500/25" 
              : "bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          ) : isSubmitted ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              پیام شما با موفقیت ارسال شد
            </>
          ) : (
            <>
              <Send className="w-5 h-5 rtl:rotate-180" />
              ارسال پیام
            </>
          )}
        </button>
      </form>
    </div>
  );
}
