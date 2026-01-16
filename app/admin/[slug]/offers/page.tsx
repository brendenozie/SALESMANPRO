// app/admin/[slug]/offers/page.tsx

import OffersClient from "./OffersClient";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return <OffersClient adminSlug={params.slug} />;
}
