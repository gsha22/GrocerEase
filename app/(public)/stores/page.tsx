import { redirect } from "next/navigation";

/** Browse all stores — same experience as the home page (`/`). */
export default function StoresIndexPage() {
  redirect("/");
}
