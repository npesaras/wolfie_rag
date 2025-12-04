"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Archive, BookOpen, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export interface UserData {
  firstName: string | null;
  lastName: string | null;
  email: string;
  id: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: UserData;
}

export function DashboardSidebar({
  user,
}: {
  user?: DashboardLayoutProps["user"];
}) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Prospectus",
      url: "/prospectus",
      icon: BookOpen,
    },
    {
      title: "CCS Resources",
      url: "/knowledge-base",
      icon: Archive,
    },
    {
      title: "Ask Wolfie",
      url: "/wolfie",
      icon: MessageSquare,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <span className="font-semibold">CCS Hub</span>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.url || (item.url !== "/dashboard" && pathname.startsWith(item.url));
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    className={`h-12 px-4 text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary border-r-2 border-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Link href={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 w-full">
              {user && (
                <div className="px-2 py-2 text-sm">
                  <p className="font-medium truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
              <SignOutButton redirectUrl="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </SignOutButton>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardSidebar user={user} />
      <main className="flex h-screen w-full flex-col overflow-hidden">
        <div className="flex flex-shrink-0 items-center justify-between border-b p-4">
          <SidebarTrigger />
          <div className="text-sm text-muted-foreground">Dashboard</div>
        </div>
        <div className="flex-1 overflow-auto p-8">{children}</div>
      </main>
    </SidebarProvider>
  );
}
