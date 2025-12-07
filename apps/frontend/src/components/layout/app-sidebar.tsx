"use client";

import * as React from "react";
// 1. Import the wrapper component
import { HugeiconsIcon } from "@hugeicons/react";
// 2. Import the specific icon definitions
import {
    Analytics01Icon, // Replaces BarChart3
    Notification03Icon, // Replaces Bell
    Coffee01Icon, // Replaces Coffee
    DashboardSquare02Icon, // Replaces LayoutDashboard
    CustomerSupportIcon, // Replaces LifeBuoy
    Megaphone01Icon, // Replaces Megaphone
    Settings01Icon, // Replaces Settings
    ShoppingBag01Icon, // Replaces ShoppingBag
    Store01Icon, // Replaces Store
    DiscountTag02Icon, // Replaces Tags
    UserGroupIcon, // Replaces Users
} from "@hugeicons/core-free-icons";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

// Menu items.
// Note: 'icon' is now the icon object, not a React Component
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: DashboardSquare02Icon,
    },
    {
        title: "Stores",
        url: "/stores",
        icon: Store01Icon,
    },
    {
        title: "Categories",
        url: "/categories",
        icon: DiscountTag02Icon,
    },
    {
        title: "Products",
        url: "/products",
        icon: Coffee01Icon,
    },
    {
        title: "Orders",
        url: "/orders",
        icon: ShoppingBag01Icon,
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
        title: "Notifications",
        url: "/notifications",
        icon: Notification03Icon,
    },
    {
        title: "Support",
        url: "/support",
        icon: CustomerSupportIcon,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: Analytics01Icon,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings01Icon,
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                    {/* Header Icon Implementation */}
                                    <HugeiconsIcon
                                        icon={Coffee01Icon}
                                        size={16}
                                        strokeWidth={2}
                                        className="text-primary-foreground"
                                    />
                                </div>
                                <div className="flex flex-col gap-0.5 leading-none">
                                    <span className="font-semibold">
                                        Corner Coffee
                                    </span>
                                    <span className="">Admin</span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={
                                            pathname === item.url ||
                                            pathname.startsWith(`${item.url}/`)
                                        }
                                        tooltip={item.title}
                                    >
                                        <Link href={item.url}>
                                            {/* Menu List Icon Implementation */}
                                            <HugeiconsIcon
                                                icon={item.icon}
                                                size={20} // Standard sidebar icon size
                                                strokeWidth={1.5}
                                            />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>{/* User menu placeholder */}</SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
