import ImportLeadsClient from "./ImportLeadsClient";

interface LeadsPageProps {
  params: { slug: string };
}

export default function ImportLeadsPage({ params }: LeadsPageProps) {
  return <ImportLeadsClient companyId={params.slug} />;
}
