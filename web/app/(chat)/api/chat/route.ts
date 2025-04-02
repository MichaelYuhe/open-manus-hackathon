import { NextRequest, NextResponse } from "next/server";
import {
  deleteChatById,
  getChatById,
  saveChat,
  saveMessages,
} from "@/lib/db/queries";
import { auth } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "../../actions";

export async function POST(request: NextRequest) {
  try {
    const { chatId, message } = await request.json();

    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const chat = await getChatById({ id: chatId });

    if (!chat) {
      const title = await generateTitleFromUserMessage({
        message,
      });

      await saveChat({ id: chatId, userId: session.user.id, title });
    } else {
      if (chat.userId !== session.user.id) {
        return new Response("Unauthorized", { status: 401 });
      }
    }

    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const messageId = crypto.randomUUID();

    await saveMessages({
      messages: [
        {
          chatId,
          createdAt: new Date(),
          id: messageId,
          role: "user",
          parts: [
            {
              type: "text",
              text: message.content,
            },
          ],
          attachments: [],
        },
      ],
    });

    const encodedContent = encodeURIComponent(message.content);
    const url = `http://localhost:8000/sse/${chatId}?content=${encodedContent}`;

    return NextResponse.json({
      success: true,
      messageId,
      sseUrl: url,
    });
  } catch (error) {
    console.error("Error in chat API route:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request!", {
      status: 500,
    });
  }
}
