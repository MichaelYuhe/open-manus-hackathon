import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { getChatById, getMessagesByChatId } from "@/lib/db/queries";
import { DataStreamHandler } from "@/components/data-stream-handler";
import { SSEChat } from "@/components/sse-chat";
import { UIMessage } from "@/lib/interface";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === "private") {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<any>): Array<any> {
    return messages.map((message) => ({
      id: message.id,
      role: message.role as UIMessage["role"],
      content: message.parts.map((part: any) => part.text).join(""),
      parts: message.parts,
    }));
  }
  const uiMessages = convertToUIMessages(messagesFromDb);

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get("chat-model");

  if (!chatModelFromCookie) {
    return (
      <>
        <SSEChat
          chatId={id}
          initialMessages={uiMessages}
          isReadonly={session?.user?.id !== chat.userId}
        />

        <DataStreamHandler id={id} />
      </>
    );
  }

  return (
    <>
      <DataStreamHandler id={id} />
    </>
  );
}
