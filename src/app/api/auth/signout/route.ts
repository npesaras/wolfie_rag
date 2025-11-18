import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST() {
  const { userId } = await auth();

  if (!userId) {
    // User is not logged in, redirect to login page
    return NextResponse.json({ redirectUrl: "/login" });
  }

  // Clerk handles sign out on the client side
  // Just return the redirect URL
  return NextResponse.json({ redirectUrl: "/login" });
}

export async function GET() {
  // Also handle GET requests and redirect to login
  return NextResponse.redirect(
    new URL("/login", process.env.NEXT_PUBLIC_APP_URL),
  );
}
