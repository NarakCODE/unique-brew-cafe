import type { Metadata } from "next";
import "@/app/globals.css";

import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";

import { ThemeProvider } from "@/components/theme-provider";
import { SidebarConfigProvider } from "@/contexts/sidebar-context";
import { ThemeManagerProvider } from "@/contexts/theme-manager-context";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { inter } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Shadcn Dashboard",
  description: "A dashboard built with Next.js and shadcn/ui",
};

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as "en" | "kh")) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <div className={`${inter.variable} ${inter.className} antialiased`}>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider defaultTheme="system" storageKey="nextjs-ui-theme">
          <ThemeManagerProvider>
            <QueryProvider>
              <SidebarConfigProvider>{children}</SidebarConfigProvider>
              <Toaster />
            </QueryProvider>
          </ThemeManagerProvider>
        </ThemeProvider>
      </NextIntlClientProvider>
    </div>
  );
}
