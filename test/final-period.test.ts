import assert from "node:assert/strict";
import { test } from "node:test";
import { dropAddedFinalPeriod } from "../src/final-period.ts";

test("added final period is removed", () => {
  assert.equal(dropAddedFinalPeriod("thanks for the help", "Thanks for the help."), "Thanks for the help");
});

test("final period that was already there is kept", () => {
  assert.equal(dropAddedFinalPeriod("Thanks for teh help.", "Thanks for the help."), "Thanks for the help.");
});

test("added final period before a closing quote or bracket is removed", () => {
  assert.equal(dropAddedFinalPeriod('he said "ok"', 'He said "ok."'), 'He said "ok"');
  assert.equal(dropAddedFinalPeriod("see the docs (v2)", "See the docs (v2.)"), "See the docs (v2)");
});

test("periods before the last sentence are kept", () => {
  assert.equal(dropAddedFinalPeriod("First one. second one", "First one. Second one."), "First one. Second one");
  assert.equal(dropAddedFinalPeriod("- fix bug\n- add test", "- fix bug.\n- add test."), "- fix bug.\n- add test");
});

test("other final punctuation is kept", () => {
  assert.equal(dropAddedFinalPeriod("can you send it", "Can you send it?"), "Can you send it?");
});

test("ellipsis in the original is kept", () => {
  assert.equal(dropAddedFinalPeriod("wait for it...", "Wait for it..."), "Wait for it...");
});
