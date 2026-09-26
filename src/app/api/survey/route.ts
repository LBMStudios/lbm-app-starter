import { NextResponse } from "next/server";
import { z } from "zod";

type StoredSubmission = {
  id: string;
  surveySlug: string;
  userData: Record<string, string | undefined>;
  answers: Record<string, string | number>;
  submittedAt: string;
};

// In-memory response cache for demo/local dashboarding
const submissionsStore: StoredSubmission[] = [
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
];

const submissionSchema = z.object({
  surveySlug: z.string().min(1),
  userData: z.record(z.string(), z.string().optional()),
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
  submittedAt: z.string().datetime(),
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  const results = slug
    ? submissionsStore.filter((s) => s.surveySlug === slug)
    : submissionsStore;

  return NextResponse.json({
    success: true,
    total: results.length,
    submissions: results,
  });
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = submissionSchema.parse(json);

    const newSubmission: StoredSubmission = {
      id: `sub-${Date.now()}`,
      surveySlug: payload.surveySlug,
      userData: payload.userData,
      answers: payload.answers,
      submittedAt: payload.submittedAt,
    };

    submissionsStore.unshift(newSubmission);

    // Optional webhook integration for Google Sheets / CRM
    const webhookUrl = process.env.SURVEY_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (webhookErr) {
        console.warn("Webhook dispatch failed:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Respuesta registrada correctamente.",
      received: {
        id: newSubmission.id,
        survey: payload.surveySlug,
        timestamp: payload.submittedAt,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Datos de formulario inválidos", details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: "Error interno procesando la respuesta." },
      { status: 500 },
    );
  }
}
