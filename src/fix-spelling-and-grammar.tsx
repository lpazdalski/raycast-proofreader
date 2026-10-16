import { FIX_SPELLING_AND_GRAMMAR } from "./prompts";
import { RewriteView } from "./rewrite-view";

export default function Command() {
  return <RewriteView prompt={FIX_SPELLING_AND_GRAMMAR} unchanged="No mistakes found." />;
}
