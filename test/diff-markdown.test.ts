import assert from "node:assert/strict";
import { test } from "node:test";
import { isTooManyChanges, proofreadDiff } from "../src/diff-markdown.ts";

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

test("a sentence with many small fixes is not too many changes", () => {
  const input = "Their going too the store tomorow, and they has alot of things to by.";
  const fixed = "They're going to the store tomorrow, and they have a lot of things to buy.";
  assert.equal(isTooManyChanges(input, fixed), false);
});

test("a dense proofread that splits words is not too many changes", () => {
  const input = "This PR fix the bug where user cant login when there password contain special charakters.";
  const fixed = "This PR fixes the bug where users can't log in when their password contains special characters.";
  assert.equal(isTooManyChanges(input, fixed), false);
});

test("a short text with three fixed words is not too many changes", () => {
  assert.equal(isTooManyChanges("i has alot", "I have a lot"), false);
});

test("a preamble before a short text is too many changes", () => {
  assert.equal(isTooManyChanges("fix teh bug", "Here is the corrected text: fix the bug"), true);
});

test("an answer instead of the corrected question is too many changes", () => {
  const input = "What is the diference between a list and a tuple in Python";
  const fixed = "A list is mutable and a tuple is immutable, so you cannot change a tuple after you create it.";
  assert.equal(isTooManyChanges(input, fixed), true);
});

test("a rewrite of every sentence is too many changes", () => {
  const input = "We've utilized a caching layer in order to ensure that response times are being kept low.";
  assert.equal(isTooManyChanges(input, "We used a cache to keep the response times low."), true);
});

test("a preamble before a long text is too many changes", () => {
  const input =
    "The deployment finished successfully and all health checks are green, so we can close the incident now.";
  assert.equal(isTooManyChanges(input, `Here is the corrected text:\n\n${input}`), true);
});

test("quote style does not count as a change", () => {
  assert.equal(isTooManyChanges("'a' 'b' 'c' 'd' 'e'", "‘a’ ‘b’ ‘c’ ‘d’ ‘e’"), false);
});
