import assert from "node:assert/strict";
import postcss from "postcss";
import test from "node:test";
import { breakpointMediaPlugin } from "../../scripts/breakpoint-media";
import { checkBreakpointRules } from "../../scripts/check-breakpoint-rules";

test("responsive aliases compile from breakpoint tokens", async () => {
  const result = await postcss([breakpointMediaPlugin()]).process(
    "@media (--ds-viewport-compact) { .card { display: grid; } }\n@media (--ds-viewport-below-medium) { .menu { display: none; } }",
    { from: undefined },
  );

  assert.match(result.css, /@media \(max-width: 40rem\)/);
  assert.match(result.css, /@media \(width < 48rem\)/);
  assert.doesNotMatch(result.css, /--ds-viewport-/);
});

test("responsive source styles require known aliases instead of raw viewport widths", () => {
  const known = postcss.parse("@media (--ds-viewport-wide-up) { .card { display: grid; } }");
  assert.deepEqual(checkBreakpointRules(known, "Card.module.css"), []);

  const raw = postcss.parse("@media (max-width: 640px) { .card { display: grid; } }");
  assert.match(checkBreakpointRules(raw, "Card.module.css").join("\n"), /shared responsive breakpoint alias/);

  const unknown = postcss.parse("@media (--ds-viewport-tablet) { .card { display: grid; } }");
  assert.match(checkBreakpointRules(unknown, "Card.module.css").join("\n"), /unknown responsive breakpoint alias/);
});

test("unknown responsive aliases fail CSS compilation", async () => {
  await assert.rejects(
    () => postcss([breakpointMediaPlugin()]).process(
      "@media (--ds-viewport-tablet) { .card { display: grid; } }",
      { from: undefined },
    ),
    /Unknown responsive breakpoint alias/,
  );
});
