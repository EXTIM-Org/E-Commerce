"use client";

import { useState } from "react";
import { MessageSquare, HelpCircle, List } from "lucide-react";

interface InteractionTabsProps {
  reviewsContent: React.ReactNode;
  qaContent: React.ReactNode;
  specificationsContent?: React.ReactNode;
  reviewsCount: number;
  qaCount: number;
}

export function InteractionTabs({ reviewsContent, qaContent, specificationsContent, reviewsCount, qaCount }: InteractionTabsProps) {
  const [activeTab, setActiveTab] = useState<"reviews" | "qa" | "specs">("reviews");

  return (
    <div className="mt-24 max-w-7xl mx-auto border-t border-gray-200 dark:border-white/10 pt-12" id="interaction">
      {/* Tabs Header */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setActiveTab("reviews")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "reviews" 
              ? "bg-rose-500 text-white shadow-md shadow-rose-500/30" 
              : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          نظرات کاربران
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === "reviews" 
              ? "bg-white/20" 
              : "bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-300"
          }`}>
            {reviewsCount}
          </span>
        </button>
        
        <button
          onClick={() => setActiveTab("qa")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
            activeTab === "qa" 
              ? "bg-fuchsia-600 text-white shadow-md shadow-fuchsia-500/20" 
              : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          پرسش و پاسخ
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            activeTab === "qa" 
              ? "bg-white/20" 
              : "bg-gray-300 dark:bg-white/10 text-gray-700 dark:text-gray-300"
          }`}>
            {qaCount}
          </span>
        </button>

        {specificationsContent && (
          <button
            onClick={() => setActiveTab("specs")}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
              activeTab === "specs" 
                ? "bg-violet-600 text-white shadow-md shadow-violet-500/20" 
                : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
          >
            <List className="w-5 h-5" />
            مشخصات فنی
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-300">
        <div className={activeTab === "reviews" ? "block" : "hidden"}>
          {reviewsContent}
        </div>
        <div className={activeTab === "qa" ? "block" : "hidden"}>
          {qaContent}
        </div>
        {specificationsContent && (
          <div className={activeTab === "specs" ? "block" : "hidden"}>
            {specificationsContent}
          </div>
        )}
      </div>
    </div>
  );
}
