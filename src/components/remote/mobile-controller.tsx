"use client";

import { useEffect, useRef, useState } from "react";

export function MobileController() {
  const [promptInput, setPromptInput] = useState("");
  const [logs, setLogs] = useState<string[]>([
    "✓ Sistema Remoto LBM conectado con Windows (UNIVERSAL-ASISS).",
    "✓ Listo para recibir prompts e instrucciones desde tu iPhone.",
  ]);
  const [isExecuting, setIsExecuting] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const quickCommands = [
    { label: "Verificar Código", cmd: "pnpm check" },
    { label: "Probar E2E Playwright", cmd: "pnpm test:e2e" },
    { label: "Auditoría Stack Doctor", cmd: "pnpm stack:doctor" },
    { label: "Listar Encuestas", cmd: "pnpm scaffold:survey list" },
  ];

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSendCommand = async (commandText: string) => {
    const text = commandText.trim();
    if (!text) return;

    setIsExecuting(true);
    setLogs((prev) => [...prev, `\n> ${text}`, "Ejecutando en tu PC..."]);
    setPromptInput("");

    try {
      const res = await fetch("/api/remote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: text }),
      });
      const data = await res.json();
      if (data.output) {
        setLogs((prev) => [...prev, data.output]);
      } else {
        setLogs((prev) => [...prev, data.message || "✓ Comando ejecutado con éxito."]);
      }
    } catch (err) {
      setLogs((prev) => [...prev, `Error de conexión: ${String(err)}`]);
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#001429] text-white font-sans touch-manipulation">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#001e3d] px-4 py-3.5 shadow-md">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
          <span className="text-sm font-bold tracking-tight text-white">Antigravity Remote</span>
        </div>
        <div className="rounded-full bg-[#00528f]/40 px-2.5 py-1 text-[11px] font-semibold text-[#00c4df]">
          {isExecuting ? "Procesando..." : "En Línea"}
        </div>
      </header>

      {/* Main Terminal View */}
      <main className="flex flex-1 flex-col p-4 pb-32">
        {/* Quick Actions */}
        <div className="mb-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Acciones Rápidas (Tocar para ejecutar)
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {quickCommands.map((qc) => (
              <button
                key={qc.label}
                type="button"
                onClick={() => handleSendCommand(qc.cmd)}
                className="flex cursor-pointer select-none items-center justify-between rounded-xl border border-white/15 bg-white/10 p-3.5 text-left text-xs font-semibold text-white shadow-sm transition-all active:scale-95 active:bg-[#00528f]"
              >
                <span>{qc.label}</span>
                <span className="font-mono text-[12px] font-bold text-[#00c4df]">↵</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Logs Terminal */}
        <div className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 p-4 font-mono text-xs text-slate-300 shadow-inner">
          <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2 text-[10px] text-slate-400">
            <span>TERMINAL SALIDA EN VIVO</span>
            <span>Windows 10</span>
          </div>
          <div className="flex-1 overflow-y-auto whitespace-pre-wrap leading-relaxed max-h-[45vh]">
            {logs.map((log, idx) => (
              <div key={idx} className="mb-1">
                {log}
              </div>
            ))}
            {isExecuting && (
              <div className="mt-2 inline-flex items-center gap-1.5 font-bold text-[#00c4df]">
                <span className="animate-spin">⠋</span> Procesando en tu computadora...
              </div>
            )}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </main>

      {/* Floating Prompt Input Bar for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-white/15 bg-[#001e3d] p-3 shadow-2xl">
        <div className="mx-auto flex max-w-lg items-center gap-2">
          <input
            type="text"
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendCommand(promptInput);
              }
            }}
            placeholder="Escribí un prompt o comando..."
            className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm text-white placeholder-slate-400 outline-none transition-all focus:border-[#00c4df] focus:bg-[#002447]"
          />
          <button
            type="button"
            onClick={() => handleSendCommand(promptInput)}
            aria-label="Enviar prompt"
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl bg-gradient-to-r from-[#00528f] to-[#008091] text-white shadow-lg transition-all active:scale-90 active:from-[#0060a8]"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
