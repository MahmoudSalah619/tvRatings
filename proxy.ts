import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Auth is hidden for now, so only refresh sessions on auth-related routes.
  // When the auth UI is enabled site-wide, widen this to all pages, e.g.
  // "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"
  matcher: ["/login", "/signup", "/account/:path*", "/auth/:path*"],
};
