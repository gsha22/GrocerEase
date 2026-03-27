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

async function activeStoreFollowShopperIds(storeId: string): Promise<string[]> {
  const rows = await prisma.alert.findMany({
    where: {
      type: AlertType.store_follow,
      storeId,
      isActive: true,
    },
    select: { shopperId: true },
    distinct: ["shopperId"],
  });
  return rows.map((r) => r.shopperId);
}

async function insertNotificationsForFollowers(
  storeId: string,
  kind: ShopperNotificationKind,
  sourceId: string,
  title: string,
  body: string | null,
  shopperIds: string[],
) {
  if (shopperIds.length === 0) return;
  await prisma.shopperNotification.createMany({
    data: shopperIds.map((shopperId) => ({
      shopperId,
      kind,
      sourceId,
      storeId,
      title,
      body,
    })),
    skipDuplicates: true,
  });
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
    const shopperIds = await activeStoreFollowShopperIds(params.storeId);
    const title = `Fresh update · ${params.storeName}`;
    const trimmedNote = params.note?.trim();
    const body =
      trimmedNote && trimmedNote.length > 0
        ? `${params.itemName} — ${trimmedNote}`
        : params.itemName;

    await insertNotificationsForFollowers(
      params.storeId,
      ShopperNotificationKind.store_fresh_update,
      params.freshUpdateId,
      title,
      body,
      shopperIds,
    );
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
    const shopperIds = await activeStoreFollowShopperIds(params.storeId);
    const priceLabel = formatPrice(params.price);
    const title = `New deal · ${params.storeName}`;
    const body = priceLabel
      ? `${params.dealTitle} · ${priceLabel}`
      : params.dealTitle;

    await insertNotificationsForFollowers(
      params.storeId,
      ShopperNotificationKind.store_new_deal,
      params.dealId,
      title,
      body,
      shopperIds,
    );
  } catch (e) {
    console.error("notifyStoreFollowersOfNewDeal:", e);
  }
}
