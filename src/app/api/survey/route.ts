import { NextResponse } from "next/server";
import { z } from "zod";

const submissionSchema = z.object({
  surveySlug: z.string().min(1),
  userData: z.record(z.string(), z.string().optional()),
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
  submittedAt: z.string().datetime(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const payload = submissionSchema.parse(json);

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
