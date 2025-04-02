import { Markdown } from "../markdown";

export function AgentThoughtMessage({ part, messageID }: { part: any, messageID: string }) {
  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer">
        <div className="font-semibold">Open Manus is Thinking:</div>
      </div>

      <div className="overflow-hidden">
        <div className="pt-2">
          <Markdown>{part.text}</Markdown>
        </div>
      </div>
    </div>
  );
}