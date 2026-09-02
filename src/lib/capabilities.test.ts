import { describe, expect, it } from "vitest";
import { capabilities, capabilityCount } from "./capabilities";

describe("starter capabilities", () => {
  it("keeps the public feature list complete", () => {
    expect(capabilityCount()).toBe(4);
    expect(capabilities.map(({ title }) => title)).toEqual(["Producto", "Datos", "Calidad", "Agentes"]);
  });
});
