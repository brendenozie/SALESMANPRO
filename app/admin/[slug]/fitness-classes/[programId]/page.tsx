import ProgramDetailsClient from "./ProgramDetailsClient";

interface PageProps {
  params: { slug: string; programId: string };
}

export default function Page({ params }: PageProps) {
  return <ProgramDetailsClient slug={params.slug} programId={params.programId} />;
}