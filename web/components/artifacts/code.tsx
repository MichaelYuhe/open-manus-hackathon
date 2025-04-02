import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { CodeIcon } from "lucide-react";
import { CodeEditor } from "../code-editor";

export function ArtifactCode() {
  const [currentArtifact] = useAtom(artifactAtom);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-muted/50 flex items-center rounded-lg justify-center">
          <CodeIcon className="opacity-80" />
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-muted-foreground">
            Open Manus is coding
          </span>

          <div className="flex items-center w-fit rounded-full text-sm px-2 py-1 bg-muted/50">
            Cooking...
          </div>
        </div>
      </div>

      <CodeEditor
        content={currentArtifact?.parts[0]?.content}
        status="streaming"
        isCurrentVersion={true}
        currentVersionIndex={0}
        suggestions={[]}
        onSaveContent={() => {}}
      />
    </div>
  );
}
