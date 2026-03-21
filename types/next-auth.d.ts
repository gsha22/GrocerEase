import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
    };
    storeId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    ownerId: string;
    storeId: string | null;
  }
}
