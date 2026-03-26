import { inferDealTitleEmoji } from "@/lib/categories";
import { formatExpiry, formatPriceUsd, isUrgent, urgentLabel } from "@/lib/deals";

export interface DealData {
  id: string;
  title: string;
  description: string | null;
  price?: string | null;
  expiresAt: string;
  storeName?: string;
}

interface Props {
  deal: DealData;
  showStore?: boolean;
}

export default function DealCard({ deal, showStore = false }: Props) {
  const urgent = isUrgent(deal.expiresAt);
  const priceLabel = formatPriceUsd(deal.price ?? null);

  return (
    <div className="flex gap-3.5 p-3.5 bg-amber-50 rounded-xl border border-amber-100 mb-2.5 last:mb-0">
      <span className="text-[22px]">{inferDealTitleEmoji(deal.title)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="font-semibold text-[15px] text-gray-800">
            {deal.title}
            {priceLabel && (
              <span className="ml-2 text-green-700 font-bold tabular-nums">
                {priceLabel}
              </span>
            )}
          </div>
          {urgent && (
            <span className="bg-red-50 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0">
              {urgentLabel(deal.expiresAt)}
            </span>
          )}
        </div>
        {deal.description && (
          <div className="text-[13px] text-gray-600 mt-0.5">
            {deal.description}
          </div>
        )}
        {showStore && deal.storeName && (
          <div className="text-[13px] text-gray-600 mt-0.5">
            {deal.storeName}
          </div>
        )}
        <div className="text-[12px] text-amber-400 font-medium mt-1">
          {formatExpiry(deal.expiresAt)}
        </div>
      </div>
    </div>
  );
}
