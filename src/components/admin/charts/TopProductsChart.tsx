"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1b26] border border-black/10 dark:border-white/10 p-3 rounded-xl shadow-xl">
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{label}</p>
        <p className="text-blue-600 dark:text-blue-400 font-bold">
          {payload[0].value.toLocaleString()} عدد فروخته شده
        </p>
      </div>
    );
  }
  return null;
};

export function TopProductsChart({ data }: { data: any[] }) {


  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  return (
    <div className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-3xl p-6 backdrop-blur-md h-full">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">پرفروش‌ترین محصولات</h3>
      
      <div className="h-[300px] w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            هنوز محصولی فروخته نشده است.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-black/5 dark:text-white/5" />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
                className="text-gray-500"
              />
              <YAxis 
                dataKey="name" 
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11 }}
                className="text-gray-600 dark:text-gray-400"
                width={90}
                tickFormatter={(value) => value.length > 12 ? value.substring(0, 12) + '...' : value}
              />
              <Tooltip cursor={{ fill: 'currentColor', opacity: 0.05 }} content={<CustomTooltip />} />
              <Bar dataKey="sales" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
