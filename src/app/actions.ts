"use server";

import { aiChatAssistant } from "@/ai/flows/ai-chat-assistant";
import type { AIChatAssistantOutput } from "@/ai/flows/ai-chat-assistant";

export type AiChatResponse = AIChatAssistantOutput & {
  error?: string;
};

export async function getAiChatResponse(
  customerId: string | undefined,
  query: string
): Promise<AiChatResponse> {
  try {
    const result = await aiChatAssistant({ customerId, query });
    return result;
  } catch (error) {
    console.error("AI Chat Assistant Error:", error);
    return {
      response: "",
      recommendedProducts: [],
      error: "aiChat.error",
    };
  }
}
