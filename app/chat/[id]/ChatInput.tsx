"use client";

import { Input } from "@/components/ui/input";
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast"
import { v4 as uuidv4 } from 'uuid';
import { useUserStore } from "@/store/userStore";
import { Imessage, useMessagesStore } from "@/store/messagesStore";

export default function ChatInput({ id }: { id: string }) {
    const user = useUserStore(state => state.user);
    const addMessage = useMessagesStore(state => state.addMessage);
    const supabase = createClient();
    const { toast } = useToast()

    const handleSendMessage = async (message: string) => {
        if (!message) return;

        const messageId = uuidv4();
       
        const newMessage = {
            id: messageId,
            content: message,
            event_id: id,
            sender_id: user?.id,
            created_at: new Date().toISOString(),
            users: {
                id: user?.id,
                name: user?.name,
                username: user?.username,
                profile_picture_url: user?.profile_picture_url
            }
        }

        addMessage(id, newMessage as Imessage);

        const { error } = await supabase.from('messages').insert({
            id: messageId,
            content: message,
            event_id: id,
            created_at: newMessage.created_at,
        });

        if (error) {
            toast({
                title: 'Error',
                description: "Failed to send message"
            });
            console.log(error)
        }
    }

    return (
        <div className="p-5">
            <Input placeholder="Send message" onKeyDown={(e)=>{
                if(e.key === 'Enter') {
                    handleSendMessage(e.currentTarget.value);
                    e.currentTarget.value = '';
                }
            }}/>
        </div>
    )
}