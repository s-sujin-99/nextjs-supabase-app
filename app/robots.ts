import type { MetadataRoute } from "next";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 초대 링크(/join)와 이벤트 상세는 초대받은 사람만 봐야 하므로 색인에서 제외한다.
      disallow: [
        "/admin",
        "/join",
        "/events",
        "/profile",
        "/protected",
        "/auth",
      ],
    },
    sitemap: `${defaultUrl}/sitemap.xml`,
  };
}
