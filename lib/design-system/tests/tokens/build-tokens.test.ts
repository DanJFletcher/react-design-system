import assert from "node:assert/strict";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { compileTokens, contrastRatio } from "../../scripts/build-tokens";

const source = resolve(import.meta.dirname, "../../src/tokens");

test("generation is deterministic and produces complete themes", async () => {
  const first = await compileTokens(source);
  const second = await compileTokens(source);
  assert.deepEqual([...first.files], [...second.files]);
  assert.deepEqual([...first.themes.keys()].sort(), ["acme", "luna", "orchid"]);
  assert.equal(Object.keys(first.themes.get("acme")!).length, Object.keys(first.themes.get("luna")!).length);
  assert.equal(first.themes.get("orchid")!["color.canvas"], "#FFF2FD");
  assert.ok(first.contrastResults.length >= 45);
  assert.ok(first.contrastResults.every((result) => result.ratio >= result.minimum));
});

test("contrast ratio matches the WCAG reference examples", () => {
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#000000") - 21) < 0.001);
  assert.ok(Math.abs(contrastRatio("#FFFFFF", "#1D4ED8") - 6.70) < 0.02);
});

test("reference cycles fail with a useful diagnostic", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-cycles-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "foundations.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { tokens: Record<string, { type: string; value: unknown; description: string }> };
    json.tokens["palette.cycle.a"] = { type: "color", value: { ref: "palette.cycle.b" }, description: "Cycle test A." };
    json.tokens["palette.cycle.b"] = { type: "color", value: { ref: "palette.cycle.a" }, description: "Cycle test B." };
    json.tokens["palette.cycle.seed"] = { type: "color", value: { ref: "palette.cycle.a" }, description: "Cycle entry." };
    json.tokens["color.cycle.consumer"] = { type: "color", value: { ref: "palette.cycle.seed" }, description: "Cycle consumer." };
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /Reference cycle detected/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test("incompatible token references fail validation", async () => {
  const temporary = await mkdtemp(join(tmpdir(), "design-system-types-"));
  try {
    await cp(source, temporary, { recursive: true });
    const file = join(temporary, "contract.json");
    const json = JSON.parse(await readFile(file, "utf8")) as { tokens: Record<string, { type: string; value: unknown; description: string }> };
    json.tokens["color.canvas"]!.value = { ref: "space.4" };
    await writeFile(file, JSON.stringify(json));
    await assert.rejects(() => compileTokens(temporary), /incompatible type/);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});
