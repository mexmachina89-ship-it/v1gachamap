import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

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
