import { SIMPLIFIED_TECHNICAL_ENGLISH } from "./prompts";
import { RewriteView } from "./rewrite-view";

export default function Command() {
  return (
    <RewriteView prompt={SIMPLIFIED_TECHNICAL_ENGLISH} unchanged="The text already follows STE." showChanges={false} />
  );
}
