import { useAtom } from "jotai";
import { artifactAtom } from "../sse-chat";
import { SearchIcon } from "lucide-react";

export function ArtifactSearch() {
  const [currentArtifact] = useAtom(artifactAtom);

  return (
    <div className="flex flex-col gap-4 overflow-y-auto">
      <div className="flex items-center gap-x-4">
        <div className="p-3 bg-muted/50 flex items-center rounded-lg justify-center">
          <SearchIcon className="opacity-80" />
        </div>

        <div className="flex flex-col gap-y-1">
          <span className="text-sm text-muted-foreground">
            Open Manus is searching
          </span>

          <div className="flex items-center w-fit rounded-full text-sm px-2 py-1 bg-muted/50">
            Finding the best results...
          </div>
        </div>
      </div>

      <ul className="flex flex-col gap-y-2">
        {currentArtifact?.parts[0]?.searchResults.map((result: any) => (
          <li
            className="w-full bg-muted/50 rounded-lg p-2 flex items-center"
            key={result.url}
          >
            {result.title}
          </li>
        ))}
      </ul>
    </div>
  );
}
