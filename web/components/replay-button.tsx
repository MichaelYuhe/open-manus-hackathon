"use client";

import { PlayIcon } from "lucide-react";

export function ReplayButton({
  isReplaying,
  setIsReplaying,
}: {
  isReplaying: boolean;
  setIsReplaying: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleReplay = () => {
    setIsReplaying(true);
  };

  return (
    <div className="fixed top-4 right-4 z-[9999]">
      <button
        onClick={handleReplay}
        className="flex items-center rounded-full bg-blue-500/90 px-3 py-1 hover:bg-blue-500 transition-all text-zinc-200 font-semibold gap-x-2"
      >
        <PlayIcon size={14} />
        Replaying
      </button>
    </div>
  );
}
