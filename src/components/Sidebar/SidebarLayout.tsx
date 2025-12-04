"use client";

import { SignOutButton } from "@clerk/nextjs";
import { BookOpen, LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
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
      icon: BookOpen,
    },
    {
      title: "Ask Wolfie",
      url: "/wolfie",
      icon: MessageSquare,
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2 px-2">
          <span className="text-xl font-bold text-primary">Wolfie</span>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-medium text-muted-foreground px-4 py-2">Main</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) => {
              const isActive = pathname === item.url || pathname?.startsWith(item.url + "/");
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton 
                    asChild 
                    size="lg" 
                    isActive={isActive}
                    className="text-base font-medium transition-colors hover:bg-primary/10 hover:text-primary data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                  >
                    <Link href={item.url}>
                      <item.icon className="!h-5 !w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col gap-2 w-full">
              {user && (
                <div className="px-2 py-3 mb-2 rounded-lg bg-muted/50 border border-border/50">
                  <p className="font-semibold text-sm truncate text-foreground">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              )}
              <SignOutButton redirectUrl="/login">
                <Button
                  variant="outline"
                  className="w-full justify-start text-muted-foreground hover:text-primary hover:border-primary/50"
                >
                  <LogOut className="mr-2 h-4 w-4" />
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
