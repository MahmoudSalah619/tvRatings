import { cacheLife } from "next/cache";

/**
 * Today's date as YYYY-MM-DD. Cached (hourly) because Cache Components forbids
 * reading the clock directly while prerendering a Server Component.
 */
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Date().toISOString().slice(0, 10);
}
