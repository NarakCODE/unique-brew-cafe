"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  className?: string;
}

export function LanguageSelector({ className }: LanguageSelectorProps) {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleLanguageChange = (nextLocale: string) => {
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={isPending}>
          <Image
            src={locale === "kh" ? "/kh.png" : "/en.png"}
            alt={locale}
            width={24}
            height={24}
            className="rounded-full object-cover border"
          />
          <span className="sr-only">Toggle language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLanguageChange("en")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Image
              src="/en.png"
              alt="English"
              width={20}
              height={20}
              className="rounded-sm object-cover border"
            />
            <span>English</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLanguageChange("kh")}
          className="cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Image
              src="/kh.png"
              alt="Khmer"
              width={20}
              height={20}
              className="rounded-sm object-cover border"
            />
            <span>Khmer</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
