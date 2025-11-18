import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/Sidebar/SidebarLayout";

/**
 * Dashboard layout - wraps all dashboard pages with sidebar
 */

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/login");
  }

  const clerkUser = await currentUser();

  // Transform Clerk user to match UserData interface
  const user = clerkUser
    ? {
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        id: clerkUser.id,
      }
    : undefined;

  return <DashboardLayout user={user}>{children}</DashboardLayout>;
}
