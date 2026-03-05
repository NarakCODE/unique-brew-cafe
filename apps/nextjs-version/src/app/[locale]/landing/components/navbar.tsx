"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { APP_NAME, ApplicationLogo } from "@/components/application-logo";
import { MegaMenu } from "@/components/landing/mega-menu";
import { Icons8Icon } from "@/components/landing/icons8-icon";
import { ModeToggle } from "@/components/mode-toggle";
import { useTheme } from "@/hooks/use-theme";

const navigationItems = [
  { name: "Home", href: "#hero" },
  { name: "Menu", href: "#pricing", hasMegaMenu: true },
  { name: "About", href: "#about" },
  { name: "Features", href: "#features" },
  { name: "Stores", href: "#stores" },
  { name: "FAQ", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

// Solutions menu items for mobile (renamed to menuItems)
const menuItems = [
  { title: "Our Menu" },
  { name: "Espresso Bar", href: "#pricing" },
  { name: "Tea & Refreshers", href: "#pricing" },
  { name: "Bakery & Food", href: "#pricing" },
  { title: "Experience" },
  { name: "Our Story", href: "#about" },
  { name: "Sustainability", href: "#" },
  { name: "Rewards", href: "#" },
  { title: "Support" },
  { name: "Store Locator", href: "#stores" },
  { name: "FAQs", href: "#faq" },
  { name: "Contact", href: "#contact" },
];

// Smooth scroll function
const smoothScrollTo = (targetId: string) => {
  if (targetId.startsWith("#")) {
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }
};

export function LandingNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [solutionsOpen, setSolutionsOpen] = useState(false);
  const { setTheme, theme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Link
            href="/landing"
            className="cursor-pointer"
          >
            <ApplicationLogo
              iconSize={32}
              name={APP_NAME}
              nameClassName="font-bold"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden xl:flex">
          <NavigationMenuList>
            {navigationItems.map((item) => (
              <NavigationMenuItem key={item.name}>
                {item.hasMegaMenu ? (
                  <>
                    <NavigationMenuTrigger className="bg-transparent hover:bg-transparent focus:bg-transparent data-[active]:bg-transparent data-[state=open]:bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary cursor-pointer">
                      {item.name}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <MegaMenu />
                    </NavigationMenuContent>
                  </>
                ) : (
                  <NavigationMenuLink
                    className="group inline-flex h-10 w-max items-center justify-center px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:text-primary focus:outline-none cursor-pointer"
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      if (item.href.startsWith("#")) {
                        smoothScrollTo(item.href);
                      } else {
                        window.location.href = item.href;
                      }
                    }}
                  >
                    {item.name}
                  </NavigationMenuLink>
                )}
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Desktop CTA */}
        <div className="hidden xl:flex items-center space-x-2">
          <ModeToggle variant="ghost" />
          <Button variant="ghost" asChild className="cursor-pointer">
            <Link href="/sign-in">Sign In</Link>
          </Button>
          <Button asChild className="cursor-pointer">
            <Link href="/auth/sign-up">
              <Icons8Icon name="shopping-cart" size={16} className="mr-2" />
              Order Online
            </Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Icons8Icon name="menu" size={20} />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:w-[400px] p-0 gap-0 [&>button]:hidden overflow-hidden flex flex-col"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <SheetHeader className="space-y-0 p-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <ApplicationLogo
                    iconSize={16}
                    name={APP_NAME}
                    iconWrapperClassName="p-2 bg-primary/10 rounded-lg"
                    nameClassName="text-lg font-semibold"
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setTheme(theme === "light" ? "dark" : "light")
                      }
                      className="cursor-pointer h-8 w-8"
                    >
                      <Icons8Icon
                        name="moon"
                        size={16}
                        className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                      />
                      <Icons8Icon
                        name="sun"
                        size={16}
                        className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsOpen(false)}
                      className="cursor-pointer h-8 w-8"
                    >
                      <Icons8Icon name="close" size={16} />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto">
                <nav className="p-6 space-y-1">
                  {navigationItems.map((item) => (
                    <div key={item.name}>
                      {item.hasMegaMenu ? (
                        <Collapsible
                          open={solutionsOpen}
                          onOpenChange={setSolutionsOpen}
                        >
                          <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer">
                            {item.name}
                            <Icons8Icon
                              name="chevron-down"
                              size={16}
                              className={`transition-transform ${solutionsOpen ? "rotate-180" : ""}`}
                            />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="pl-4 space-y-1">
                            {menuItems.map((solution, index) =>
                              solution.title ? (
                                <div
                                  key={`title-${index}`}
                                  className="px-4 mt-5 py-2 text-xs font-semibold text-muted-foreground/50 uppercase tracking-wider"
                                >
                                  {solution.title}
                                </div>
                              ) : (
                                <a
                                  key={solution.name}
                                  href={solution.href}
                                  className="flex items-center px-4 py-2 text-sm rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                                  onClick={(e) => {
                                    setIsOpen(false);
                                    if (solution.href?.startsWith("#")) {
                                      e.preventDefault();
                                      setTimeout(
                                        () => smoothScrollTo(solution.href),
                                        100
                                      );
                                    }
                                  }}
                                >
                                  {solution.name}
                                </a>
                              )
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ) : (
                        <a
                          href={item.href}
                          className="flex items-center px-4 py-3 text-base font-medium rounded-lg transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
                          onClick={(e) => {
                            setIsOpen(false);
                            if (item.href.startsWith("#")) {
                              e.preventDefault();
                              setTimeout(() => smoothScrollTo(item.href), 100);
                            }
                          }}
                        >
                          {item.name}
                        </a>
                      )}
                    </div>
                  ))}
                </nav>
              </div>

              {/* Footer Actions */}
              <div className="border-t p-6 space-y-4">
                {/* Primary Actions */}
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                    className="w-full cursor-pointer"
                  >
                    <Link href="/dashboard">
                      <Icons8Icon name="dashboard" size={16} />
                      Admin Dashboard
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                      className="cursor-pointer"
                    >
                      <Link href="/sign-in">Sign In</Link>
                    </Button>
                    <Button asChild size="lg" className="cursor-pointer">
                      <Link href="/auth/sign-up">Order Now</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
