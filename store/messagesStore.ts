import { create } from "zustand";

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
    messages: Record<string, Imessage[]>;
    setMessages: (eventId: string, newMessages: Imessage[]) => void;
    addMessage: (eventId: string, newMessage: Imessage) => void;
    clearMessages: (eventId: string) => void;
}

export const useMessagesStore = create<MessageState>((set) => ({
    messages : {},
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
      
      clearMessages: (eventId) =>
        set((state) => ({
          messages: {
            ...state.messages,
            [eventId]: [],
          },
        })),
}));