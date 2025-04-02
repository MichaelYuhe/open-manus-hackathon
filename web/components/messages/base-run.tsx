import { Markdown } from "../markdown";

export function BaseRunMessage({
  part,
  messageID,
}: {
  part: any;
  messageID: string;
}) {
  return (
    <div className="pt-1">
      <Markdown>{part.text}</Markdown>
    </div>
  );
}
