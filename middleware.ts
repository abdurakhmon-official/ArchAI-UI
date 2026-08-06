import {NextResponse, NextRequest} from "next/server";

const protectedRoutes = ["/dashboard", "/tests", "/profile", "/results", "/settings"];

export function middleware(req: NextRequest) {
    const token = req.cookies.get("token")?.value;
    const {pathname} = req.nextUrl;

    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected && !token) {
        const loginUrl = new URL("/login", req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/tests/:path*", "/profile/:path*", "/results/:path*", "/settings/:path*"],
};