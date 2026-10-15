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
  assert.deepEqual([...first.themes.keys()].sort(), ["acme", "atom", "luna", "orchid", "sublime"]);
  assert.equal(Object.keys(first.themes.get("acme")!).length, Object.keys(first.themes.get("luna")!).length);
  assert.equal(first.themes.get("orchid")!["color.canvas"], "#FFF2FD");
  assert.equal(first.themes.get("atom")!["color.canvas"], "#11111D");
  assert.equal(first.themes.get("atom")!["border.width.default"], "3px");
  assert.equal(first.themes.get("atom")!["shadow.offset.surface"], "6px");
  assert.equal(first.themes.get("atom")!["shadow.offset.control"], "3px");
  assert.equal(first.themes.get("sublime")!["color.canvas"], "#1F242C");
  assert.equal(first.themes.get("sublime")!["color.action.primary.bg"], "#66D9EF");
  assert.equal(first.themes.get("sublime")!["radius.surface"], "4px");
  assert.equal(first.themes.get("luna")!["color.surface.overlay"], "#2B2545");
  assert.equal(first.themes.get("atom")!["color.status.info.fg"], "#97E9FF");
  assert.equal(first.themes.get("orchid")!["color.status.neutral.bg"], "#EEE4EF");
  assert.match(first.files.get("tokens.css")!, /--ds-motion-duration-standard: 200ms;/);
  assert.match(first.files.get("tokens.css")!, /--ds-motion-easing-standard: cubic-bezier\(0\.2, 0, 0, 1\);/);
  assert.match(first.files.get("token-types.ts")!, /"motion\.easing\.standard"/);
  assert.ok(first.contrastResults.length >= 120);
  assert.ok(first.contrastResults.some((result) => result.name === "Primary text on overlay surface"));
  assert.ok(first.contrastResults.some((result) => result.name === "Strong boundary on overlay surface"));
  assert.ok(first.contrastResults.every((result) => result.ratio >= result.minimum));
});

test("Atom uses dark comic colors with hard, block-style elevation", async () => {
  const result = await compileTokens(source);
  const atom = result.themes.get("atom")!;

  assert.equal(atom["color.surface.primary"], "#202033");
  assert.equal(atom["color.action.primary.bg"], "#FF3D8D");
  assert.equal(atom["color.focus.ring"], "#70E8FF");
  assert.equal(atom["border.width.default"], "3px");
  assert.equal(atom["shadow.color"], "#FF3D8D");
  assert.equal(atom["shadow.offset.surface"], "6px");
  assert.equal(atom["shadow.offset.control"], "3px");
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
