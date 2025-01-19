"use client";

import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from "@/store/userStore";
import { Imessage, useMessagesStore } from "@/store/messagesStore";
import { FaPaperPlane } from "react-icons/fa";
import { Button } from "@/components/ui/button";

export default function ChatInput({ id }: { id: string }) {
    const user = useUserStore(state => state.user);
    const addMessage = useMessagesStore(state => state.addMessage);
    const supabase = createClient();
    const [message, setMessage] = useState("");

    const handleSendMessage = async () => {
        const trimmedMessage = message.trim();
        if (trimmedMessage === "") return;

        const messageId = uuidv4();
       
        const newMessage = {
            id: messageId,
            content: trimmedMessage,
            event_id: id,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            users: {
                id: user?.id,
                username: user?.username,
                profile_picture_url: user?.profile_picture_url
            }
        }

        addMessage(id, newMessage as Imessage);
        setMessage("");
        const { error } = await supabase.from('messages').insert({
            id: messageId,
            content: trimmedMessage,
            event_id: id,
            created_at: newMessage.created_at,
        });

        if (error) {
            toast.error("Failed to send message");
            console.log(error)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSendMessage();
        }
      };

    return (
        <div className="p-5 bg-white border-t flex items-center gap-2">
            <Input
                placeholder="Send a message..."
                className="flex-1"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <Button
                className="flex-shrink-0"
                onClick={handleSendMessage}
                disabled={message.trim() === ""}
                aria-label="Send message"
            >
            <FaPaperPlane className="h-5 w-5" />
            </Button>
        </div>
      );
}