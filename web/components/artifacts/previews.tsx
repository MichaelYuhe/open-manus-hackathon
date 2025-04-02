import { useAtom } from "jotai";
import { artifactsAtom } from "../sse-chat";

export function ArtifactPreviews() {
  const [artifacts] = useAtom(artifactsAtom);

  return <div>ArtifactPreviews</div>;
}
