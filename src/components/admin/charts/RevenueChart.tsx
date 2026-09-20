"use client";

import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getRevenueData } from "@/actions/analytics";
import { Loader2 } from "lucide-react";

export function RevenueChart({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [days, setDays] = useState<7 | 30>(7);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Only fetch if it's not the initial load for 7 days
    if (days === 7 && data === initialData) return;
    
    let isMounted = true;
    
    const fetchNewData = async () => {
      setIsLoading(true);
      try {
        const newData = await getRevenueData(days);
        if (isMounted) {
          setData(newData);
        }
      } catch (error) {
        console.error("Failed to fetch revenue data", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    
    fetchNewData();
    
    return () => { isMounted = false; };
  }, [days, initialData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-[#1a1b26] border border-black/10 dark:border-white/10 p-3 rounded-xl shadow-xl">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
          <p className="text-violet-600 dark:text-violet-400 font-bold">
            {payload[0].value.toLocaleString()} تومان
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">نمودار درآمد</h3>
        
        {/* Toggle 7/30 Days */}
        <div className="bg-black/5 dark:bg-black/40 p-1 rounded-xl flex items-center">
          <button 
            onClick={() => setDays(7)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${days === 7 ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            ۷ روز گذشته
          </button>
          <button 
            onClick={() => setDays(30)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${days === 30 ? 'bg-white dark:bg-white/20 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}
          >
            ۳۰ روز گذشته
          </button>
        </div>
      </div>
      
      <div className="h-[300px] w-full relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
          </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-black/5 dark:text-white/5" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-gray-500"
              tickMargin={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-gray-500"
              tickFormatter={(value) => value === 0 ? '0' : `${(value / 1000).toLocaleString()}k`}
              width={60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
