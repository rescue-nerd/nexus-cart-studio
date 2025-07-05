"use server";

import { aiChatAssistant } from "@/ai/flows/ai-chat-assistant";
import type { AIChatAssistantOutput } from "@/ai/flows/ai-chat-assistant";

export async function getAiChatResponse(
  customerId: string | undefined,
  query: string
): Promise<AIChatAssistantOutput> {
  try {
    const result = await aiChatAssistant({ customerId, query });
    return result;
  } catch (error) {
    console.error("AI Chat Assistant Error:", error);
    return {
      response:
        "Sorry, I am having some trouble right now. Please try again later.",
      recommendedProducts: [],
    };
  }
}
