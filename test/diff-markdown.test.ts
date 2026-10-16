import assert from "node:assert/strict";
import { test } from "node:test";
import { proofreadDiff } from "../src/diff-markdown.ts";

const IMAGE = /!\[\]\(data:image\/svg\+xml;base64,([^)]+)\)/g;
const withoutImages = (markdown: string) => markdown.replace(IMAGE, "<green>");
const greenWords = (markdown: string) =>
  [...markdown.matchAll(IMAGE)].map(([, b64]) => /<text[^>]*>(.*)<\/text>/.exec(atob(b64))![1]);

test("curly quotes replacing straight quotes are not a change", () => {
  const { text, changes } = proofreadDiff('"dedupe" is ready', "“dedupe” is ready");
  assert.equal(text, '"dedupe" is ready');
  assert.deepEqual(changes, []);
});

test("straight apostrophe replacing a curly one keeps the original", () => {
  const { text, markdown, changes } = proofreadDiff("They’re here", "They're here");
  assert.equal(text, "They’re here");
  assert.equal(markdown, "They’re here");
  assert.deepEqual(changes, []);
});

test("markers next to quoted words stay next to whitespace", () => {
  const { markdown } = proofreadDiff('"dedupe" is now remove duplicates', "“dedupe” now removes duplicates");
  assert.equal(withoutImages(markdown), '"dedupe" ~~is~~ now ~~remove~~ <green> duplicates');
});

test("markdown characters in the text are escaped", () => {
  assert.equal(proofreadDiff("call __init__ now", "call __init__ now").markdown, "call \\_\\_init\\_\\_ now");
});

test("removal across a blank line is struck through on each line", () => {
  const { text, markdown, changes } = proofreadDiff("start one\n\ntwo end", "start end");
  assert.equal(text, "start end");
  assert.equal(markdown, "start ~~one~~  \n  \n~~two~~ end");
  assert.deepEqual(changes, [{ from: "one\n\ntwo", to: "" }]);
});

test("adjacent edits form one change", () => {
  const { text, markdown, changes } = proofreadDiff("they has alot of things", "they have a lot of things");
  assert.equal(text, "they have a lot of things");
  assert.deepEqual(greenWords(markdown), ["have", "a", "lot"]);
  assert.deepEqual(changes, [{ from: "has alot", to: "have a lot" }]);
});

test("removed word is a change with no replacement", () => {
  assert.deepEqual(proofreadDiff("I saw the the cat", "I saw the cat").changes, [{ from: "the", to: "" }]);
});

test("line breaks become markdown hard breaks", () => {
  const { text, markdown } = proofreadDiff("line one\nline twoo", "line one\nline two");
  assert.equal(text, "line one\nline two");
  assert.equal(withoutImages(markdown), "line one  \nline ~~twoo~~ <green>");
});

test("green words are escaped for SVG", () => {
  assert.deepEqual(greenWords(proofreadDiff("a b", "a <b> & c").markdown), ["&lt;b&gt;", "&amp;", "c"]);
});
