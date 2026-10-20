import { DepensesPage } from "@/features/depense/components/DepensesPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChantierDepensesPage({ params }: PageProps) {
  const { id } = await params;
  return <DepensesPage chantierId={id} />;
}
