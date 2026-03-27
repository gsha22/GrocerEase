import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
    storeId: string | null;
    /** Present on new sessions; missing tokens default to `"owner"` in the session callback. */
    role: "owner" | "shopper";
  }

  interface User {
    role?: "owner" | "shopper";
    storeId?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    storeId: string | null;
    role?: "owner" | "shopper";
  }
}
