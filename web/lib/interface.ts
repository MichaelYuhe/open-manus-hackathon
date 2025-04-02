import { UIMessage as AIUIMessage } from "ai";
import { ArtifactType } from "./types";

// @ts-ignore
export interface UIMessage extends AIUIMessage {
  parts: Array<{
    type: string;
    text: string;
    reasoning?: string;
    step?: number;
    [key: string]: any;
  }>;
  attachments?: Array<{
    type: string;
    base64: string;
  }>;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: any;
  parts: any;
}
