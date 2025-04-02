import { SSEChat } from "@/components/sse-chat";
import { generateUUID } from "@/lib/utils";

export default function SSEChatPage() {
  const id = generateUUID();

  return <SSEChat chatId={id} initialMessages={[]} />;
}
