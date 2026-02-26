import { ChatMessage, MessageResponse } from "../types/chat";

export const transformMessageResponse = (
  response: MessageResponse,
  chatId: string | number
): ChatMessage => {
  return {
    id: parseInt(response.message_id) || Date.now(), // Convert string to number, fallback to timestamp
    chat_id: parseInt(chatId.toString()),
    chat_role_id: 2, // assuming 2 is assistant role
    content: response.answer,
    created_at: new Date(response.created_at * 1000).toISOString(), // Convert UNIX timestamp to ISO string
    updated_at: new Date(response.created_at * 1000).toISOString(),
    chat_message_role: {
      role: "assistant",
      id: 2,
      created_at: new Date(response.created_at * 1000).toISOString(),
      updated_at: new Date(response.created_at * 1000).toISOString(),
    },
  };
};
