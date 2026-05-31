import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://gachamap.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/ja/auth/", "/en/auth/", "/ja/mypage", "/en/mypage"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
