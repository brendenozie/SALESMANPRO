import { MetadataRoute } from 'next'
import siteMetadata from '@/data/siteMetadata'
import { last } from 'lodash'

export const dynamic = 'force-static'

const allBlogs = [
  {
    path: 'blog/my-first-post',
    date: '2023-01-01',
    draft: false,
    lastmod: '2023-06-15',
  },
  {
    path: 'blog/my-second-post',
    date: '2023-01-02',
    draft: true,
    lastmod: null,
  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = siteMetadata.siteUrl

  const blogRoutes = allBlogs
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${siteUrl}/${post.path}`,
      lastModified: post.lastmod || post.date,
    }))

  const routes = ['', 'blog', 'projects', 'tags'].map((route) => ({
    url: `${siteUrl}/${route}`,
    lastModified: new Date().toISOString().split('T')[0],
  }))

  return [...routes, ...blogRoutes]
}

// app/sitemap.ts
// import { MetadataRoute } from 'next';
// import siteMetadata from '@/data/siteMetadata';
// // Import your actual fetcher that returns all active store slugs/data
// // import { getAllActiveStores } from '@/lib/company-fetcher'; 

// // Revalidate once a day (86400 seconds) to pick up new stores automatically
// export const revalidate = 86400;

// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const siteUrl = siteMetadata.siteUrl;

//   // 1. Core Static Routes
//   const staticRoutes = ['', 'about', 'contact'].map((route) => ({
//     url: `${siteUrl}${route === '' ? '' : `/${route}`}`,
//     lastModified: new Date().toISOString(),
//     changeFrequency: 'daily' as const,
//     priority: route === '' ? 1.0 : 0.8,
//   }));

//   // 2. Fetch Dynamic Tenant/Store Routes
//   // This should be a lightweight Prisma query selecting ONLY the slug and updatedAt fields
//   const activeStores = await getAllActiveStores(); 
  
//   const storeRoutes = activeStores.map((store) => ({
//     // Ensure this matches the public-facing URL structure (e.g., site.com/slug)
//     url: `${siteUrl}/${store.slug}`, 
//     lastModified: store.updatedAt ? new Date(store.updatedAt).toISOString() : new Date().toISOString(),
//     changeFrequency: 'weekly' as const,
//     priority: 0.9, // High priority for marketplace profiles
//   }));

//   return [...staticRoutes, ...storeRoutes];
// }