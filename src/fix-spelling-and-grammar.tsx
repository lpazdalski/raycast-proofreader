import { LaunchProps } from "@raycast/api";
import { Corrected, fixSpellingAndGrammar } from "./proofread";
import { RewriteView } from "./rewrite-view";

export default function Command({ launchContext }: LaunchProps<{ launchContext?: Corrected }>) {
  return <RewriteView correct={fixSpellingAndGrammar} unchanged="No mistakes found." given={launchContext} />;
}
