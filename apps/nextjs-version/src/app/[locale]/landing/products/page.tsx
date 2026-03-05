import type { Metadata } from "next";
import { LandingProductsContent } from "./landing-products-content";

export const metadata: Metadata = {
  title: "Our Menu | Unique Brew Café",
  description:
    "Explore our handcrafted coffees, teas, bakery items, and more. Find your perfect brew from our full menu.",
  openGraph: {
    title: "Our Menu | Unique Brew Café",
    description:
      "Explore our handcrafted coffees, teas, bakery items, and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Our Menu | Unique Brew Café",
    description:
      "Explore our handcrafted coffees, teas, bakery items, and more.",
  },
};

export default function LandingProductsPage() {
  return <LandingProductsContent />;
}
