// /server/lib/get-company-data.ts
import prisma from '@/server/db/prismadb';

export async function getCompanyData(
  slug: string, 
  requestedHost: string | null, 
  requestedSubdomain: string | null, 
  includeOptions: any // Pass your 'leanShellInclude' or 'pageDataInclude' object here
) {
  let raw = null;

  if (requestedHost) {
    const normalizedHost = requestedHost.replace(/^www\./, "").toLowerCase();
    raw = await prisma.company.findFirst({
      where: {
        OR: [
          { domain: normalizedHost },
          { domain: `www.${normalizedHost}` },
          { domain: `https://${normalizedHost}` },
          { domain: `https://www.${normalizedHost}` },
        ],
      },
      include: includeOptions,
    });
  }

  if (!raw && requestedSubdomain) {
    raw = await prisma.company.findFirst({
      where: { slug: requestedSubdomain },
      include: includeOptions,
    });
  }

  if (!raw) {
    raw = await prisma.company.findFirst({
      where: { slug: slug },
      include: includeOptions,
    });
  }

  return raw;
}