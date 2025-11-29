// import NextAuth from "next-auth";
// import authConfig from "@/auth.config";
// import { NextResponse } from "next/server";

// const { auth } = NextAuth(authConfig);

// export default auth(async (req) => {
//   // ✅ Always allow
//   return NextResponse.next();
// });

// export const config = {
//   matcher: [
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|mp4|mov|avi|mkv|webm|ogg|wav|mp3)).*)",
//     "/(api|trpc)(.*)",
//   ],
// };

// import NextAuth from "next-auth";
// import authConfig from "@/auth.config";
// import { NextResponse } from "next/server";

// const { auth } = NextAuth(authConfig);

// export default auth(async (req) => {
//   // ✅ Always allow
//   return NextResponse.next();
// });

// export const config = {
//   // Only run on specific protected routes
//   matcher: [
//     "/dashboard/:path*",
//     "/admin/:path*", 
//     "/profile/:path*"
//     // Add only the routes you actually want to protect
//   ],
// };



import { NextResponse, NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes 
  const publicRoutes = ['/login', '/register'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // 
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // if no token and trying to access protected route
  if (!token && !isPublicRoute) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    
    // Extra safety: Clear any remaining cookies
    response.cookies.delete('token');
    response.cookies.delete('adminToken');
    
    return response;
  }

  // For all other requests, ensure fresh cookie check
  const response = NextResponse.next();
  
  // Add cache control headers to prevent stale authentication state
  response.headers.set('Cache-Control', 'no-store, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};