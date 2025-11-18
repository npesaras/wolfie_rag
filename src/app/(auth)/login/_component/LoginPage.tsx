"use client";

import { SignIn } from "@clerk/nextjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

/**
 * Login page for the application with Clerk authentication
 */

export default function LoginPage() {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 py-16 bg-white">
      {/* Improved Dreamy Sky Gradient - Same as Homepage */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(circle at 30% 70%, rgba(173, 216, 230, 0.25), transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(255, 182, 193, 0.3), transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(240, 240, 255, 0.4), transparent 70%)`,
        }}
      />

      {/* Back to Home - Top Left Corner */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors z-20"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="hidden sm:inline">Back to Home</span>
      </Link>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-background rounded-lg shadow-lg",
              headerTitle: "text-2xl font-bold text-center",
              headerSubtitle: "text-muted-foreground text-sm text-center",
              socialButtonsBlockButton:
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
              socialButtonsBlockButtonText: "font-normal",
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:bg-primary/90",
              formFieldInput: "ring-foreground/15 border-transparent ring-1",
              footerActionLink: "text-foreground font-medium hover:underline",
              identityPreviewText: "text-muted-foreground",
              formFieldLabel: "text-sm",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground text-xs uppercase",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "top",
              socialButtonsVariant: "blockButton",
            },
          }}
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </section>
  );
}
