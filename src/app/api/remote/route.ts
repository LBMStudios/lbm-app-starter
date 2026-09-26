import { exec } from "node:child_process";
import { appendFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";

const execAsync = promisify(exec);

const remotePayloadSchema = z.object({
  command: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const { command } = remotePayloadSchema.parse(json);

    const timestamp = new Date().toLocaleTimeString();
    const promptEntry = `\n- **[${timestamp}] (iPhone Remote)**: ${command}`;
    const promptsFile = path.join(process.cwd(), "docs/REMOTE_PROMPTS.md");

    try {
      await appendFile(promptsFile, promptEntry, "utf8");
    } catch {
      // Non-blocking log
    }

    // Direct CLI commands
    const isDirectCommand = /^(pnpm|node|git|npm|npx|dir|echo)\b/i.test(command.trim());

    if (isDirectCommand) {
      try {
        const fullCmd = `$env:PATH += ";$env:APPDATA\\npm"; ${command}`;
        const { stdout, stderr } = await execAsync(fullCmd, {
          cwd: process.cwd(),
          shell: "powershell.exe",
        });

        return NextResponse.json({
          success: true,
          output: stdout || stderr || "✓ Comando ejecutado con éxito en Windows.",
        });
      } catch (cmdError: unknown) {
        const errObj = cmdError as { stdout?: string; stderr?: string; message?: string };
        return NextResponse.json({
          success: false,
          output: errObj.stdout || errObj.stderr || errObj.message || "Error ejecutando comando.",
        });
      }
    }

    // Natural language prompts
    return NextResponse.json({
      success: true,
      output: `✓ Prompt recibido y sincronizado con tu PC:\n"${command}"\n\n(Guardado en docs/REMOTE_PROMPTS.md para procesamiento inmediato).`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, output: `Error: ${String(error)}` },
      { status: 400 },
    );
  }
}
