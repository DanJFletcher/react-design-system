import assert from "node:assert/strict";
import test from "node:test";
import { checkRadiusRules, type RadiusException } from "../../scripts/check-radius-rules";
import { compileTokens } from "../../scripts/build-tokens";
import { resolve } from "node:path";

test("surface and specialized defaults are bounded, while Luna action/form controls remain pills", async () => {
  const result = await compileTokens(resolve(import.meta.dirname, "../../src/tokens"));
  for (const theme of ["acme", "luna", "orchid"]) {
    const values = result.themes.get(theme)!;
    assert.equal(values["radius.surface"], theme === "luna" ? "32px" : "12px");
    for (const token of ["radius.tooltip", "radius.menu", "radius.textarea", "radius.form-group"]) {
      assert.equal(values[token], theme === "luna" ? "32px" : theme === "acme" ? "6px" : "16px");
    }
  }
  assert.equal(result.themes.get("luna")!["radius.control"], "9999px");
  assert.equal(result.themes.get("luna")!["radius.form-control"], "9999px");
});

test("new surfaces cannot use action, form, full, or fixed shape defaults", () => {
  for (const token of ["control", "form-control", "full", "shape-rounded"]) {
    const errors = checkRadiusRules(`.panel { border-radius: var(--ds-radius-${token}); }`, "New/New.module.css");
    assert.ok(errors.some((error) => error.includes('radius role "surface"')), token);
  }
  assert.deepEqual(checkRadiusRules(".panel { border-radius: var(--ds-radius-surface); }", "New/New.module.css"), []);
});

test("surface hook fallback chains cannot hide pill tokens", () => {
  for (const value of [
    "var(--ds-card-radius, var(--ds-radius-control))",
    "var(--ds-card-radius, var(--ds-radius-surface, var(--ds-radius-full)))",
    "var(--ds-button-radius, var(--ds-radius-surface))",
    "var(--ds-card-radius)",
    "var(--unknown-radius, var(--ds-radius-surface))",
  ]) {
    assert.ok(checkRadiusRules(`.panel { border-radius: ${value}; }`, "New/New.module.css").length, value);
  }
  assert.deepEqual(checkRadiusRules(".panel { border-radius: var(--ds-card-radius, var(--ds-radius-surface)); }", "New/New.module.css"), []);
});

test("private aliases, override definitions, missing references and cycles are checked", () => {
  for (const css of [
    ".panel { --_corner: var(--ds-radius-control); border-radius: var(--_corner); }",
    ".panel { --_radius: var(--ds-radius-surface); border-radius: var(--_radius); } .other { --_radius: var(--ds-radius-full); }",
    ".panel { border-radius: var(--_missing); }",
    ".panel { --_a: var(--_b); --_b: var(--_a); border-radius: var(--_a); }",
    ".panel { border-start-end-radius: var(--ds-radius-full); }",
  ]) {
    assert.ok(checkRadiusRules(css, "New/New.module.css").length, css);
  }
  assert.deepEqual(checkRadiusRules(".panel { --_radius: var(--ds-radius-surface); border-radius: var(--_radius); } .panel[data-shape=square] { --_radius: var(--ds-radius-shape-square); }", "New/New.module.css"), []);
});

test("reviewed exceptions permit controls, explicit shapes and circles only on exact selectors", () => {
  const exceptions: RadiusException[] = [
    { file: "Demo.css", selector: ".button", role: "action", reason: "Action button." },
    { file: "Demo.css", selector: ".pill", role: "shape", reason: "Explicit pill prop." },
    { file: "Demo.css", selector: ".avatar", role: "circle", reason: "Portrait circle." },
    { file: "Demo.css", selector: ".input", role: "form", reason: "Single-line control." },
    { file: "Demo.css", selector: ".child", role: "inherited", reason: "Inherits panel corners." },
  ];
  const css = ".button { border-radius: var(--ds-button-radius, var(--ds-radius-control)); } .pill { border-radius: var(--ds-radius-full); } .avatar { border-radius: var(--ds-radius-full); } .input { border-radius: var(--ds-radius-form-control); } .child { border-radius: inherit; }";
  assert.deepEqual(checkRadiusRules(css, "Demo.css", exceptions), []);
  assert.ok(checkRadiusRules(`${css} .newPanel { border-radius: var(--ds-radius-full); }`, "Demo.css", exceptions).length);
  assert.ok(checkRadiusRules(".button { border-radius: var(--ds-radius-full); }", "Demo.css", exceptions).length);
  assert.ok(checkRadiusRules("", "Demo.css", exceptions).some((error) => error.includes("stale")));
});
