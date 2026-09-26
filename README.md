# LBM ENTERPRISE APP STARTER
### PRODUCTION BLUEPRINT FOR AUTONOMOUS AGENTS & HIGH-VELOCITY POCS
`LBM STUDIOS INTERNAL ARCHITECTURE` · `FLAGSHIP ARCHIVE 06/06`

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ CASE STUDY: 06/06                                                       │
│ PROJECT:    LBM ENTERPRISE APP STARTER & POC AUTOMATION PLATFORM        │
│ CLIENT:     LBM STUDIOS INTERNAL R&D / ENTERPRISE CLIENT BLUEPRINT      │
│ ROLE:       SYSTEMS ARCHITECT & FORWARD DEPLOYED PLATFORM ENGINEER      │
│ STACK:      NEXT.JS 16 · TYPESCRIPT · SUPABASE · PLAYWRIGHT · VITEST    │
│ STATUS:     CONTINUOUS INTEGRATION VERIFIED / PRODUCTION MULTI-AGENT    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 01 // ARCHITECTURAL THESIS

Modern software engineering requires bridging raw discovery meetings with robust, production-grade proofs-of-concept (POCs) without manual boilerplate friction. 

**LBM App Starter** is a standardized, automated enterprise repository foundation created by Lucas Beathyate Mascherini. It unites:
- A strict **Next.js 16 (App Router)** & **TypeScript** core.
- Decoupled **Supabase** persistence layer with zero-friction offline mocks.
- Autonomous **Multi-Agent Orchestration Protocols** (`.agents/` rules, skills, hooks, workflows).
- Dual-engine verification: **Vitest** for deterministic unit testing and **Playwright** for automated WCAG accessibility and headless visual regression checks.
- Mobile controller & live presentation survey engine with Google Sheets webhook integration.

```
[ STAKEHOLDER AUDIO / TRANSCRIPT ]
               │
               ▼
[ MEETING-TO-POC ENGINE ] ──▶ [ STRICT CONTRACT HANDOFF ] ──▶ [ VERIFIED DEPLOYMENT ]
   (Docs / Synthesis)             (docs/pocs/<slug>/)            (Preview / Vercel)
```

---

## 02 // TECHNICAL MATRIX

| Dimension | Specification |
|:---|:---|
| **Core Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript (Strict Mode) |
| **Package Manager** | pnpm 10.0+ with corepack |
| **State & Backend** | Supabase SSR Client / Local Mock fallback |
| **Test Automation** | Vitest (Unit / Integration), Playwright (E2E Smoke & a11y) |
| **Accessibility Gate** | Automated WCAG 2.1 AA audit on all public routes |
| **Agent Protocols** | Native Antigravity / Codex skill packs (`.agents/skills/`) |
| **CI/CD Pipeline** | GitHub Actions (Lint, Typecheck, Unit Tests, E2E Matrix) |

---

## 03 // QUICK START & EXECUTION

```bash
# 1. Environment bootstrap
nvm use
corepack enable
pnpm install

# 2. Local development
pnpm dev

# 3. Comprehensive verification gate
pnpm verify
```

Open `http://localhost:3000`. Supabase is strictly optional for local baseline execution. To activate full Supabase authentication and persistence, copy `.env.example` to `.env.local` and populate the public keys.

---

## 04 // COMMAND REGISTRY

| Command | Purpose |
|:---|:---|
| `pnpm dev` | Starts local Next.js development server with hot-reload |
| `pnpm check` | Runs ESLint, TypeScript compiler, Vitest suites, and production build |
| `pnpm test:e2e` | Automated headless Playwright browser smoke test across registered routes |
| `pnpm test:a11y` | Automated WCAG accessibility audit validating ARIA, contrast, and focus states |
| `pnpm test:e2e:headed` | Runs Playwright with visible browser window for visual validation |
| `pnpm poc:create -- --input <file.json>` | Materializes a stakeholder meeting into a sandboxed POC with structured criteria |
| `pnpm poc:check` | Validates all active POC contracts and handoff files |
| `pnpm poc:status -- --handoff <file>` | Summarizes git branch, progress, and upcoming acceptance criteria for the agent |
| `pnpm stack:doctor` | Pre-flight audit assessing node versions, pnpm, and optional external integrations |
| `pnpm verify` | Mandatory gate executing all static, dynamic, and security checks |

---

## 05 // MULTI-AGENT SPECIFICATION & GOVERNANCE

This repository embeds an autonomous agent orchestration environment located in `.agents/`:
- **Specialized Roles:**
  * `db-architect.md`: Database modeling, Supabase RLS policies, migrations.
  * `ui-builder.md`: Semantic UI, Swiss typography, mobile-responsive layout.
  * `qa-tester.md`: Playwright assertions, axe-core a11y rules, test fixtures.
- **Contract Rules:** Strict code style, no arbitrary dependencies, zero secrets in git history, and reproducible builds.

---

```text
© 2026 LBM STUDIOS // LUCAS BEATHYATE MASCHERINI. ALL RIGHTS RESERVED.
DESIGNED FOR HIGH-VELOCITY ENTERPRISE APPLICATION DEVELOPMENT.
```
