import { OuvrierDetailPage } from "@/features/ouvriers/components/OuvrierDetailPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OuvrierDetailRoute({ params }: PageProps) {
  const { id } = await params;
  return <OuvrierDetailPage ouvrierID={id} />;
}
