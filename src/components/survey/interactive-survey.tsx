"use client";

import { useMemo, useState } from "react";

export type QuestionOption = {
  id: string;
  label: string;
  jumpToStep?: number;
};

export type Question = {
  id: string;
  type: "multiple_choice" | "score" | "text";
  title: string;
  description?: string;
  options?: QuestionOption[];
  maxScore?: number;
};

export type SurveyConfig = {
  slug: string;
  title: string;
  subtitle: string;
  welcomeMessage: string;
  questions: Question[];
  thankYouMessage: string;
  thankYouSubtitle: string;
  ctaText?: string;
  ctaUrl?: string;
};

type UserData = {
  email?: string;
  nombre?: string;
  pais?: string;
  organizacion?: string;
  [key: string]: string | undefined;
};

export function InteractiveSurvey({
  config,
  userData,
}: {
  config: SurveyConfig;
  userData: UserData;
}) {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [textInput, setTextInput] = useState<string>("");
  const [hoveredScore, setHoveredScore] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const totalQuestions = config.questions.length;
  const currentQuestion = currentStep > 0 && currentStep <= totalQuestions
    ? config.questions[currentStep - 1]
    : null;

  const displayName = useMemo(() => {
    return userData.nombre?.toUpperCase() || "PARTNER";
  }, [userData.nombre]);

  const handleStart = () => {
    setCurrentStep(1);
  };

  const handleOptionSelect = (option: QuestionOption) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: option.label };
    setAnswers(newAnswers);

    if (option.jumpToStep && option.jumpToStep <= totalQuestions) {
      setCurrentStep(option.jumpToStep);
    } else if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSurvey(newAnswers);
    }
  };

  const handleScoreSelect = (score: number) => {
    if (!currentQuestion) return;
    const newAnswers = { ...answers, [currentQuestion.id]: score };
    setAnswers(newAnswers);

    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSurvey(newAnswers);
    }
  };

  const handleTextNext = () => {
    if (!currentQuestion || !textInput.trim()) return;
    const newAnswers = { ...answers, [currentQuestion.id]: textInput.trim() };
    setAnswers(newAnswers);
    setTextInput("");

    if (currentStep < totalQuestions) {
      setCurrentStep(currentStep + 1);
    } else {
      submitSurvey(newAnswers);
    }
  };

  const submitSurvey = async (finalAnswers: Record<string, string | number>) => {
    setIsSubmitting(true);
    try {
      await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveySlug: config.slug,
          userData,
          answers: finalAnswers,
          submittedAt: new Date().toISOString(),
        }),
      });
    } catch {
      // Non-blocking submission error
    } finally {
      setIsSubmitting(false);
      setIsCompleted(true);
    }
  };

  const progressPercent = currentStep === 0
    ? 0
    : isCompleted
      ? 100
      : Math.round((currentStep / totalQuestions) * 100);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-[#001e3d] bg-gradient-to-br from-[#001e3d] via-[#002447] to-[#001429] p-4 text-white font-sans selection:bg-[#00c4df] selection:text-[#001e3d]">
      {/* Background glowing ambient elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#00528f]/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#00c4df]/20 blur-3xl" />
      </div>

      {/* Progress Bar Header */}
      {currentStep > 0 && !isCompleted && (
        <div className="fixed top-0 left-0 z-50 w-full bg-[#002447]/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-3 text-xs tracking-wider text-slate-300">
            <span className="font-semibold uppercase text-[#00c4df]">Universal Assistance</span>
            <span className="font-mono">Paso {currentStep} de {totalQuestions}</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#00528f] via-[#00c4df] to-[#00e5ff] transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Survey Card Container */}
      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl md:p-10">
        {/* Loading / Submitting State */}
        {isSubmitting && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#00c4df]/20 border-t-[#00c4df]" />
            <p className="text-sm font-medium text-slate-300">Registrando tus respuestas...</p>
          </div>
        )}

        {/* Step 0: Welcome Screen */}
        {currentStep === 0 && !isCompleted && !isSubmitting && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-[#00c4df]/30 bg-[#00c4df]/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c4df]">
              Universal Assistance
            </div>
            <h1 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              ¡Hola, {displayName}!
            </h1>
            <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
              {config.welcomeMessage}
            </p>
            <button
              onClick={handleStart}
              className="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-[#00528f] to-[#008091] px-8 py-3.5 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-[#0060a8] hover:to-[#009bb0] hover:shadow-[#00c4df]/20 active:scale-95"
            >
              <span>Empezar encuesta</span>
              <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* Step 1 to N: Question Screen */}
        {currentStep > 0 && !isCompleted && !isSubmitting && currentQuestion && (
          <div className="flex flex-col">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#00c4df]">
              Pregunta {currentStep}
            </div>
            <h2 className="mb-2 text-xl font-bold text-white md:text-2xl">
              {currentQuestion.title}
            </h2>
            {currentQuestion.description && (
              <p className="mb-6 text-sm text-slate-300">
                {currentQuestion.description}
              </p>
            )}

            {/* Multiple Choice Type */}
            {currentQuestion.type === "multiple_choice" && currentQuestion.options && (
              <div className="flex flex-col gap-3">
                {currentQuestion.options.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionSelect(opt)}
                    className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-4 text-left text-sm font-medium text-white transition-all duration-200 hover:border-[#00c4df] hover:bg-[#00528f]/40 hover:shadow-md hover:shadow-[#00c4df]/10 active:scale-[0.99]"
                  >
                    <span>{opt.label}</span>
                    <span className="text-xs text-slate-400 opacity-0 transition-opacity hover:opacity-100">
                      Seleccionar ↵
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Score / Stars Type */}
            {currentQuestion.type === "score" && (
              <div className="my-6 flex flex-col items-center">
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onMouseEnter={() => setHoveredScore(star)}
                      onMouseLeave={() => setHoveredScore(null)}
                      onClick={() => handleScoreSelect(star)}
                      className="group flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition-all duration-200 hover:scale-110 hover:border-[#00c4df] hover:bg-[#00528f]/50"
                      aria-label={`Calificar con ${star} estrellas`}
                    >
                      <svg
                        className={`h-8 w-8 transition-colors duration-150 ${
                          (hoveredScore !== null ? star <= hoveredScore : false)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-none text-slate-400 group-hover:text-amber-300"
                        }`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex w-full justify-between text-xs text-slate-400">
                  <span>1 estrella (Insatisfecho)</span>
                  <span>5 estrellas (Excelente)</span>
                </div>
              </div>
            )}

            {/* Free Text Type */}
            {currentQuestion.type === "text" && (
              <div className="flex flex-col gap-4">
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Escribí aquí tus comentarios..."
                  rows={4}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white placeholder-slate-400 outline-none transition-all duration-200 focus:border-[#00c4df] focus:bg-[#002447]/60 focus:ring-1 focus:ring-[#00c4df]"
                />
                <button
                  onClick={handleTextNext}
                  disabled={!textInput.trim()}
                  className="inline-flex items-center justify-center rounded-xl bg-[#00528f] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-[#0060a8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continuar ↵
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step Final: Thank You Screen */}
        {isCompleted && (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">
              {config.thankYouMessage}
            </h1>
            <p className="mb-6 max-w-md text-sm text-slate-300 md:text-base">
              {config.thankYouSubtitle}
            </p>
            {config.ctaUrl && (
              <a
                href={config.ctaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00528f] to-[#008091] px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:scale-105 hover:from-[#0060a8] hover:to-[#009bb0]"
              >
                <span>{config.ctaText || "Continuar"}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer Branding */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Universal Assistance · LBM Studios</p>
      </footer>
    </div>
  );
}
