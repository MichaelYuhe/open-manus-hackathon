import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { chatId } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: "Missing chat ID" }, { status: 400 });
    }

    // Call backend to stop execution
    const response = await fetch(`http://localhost:8000/api/stop/${chatId}`, {
      method: "POST",
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error stopping execution:", error);
    return NextResponse.json(
      { error: "Failed to stop execution" },
      { status: 500 }
    );
  }
}
