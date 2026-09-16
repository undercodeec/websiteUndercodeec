import assert from "node:assert/strict";
import test from "node:test";

let splitAnimatedWords;

try {
  ({ splitAnimatedWords } = await import("../src/components/Marketing/marketingIntroText.mjs"));
} catch {
  // The first TDD run intentionally happens before the production module exists.
}

test("keeps animated characters grouped inside complete words", () => {
  assert.deepEqual(splitAnimatedWords?.("SEO para ti"), [
    { type: "word", characters: ["S", "E", "O"] },
    { type: "space", value: " " },
    { type: "word", characters: ["p", "a", "r", "a"] },
    { type: "space", value: " " },
    { type: "word", characters: ["t", "i"] },
  ]);
});
