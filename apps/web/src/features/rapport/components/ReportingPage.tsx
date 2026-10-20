"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Document, Page, StyleSheet, Text, View, pdf } from "@react-pdf/renderer";
import { Download, Save, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useReporting,
  useUpdateCapitalInitial,
} from "@/features/rapport/reporting.hooks";
import type {
  ReportingChantier,
  ReportingGlobal,
} from "@/features/rapport/reporting.types";
import { cn } from "@/lib/utils";

type ReportingPreset = "semaine" | "mois" | "annee" | "personnalisee";

function formatMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const parsedDate = new Date(
    value.includes("T") ? value : `${value}T12:00:00`,
  );
  if (Number.isNaN(parsedDate.getTime())) return "Date invalide";
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

function dateValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getPresetDates(preset: ReportingPreset) {
  const today = new Date();
  const end = new Date(today);
  const start = new Date(today);
  if (preset === "semaine") {
    const day = start.getDay() || 7;
    start.setDate(start.getDate() - day + 1);
  } else if (preset === "mois") {
    start.setDate(1);
  } else if (preset === "annee") {
    start.setMonth(0, 1);
  }
  return { dateFrom: dateValue(start), dateTo: dateValue(end) };
}

function statusLabel(status: string): string {
  return {
    EN_COURS: "En cours",
    TERMINE: "Terminé",
    EN_PAUSE: "En pause",
    ANNULE: "Annulé",
  }[status] ?? status;
}

