export function messageToArtifact(message: any) {
  const messageID = message.id;
  const part = message.parts[0];
  const type = part.type;

  if (type === "browser_state_update") {
    return {
      id: messageID,
      type: "browser",
      title: part.text,
      content: {
        url: part.text,
      },
      parts: [
        {
          type: "browser_state_update",
          text: part.text,
          screenshot: part.screenshot,
          url: part.url,
          result: part.result,
        },
      ],
    };
  } else {
    return {
      id: messageID,
      type: "editor",
      title: part.text,
      content: {},
      parts: [
        {
          type: "editor_state_update",
          text: part.text,
          content: part.content,
          path: part.path.substring(part.path.indexOf("/workspace/") + 11),
        },
      ],
    };
  }
}
