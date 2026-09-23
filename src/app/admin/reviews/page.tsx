import { db } from "@/prisma/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReviewList } from "@/components/admin/ReviewList";
import { ReviewFilters } from "@/components/admin/ReviewFilters";
import { or } from "@prisma/orm-postgres/orm-client";
import { canManageStore } from "@/lib/permissions";

export const metadata = {
  title: "مدیریت نظرات | پنل ادمین EXTIM",
};

export default async function AdminReviewsPage(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const session = await getSession();
  if (!session || !canManageStore(session.role as string)) {
    redirect("/login");
  }

  const searchParams = await props.searchParams;
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams?.status === "string" ? searchParams.status : undefined;
  const rating = typeof searchParams?.rating === "string" ? searchParams.rating : undefined;
  const verified = typeof searchParams?.verified === "string" ? searchParams.verified : undefined;

  let query = db.orm.public.Review
    .include("user")
    .include("product")
    .include("votes")
    .orderBy((r) => r.createdAt.desc());

  if (q) {
    const matchingUserIds = (await db.orm.public.User
      .where(u => or(u.name.ilike(`%${q}%`), u.email.ilike(`%${q}%`)))
      .select("id")
      .all()).map(u => u.id);
      
    const matchingProductIds = (await db.orm.public.Product
      .where(p => p.name.ilike(`%${q}%`))
      .select("id")
      .all()).map(p => p.id);

    query = query.where((r) => {
      const conditions = [r.comment.ilike(`%${q}%`)];
      if (matchingUserIds.length > 0) conditions.push(r.userId.in(matchingUserIds));
      if (matchingProductIds.length > 0) conditions.push(r.productId.in(matchingProductIds));
      
      if (conditions.length === 1) return conditions[0];
      return or(conditions[0], conditions[1], ...conditions.slice(2));
    });
  }
  
  if (status === "unanswered") {
    query = query.where((r) => r.adminReply.isNull());
  } else if (status === "answered") {
    query = query.where((r) => r.adminReply.isNotNull());
  }
  
  if (rating) {
    const rInt = parseInt(rating);
    if (!isNaN(rInt)) {
      query = query.where({ rating: rInt });
    }
  }
  
  if (verified === "true") {
    query = query.where({ isVerifiedBuyer: true });
  } else if (verified === "false") {
    query = query.where({ isVerifiedBuyer: false });
  }

  const reviews = await query.all();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">مدیریت نظرات کاربران</h1>
      </div>

      <ReviewFilters />
      <ReviewList initialReviews={reviews} />
    </div>
  );
}
