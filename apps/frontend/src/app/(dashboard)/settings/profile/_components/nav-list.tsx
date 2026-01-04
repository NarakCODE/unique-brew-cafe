"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export const linksData = [
    { title: "Profile", href: "/settings/profile" },
    { title: "Security", href: "/settings/security" },
    { title: "Notifications", href: "/settings/notifications" },
    { title: "Address", href: "/settings/address" },
    { title: "Payment", href: "/settings/payment" },
    { title: "Order History", href: "/settings/order-history" },
    { title: "Referral", href: "/settings/referral" },
    { title: "Logout", href: "/settings/logout" },
];

export function NavList() {
    const pathname = usePathname();

    return (
        <nav className="flex flex-wrap gap-4 text-sm text-muted-foreground md:flex-col">
            {linksData.map((link) => {
                const localizedPathname = link.href;

                return (
                    <Link
                        key={link.title}
                        href={localizedPathname}
                        className={cn(
                            pathname === localizedPathname &&
                                "font-semibold text-primary" // Highlight the current page
                        )}
                        aria-current={
                            pathname === localizedPathname ? "page" : undefined
                        }
                    >
                        {link.title}
                    </Link>
                );
            })}
        </nav>
    );
}
