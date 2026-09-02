import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { pathToFileURL } from "node:url";

import { z } from "zod";

const optionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  jumpToStep: z.number().int().positive().optional(),
});

const questionSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["multiple_choice", "score", "text"]),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(optionSchema).optional(),
  maxScore: z.number().int().positive().optional(),
});

export const surveyConfigSchema = z.object({
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/u, "El slug debe contener solo letras minúsculas, números y guiones."),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  welcomeMessage: z.string().min(1),
  thankYouMessage: z.string().min(1),
  thankYouSubtitle: z.string().min(1),
  ctaText: z.string().optional(),
  ctaUrl: z.string().url().optional(),
  questions: z.array(questionSchema).min(1),
});

export async function createSurvey({
  slug,
  title,
  subtitle = "Tu opinión es clave para seguir brindándote la mejor experiencia.",
  welcomeMessage = "Te invitamos a responder esta breve encuesta interactiva.",
  thankYouMessage = "¡Muchas gracias!",
  thankYouSubtitle = "Tendremos muy en cuenta tus respuestas.",
  ctaText = "Ir al Portal Principal",
  ctaUrl = "https://www.universal-assistance.com",
  questions = [
    {
      id: "calificacion_general",
      type: "score",
      title: "¿Cómo calificarías tu experiencia general con nosotros?",
      description: "Siendo 5 estrellas excelente",
      maxScore: 5,
    },
    {
      id: "comentarios",
      type: "text",
      title: "¿Qué sugerencias o comentarios te gustaría compartir?",
    },
  ],
  dataDir = path.join(process.cwd(), "src/data/surveys"),
}) {
  const candidate = {
    slug,
    title,
    subtitle,
    welcomeMessage,
    thankYouMessage,
    thankYouSubtitle,
    ctaText,
    ctaUrl,
    questions,
  };

  const validated = surveyConfigSchema.parse(candidate);
  await mkdir(dataDir, { recursive: true });
  const targetPath = path.join(dataDir, `${validated.slug}.json`);
  await writeFile(targetPath, JSON.stringify(validated, null, 2), "utf8");
  return { success: true, path: targetPath, survey: validated };
}

export async function listSurveys({ dataDir = path.join(process.cwd(), "src/data/surveys") } = {}) {
  try {
    const files = await readdir(dataDir);
    const surveys = [];
    for (const file of files.filter((f) => f.endsWith(".json"))) {
      const content = await readFile(path.join(dataDir, file), "utf8");
      try {
        const parsed = surveyConfigSchema.parse(JSON.parse(content));
        surveys.push(parsed);
      } catch (err) {
        console.warn(`Archivo de encuesta inválido: ${file}`, err);
      }
    }
    return surveys;
  } catch {
    return [];
  }
}

function parseArgs(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[i + 1];
      if (next && !next.startsWith("--")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const command = process.argv[2] ?? "list";
  const flags = parseArgs(process.argv.slice(3));

  if (command === "create") {
    if (!flags.slug || !flags.title) {
      console.error("Error: --slug y --title son obligatorios.");
      process.exit(1);
    }
    createSurvey({ slug: flags.slug, title: flags.title })
      .then((res) => {
        console.log(`✓ Encuesta creada en: ${res.path}`);
        console.log(`URL local: http://localhost:3000/survey/${res.survey.slug}`);
      })
      .catch((err) => {
        console.error("Error creando encuesta:", err.message);
        process.exit(1);
      });
  } else if (command === "list") {
    listSurveys()
      .then((surveys) => {
        console.log(`Encuestas registradas (${surveys.length}):`);
        for (const s of surveys) {
          console.log(`- [${s.slug}] ${s.title} (${s.questions.length} preguntas) -> /survey/${s.slug}`);
        }
      })
      .catch((err) => {
        console.error("Error listando encuestas:", err.message);
        process.exit(1);
      });
  }
}
