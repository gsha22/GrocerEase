import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export type ShopperAuthUser = {
  id: string;
  email: string;
  name: string;
};

/**
 * Validates email/password against shoppers (for Auth.js + tests).
 */
export async function authenticateShopper(
  email: string | undefined,
  password: string | undefined,
): Promise<ShopperAuthUser | null> {
  if (!email || !password) return null;

  const normalized = email.trim().toLowerCase();
  const shopper = await prisma.shopper.findUnique({
    where: { email: normalized },
  });

  if (!shopper) return null;

  const valid = await bcrypt.compare(password, shopper.passwordHash);
  if (!valid) return null;

  return {
    id: shopper.id,
    email: shopper.email,
    name: shopper.name,
  };
}
