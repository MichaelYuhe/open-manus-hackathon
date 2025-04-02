"use client";

import { ReactNode, useState } from "react";
import {
  ArrowUpIcon,
  Bitcoin,
  Film,
  Github,
  Globe,
  Newspaper,
  Pizza,
  Plane,
  Sun,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Marquee } from "@/components/magicui/marquee";
import { cn } from "@/lib/utils";

interface PreDefinedCommands {
  name: string;
  icon: ReactNode;
}

const preDefinedCommands: PreDefinedCommands[] = [
  { name: "BTC price today", icon: <Bitcoin size={16} /> },
  { name: "Plan a travel to Kyoto", icon: <Plane size={16} /> },
  { name: "Explore trending repos", icon: <Github size={16} /> },
  { name: "Buy a pizza", icon: <Pizza size={16} /> },
  { name: "Weather in Hangzhou", icon: <Sun size={16} /> },
  { name: "What happend last week", icon: <Newspaper size={16} /> },
  { name: "How to make a film", icon: <Film size={16} /> },
];

export function CommandPalette({
  onSubmit,
  input,
  setInput,
}: {
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  setInput: (value: string) => void;
}) {
  const [isBrowserUsed, setIsBrowserUsed] = useState(false);

  return (
    <div className="size-full flex items-center justify-center overflow-hidden flex-col p-4">
      <div className="w-full max-w-2xl flex flex-col">
        <span className="text-2xl font-medium">Hey, Yuhang</span>

        <form
          onSubmit={onSubmit}
          className="relative flex flex-col w-full gap-2 mt-4"
        >
          <Textarea
            placeholder="What can I do for you today?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[112px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700 transition-all duration-300"
          />

          <div className="absolute bottom-0 p-2 w-full flex items-center justify-between">
            <div className="flex items-center gap-x-2">
              <Button
                onClick={() => setIsBrowserUsed(!isBrowserUsed)}
                type="button"
                className={cn(
                  "rounded-full px-3.5 py-1.5 h-fit hover:text-black border transition-all duration-300 border-zinc-600",
                  isBrowserUsed
                    ? "text-black"
                    : "bg-background text-muted-foreground"
                )}
              >
                <Globe size={14} />
                Browser Use
              </Button>
            </div>

            <Button
              disabled={input.length === 0}
              type="submit"
              className="rounded-full p-1.5 h-fit border transition-all duration-300 dark:border-zinc-600"
            >
              <ArrowUpIcon size={14} />
            </Button>
          </div>
        </form>

        <div className="relative w-full mt-2">
          <Marquee pauseOnHover className="[--duration:20s]">
            {preDefinedCommands.map((command) => (
              <button
                onClick={() => {
                  setInput(command.name);
                }}
                key={command.name}
                className="flex flex-row cursor-pointer items-center text-sm bg-muted rounded-full px-2 py-1 gap-2 hover:bg-muted-foreground/30"
              >
                {command.icon}
                {command.name}
              </button>
            ))}
          </Marquee>
          
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background" />
        </div>
      </div>
    </div>
  );
}
