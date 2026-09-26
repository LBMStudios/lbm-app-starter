"use client";

import { useMemo, useState } from "react";
import type { SurveyConfig } from "./interactive-survey";

export type Submission = {
  id: string;
  surveySlug: string;
  userData: {
    nombre?: string;
    email?: string;
    pais?: string;
    organizacion?: string;
    canal?: string;
    [key: string]: string | undefined;
  };
  answers: Record<string, string | number>;
  submittedAt: string;
};

export function SurveyResultsDashboard({
  survey,
  initialSubmissions,
}: {
  survey: SurveyConfig;
  initialSubmissions: Submission[];
}) {
  const [submissions] = useState<Submission[]>(initialSubmissions);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const sub of submissions) {
      if (sub.userData.pais) set.add(sub.userData.pais);
    }
    return Array.from(set).sort();
  }, [submissions]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      const matchesCountry =
        selectedCountry === "all" || sub.userData.pais === selectedCountry;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        (sub.userData.nombre && sub.userData.nombre.toLowerCase().includes(term)) ||
        (sub.userData.email && sub.userData.email.toLowerCase().includes(term)) ||
        (sub.userData.organizacion && sub.userData.organizacion.toLowerCase().includes(term));

      return matchesCountry && matchesSearch;
    });
  }, [submissions, searchTerm, selectedCountry]);

  // KPIs
  const totalCount = filteredSubmissions.length;

  const avgComercialScore = useMemo(() => {
    const scores = filteredSubmissions
      .map((s) => Number(s.answers.calificacion_comercial))
      .filter((score) => !isNaN(score) && score > 0);
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  }, [filteredSubmissions]);

  const avgCobranzasScore = useMemo(() => {
    const scores = filteredSubmissions
      .map((s) => Number(s.answers.calificacion_cobranzas))
      .filter((score) => !isNaN(score) && score > 0);
    if (scores.length === 0) return 0;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  }, [filteredSubmissions]);

  const autogestionPercent = useMemo(() => {
    if (filteredSubmissions.length === 0) return 0;
    const adopting = filteredSubmissions.filter((s) =>
      typeof s.answers.autogestion_portal === "string" &&
      s.answers.autogestion_portal.toLowerCase().includes("haciendo"),
    ).length;
    return Math.round((adopting / filteredSubmissions.length) * 100);
  }, [filteredSubmissions]);

  // Frequency breakdown
  const frequencyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const sub of filteredSubmissions) {
      const val = String(sub.answers.visita_frecuencia || "No especificado");
      counts[val] = (counts[val] || 0) + 1;
    }
    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percent: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
    }));
  }, [filteredSubmissions, totalCount]);

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return;

    const headers = [
      "ID",
      "Fecha",
      "Nombre",
      "Email",
      "Pais",
      "Organizacion",
      "Canal",
      "Frecuencia Visita",
      "Calificacion Comercial",
      "Autogestion Portal",
      "Mejoras Portal",
      "Calificacion Cobranzas",
      "Comentarios Finales",
    ];

    const rows = filteredSubmissions.map((s) => [
      s.id,
      new Date(s.submittedAt).toLocaleString(),
      `"${s.userData.nombre || ""}"`,
      `"${s.userData.email || ""}"`,
      `"${s.userData.pais || ""}"`,
      `"${s.userData.organizacion || ""}"`,
      `"${s.userData.canal || ""}"`,
      `"${s.answers.visita_frecuencia || ""}"`,
      s.answers.calificacion_comercial || "",
      `"${s.answers.autogestion_portal || ""}"`,
      `"${s.answers.mejoras_portal || ""}"`,
      s.answers.calificacion_cobranzas || "",
      `"${s.answers.comentarios_finales || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `respuestas_${survey.slug}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#001429] bg-gradient-to-b from-[#001e3d] to-[#001429] p-4 text-white md:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Top Bar Navigation & Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#00c4df]/30 bg-[#00c4df]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c4df]">
              <span>Analytics & Resultados</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
              {survey.title}
            </h1>
            <p className="text-sm text-slate-400">
              Dashboard de respuestas en tiempo real para Universal Assistance
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/survey/${survey.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-slate-200 transition-all hover:border-[#00c4df] hover:bg-white/10"
            >
              <span>Abrir Encuesta Pública</span>
              <svg className="h-4 w-4 text-[#00c4df]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <button
              onClick={exportToCSV}
              disabled={totalCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00528f] to-[#008091] px-5 py-2 text-xs font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-[#0060a8] hover:to-[#009bb0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Exportar a CSV</span>
            </button>
          </div>
        </div>

        {/* KPI Cards Grid */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Respuestas</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white">{totalCount}</span>
              <span className="text-xs text-emerald-400 font-medium">100% completadas</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Atención Comercial</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#00c4df]">{avgComercialScore}</span>
              <span className="text-xs text-amber-400 font-medium">★ de 5.0</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gestión Cobranzas</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-[#00e5ff]">{avgCobranzasScore}</span>
              <span className="text-xs text-amber-400 font-medium">★ de 5.0</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Uso de Autogestión</div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-400">{autogestionPercent}%</span>
              <span className="text-xs text-slate-400">ya emiten en portal</span>
            </div>
          </div>
        </div>

        {/* Charts & Distribution Section */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Frequency Breakdown Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h3 className="mb-4 text-base font-semibold text-white">
              Frecuencia Deseada de Visitas Comerciales
            </h3>
            <div className="flex flex-col gap-3">
              {frequencyStats.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>{item.label}</span>
                    <span className="font-semibold">{item.count} ({item.percent}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#00528f] to-[#00c4df]"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions & Integration Status */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <div>
              <h3 className="mb-2 text-base font-semibold text-white">
                Integración de Datos y Webhooks
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Todas las respuestas recibidas son procesadas por la API interna y pueden retransmitirse en tiempo real a una planilla de <strong>Google Sheets</strong> o guardarse en <strong>Supabase</strong> sin costo.
              </p>
            </div>

            <div className="mt-6 rounded-xl border border-[#00c4df]/20 bg-[#002447]/60 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#00c4df]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Conectar con Google Sheets</span>
              </div>
              <p className="mt-1 text-xs text-slate-300">
                Consulta la guía en <code className="text-[#00e5ff]">docs/GOOGLE_SHEETS_WEBHOOK.md</code> para copiar el script de recepción automática.
              </p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, email o agencia..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-400 outline-none transition-all focus:border-[#00c4df] focus:bg-[#002447]"
            />
            <svg className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">País:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#001e3d] px-3 py-2 text-xs text-white outline-none focus:border-[#00c4df]"
            >
              <option value="all">Todos los países ({submissions.length})</option>
              {countries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions Data Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-white/10 bg-white/5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3.5">Fecha</th>
                  <th className="px-4 py-3.5">Partner / Contacto</th>
                  <th className="px-4 py-3.5">País / Agencia</th>
                  <th className="px-4 py-3.5">Visita</th>
                  <th className="px-4 py-3.5">Comercial</th>
                  <th className="px-4 py-3.5">Cobranzas</th>
                  <th className="px-4 py-3.5">Sugerencias</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {filteredSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No se encontraron respuestas con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub.id} className="transition-colors hover:bg-white/5">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-slate-400">
                        {new Date(sub.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{sub.userData.nombre || "Anónimo"}</div>
                        <div className="text-[11px] text-slate-400">{sub.userData.email || "—"}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-200">{sub.userData.organizacion || "—"}</div>
                        <div className="inline-block rounded bg-[#00528f]/40 px-1.5 py-0.5 text-[10px] font-semibold text-[#00c4df]">
                          {sub.userData.pais || "GSA"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {sub.answers.visita_frecuencia || "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-400">
                        {sub.answers.calificacion_comercial ? `${sub.answers.calificacion_comercial} ★` : "—"}
                      </td>
                      <td className="px-4 py-3 font-semibold text-amber-400">
                        {sub.answers.calificacion_cobranzas ? `${sub.answers.calificacion_cobranzas} ★` : "—"}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-slate-300" title={String(sub.answers.mejoras_portal || sub.answers.comentarios_finales || "")}>
                        {sub.answers.mejoras_portal || sub.answers.comentarios_finales || "Sin comentarios"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <span>Mostrando {filteredSubmissions.length} de {submissions.length} respuestas registradas</span>
          <span>Universal Assistance Analytics Hub</span>
        </div>
      </div>
    </div>
  );
}
