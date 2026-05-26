// app/admin/[slug]/programs/page.tsx

import ProgramsClient from "./ProgramsClient";

interface PageProps {
  params: { slug: string };
}

export default function Page({ params }: PageProps) {
  return <ProgramsClient slug={params.slug} />;
}
