"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export function FlashSaleCountdown({ endTime, className = "" }: { endTime: Date | string, className?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const end = new Date(endTime).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)) + Math.floor(distance / (1000 * 60 * 60 * 24)) * 24,
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    };

    updateTimer(); // Initial call
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [endTime]);

  if (!timeLeft) return null; // Hydration guard

  return (
    <div className={`flex items-center gap-2 text-rose-500 font-medium bg-rose-500/10 px-3 py-1.5 rounded-full w-fit ${className}`}>
      <Clock className="w-4 h-4 animate-pulse" />
      <span className="text-sm" suppressHydrationWarning>
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
