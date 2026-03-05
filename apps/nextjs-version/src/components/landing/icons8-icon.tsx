import Image from "next/image";
import { cn } from "@/lib/utils";

export type Icons8Name =
  | "close"
  | "coffee"
  | "dice"
  | "facebook"
  | "gift"
  | "github"
  | "globe"
  | "heart"
  | "help"
  | "info"
  | "instagram"
  | "leaf"
  | "lightning"
  | "linkedin"
  | "map-pin"
  | "menu"
  | "moon"
  | "palette"
  | "quote"
  | "right"
  | "rotate-left"
  | "search"
  | "settings"
  | "shield"
  | "shopping-cart"
  | "smartphone"
  | "star"
  | "store"
  | "sun"
  | "twitter-x"
  | "upload"
  | "users"
  | "dashboard"
  | "chevron-down"
  | "food"
  | "clock"
  | "external-link";

const ICONS8_IDS: Record<Icons8Name, string> = {
  close: "46",
  coffee: "26396",
  dice: "569",
  facebook: "118468",
  gift: "338",
  github: "v551nqGeHhGn",
  globe: "3685",
  heart: "87",
  help: "646",
  info: "CWiCmUhQTh3E",
  instagram: "32292",
  leaf: "794",
  lightning: "6703",
  linkedin: "447",
  "map-pin": "ceFLHm7XVrUw",
  menu: "fBAfR7rUd6zP",
  moon: "25031",
  palette: "25729",
  quote: "902",
  right: "355",
  "rotate-left": "7342",
  search: "132",
  settings: "BYnvGv84C52t",
  shield: "852",
  "shopping-cart": "Ot2P5D5MPltM",
  smartphone: "11409",
  star: "104",
  store: "77121",
  sun: "648",
  "twitter-x": "6Fsj3rv2DCmG",
  upload: "368",
  users: "21995",
  dashboard: "6690",
  "chevron-down": "40026",
  food: "2470",
  clock: "423",
  "external-link": "742",
};

interface Icons8IconProps {
  name: Icons8Name;
  size?: number;
  className?: string;
  alt?: string;
}

export function Icons8Icon({
  name,
  size = 16,
  className,
  alt = "",
}: Icons8IconProps) {
  return (
    <Image
      src={`https://img.icons8.com/?id=${ICONS8_IDS[name]}&format=png&size=24`}
      alt={alt}
      width={size}
      height={size}
      className={cn("inline-block shrink-0 dark:invert", className)}
      aria-hidden={alt ? undefined : true}
    />
  );
}
