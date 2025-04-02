"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { atom, useAtom } from "jotai";
import { UseChatHelpers } from "@ai-sdk/react";

import { Messages } from "@/components/messages";
import { CommandPalette } from "@/components/command-palette";
import { Artifact, UIMessage } from "@/lib/interface";
import { saveMessageToDb } from "@/app/(chat)/actions";
import { ChatHeader } from "@/components/chat-header";
import { ArtifactViewer } from "./artifacts";
import { ReplayButton } from "./replay-button";

function generateUUID(): string {
  return crypto.randomUUID();
}

interface SSEChatProps {
  chatId: string;
  initialMessages?: UIMessage[];
  isReadonly: boolean;
}

export const artifactAtom = atom<Artifact | null>(null);
export const artifactsAtom = atom<Artifact[]>([]);

export function SSEChat({
  chatId,
  initialMessages = [],
  isReadonly,
}: SSEChatProps) {
  const eventSourceRef = useRef<EventSource | null>(null);

  const [currentArtifact] = useAtom(artifactAtom);
  const [, setArtifacts] = useAtom(artifactsAtom);
  const [messages, setMessages] = useState<any[]>(initialMessages);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<UseChatHelpers["status"]>("ready");
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    const filteredArtifacts = messages.filter((message) =>
      message.parts.some(
        (part: any) => part.type && part.type.endsWith("state_update"),
      ),
    );
    setArtifacts(filteredArtifacts);
  }, [messages, setArtifacts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || status !== "ready") return;

    window.history.replaceState({}, "", `/chat/${chatId}`);

    const userMessage: UIMessage = {
      id: generateUUID(),
      role: "user",
      content: input,
      parts: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setStatus("submitted");

    try {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatId,
          message: userMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      const eventSource = new EventSource(data.sseUrl);
      eventSourceRef.current = eventSource;

      eventSource.addEventListener("message", (event) => {
        if (event.data === "[DONE]") {
          eventSource.close();
          setStatus("ready");
          return;
        }

        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case "execution_started": {
              const startMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: "Mission started",
                parts: [
                  {
                    type: "text",
                    text: "Mission started",
                  },
                ],
              };

              setMessages((prev) => [...prev, startMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: startMessage.id,
                  role: startMessage.role,
                  parts: [
                    {
                      type: "text",
                      text: startMessage.content,
                    },
                  ],
                  content: startMessage.content,
                },
              });
              break;
            }
            case "step_update": {
              const stepContent = data.result;

              const newMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: stepContent,
                parts: [
                  {
                    type: "step",
                    text: stepContent,
                    step: data.step,
                  },
                ],
              };
              setMessages((prev) => [...prev, newMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: newMessage.id,
                  role: newMessage.role,
                  parts: newMessage.parts,
                  content: newMessage.content,
                },
              });
              break;
            }
            case "browser_state_update": {
              const browserMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: "Browser tool was used",
                parts: [
                  {
                    type: "browser_state_update",
                    text: "Browser tool was used",
                    screenshot: data.data?.screenshot,
                    url: data.data?.state.url,
                    result: data.data?.result,
                  },
                ],
                attachments: [],
              };
              setMessages((prev) => [...prev, browserMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: browserMessage.id,
                  role: browserMessage.role,
                  parts: browserMessage.parts,
                  content: browserMessage.content,
                  attachments: [],
                },
              });
              break;
            }
            case "editor_state_update": {
              const editorMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: "Editor tool was used",
                parts: [
                  {
                    type: "editor_state_update",
                    text: "Editor tool was used",
                    content: data.data?.state.content,
                    path: data.data?.state.path,
                  },
                ],
                attachments: [],
              };
              setMessages((prev) => [...prev, editorMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: editorMessage.id,
                  role: editorMessage.role,
                  parts: editorMessage.parts,
                  attachments: [],
                },
              });
              break;
            }
            case "agent_thought": {
              const agentThoughtMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: data.message,
                parts: [
                  {
                    type: "agent_thought",
                    text: data.message,
                  },
                ],
              };
              setMessages((prev) => [...prev, agentThoughtMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: agentThoughtMessage.id,
                  role: agentThoughtMessage.role,
                  parts: agentThoughtMessage.parts,
                  content: agentThoughtMessage.content,
                },
              });
              break;
            }
            case "base_run": {
              const baseRunMessage: UIMessage = {
                id: generateUUID(),
                role: "assistant",
                content: data.message,
                parts: [
                  {
                    type: "base_run",
                    text: data.message,
                  },
                ],
              };
              setMessages((prev) => [...prev, baseRunMessage]);
              saveMessageToDb({
                chatId,
                message: {
                  id: baseRunMessage.id,
                  role: baseRunMessage.role,
                  parts: baseRunMessage.parts,
                  content: baseRunMessage.content,
                },
              });
              break;
            }
            case "error": {
              toast.error(data.content);
              break;
            }
          }
        } catch (err) {
          console.error("Error parsing SSE message:", err);
        }
      });

      eventSource.onerror = (error) => {
        console.error("SSE error:", error);
        eventSource.close();
        setStatus("error");
        toast.error("Connection error");
      };

      eventSource.addEventListener("done", function (event) {
        eventSource.close();
        setStatus("ready");
      });
    } catch (error) {
      console.error("Error setting up SSE:", error);
      setStatus("error");
      toast.error("Failed to start conversation");
    }
  };

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chatId={chatId || generateUUID()} />

      {messages.length === 0 && (
        <CommandPalette
          onSubmit={handleSubmit}
          input={input}
          setInput={setInput}
        />
      )}

      <div className="flex size-full">
        <div className={`${currentArtifact ? "w-3/5" : "w-full"} relative`}>
          <Messages
            chatId={chatId || generateUUID()}
            status={status}
            messages={messages}
            isReadonly={isReadonly}
            isReplaying={isReplaying}
          />
        </div>

        {currentArtifact && <ArtifactViewer />}
      </div>

      {isReadonly && messages.length > 0 && (
        <ReplayButton
          isReplaying={isReplaying}
          setIsReplaying={setIsReplaying}
        />
      )}

      {/* <ChatFooter chatId={chatId || generateUUID()} /> */}
    </div>
  );
}
