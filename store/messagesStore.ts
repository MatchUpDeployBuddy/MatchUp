import { MESSAGE_LIMIT } from "@/constants";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Imessage = {
  content: string;
  created_at: string;
  event_id: string | null;
  id: string;
  sender_id: string | null;
  users: {
      id: string;
      name: string;
      username: string | null;
      profile_picture_url: string | null;
  } | null;
}

interface MessageState {
    hasMore: Record<string, boolean>;
    page: Record<string, number>;
    messages: Record<string, Imessage[]>;
    setHasMore: (eventId: string, hasMoreValue: boolean) => void;
    setPage: (eventId: string, pageNumber: number) => void;
    setMessages: (eventId: string, newMessages: Imessage[]) => void;
    addMessage: (eventId: string, newMessage: Imessage) => void;
    addMessages: (eventId: string, newMessages: Imessage[]) => void;
    clearMessages: (eventId: string) => void;
}

export const useMessagesStore = create(
  persist<MessageState>(
    (set) => ({
      hasMore: {},
      page: {},
      messages : {},
      setHasMore: (eventId, hasMoreValue) => 
        set((state) => ({
          hasMore: {
            ...state.hasMore,
            [eventId]: hasMoreValue
          }
        })),
      setPage: (eventId, pageNumber) => 
          set((state) => ({
            page: {
              ...state.page,
              [eventId]: pageNumber
            }
          })),
      setMessages: (eventId, newMessages) =>
          set((state) => ({
            messages: {
              ...state.messages,
              [eventId]: newMessages
            },
          })),
      
      addMessage: (eventId, newMessage) =>
        set((state) => {
          const existingMessages = state.messages[eventId] || [];
          const messageExists = existingMessages.some(
            (msg) => msg.id === newMessage.id
          );
    
          if (messageExists) {
            return state;
          }
    
          return {
            messages: {
              ...state.messages,
              [eventId]: [...existingMessages, newMessage],
            },
          };
        }),
      
      addMessages: (eventId, newMessages) =>
        set((state) => ({
            messages: {
              ...state.messages,
              [eventId]: [...newMessages, ...state.messages[eventId]],
            },
            page: {
              ...state.page,
              [eventId]: state.page[eventId] + 1
            },
            hasMore: {
              ...state.hasMore,
              [eventId]: newMessages.length >= MESSAGE_LIMIT
            }
        })),

      clearMessages: (eventId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [eventId]: [],
          },
        })),
  }),
  {
    name: "messages-storage",
    storage: createJSONStorage(() => localStorage)
  }
));