import { prisma } from "@/lib/prisma";

const ONE_HOUR_MS = 60 * 60 * 1000;

/**
 * Marks past deals expired, then notifies owners once per deal when expiry is within 1 hour.
 * Invoked from `GET /api/deals/maintenance` (throttled), triggered on app load and optionally via UI.
 */
export async function runDealMaintenance(now = new Date()): Promise<{
  markedExpired: number;
  expiryNotifications: number;
}> {
  const expired = await prisma.deal.updateMany({
    where: {
      deletedAt: null,
      isExpired: false,
      expiresAt: { lte: now },
    },
    data: { isExpired: true },
  });

  const soon = await prisma.deal.findMany({
    where: {
      deletedAt: null,
      isExpired: false,
      expiryNotifiedAt: null,
      expiresAt: { gt: now, lte: new Date(now.getTime() + ONE_HOUR_MS) },
    },
    include: {
      store: { select: { ownerId: true } },
    },
  });

  let expiryNotifications = 0;

  for (const deal of soon) {
    const updated = await prisma.deal.updateMany({
      where: {
        id: deal.id,
        expiryNotifiedAt: null,
        isExpired: false,
      },
      data: { expiryNotifiedAt: now },
    });

    if (updated.count !== 1) continue;

    await prisma.ownerNotification.create({
      data: {
        ownerId: deal.store.ownerId,
        dealId: deal.id,
        kind: "deal_expiring_soon",
        message: `Your deal "${deal.title}" expires within one hour.`,
      },
    });
    expiryNotifications += 1;
  }

  return { markedExpired: expired.count, expiryNotifications };
}
