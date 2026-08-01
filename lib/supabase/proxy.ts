import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";

const protectedPaths = ["/dashboard", "/klanten", "/offertes", "/instellingen"];
const isProtectedPath = (pathname: string) => protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
const copyCookies = (from: NextResponse, to: NextResponse) => { from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie)); return to; };

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!isSupabaseConfigured()) {
    if (isProtectedPath(pathname)) return NextResponse.redirect(new URL("/login?error=config", request.url));
    return NextResponse.next({ request });
  }
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, { cookies: { getAll() { return request.cookies.getAll(); }, setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value)); response = NextResponse.next({ request }); cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)); } } });
  const { data: claims } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(claims);
  if (!isSignedIn && isProtectedPath(pathname)) return copyCookies(response, NextResponse.redirect(new URL("/login", request.url)));
  if (isSignedIn && pathname === "/login") return copyCookies(response, NextResponse.redirect(new URL("/dashboard", request.url)));
  return response;
}
