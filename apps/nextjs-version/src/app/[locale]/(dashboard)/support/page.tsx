import { redirect } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function SupportPage({ params }: Props) {
  const { locale } = await params;
  redirect({ href: "/support/tickets", locale });
}
