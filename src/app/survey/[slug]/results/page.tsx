import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type { SurveyConfig } from "@/components/survey/interactive-survey";
import { SurveyResultsDashboard, type Submission } from "@/components/survey/survey-results-dashboard";

async function getSurvey(slug: string): Promise<SurveyConfig | null> {
  try {
    const filePath = path.join(process.cwd(), "src/data/surveys", `${slug}.json`);
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as SurveyConfig;
  } catch {
    return null;
  }
}

// Initial mock/sample submissions for immediate demo & preview
const initialData: Record<string, Submission[]> = {
  "agencias-r-2026": [
    {
      id: "sub-1",
      surveySlug: "agencias-r-2026",
      userData: {
        nombre: "LUCAS",
        email: "lucasbeathyate@gmail.com",
        pais: "URUGUAY",
        organizacion: "CF TLMK URUGUAY",
        canal: "Affinity",
      },
      answers: {
        visita_frecuencia: "Cada quince días",
        calificacion_comercial: 5,
        autogestion_portal: "Sí, ya lo estoy haciendo",
        mejoras_portal: "Poder cotizar grupos familiares con un solo click.",
        calificacion_cobranzas: 5,
        comentarios_finales: "Excelente atención y soporte continuo.",
      },
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "sub-2",
      surveySlug: "agencias-r-2026",
      userData: {
        nombre: "MARIANA GÓMEZ",
        email: "mariana.gomez@viajeslatam.com",
        pais: "ARGENTINA",
        organizacion: "Viajes Latam",
        canal: "Agencias",
      },
      answers: {
        visita_frecuencia: "Una vez al mes",
        calificacion_comercial: 4,
        autogestion_portal: "Sí, me gustaría gestionarlo desde el portal",
        mejoras_portal: "Dashboard con reportes de comisiones mensuales descargables.",
        calificacion_cobranzas: 4,
      },
      submittedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    },
    {
      id: "sub-3",
      surveySlug: "agencias-r-2026",
      userData: {
        nombre: "ROBERTO SILVA",
        email: "rsilva@turismomundial.com.br",
        pais: "BRASIL",
        organizacion: "Turismo Mundial",
        canal: "Corporativo",
      },
      answers: {
        visita_frecuencia: "Prefiero visita virtual",
        calificacion_comercial: 5,
        autogestion_portal: "Sí, ya lo estoy haciendo",
        mejoras_portal: "Integración API directa con nuestro CRM.",
        calificacion_cobranzas: 5,
        comentarios_finales: "Muy buena plataforma y atención rápida por WhatsApp.",
      },
      submittedAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],
};

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const survey = await getSurvey(params.slug);
  if (!survey) return { title: "Resultados de Encuesta" };

  return {
    title: `Resultados: ${survey.title} | Universal Assistance`,
    description: `Dashboard de analítica y métricas de satisfacción para ${survey.title}`,
  };
}

export default async function SurveyResultsPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const survey = await getSurvey(params.slug);

  if (!survey) {
    notFound();
  }

  const submissions = initialData[params.slug] || [];

  return <SurveyResultsDashboard survey={survey} initialSubmissions={submissions} />;
}
