"use client";

import { GlobeIcon } from "@radix-ui/react-icons";
import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { cn } from "@/lib/utils";

export function BrowserMessage({
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
            type: "browser",
            title: part.text,
            content: {
              url: part.text,
            },
            parts: [
              {
                type: "browser_state_update",
                text: part.text,
                screenshot: part.screenshot,
                url: part.url,
                result: part.result,
              },
            ],
          })
        }
        className={cn(
          "rounded-full flex items-center gap-x-2 px-4 py-2 text-sm bg-muted/50 w-fit",
          currentArtifact?.id === messageID && "bg-muted ring-1 ring-white/80"
        )}
      >
        <GlobeIcon className="size-4" />

        {part.text}
      </button>
    </div>
  );
}