function ReportPdfDocument({ report }: { report: ReportingGlobal }) {
  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.title}>Rapport d&apos;activité BTP</Text>
        <Text style={pdfStyles.subtitle}>
          Du {formatDate(report.dateFrom)} au {formatDate(report.dateTo)}
        </Text>
        <View style={pdfStyles.kpis}>
          <Text style={pdfStyles.kpi}>Entrées: {formatMoney(report.totalEntrees)}</Text>
          <Text style={pdfStyles.kpi}>Sorties: {formatMoney(report.totalSorties)}</Text>
          <Text style={pdfStyles.kpi}>Trésorerie finale: {formatMoney(report.tresorerieFinale)}</Text>
        </View>
        <Text style={pdfStyles.section}>Répartition des sorties</Text>
        <Text style={pdfStyles.line}>Main-d&apos;œuvre interne: {formatMoney(report.coutMainOeuvre)}</Text>
        <Text style={pdfStyles.line}>Sous-traitance: {formatMoney(report.coutSousTraitance)}</Text>
        <Text style={pdfStyles.line}>Matériaux: {formatMoney(report.coutMateriaux)}</Text>
        <Text style={pdfStyles.line}>Autres dépenses: {formatMoney(report.coutAutres)}</Text>
        <Text style={pdfStyles.section}>Chantiers concernés</Text>
        {report.chantiers.map((chantier) => (
          <View key={chantier.id} style={pdfStyles.chantier}>
            <Text style={pdfStyles.chantierTitle}>
              {chantier.name} - {statusLabel(chantier.status)}
            </Text>
            <Text style={pdfStyles.line}>
              Période: {formatDate(chantier.startDate)} au {chantier.endDate ? formatDate(chantier.endDate) : "en cours"}
            </Text>
            <Text style={pdfStyles.line}>
              Main-d&apos;œuvre {formatMoney(chantier.coutMainOeuvre)} | Sous-traitance {formatMoney(chantier.coutSousTraitance)} | Matériaux {formatMoney(chantier.coutMateriaux)} | Total {formatMoney(chantier.coutTotal)}
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

const pdfStyles = StyleSheet.create({
  page: { padding: 36, color: "#292524", fontSize: 10 },
  title: { fontSize: 22, marginBottom: 6, fontWeight: 700 },
  subtitle: { color: "#78716c", marginBottom: 20 },
  kpis: { flexDirection: "row", gap: 10, marginBottom: 18 },
  kpi: { backgroundColor: "#f5f5f4", padding: 10, flexGrow: 1 },
  section: { fontSize: 14, fontWeight: 700, marginTop: 14, marginBottom: 8 },
  line: { marginBottom: 4 },
  chantier: { borderBottom: "1 solid #d6d3d1", paddingBottom: 8, marginBottom: 8 },
  chantierTitle: { fontWeight: 700, marginBottom: 4 },
});

function Kpi({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{label}</p>
      <p className={cn("mt-2 text-xl font-semibold tabular-nums", tone === "positive" && "text-emerald-700", tone === "negative" && "text-red-700")}>{value}</p>
    </div>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-100 py-2 text-sm last:border-0">
      <span className="text-stone-600">{label}</span>
      <span className="font-semibold tabular-nums text-stone-900">{formatMoney(value)}</span>
    </div>
  );
}

function ReportTable({ chantiers }: { chantiers: ReportingChantier[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white shadow-sm">
      <table className="w-full min-w-[780px] text-sm">
        <thead className="bg-stone-100 text-left text-xs font-semibold uppercase tracking-wider text-stone-500">
          <tr>
            <th className="px-4 py-3">Chantier</th>
            <th className="px-4 py-3">Statut</th>
            <th className="px-4 py-3 text-right">Main-d&apos;œuvre</th>
            <th className="px-4 py-3 text-right">Sous-traitance</th>
            <th className="px-4 py-3 text-right">Matériaux</th>
            <th className="px-4 py-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {chantiers.map((chantier) => (
            <tr key={chantier.id} className="border-t border-stone-100">
              <td className="px-4 py-3 font-medium text-stone-900">{chantier.name}</td>
              <td className="px-4 py-3 text-stone-600">{statusLabel(chantier.status)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(chantier.coutMainOeuvre)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(chantier.coutSousTraitance)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{formatMoney(chantier.coutMateriaux)}</td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatMoney(chantier.coutTotal)}</td>
            </tr>
          ))}
          {!chantiers.length && (
            <tr><td colSpan={6} className="px-4 py-8 text-center text-stone-500">Aucun chantier sur cette période.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function ReportingPage() {
  const initialDates = getPresetDates("mois");
  const [preset, setPreset] = useState<ReportingPreset>("mois");
  const [dateFrom, setDateFrom] = useState(initialDates.dateFrom);
  const [dateTo, setDateTo] = useState(initialDates.dateTo);
  const [chantierId, setChantierId] = useState("all");
  const [capitalDraft, setCapitalDraft] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const periode = useMemo(() => ({ dateFrom, dateTo, ...(chantierId !== "all" ? { chantierId } : {}) }), [chantierId, dateFrom, dateTo]);
  const { data: report, isLoading, isError } = useReporting(periode);
  const updateCapital = useUpdateCapitalInitial();
  const capitalValue = capitalDraft ?? String(report?.capitalInitial ?? 0);

  const changePreset = (value: ReportingPreset) => {
    setPreset(value);
    if (value !== "personnalisee") {
      const dates = getPresetDates(value);
      setDateFrom(dates.dateFrom);
      setDateTo(dates.dateTo);
    }
  };

  const saveCapital = () => {
    const value = Number(capitalValue);
    if (!Number.isFinite(value) || value < 0) return;
    updateCapital.mutate(value, { onSuccess: () => setCapitalDraft(null) });
  };

  const exportPdf = async () => {
    if (!report) return;
    setExporting(true);
    try {
      const blob = await pdf(<ReportPdfDocument report={report} />).toBlob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `rapport_${report.dateFrom}_${report.dateTo}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] bg-stone-50/70 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col justify-between gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Pilotage financier</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950">Reporting entreprise</h1>
            <p className="mt-1.5 text-sm text-stone-500">Trésorerie, dépenses et activité des chantiers sur la période sélectionnée.</p>
          </div>
          <Button variant="outline" onClick={() => void exportPdf()} disabled={!report || exporting}>
            <Download /> {exporting ? "Génération..." : "Exporter le PDF"}
          </Button>
        </div>

        <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm" aria-label="Filtres du reporting">
          <div className="grid gap-4 md:grid-cols-4 md:items-end">
            <label className="text-xs font-medium text-stone-600">Période
              <select className="mt-1 block h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm font-normal text-stone-800" value={preset} onChange={(event) => changePreset(event.target.value as ReportingPreset)}>
                <option value="semaine">Cette semaine</option><option value="mois">Ce mois</option><option value="annee">Cette année</option><option value="personnalisee">Personnalisée</option>
              </select>
            </label>
            <label className="text-xs font-medium text-stone-600">Du<Input type="date" className="mt-1" value={dateFrom} onChange={(event) => { setPreset("personnalisee"); setDateFrom(event.target.value); }} /></label>
            <label className="text-xs font-medium text-stone-600">Au<Input type="date" className="mt-1" value={dateTo} onChange={(event) => { setPreset("personnalisee"); setDateTo(event.target.value); }} /></label>
            <label className="text-xs font-medium text-stone-600">Chantier
              <select className="mt-1 block h-9 w-full rounded-md border border-stone-200 bg-white px-2 text-sm font-normal text-stone-800" value={chantierId} onChange={(event) => setChantierId(event.target.value)}>
                <option value="all">Tous les chantiers</option>
                {report?.chantiers.map((chantier) => <option key={chantier.id} value={chantier.id}>{chantier.name}</option>)}
              </select>
            </label>
          </div>
        </section>

        {isError && <p className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">Impossible de charger le reporting.</p>}
        {isLoading && <p className="rounded-lg border border-stone-200 bg-white p-8 text-center text-sm text-stone-500">Chargement du reporting...</p>}
        {report && !isLoading && (
          <>
            <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Kpi label="Capital initial" value={formatMoney(report.capitalInitial)} />
              <Kpi label="Entrées" value={formatMoney(report.totalEntrees)} tone="positive" />
              <Kpi label="Sorties" value={formatMoney(report.totalSorties)} tone="negative" />
              <Kpi label="Trésorerie finale" value={formatMoney(report.tresorerieFinale)} tone={report.tresorerieFinale >= 0 ? "positive" : "negative"} />
            </section>

            <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.8fr)]">
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between"><div><h2 className="font-semibold text-stone-900">Entrées et sorties</h2><p className="text-xs text-stone-500">Évolution quotidienne de la période</p></div><WalletCards className="size-5 text-orange-600" /></div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%"><BarChart data={report.serie} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" /><XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 11 }} /><YAxis tickFormatter={(value: number) => `${value} €`} tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => formatMoney(typeof value === "number" ? value : Number(value) || 0)} labelFormatter={(value) => formatDate(String(value))} /><Legend /><Bar dataKey="entrees" name="Entrées" fill="#059669" radius={[3, 3, 0, 0]} /><Bar dataKey="sorties" name="Sorties" fill="#ea580c" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer>
                </div>
              </div>
              <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><h2 className="mb-3 font-semibold text-stone-900">Répartition des sorties</h2><CostLine label="Main-d&apos;œuvre interne" value={report.coutMainOeuvre} /><CostLine label="Sous-traitance" value={report.coutSousTraitance} /><CostLine label="Matériaux" value={report.coutMateriaux} /><CostLine label="Autres" value={report.coutAutres} /><CostLine label="Total" value={report.coutTotal} /></div>
            </section>

            <section className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"><div className="mb-3 flex items-center justify-between"><div><h2 className="font-semibold text-stone-900">Capital initial</h2><p className="text-xs text-stone-500">Base de calcul de la trésorerie de la période.</p></div><div className="flex items-center gap-2"><Input type="number" min="0" step="0.01" value={capitalValue} onChange={(event) => setCapitalDraft(event.target.value)} className="w-36 text-right" /><Button onClick={saveCapital} disabled={updateCapital.isPending || capitalDraft === null}><Save /> Enregistrer</Button></div></div>{updateCapital.isError && <p className="text-xs text-red-700">Le capital initial n&apos;a pas pu être enregistré.</p>}</section>

            <section><div className="mb-3"><h2 className="font-semibold text-stone-900">Chantiers concernés</h2><p className="text-xs text-stone-500">Chantiers commencés, terminés ou actifs pendant la période.</p></div><ReportTable chantiers={report.chantiers} /></section>
          </>
        )}
      </div>
    </div>
  );
}