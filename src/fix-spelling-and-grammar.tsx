import { fixSpellingAndGrammar } from "./proofread";
import { RewriteView } from "./rewrite-view";

export default function Command() {
  return <RewriteView correct={fixSpellingAndGrammar} unchanged="No mistakes found." />;
}
