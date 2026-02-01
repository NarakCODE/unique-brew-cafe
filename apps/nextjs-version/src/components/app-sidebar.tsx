"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { Logo } from "@/components/logo";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard } from "./animate-ui/icons/layout-dashboard";
import { useProfile } from "@/hooks/use-profile";

// Import Hugeicons
import {
  DashboardBrowsingIcon,
  PanelLeftIcon,
  Package01Icon,
  Store03Icon,
  ChartBarLineIcon,
  UserGroupIcon,
  Megaphone01Icon,
  HelpCircleIcon,
  Shield02Icon,
  Alert02Icon,
  Settings05Icon,
  CreditCardIcon,
  Layout03Icon,
} from "@hugeicons/core-free-icons";

const data = {
  user: {
    name: "ShadcnStore",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Dashboards",
      items: [
        {
          title: "Dashboard 1",
          url: "/dashboard",
          icon: <LayoutDashboard animateOnHover />,
        },
        {
          title: "Dashboard 2",
          url: "/dashboard-2",
          icon: PanelLeftIcon,
        },
      ],
    },
    {
      label: "Apps",
      items: [
        {
          title: "Products",
          url: "/products",
          icon: Package01Icon,
        },
        {
          title: "Stores",
          url: "/stores",
          icon: Store03Icon,
        },
        {
          title: "Categories",
          url: "/categories",
          icon: ChartBarLineIcon,
        },
        {
          title: "Users",
          url: "/users",
          icon: UserGroupIcon,
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: Megaphone01Icon,
        },
        {
          title: "Support",
          url: "/support",
          icon: HelpCircleIcon,
        },
      ],
    },
    {
      label: "Pages",
      items: [
        {
          title: "Landing",
          url: "/landing",
          target: "_blank",
          icon: Layout03Icon,
        },
        {
          title: "Auth Pages",
          url: "#",
          icon: Shield02Icon,
          items: [
            {
              title: "Sign In 1",
              url: "/sign-in",
            },
            {
              title: "Sign In 2",
              url: "/sign-in-2",
            },
            {
              title: "Sign In 3",
              url: "/sign-in-3",
            },
            {
              title: "Sign Up 1",
              url: "/sign-up",
            },
            {
              title: "Sign Up 2",
              url: "/sign-up-2",
            },
            {
              title: "Sign Up 3",
              url: "/sign-up-3",
            },
            {
              title: "Forgot Password 1",
              url: "/forgot-password",
            },
            {
              title: "Forgot Password 2",
              url: "/forgot-password-2",
            },
            {
              title: "Forgot Password 3",
              url: "/forgot-password-3",
            },
          ],
        },
        {
          title: "Errors",
          url: "#",
          icon: Alert02Icon,
          items: [
            {
              title: "Unauthorized",
              url: "/errors/unauthorized",
            },
            {
              title: "Forbidden",
              url: "/errors/forbidden",
            },
            {
              title: "Not Found",
              url: "/errors/not-found",
            },
            {
              title: "Internal Server Error",
              url: "/errors/internal-server-error",
            },
            {
              title: "Under Maintenance",
              url: "/errors/under-maintenance",
            },
          ],
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings05Icon,
          items: [
            {
              title: "User Settings",
              url: "/settings/user",
            },
            {
              title: "Account Settings",
              url: "/settings/account",
            },
            {
              title: "Plans & Billing",
              url: "/settings/billing",
            },
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
            // {
            //   title: "Notifications",
            //   url: "/settings/notifications",
            // },
            {
              title: "Connections",
              url: "/settings/connections",
            },
          ],
        },
        {
          title: "Pricing",
          url: "/pricing",
          icon: CreditCardIcon,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useProfile();

  const displayUser = user
    ? {
        name: user.fullName,
        email: user.email,
        avatar: "",
      }
    : data.user;

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Logo size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">ShadcnStore</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* <SidebarNotification /> */}
        <NavUser user={displayUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
