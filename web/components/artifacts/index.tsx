import { useAtom } from "jotai";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Cross1Icon } from "@radix-ui/react-icons";

import { ArtifactBrowser } from "./browser";
import { ArtifactEditor } from "./editor";
import { artifactAtom, artifactsAtom } from "../sse-chat";
import { messageToArtifact } from "@/lib/utils/message-to-artifact";

export function ArtifactViewer() {
  const [artifacts] = useAtom(artifactsAtom);
  const [currentArtifact, setCurrentArtifact] = useAtom(artifactAtom);

  return (
    <div
      key={currentArtifact?.id}
      className="fixed right-0 top-0 z-[999] h-full w-2/5 bg-background border-l flex flex-col"
    >
      <div className="flex w-full items-center justify-between p-4 border-b">
        <div className="flex items-center gap-x-2">
          <button
            onClick={() => setCurrentArtifact(null)}
            className="rounded-full p-2 hover:bg-muted"
          >
            <Cross1Icon className="size-4" />
          </button>
          <span>Artifacts</span>

          <span className="text-xs opacity-70 px-2 py-1 border rounded-full">
            {currentArtifact?.id?.slice(0, 3) +
              "..." +
              currentArtifact?.id?.slice(-3)}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col justify-between">
        <div className="p-4">
          {currentArtifact?.type === "browser" && (
            <ArtifactBrowser key={currentArtifact?.id} />
          )}
          {currentArtifact?.type === "editor" && (
            <ArtifactEditor key={currentArtifact?.id} />
          )}
        </div>
      </div>
      <div className="flex items-center p-2 gap-x-2 w-full border-t">
        <button
          onClick={() => {
            const index = artifacts.findIndex(
              (artifact) => artifact.id === currentArtifact?.id,
            );
            if (index > 0) {
              setCurrentArtifact(messageToArtifact(artifacts[index - 1]));
            }
          }}
          className="rounded-full p-2 hover:bg-muted"
        >
          <ChevronLeft className="size-4" />
        </button>

        <button
          onClick={() => {
            const index = artifacts.findIndex(
              (artifact) => artifact.id === currentArtifact?.id,
            );
            if (index < artifacts.length - 1) {
              setCurrentArtifact(messageToArtifact(artifacts[index + 1]));
            }
          }}
          className="rounded-full p-2 hover:bg-muted"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
