"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

type IconType =
  | LucideIcon
  | React.ReactElement
  | readonly (readonly [string, { readonly [key: string]: string | number }])[]; // Hugeicon object type from core-free-icons

export function NavMain({
  label,
  items,
}: {
  label: string;
  items: {
    title: string;
    url: string;
    icon?: IconType;
    isActive?: boolean;
    target?: string;
    items?: {
      title: string;
      url: string;
      isActive?: boolean;
    }[];
  }[];
}) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  // Check if any subitem is active to determine if parent should be open
  const shouldBeOpen = (item: (typeof items)[0]) => {
    if (item.isActive) return true;
    return item.items?.some((subItem) => pathname === subItem.url) || false;
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={shouldBeOpen(item)}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {item.items?.length ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredItem(item.title)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      {item.icon &&
                        (React.isValidElement(item.icon) ? (
                          // Case 1: It's a React element (animated icons)
                          <span className="shrink-0">
                            {React.cloneElement(
                              item.icon as React.ReactElement<{
                                animate?: boolean;
                              }>,
                              {
                                animate: hoveredItem === item.title,
                              },
                            )}
                          </span>
                        ) : typeof item.icon === "function" ? (
                          // Case 2: It's a Lucide icon component
                          <item.icon />
                        ) : (
                          // Case 3: It's a Hugeicon object
                          <HugeiconsIcon
                            icon={item.icon as any}
                            size={20}
                            strokeWidth={1.5}
                          />
                        ))}{" "}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className="cursor-pointer"
                            isActive={pathname === subItem.url}
                          >
                            <Link
                              href={subItem.url}
                              target={
                                item.title === "Auth Pages" ||
                                item.title === "Errors"
                                  ? "_blank"
                                  : undefined
                              }
                              rel={
                                item.title === "Auth Pages" ||
                                item.title === "Errors"
                                  ? "noopener noreferrer"
                                  : undefined
                              }
                            >
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className="cursor-pointer"
                  isActive={pathname === item.url}
                  onMouseEnter={() => setHoveredItem(item.title)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link href={item.url}>
                    {item.icon &&
                      (React.isValidElement(item.icon) ? (
                        React.cloneElement(
                          item.icon as React.ReactElement<{
                            animate?: boolean;
                          }>,
                          {
                            animate: hoveredItem === item.title,
                          },
                        )
                      ) : typeof item.icon === "function" ? (
                        <item.icon />
                      ) : (
                        <HugeiconsIcon
                          icon={item.icon as any}
                          size={20}
                          strokeWidth={1.5}
                        />
                      ))}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
