import { AffectationOuvriersPage } from "@/features/chantier/components/AffectationOuvriersPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChantierOuvriersPage({ params }: PageProps) {
  const { id } = await params;
  return <AffectationOuvriersPage chantierId={id} />;
}
