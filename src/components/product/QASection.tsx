"use client";

import { HelpCircle, User, ShieldCheck } from "lucide-react";
import { QuestionForm } from "./QuestionForm";
import { AnswerForm } from "./AnswerForm";

type QuestionData = {
  id: string;
  text: string;
  createdAt: string;
  user: { name: string | null };
  answers: {
    id: string;
    text: string;
    createdAt: string;
    isAdmin: boolean;
    user: { name: string | null };
  }[];
};

interface QASectionProps {
  productId: string;
  isLoggedIn: boolean;
  questions: QuestionData[];
}

export function QASection({ productId, isLoggedIn, questions }: QASectionProps) {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Questions List */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {questions && questions.length > 0 ? (
            questions.map((q) => (
              <div key={q.id} className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 rounded-2xl shadow-sm dark:shadow-none backdrop-blur-sm flex flex-col gap-4">
                {/* Question Header */}
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white">{q.user.name || "کاربر ناشناس"}</span>
                      <span className="text-xs text-gray-500 px-2 border-r border-gray-300 dark:border-gray-600">
                        {new Date(q.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                    <p className="text-gray-800 dark:text-gray-200 mt-2 font-medium leading-relaxed">{q.text}</p>
                    
                    {/* Reply Form Trigger */}
                    <AnswerForm questionId={q.id} isLoggedIn={isLoggedIn} />
                  </div>
                </div>

                {/* Answers List */}
                {q.answers.length > 0 && (
                  <div className="mt-2 flex flex-col gap-4 pl-4 sm:pl-12">
                    {q.answers.map((a) => (
                      <div key={a.id} className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5 flex gap-4 relative">
                        {/* Connecting Line */}
                        <div className="absolute -right-4 sm:-right-8 top-0 w-4 sm:w-8 h-8 border-r-2 border-b-2 border-gray-200 dark:border-white/10 rounded-br-xl"></div>
                        
                        <div className="w-8 h-8 rounded-full bg-white dark:bg-white/10 flex items-center justify-center flex-shrink-0 border border-gray-200 dark:border-white/10 z-10">
                          {a.isAdmin ? (
                            <ShieldCheck className="w-4 h-4 text-fuchsia-500" />
                          ) : (
                            <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="flex flex-col z-10">
                          <div className="flex items-center gap-2">
                            <span className={`font-bold text-sm ${a.isAdmin ? "text-fuchsia-600 dark:text-fuchsia-400" : "text-gray-900 dark:text-white"}`}>
                              {a.isAdmin ? "پاسخ فروشگاه" : (a.user.name || "کاربر")}
                            </span>
                            <span className="text-xs text-gray-500 px-2 border-r border-gray-300 dark:border-gray-600">
                              {new Date(a.createdAt).toLocaleDateString("fa-IR")}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 mt-1 text-sm leading-relaxed">{a.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm dark:shadow-none">
              <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400 font-medium">هنوز پرسشی برای این محصول ثبت نشده است. اولین نفر باشید!</p>
            </div>
          )}
        </div>
        
        {/* Ask Question Form */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <QuestionForm productId={productId} isLoggedIn={isLoggedIn} />
          </div>
        </div>
      </div>
    </div>
  );
}
