import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { InteractiveSurvey, type SurveyConfig } from "@/components/survey/interactive-survey";

async function getSurvey(slug: string): Promise<SurveyConfig | null> {
  try {
    const filePath = path.join(process.cwd(), "src/data/surveys", `${slug}.json`);
    const content = await readFile(filePath, "utf8");
    return JSON.parse(content) as SurveyConfig;
  } catch {
    return null;
  }
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const survey = await getSurvey(params.slug);
  if (!survey) return { title: "Encuesta no encontrada" };

  return {
    title: `${survey.title} | Universal Assistance`,
    description: survey.subtitle,
  };
}

export default async function SurveyPage(props: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const survey = await getSurvey(params.slug);

  if (!survey) {
    notFound();
  }

  const rawNombre = typeof searchParams.nombre_apellido === "string"
    ? searchParams.nombre_apellido
    : typeof searchParams.nombre === "string"
      ? searchParams.nombre
      : undefined;

  const userData = {
    email: typeof searchParams.email === "string" ? searchParams.email : undefined,
    nombre: rawNombre,
    pais: typeof searchParams.pais === "string" ? searchParams.pais : undefined,
    organizacion: typeof searchParams.organizacion === "string" ? searchParams.organizacion : undefined,
    canal: typeof searchParams.canal === "string" ? searchParams.canal : undefined,
  };

  return <InteractiveSurvey config={survey} userData={userData} />;
}
