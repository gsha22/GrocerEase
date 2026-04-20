import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to GrocerEase as a neighbor saving favorite markets, or as a store team managing your listing.",
};

type SearchParams = { next?: string };

function safeNextPath(raw: string | undefined): string | undefined {
  if (!raw || !raw.startsWith("/")) return undefined;
  if (raw.startsWith("//")) return undefined;
  return raw;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const next = safeNextPath(sp.next);
  const shopperQs = next
    ? `?callbackUrl=${encodeURIComponent(next)}`
    : "?callbackUrl=%2F";
  const ownerQs = next
    ? `?callbackUrl=${encodeURIComponent(next)}`
    : "?callbackUrl=%2Fowner-dashboard";

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-8rem)] max-w-3xl flex-col justify-center px-4 py-12 sm:px-6">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
          GrocerEase
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
          How are you using GrocerEase?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-[15px] leading-relaxed text-stone-600">
          Pick the sign-in that matches you. Same app — neighbors browse and save shops; store
          teams manage what shoppers see.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <article className="flex flex-col rounded-2xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/90 via-white to-white p-6 shadow-sm ring-1 ring-emerald-900/[0.06] sm:p-7">
          <span className="text-2xl" aria-hidden>
            🧺
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold text-stone-900">
            Neighbors
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
            Save your go-to markets, follow restocks, and see updates — no cart, no checkout. Free
            account.
          </p>
          <Link
            href={`/shopper/login${shopperQs}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-emerald-700 px-4 py-3 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Sign in to save shops
          </Link>
          <Link
            href={`/shopper/signup${shopperQs}`}
            className="mt-2 text-center text-sm font-medium text-emerald-800 underline-offset-2 hover:underline"
          >
            Create a neighbor account
          </Link>
        </article>

        <article className="flex flex-col rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-900/[0.04] sm:p-7">
          <span className="text-2xl" aria-hidden>
            🏪
          </span>
          <h2 className="mt-3 font-display text-xl font-semibold text-stone-900">
            Store teams
          </h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
            Manage your published store, fresh posts, and deals for people nearby.
          </p>
          <Link
            href={`/login${ownerQs}`}
            className="mt-6 inline-flex w-full items-center justify-center rounded-xl border border-stone-300 bg-stone-50 px-4 py-3 text-center text-sm font-semibold text-stone-900 transition hover:bg-white"
          >
            Sign in to manage your store
          </Link>
          <Link
            href={`/signup${ownerQs}`}
            className="mt-2 text-center text-sm font-medium text-stone-600 underline-offset-2 hover:underline"
          >
            Register a store
          </Link>
        </article>
      </div>

      <p className="mt-8 text-center text-[13px] text-stone-500">
        Wrong choice? You can always sign out and return here — owner and neighbor accounts stay
        separate.
      </p>
    </div>
  );
}
