"use client";

import * as React from "react";
import {
    BarChart3,
    Bell,
    Coffee,
    LayoutDashboard,
    LifeBuoy,
    Megaphone,
    Settings,
    ShoppingBag,
    Store,
    Tags,
    Users,
} from "lucide-react";
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
const items = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Stores",
        url: "/stores",
        icon: Store,
    },
    {
        title: "Categories",
        url: "/categories",
        icon: Tags,
    },
    {
        title: "Products",
        url: "/products",
        icon: Coffee,
    },
    {
        title: "Orders",
        url: "/orders",
        icon: ShoppingBag,
    },
    {
        title: "Users",
        url: "/users",
        icon: Users,
    },
    {
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
    },
    {
        title: "Notifications",
        url: "/notifications",
        icon: Bell,
    },
    {
        title: "Support",
        url: "/support",
        icon: LifeBuoy,
    },
    {
        title: "Reports",
        url: "/reports",
        icon: BarChart3,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
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
                                    <Coffee className="size-4" />
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
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                {/* User menu will be in the Header as per requirements, but we can put a footer here if needed */}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
