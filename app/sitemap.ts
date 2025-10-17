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
