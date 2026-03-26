import { prisma } from "@/lib/prisma";

const activePublishedDealSelect = {
  id: true,
  title: true,
  description: true,
  price: true,
  discountPct: true,
  expiresAt: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
    },
  },
} as const;

/**
 * Active deals on published stores: not deleted, not expired, future expiry.
 * Same filter for `/api/deals` and the public `/deals` page.
 */
export async function findActivePublishedDeals(now = new Date()) {
  return prisma.deal.findMany({
    where: {
      deletedAt: null,
      isExpired: false,
      expiresAt: { gt: now },
      store: { isPublished: true },
    },
    orderBy: { expiresAt: "asc" },
    select: activePublishedDealSelect,
  });
}
