"use client";

import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { cn } from "@/lib/utils";
import { Pencil1Icon } from "@radix-ui/react-icons";

export function EditorMessage({
  part,
  messageID,
}: {
  part: any;
  messageID: string;
}) {
  const [currentArtifact, setCurrentArtifact] = useAtom(artifactAtom);

  return (
    <div>
      <button
        onClick={() =>
          setCurrentArtifact({
            id: messageID,
            type: "editor",
            title: part.text,
            content: {},
            parts: [
              {
                type: "editor_state_update",
                text: part.text,
                content: part.content,
                path: part.path.substring(part.path.indexOf('/workspace/') + 11),
              },
            ],
          })
        }
        className={cn(
          "rounded-full flex items-center gap-x-2 px-4 py-2 text-sm bg-muted/50 w-fit",
          currentArtifact?.id === messageID && "bg-muted ring-1 ring-white/80"
        )}
      >
        <Pencil1Icon className="size-4" />
        {part.text}
      </button>
    </div>
  );
}
