"use client";

import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import {
  Search,
  LayoutPanelLeft,
  LayoutDashboard,
  Package,
  Store,
  Users,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  Megaphone,
  LifeBuoy,
  Tag,
  Shield,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  User,
  Bell,
  Link2,
  Palette,
  Home,
  CupSoda,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex h-full w-full flex-col overflow-hidden rounded-xl bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Input
    ref={ref}
    className={cn(
      "flex h-12 w-full border-none bg-transparent px-4 py-3 text-[17px] outline-none placeholder:text-zinc-500 dark:placeholder:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 mb-4",
      className
    )}
    {...props}
  />
));
CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "max-h-[400px] overflow-y-auto overflow-x-hidden pb-2",
      className
    )}
    {...props}
  />
));
CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="flex h-12 items-center justify-center text-sm text-zinc-500 dark:text-zinc-400"
    {...props}
  />
));
CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden px-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-zinc-500 dark:[&_[cmdk-group-heading]]:text-zinc-400 [&:not(:first-child)]:mt-2",
      className
    )}
    {...props}
  />
));
CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex h-12 cursor-pointer select-none items-center gap-2 rounded-lg px-4 text-sm text-zinc-700 dark:text-zinc-300 outline-none transition-colors data-[disabled=true]:pointer-events-none data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800 data-[selected=true]:text-zinc-900 dark:data-[selected=true]:text-zinc-100 data-[disabled=true]:opacity-50 [&+[cmdk-item]]:mt-1",
      className
    )}
    {...props}
  />
));
CommandItem.displayName = CommandPrimitive.Item.displayName;

interface SearchItem {
  title: string;
  url: string;
  group: string;
  icon?: LucideIcon;
}

interface CommandSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandSearch({ open, onOpenChange }: CommandSearchProps) {
  const router = useRouter();
  const commandRef = React.useRef<HTMLDivElement>(null);
  const t = useTranslations("Sidebar");

  const searchItems: SearchItem[] = [
    { title: "Home", url: "/", group: t("Pages"), icon: Home },
    // Dashboards
    {
      title: t("Dashboard1"),
      url: "/dashboard",
      group: t("Dashboards"),
      icon: LayoutDashboard,
    },
    {
      title: t("Dashboard2"),
      url: "/dashboard-2",
      group: t("Dashboards"),
      icon: LayoutPanelLeft,
    },

    // Apps
    { title: t("Products"), url: "/products", group: t("Apps"), icon: Package },
    { title: t("Stores"), url: "/stores", group: t("Apps"), icon: Store },
    { title: t("Categories"), url: "/categories", group: t("Apps"), icon: Tag },
    { title: t("Users"), url: "/users", group: t("Apps"), icon: Users },
    {
      title: t("Announcements"),
      url: "/announcements",
      group: t("Apps"),
      icon: Megaphone,
    },
    { title: t("Support"), url: "/support", group: t("Apps"), icon: LifeBuoy },
    { title: "Mail", url: "/mail", group: t("Apps"), icon: Mail },
    { title: "Tasks", url: "/tasks", group: t("Apps"), icon: CheckSquare },
    { title: "Chat", url: "/chat", group: t("Apps"), icon: MessageCircle },
    { title: "Calendar", url: "/calendar", group: t("Apps"), icon: Calendar },

    // Auth Pages
    { title: t("SignIn1"), url: "/sign-in", group: t("AuthPages"), icon: Shield },
    { title: t("SignIn3"), url: "/sign-in-3", group: t("AuthPages"), icon: Shield },
    { title: t("SignUp1"), url: "/sign-up", group: t("AuthPages"), icon: Shield },
    { title: t("SignUp3"), url: "/sign-up-3", group: t("AuthPages"), icon: Shield },
    {
      title: t("ForgotPassword1"),
      url: "/forgot-password",
      group: t("AuthPages"),
      icon: Shield,
    },
    {
      title: t("ForgotPassword2"),
      url: "/forgot-password-2",
      group: t("AuthPages"),
      icon: Shield,
    },
    {
      title: t("ForgotPassword3"),
      url: "/forgot-password-3",
      group: t("AuthPages"),
      icon: Shield,
    },
    { title: "Verify OTP", url: "/verify-otp", group: t("AuthPages"), icon: Shield },
    {
      title: "Register Success",
      url: "/register-success",
      group: t("AuthPages"),
      icon: Shield,
    },

    // Errors
    {
      title: t("Unauthorized"),
      url: "/errors/unauthorized",
      group: t("Errors"),
      icon: AlertTriangle,
    },
    {
      title: t("Forbidden"),
      url: "/errors/forbidden",
      group: t("Errors"),
      icon: AlertTriangle,
    },
    {
      title: t("NotFound"),
      url: "/errors/not-found",
      group: t("Errors"),
      icon: AlertTriangle,
    },
    {
      title: t("InternalServerError"),
      url: "/errors/internal-server-error",
      group: t("Errors"),
      icon: AlertTriangle,
    },
    {
      title: t("UnderMaintenance"),
      url: "/errors/under-maintenance",
      group: t("Errors"),
      icon: AlertTriangle,
    },

    // Settings
    {
      title: t("UserSettings"),
      url: "/settings/user",
      group: t("Settings"),
      icon: User,
    },
    {
      title: t("AccountSettings"),
      url: "/settings/account",
      group: t("Settings"),
      icon: Settings,
    },
    {
      title: t("PlansBilling"),
      url: "/settings/billing",
      group: t("Settings"),
      icon: CreditCard,
    },
    {
      title: t("Appearance"),
      url: "/settings/appearance",
      group: t("Settings"),
      icon: Palette,
    },
    {
      title: "Notifications",
      url: "/settings/notifications",
      group: t("Settings"),
      icon: Bell,
    },
    {
      title: t("Connections"),
      url: "/settings/connections",
      group: t("Settings"),
      icon: Link2,
    },

    // Pages
    { title: t("Landing"), url: "/landing", group: t("Pages"), icon: CupSoda },
    { title: "FAQs", url: "/faqs", group: t("Pages"), icon: HelpCircle },
    { title: t("Pricing"), url: "/pricing", group: t("Pages"), icon: CreditCard },
  ];

  const groupedItems = searchItems.reduce(
    (acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    },
    {} as Record<string, SearchItem[]>
  );

  const handleSelect = (url: string) => {
    router.push(url);
    onOpenChange(false);
    // Bounce effect like Vercel
    if (commandRef.current) {
      commandRef.current.style.transform = "scale(0.96)";
      setTimeout(() => {
        if (commandRef.current) {
          commandRef.current.style.transform = "";
        }
      }, 100);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 shadow-2xl border border-zinc-200 dark:border-zinc-800 max-w-[640px]">
        <DialogTitle className="sr-only">Command Search</DialogTitle>
        <Command
          ref={commandRef}
          className="transition-transform duration-100 ease-out"
        >
          <CommandInput placeholder="What do you need?" autoFocus />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            {Object.entries(groupedItems).map(([group, items]) => (
              <CommandGroup key={group} heading={group}>
                {items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.url}
                      value={item.title}
                      onSelect={() => handleSelect(item.url)}
                    >
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      {item.title}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1 relative w-full justify-start text-muted-foreground sm:pr-12 md:w-36 lg:w-56"
    >
      <Search className="mr-2 h-3.5 w-3.5" />
      <span className="hidden lg:inline-flex">Search...</span>
      <span className="inline-flex lg:hidden">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-4 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </button>
  );
}
