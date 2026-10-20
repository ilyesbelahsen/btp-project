import { TachesManagementPage } from "@/features/chantier/components/TachesManagementPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChantierTachesPage({ params }: PageProps) {
  const { id } = await params;
  return <TachesManagementPage chantierId={id} />;
}
