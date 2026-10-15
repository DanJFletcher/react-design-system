import assert from "node:assert/strict";
import test from "node:test";
import postcss from "postcss";
import { checkBorderElevationRules } from "../../scripts/check-border-elevation-rules";

function check(css: string, fileName = "Example/Example.module.css"): string[] {
  return checkBorderElevationRules(postcss.parse(css), fileName);
}

test("allows shared elevation tokens and explicit flat surfaces", () => {
  const errors = check(`
    .surface { box-shadow: var(--ds-shadow-elevation-surface); }
    .control { box-shadow: var(--ds-shadow-elevation-control); }
    .overlay { box-shadow: var(--ds-shadow-elevation-overlay); }
    .flat { box-shadow: none; }
  `);

  assert.deepEqual(errors, []);
});

test("rejects hard-coded and component-local box shadows", () => {
  const errors = check(`
    .surface { box-shadow: 0 4px 8px black; }
    .control { box-shadow: var(--ds-shadow-surface); }
  `);

  assert.equal(errors.length, 2);
  assert.match(errors[0], /box-shadow must use a shared elevation token/);
  assert.match(errors[1], /box-shadow must use a shared elevation token/);
});

test("requires subtle border width on named decorative dividers", () => {
  const errors = check(`
    .section-divider { border-block-end: var(--ds-border-width-default) solid currentColor; }
    [data-variant="divided"] .item { border-block-start: var(--ds-border-width-default) solid currentColor; }
    .tabList { border-block-end: var(--ds-border-width-default) solid currentColor; }
  `);

  assert.equal(errors.length, 3);
  assert.ok(errors.every((error) => error.includes("--ds-border-width-subtle")));
});

test("allows default borders on surfaces and subtle borders on dividers", () => {
  const errors = check(`
    .card { border: var(--ds-border-width-default) solid currentColor; }
    .divider { border-block-end: var(--ds-border-width-subtle) solid currentColor; }
  `);

  assert.deepEqual(errors, []);
});

test("recognizes the dedicated Separator component stylesheet", () => {
  const errors = check(
    ".horizontal { border-block-end: var(--ds-border-width-default) solid currentColor; }",
    "Separator/Separator.module.css",
  );

  assert.equal(errors.length, 1);
  assert.match(errors[0], /decorative dividers must use --ds-border-width-subtle/);
});
