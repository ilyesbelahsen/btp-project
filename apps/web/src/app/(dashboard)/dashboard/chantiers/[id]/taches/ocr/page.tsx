import { OcrImportPage } from "@/features/chantier/components/OcrImportPage";

export const metadata = { title: "Import OCR — BTP Manager" };

export default async function OcrImportRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OcrImportPage chantierId={id} />;
}
