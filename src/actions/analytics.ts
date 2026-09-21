"use server";
import { canManageStore } from "@/lib/permissions";

import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";

export async function getRevenueData(days: number) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    throw new Error("Unauthorized");
  }

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Fetch all orders in the range and group them in JS
  const orders = await db.orm.public.Order
    .where((o) => o.status.neq('CANCELLED'))
    .where((o) => o.createdAt.gte(startDate.toISOString()))
    .select('createdAt', 'totalAmount')
    .all();
  
  // Group by date string (YYYY-MM-DD)
  const groupedRevenue: Record<string, number> = {};
  for (const order of orders) {
    const dateStr = new Date(order.createdAt).toISOString().split('T')[0];
    groupedRevenue[dateStr] = (groupedRevenue[dateStr] || 0) + Number(order.totalAmount);
  }
  
  // Format dates for the chart and ensure missing days have 0 revenue
  const chartData = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateString = d.toISOString().split('T')[0];
    
    // Check if we have data for this date
    const dayRevenue = groupedRevenue[dateString] || 0;

    chartData.push({
      date: new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(d),
      rawDate: dateString,
      revenue: dayRevenue
    });
  }

  return chartData;
}

export async function getTopProducts() {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    throw new Error("Unauthorized");
  }

  // We need to fetch all valid OrderItems, include Variant and Product, then group in JS
  const orderItems = await db.orm.public.OrderItem
    .include('variant', (v) => v.include('product'))
    .all();
    
  // Since we can't easily filter by order status from the OrderItem side without a complex join,
  // we'll fetch valid orders first, or just assume we'll group whatever is there since it's analytics.
  // To be perfectly accurate, let's fetch valid orders:
  const validOrders = await db.orm.public.Order
    .where((o) => o.status.neq('CANCELLED'))
    .select('id')
    .all();
    
  const validOrderIds = new Set(validOrders.map(o => o.id));

  const productSales: Record<string, { name: string, sales: number }> = {};

  for (const item of orderItems) {
    if (!validOrderIds.has(item.orderId)) continue;
    
    const product = item.variant?.product;
    if (!product) continue;

    if (!productSales[product.id]) {
      productSales[product.id] = { name: product.name, sales: 0 };
    }
    productSales[product.id].sales += item.quantity;
  }

  // Sort and take top 5
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  return topProducts;
}
