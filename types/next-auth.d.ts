import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "owner" | "shopper";
    storeId?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
    role: "owner" | "shopper";
    storeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "owner" | "shopper";
    ownerId?: string;
    shopperId?: string;
    storeId?: string | null;
  }
}
