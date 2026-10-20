import { EditChantierPage } from "@/features/chantier/components/EditChantierPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChantierModifierPage({ params }: PageProps) {
  const { id } = await params;
  return <EditChantierPage chantierId={id} />;
}
