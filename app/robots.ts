import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dataproflow.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/dashboard/',
          '/api/',
          '/auth/',
          '/account-suspended',
          '/setup-admin',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
