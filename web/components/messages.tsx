"use client";

import { UIMessage } from "../lib/interface";
import { PreviewMessage, ThinkingMessage } from "./message";
import { useScrollToBottom } from "./use-scroll-to-bottom";
import { memo, useEffect, useState } from "react";
import equal from "fast-deep-equal";
import { UseChatHelpers } from "@ai-sdk/react";

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers["status"];
  messages: Array<UIMessage>;
  isReadonly: boolean;
  isReplaying?: boolean;
}

function PureMessages({
  chatId,
  status,
  messages,
  isReadonly,
  isReplaying,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [replayIndex, setReplayIndex] = useState(0);

  useEffect(() => {
    if (!isReadonly) {
      setReplayIndex(messages.length - 1);
    }

    const timeout = setTimeout(() => {
      if (replayIndex >= messages.length - 1) {
        setReplayIndex(messages.length - 1);
        return;
      }

      setReplayIndex((prevIndex) => prevIndex + 1);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [isReplaying, replayIndex, messages.length, isReadonly]);

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col w-full relative min-w-0 gap-6 flex-1 overflow-y-scroll pt-4 overflow-x-hidden"
    >
      {messages.slice(0, replayIndex + 1).map((message, index) => (
        <PreviewMessage
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === "streaming" && messages.length - 1 === index}
          isReadonly={isReadonly}
        />
      ))}

      {status === "submitted" &&
        messages.length > 0 &&
        messages[messages.length - 1].role === "user" && <ThinkingMessage />}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (prevProps.isReplaying !== nextProps.isReplaying) return false;

  return true;
});
