import { IndicateursChantierPage } from "@/features/rapport/components/IndicateursChantierPage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChantierIndicateursPage({ params }: PageProps) {
  const { id } = await params;
  return <IndicateursChantierPage chantierId={id} />;
}
