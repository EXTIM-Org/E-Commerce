import { getSession } from "@/lib/session";
import { db } from "@/prisma/db";
import { MapPin } from "lucide-react";
import { NewAddressForm } from "@/components/profile/NewAddressForm";
import { DeleteAddressButton } from "@/components/profile/DeleteAddressButton";

export default async function AddressesPage() {
  const session = await getSession();
  
  if (!session?.userId) return null;

  // Fetch addresses from DB
  const addresses = await db.orm.public.Address.where({ userId: session.userId as string })
    .orderBy((f) => f.createdAt.desc())
    .all();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white mb-2">آدرس‌های من</h1>
        <NewAddressForm />
      </div>
      
      {addresses.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center gap-4">
          <MapPin className="w-20 h-20 text-gray-500/50" />
          <h2 className="text-xl font-medium text-gray-300">هیچ آدرسی ثبت نشده است!</h2>
          <p className="text-gray-500 text-sm text-center">آدرس‌های شما در زمان تکمیل خرید به صورت خودکار در اینجا ذخیره می‌شوند.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden group hover:border-purple-500/30 transition-colors">
              
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">{address.title || "آدرس"}</span>
                </div>
                {address.isDefault && (
                  <span className="bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded text-xs">آدرس پیش‌فرض</span>
                )}
              </div>
              
              <p className="text-gray-400 text-sm leading-relaxed mt-2">
                {address.fullAddress}
              </p>

              <div className="flex items-center gap-4 mt-2 pt-4 border-t border-white/5 text-sm text-gray-500">
                {address.postalCode && (
                  <span>کد پستی: {address.postalCode}</span>
                )}
              </div>

              <DeleteAddressButton id={address.id} />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
