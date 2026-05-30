"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import { Menu, X, Globe, User, LogOut, TrendingUp, Map, Search, Heart } from "lucide-react";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  const otherLocale = locale === "ja" ? "en" : "ja";
  const switchLocale = () => {
    const newPath = pathname.replace(`/${locale}`, `/${otherLocale}`);
    router.push(newPath);
  };

  const navLinks = [
    { href: `/${locale}`, label: t("home"), icon: null },
    { href: `/${locale}/search`, label: t("search"), icon: <Search size={16} /> },
    { href: `/${locale}/map`, label: t("map"), icon: <Map size={16} /> },
    { href: `/${locale}/ranking`, label: t("ranking"), icon: <TrendingUp size={16} /> },
    ...(session ? [{ href: `/${locale}/mypage`, label: "マイページ", icon: <Heart size={16} /> }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b-4 border-pink-400 shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-2">
          <span className="text-2xl">🎰</span>
          <span className="font-black text-xl bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
            GachaMap
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-1 px-3 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-pink-50 hover:text-pink-600 transition-colors"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={switchLocale}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold border-2 border-purple-400 text-purple-600 hover:bg-purple-50 transition-colors"
          >
            <Globe size={14} />
            {otherLocale.toUpperCase()}
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                <User size={14} className="inline mr-1" />
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                <LogOut size={14} />
                {t("signout")}
              </button>
            </div>
          ) : (
            <>
              <Link
                href={`/${locale}/auth/signin`}
                className="px-4 py-1.5 rounded-full text-sm font-bold border-2 border-pink-400 text-pink-600 hover:bg-pink-50 transition-colors"
              >
                {t("signin")}
              </Link>
              <Link
                href={`/${locale}/auth/signup`}
                className="px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:opacity-90 transition-opacity"
              >
                {t("signup")}
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-pink-50"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-pink-100 px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:bg-pink-50"
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
          <hr className="border-pink-100" />
          <button
            onClick={() => { switchLocale(); setMenuOpen(false); }}
            className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-purple-600"
          >
            <Globe size={16} /> {otherLocale === "ja" ? "日本語" : "English"}に切り替え
          </button>
          {session ? (
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-500"
            >
              <LogOut size={16} /> {t("signout")}
            </button>
          ) : (
            <div className="flex gap-2">
              <Link href={`/${locale}/auth/signin`} onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-full text-sm font-bold border-2 border-pink-400 text-pink-600">
                {t("signin")}
              </Link>
              <Link href={`/${locale}/auth/signup`} onClick={() => setMenuOpen(false)}
                className="flex-1 text-center px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-pink-500 to-purple-500 text-white">
                {t("signup")}
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
