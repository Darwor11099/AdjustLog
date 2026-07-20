import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const api = await readFile(new URL("../app/api/adjustments/route.ts", import.meta.url), "utf8");

test("groups adjustments exclusively by normalized part number", () => {
  assert.match(page, /pieceId\.trim\(\)\.toUpperCase\(\)/);
  assert.match(page, /new Map<string, AdjustmentGroup>/);
  assert.doesNotMatch(page, /Part name|pieceName/);
});

test("includes persistent light and dark themes", () => {
  assert.match(page, /adjustlog-theme/);
  assert.match(page, /Switch to light mode/);
  assert.match(page, /Switch to dark mode/);
});

test("normalizes new records in the API", () => {
  assert.match(api, /pieceId\.toUpperCase\(\)/);
});
