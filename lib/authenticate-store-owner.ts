import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type StoreOwnerAuthUser = {
  id: string;
  email: string;
  name: string;
  storeId: string | null;
};

/**
 * Validates email/password against store_owners. Used by Auth.js authorize and tests.
 */
export async function authenticateStoreOwner(
  email: string | undefined,
  password: string | undefined
): Promise<StoreOwnerAuthUser | null> {
  if (!email || !password) return null;

  const normalized = email.trim().toLowerCase();
  const owner = await prisma.storeOwner.findUnique({
    where: { email: normalized },
    include: { store: { select: { id: true } } },
  });

  if (!owner) return null;

  const valid = await bcrypt.compare(password, owner.passwordHash);
  if (!valid) return null;

  return {
    id: owner.id,
    email: owner.email,
    name: owner.name,
    storeId: owner.store?.id ?? null,
  };
}
