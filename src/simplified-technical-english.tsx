import { rewriteInSimplifiedTechnicalEnglish } from "./proofread";
import { RewriteView } from "./rewrite-view";

export default function Command() {
  return (
    <RewriteView
      correct={rewriteInSimplifiedTechnicalEnglish}
      unchanged="The text already follows STE."
      showChanges={false}
      diffFirst={false}
    />
  );
}
