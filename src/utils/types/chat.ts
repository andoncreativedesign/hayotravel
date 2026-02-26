import { Itinerary } from "@/store/itinerary/itinerary.store";

export type Chat = {
  user_id: number;
  chat_status_id: number;
  external_id: string;
  chat_client_id: string;
  title: string;
  destination: string;
  travel_start_date: string; // ISO date string
  travel_end_date: string;
  travelers_count: number;
  chat_metadata: Record<string, unknown>;
  id: number;
  started_at: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  itinerary_id: number | null;
  user: {
    email: string;
    full_name: string;
    is_active: boolean;
    user_role_id: number;
    external_id: string;
    id: number;
    created_at: string;
    updated_at: string;
    user_role: {
      role: UserRole;
      id: number;
      created_at: string;
      updated_at: string;
    };
  };
  chat_status: {
    status: ChatStatus;
    id: number;
    created_at: string;
    updated_at: string;
  };
};

export enum UserRole {
  Admin = "admin",
  User = "user",
}

export enum ChatStatus {
  Active = "active",
  Closed = "closed",
}

export type MutateNewChatBody = {
  user_id: number;
  chat_status_id: number;
  client_id: string;
};

// Messages

export type ChatMessageRole = {
  role: "user" | "assistant";
  id: number;
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  chat_id: number;
  chat_role_id: number;
  content: string;
  id: number;
  created_at: string;
  updated_at: string;
  chat_message_role: ChatMessageRole;
};

export type ChatMessages = ChatMessage[];

export type MessageMutationBody = {
  user_id: number;
  chat_client_id?: string; // Temporary fix
  query: string;
  conversation_id?: string;
};

export type MessageResponse = {
  answer: string;
  conversation_id: string;
  message_id: string;
  client_id: string;
  metadata: {
    model: string; // например, "gpt-4"
    usage: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
  };
  created_at: number; // UNIX timestamp
};

// Messages

export interface SendItineraryBody {
  chat_id: number;
  title: string;
  start_date: string;
  end_date: string;
  currency: string;
  itinerary_data: {
    travelers_count: number;
    itinerary: Itinerary[];
  };
}

export interface GetItineraryResponse extends SendItineraryBody {
  id: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}
