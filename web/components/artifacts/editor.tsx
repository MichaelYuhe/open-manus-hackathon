import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { PreservedMarkdown } from "../markdown";
import { Pencil1Icon } from "@radix-ui/react-icons";

export function ArtifactEditor() {
  const [currentArtifact] = useAtom(artifactAtom);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-muted/50 flex items-center rounded-lg justify-center">
          <Pencil1Icon className="opacity-80" />
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-muted-foreground">
            Open Manus is using editor
          </span>

          <div className="flex items-center w-fit rounded-full text-sm px-2 py-1 bg-muted/50">
            Writing...
          </div>
        </div>
      </div>

      <div className="rounded-lg border flex-1 border-zinc-500/60 bg-muted">
        <div className="flex w-full items-center justify-start border-b p-2 text-sm border-zinc-500/60 opacity-80">
          {currentArtifact?.parts[0]?.path}
        </div>

        <div className="p-2">
          <PreservedMarkdown
            content={currentArtifact?.parts[0]?.content}
          />  
        </div>
      </div>
    </div>
  );
}
