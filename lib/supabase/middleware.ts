import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env vars in middleware:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
    });
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public dashboard view paths (guest access for generated dashboards)
  const publicDashboardPaths = ["/dashboard/view"];
  const isPublicDashboardPath = publicDashboardPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Protected routes (excluding public dashboard view)
  const protectedPaths = ["/dashboard", "/admin"];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  ) && !isPublicDashboardPath;

  // Admin routes
  const adminPaths = ["/admin"];
  const isAdminPath = adminPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Auth routes (redirect if already logged in)
  const authPaths = ["/login", "/signup"];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedPath && !user) {
    // Redirect to login if trying to access protected route without auth
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  if (isProtectedPath && user) {
    // Check if user is active
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    // Check if user is inactive (not admin path check)
    if (profile && profile.is_active === false && !isAdminPath) {
      // Redirect inactive users to account suspended page
      const url = request.nextUrl.clone();
      url.pathname = "/account-suspended";
      return NextResponse.redirect(url);
    }

    // Check admin access
    if (isAdminPath) {
      if (!profile || profile.role !== "admin") {
        // Redirect non-admin users to dashboard
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }
    }

    // Redirect admin users from /dashboard to /admin
    if (request.nextUrl.pathname.startsWith("/dashboard") && profile?.role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      return NextResponse.redirect(url);
    }
  }

  if (isAuthPath && user) {
    // Check if user is admin and redirect accordingly
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const url = request.nextUrl.clone();
    url.pathname = profile?.role === "admin" ? "/admin" : "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
