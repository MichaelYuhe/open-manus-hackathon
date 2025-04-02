import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { Safari } from "../ui/safari";
import { GlobeIcon } from "lucide-react";

export function ArtifactBrowser() {
  const [currentArtifact] = useAtom(artifactAtom);

  const convertBase64ToImage = (base64: string) => {
    return `data:image/png;base64,${base64}`;
  };

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-muted/50 flex items-center rounded-lg justify-center">
          <GlobeIcon className="opacity-80" />
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-muted-foreground">
            Open Manus is using browser
          </span>

          <div className="flex items-center w-fit rounded-full text-sm px-2 py-1 bg-muted/50">
            Surfing the web...
          </div>
        </div>
      </div>

      <Safari
        // url={currentArtifact?.parts[0]?.url}
        className="size-full"
        src={convertBase64ToImage(currentArtifact?.parts[0]?.screenshot)}
      />

      <p className="text-xs text-muted-foreground">
        {currentArtifact?.parts[0]?.result}
      </p>
    </div>
  );
}
