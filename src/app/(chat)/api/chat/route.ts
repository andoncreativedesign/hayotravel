import { generateUUID } from "@/utils";
import { CoreMessage, createDataStream, smoothStream, streamText } from "ai";
import { difyProvider } from "dify-ai-provider";
import { NextRequest } from "next/server";
import { FastApiClient } from "@/lib/fastapi-client";
import { API_URL } from "@/utils/api";

const apiKey = process.env.DIFY_API_KEY || "";
const appId = process.env.DIFI_APP_ID || "";

const dify = difyProvider(appId, {
  responseMode: "streaming",
  apiKey: apiKey,
});

export async function POST(req: NextRequest) {
  try {
    const {
      conversationId,
      messages,
      userId,
    }: { 
      conversationId: string; 
      messages: CoreMessage[]; 
      userId?: number;
    } = await req.json();

    // Extract auth token from headers
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const headers: Record<string, string> = {
      "user-id": userId?.toString() || "anonymous",
    };
    if (conversationId) {
      headers["chat-id"] = conversationId;
    }

    // If we have a token and userId, save chat message to FastAPI backend
    if (token && userId && messages.length > 0) {
      try {
        const fastApiClient = new FastApiClient(API_URL, async () => token);
        const lastMessage = messages[messages.length - 1];
        
        if (lastMessage.role === 'user' && lastMessage.content) {
          await fastApiClient.sendChatMessage({
            user_id: userId,
            query: lastMessage.content.toString(),
            conversation_id: conversationId,
            chat_client_id: generateUUID(),
          });
        }
      } catch (error) {
        console.warn('Failed to save chat message to backend:', error);
        // Continue with chat processing even if backend save fails
      }
    }

    const stream = createDataStream({
      execute: async (dataStream) => {
        const result = await streamText({
          model: dify,
          messages,
          headers,
          maxSteps: 2,
          maxRetries: 3,
          // maxTokens: 512,
          experimental_transform: smoothStream({ chunking: "word" }),
          experimental_generateMessageId: generateUUID,
          onFinish: async ({ response }) => {
            console.log(response);
          },
        });
        result.consumeStream();

        result.mergeIntoDataStream(dataStream, {
          sendReasoning: true,
        });
      },
      onError: () => {
        return "Oops, an error occurred!";
      },
    });

    return new Response(stream);
  } catch (e) {
    console.error("MCP/AI Error", e);
    return new Response("Internal Server Error", { status: 500 });
  }
}
