"use client";

import * as React from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { APP_NAME, ApplicationLogo } from "@/components/application-logo";

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
  PanelLeftIcon,
  Package01Icon,
  ShoppingBag02Icon,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("Sidebar");
  const { user } = useProfile();

  const data = {
    user: {
      name: APP_NAME,
      email: "store@example.com",
      avatar: "",
    },
    navGroups: [
      {
        label: t("Dashboards"),
        items: [
          {
            title: t("Dashboard1"),
            url: "/dashboard",
            icon: <LayoutDashboard animateOnHover />,
          },
          {
            title: t("Dashboard2"),
            url: "/dashboard-2",
            icon: PanelLeftIcon,
          },
        ],
      },
      {
        label: t("Apps"),
        items: [
          {
            title: t("Products"),
            url: "/products",
            icon: Package01Icon,
          },
          {
            title: t("Orders"),
            url: "/orders",
            icon: ShoppingBag02Icon,
          },
          {
            title: t("Stores"),
            url: "/stores",
            icon: Store03Icon,
          },
          {
            title: t("Categories"),
            url: "/categories",
            icon: ChartBarLineIcon,
          },
          {
            title: t("Users"),
            url: "/users",
            icon: UserGroupIcon,
          },
          {
            title: t("Announcements"),
            url: "/announcements",
            icon: Megaphone01Icon,
          },
          {
            title: t("Support"),
            url: "#",
            icon: HelpCircleIcon,
            items: [
              {
                title: t("Tickets"),
                url: "/support/tickets",
              },
              {
                title: t("FAQ"),
                url: "/support/faq",
              },
            ],
          },
        ],
      },
      {
        label: t("Pages"),
        items: [
          {
            title: t("Landing"),
            url: "/landing",
            target: "_blank",
            icon: Layout03Icon,
          },
          {
            title: t("AuthPages"),
            url: "#",
            icon: Shield02Icon,
            items: [
              {
                title: t("SignIn1"),
                url: "/sign-in",
              },
              {
                title: t("SignIn2"),
                url: "/sign-in-2",
              },
              {
                title: t("SignIn3"),
                url: "/sign-in-3",
              },
              {
                title: t("SignUp1"),
                url: "/sign-up",
              },
              {
                title: t("SignUp2"),
                url: "/sign-up-2",
              },
              {
                title: t("SignUp3"),
                url: "/sign-up-3",
              },
              {
                title: t("ForgotPassword1"),
                url: "/forgot-password",
              },
              {
                title: t("ForgotPassword2"),
                url: "/forgot-password-2",
              },
              {
                title: t("ForgotPassword3"),
                url: "/forgot-password-3",
              },
            ],
          },
          {
            title: t("Errors"),
            url: "#",
            icon: Alert02Icon,
            items: [
              {
                title: t("Unauthorized"),
                url: "/errors/unauthorized",
              },
              {
                title: t("Forbidden"),
                url: "/errors/forbidden",
              },
              {
                title: t("NotFound"),
                url: "/errors/not-found",
              },
              {
                title: t("InternalServerError"),
                url: "/errors/internal-server-error",
              },
              {
                title: t("UnderMaintenance"),
                url: "/errors/under-maintenance",
              },
            ],
          },
          {
            title: t("Settings"),
            url: "#",
            icon: Settings05Icon,
            items: [
              {
                title: t("UserSettings"),
                url: "/settings/user",
              },
              {
                title: t("AccountSettings"),
                url: "/settings/account",
              },
              {
                title: t("PlansBilling"),
                url: "/settings/billing",
              },
              {
                title: t("Appearance"),
                url: "/settings/appearance",
              },
              // {
              //   title: "Notifications",
              //   url: "/settings/notifications",
              // },
              {
                title: t("Connections"),
                url: "/settings/connections",
              },
            ],
          },
          {
            title: t("Pricing"),
            url: "/pricing",
            icon: CreditCardIcon,
          },
        ],
      },
    ],
  };

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
                <ApplicationLogo
                  className="w-full"
                  name={APP_NAME}
                  subtitle={t("AdminDashboard")}
                  iconSize={24}
                  iconWrapperClassName="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
                  iconClassName="text-current"
                  nameClassName="font-medium text-sm"
                  subtitleClassName="text-xs"
                />
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
