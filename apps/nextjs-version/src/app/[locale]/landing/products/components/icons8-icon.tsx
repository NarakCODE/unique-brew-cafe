import Image from "next/image";

type Icons8Name =
  | "search"
  | "coffee"
  | "close"
  | "chevron-left"
  | "chevron-right"
  | "sparkles"
  | "fire"
  | "clock"
  | "external-link"
  | "line-chart"
  | "star"
  | "tag"
  | "warning"
  | "dollar";

const ICONS8_URLS: Record<Icons8Name, string> = {
  search: "https://img.icons8.com/?id=132&format=png&size=24",
  coffee: "https://img.icons8.com/?id=1150&format=png&size=24",
  close: "https://img.icons8.com/?id=46&format=png&size=24",
  "chevron-left": "https://img.icons8.com/?id=40024&format=png&size=24",
  "chevron-right": "https://img.icons8.com/?id=40022&format=png&size=24",
  sparkles: "https://img.icons8.com/?id=0O4DSMrBu10j&format=png&size=24",
  fire: "https://img.icons8.com/?id=3104&format=png&size=24",
  clock: "https://img.icons8.com/?id=34&format=png&size=24",
  "external-link": "https://img.icons8.com/?id=742&format=png&size=24",
  "line-chart": "https://img.icons8.com/?id=90&format=png&size=24",
  star: "https://img.icons8.com/?id=104&format=png&size=24",
  tag: "https://img.icons8.com/?id=119&format=png&size=24",
  warning: "https://img.icons8.com/?id=360&format=png&size=24",
  dollar: "https://img.icons8.com/?id=7172&format=png&size=24",
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
      src={ICONS8_URLS[name]}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block shrink-0 dark:invert ${className ?? ""}`}
      aria-hidden={alt ? undefined : true}
    />
  );
}
