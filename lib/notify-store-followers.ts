import {
  AlertType,
  Prisma,
  ShopperNotificationKind,
} from "@/app/generated/prisma/client";
import { prisma } from "@/lib/prisma";

function formatPrice(price: Prisma.Decimal | null): string | null {
  if (price == null) return null;
  const n = Number(price);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/**
 * Fan-out in-app notifications to shoppers with an active store_follow for this store.
 * Errors are logged; callers should not fail the owner action if this fails.
 */
export async function notifyStoreFollowersOfFreshUpdate(params: {
  storeId: string;
  storeName: string;
  freshUpdateId: string;
  itemName: string;
  note: string | null;
}) {
  try {
    const followers = await prisma.alert.findMany({
      where: {
        type: AlertType.store_follow,
        storeId: params.storeId,
        isActive: true,
      },
      select: { shopperId: true },
      distinct: ["shopperId"],
    });
    if (followers.length === 0) return;

    const title = `Fresh update · ${params.storeName}`;
    const trimmedNote = params.note?.trim();
    const body =
      trimmedNote && trimmedNote.length > 0
        ? `${params.itemName} — ${trimmedNote}`
        : params.itemName;

    await prisma.shopperNotification.createMany({
      data: followers.map((f) => ({
        shopperId: f.shopperId,
        kind: ShopperNotificationKind.store_fresh_update,
        sourceId: params.freshUpdateId,
        storeId: params.storeId,
        title,
        body,
      })),
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("notifyStoreFollowersOfFreshUpdate:", e);
  }
}

export async function notifyStoreFollowersOfNewDeal(params: {
  storeId: string;
  storeName: string;
  dealId: string;
  dealTitle: string;
  price: Prisma.Decimal | null;
}) {
  try {
    const followers = await prisma.alert.findMany({
      where: {
        type: AlertType.store_follow,
        storeId: params.storeId,
        isActive: true,
      },
      select: { shopperId: true },
      distinct: ["shopperId"],
    });
    if (followers.length === 0) return;

    const priceLabel = formatPrice(params.price);
    const title = `New deal · ${params.storeName}`;
    const body = priceLabel
      ? `${params.dealTitle} · ${priceLabel}`
      : params.dealTitle;

    await prisma.shopperNotification.createMany({
      data: followers.map((f) => ({
        shopperId: f.shopperId,
        kind: ShopperNotificationKind.store_new_deal,
        sourceId: params.dealId,
        storeId: params.storeId,
        title,
        body,
      })),
      skipDuplicates: true,
    });
  } catch (e) {
    console.error("notifyStoreFollowersOfNewDeal:", e);
  }
}
