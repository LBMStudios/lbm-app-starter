import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createSurvey, listSurveys } from "../../scripts/scaffold-survey.mjs";

describe("scaffold-survey", () => {
  let tempDir;

  before(async () => {
    tempDir = await mkdtemp(path.join(os.tmpdir(), "survey-test-"));
  });

  after(async () => {
    if (tempDir) {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("crea una encuesta válida con el esquema Zod", async () => {
    const result = await createSurvey({
      slug: "test-encuesta",
      title: "Encuesta de Prueba",
      dataDir: tempDir,
    });

    assert.equal(result.success, true);
    assert.equal(result.survey.slug, "test-encuesta");
    assert.equal(result.survey.title, "Encuesta de Prueba");
    assert.equal(result.survey.questions.length, 2);
  });

  it("rechaza un slug inválido con mayúsculas o espacios", async () => {
    await assert.rejects(
      async () => {
        await createSurvey({
          slug: "Slug Invalido!",
          title: "Encuesta Invalida",
          dataDir: tempDir,
        });
      },
      (err) => {
        return err.name === "ZodError";
      },
    );
  });

  it("lista las encuestas creadas", async () => {
    const surveys = await listSurveys({ dataDir: tempDir });
    assert.equal(surveys.length, 1);
    assert.equal(surveys[0].slug, "test-encuesta");
  });
});
