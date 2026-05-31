import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

const locales = ["ja", "en"];

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <Providers>
        <div lang={locale} className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="bg-white border-t-4 border-pink-200 py-6 text-center text-sm text-gray-500">
            <p className="font-bold text-pink-500">💊 GachaMap</p>
            <p className="mt-1">© 2026 GachaMap. All rights reserved.</p>
          </footer>
        </div>
      </Providers>
    </NextIntlClientProvider>
  );
}
