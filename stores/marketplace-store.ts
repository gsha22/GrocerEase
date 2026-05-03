"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { seedMarketplaceListings } from "@/lib/marketplace/seed-listings";
import type {
  MarketplaceListing,
  MarketplaceListingInput,
} from "@/lib/marketplace/types";

const BROADCAST_NAME = "grocerease-marketplace-v2";
const PERSIST_KEY = "grocerease-marketplace-v2";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `mp-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

type MarketplaceStore = {
  listings: MarketplaceListing[];
  addListing: (input: MarketplaceListingInput) => void;
  updateListing: (id: string, patch: Partial<MarketplaceListingInput>) => void;
  deleteListing: (id: string) => void;
};

let broadcast: BroadcastChannel | null = null;
let applyingRemote = false;

function getBroadcast(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!broadcast) {
    broadcast = new BroadcastChannel(BROADCAST_NAME);
    broadcast.onmessage = (event: MessageEvent<{ listings?: MarketplaceListing[] }>) => {
      const next = event.data?.listings;
      if (!Array.isArray(next)) return;
      applyingRemote = true;
      useMarketplaceStore.setState({ listings: next });
      queueMicrotask(() => {
        applyingRemote = false;
      });
    };
  }
  return broadcast;
}

function publishListings(listings: MarketplaceListing[]) {
  if (applyingRemote) return;
  getBroadcast()?.postMessage({ listings });
}

export const useMarketplaceStore = create<MarketplaceStore>()(
  persist(
    (set, get) => ({
      listings: seedMarketplaceListings,
      addListing: (input) => {
        const listing: MarketplaceListing = {
          ...input,
          id: newId(),
          updatedAt: new Date().toISOString(),
        };
        const listings = [listing, ...get().listings];
        set({ listings });
        publishListings(listings);
      },
      updateListing: (id, patch) => {
        const listings = get().listings.map((row) =>
          row.id === id
            ? {
                ...row,
                ...patch,
                id: row.id,
                updatedAt: new Date().toISOString(),
              }
            : row,
        );
        set({ listings });
        publishListings(listings);
      },
      deleteListing: (id) => {
        const listings = get().listings.filter((row) => row.id !== id);
        set({ listings });
        publishListings(listings);
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ listings: state.listings }),
    },
  ),
);
