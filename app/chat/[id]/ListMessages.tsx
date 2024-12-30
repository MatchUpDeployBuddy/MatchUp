"use client";
import { Imessage } from "@/store/messagesStore";
import React, { useEffect, useRef } from "react";
import { useMessagesStore } from "@/store/messagesStore";
import Message from "./Message";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function ListMessages({ eventId, currentMessages }: { eventId: string, currentMessages: Imessage[]}) {
    const { messages, setMessages, addMessage } = useMessagesStore();
    const initState = useRef(false);
    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        if (!initState.current) {
            console.log("Initializing messages");
            setMessages(eventId, currentMessages);
            initState.current = true;
          }

        const channel = supabase
            .channel(`event-messages-${eventId}`)
            .on("postgres_changes", 
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `event_id=eq.${eventId}`
                },
                async (payload) => {
                    const  { data, error } = await supabase.from("users")
                                                            .select("id, name, username, profile_picture_url")
                                                            .eq("id", payload.new.sender_id)
                                                            .single();
                    if (error) {
                        toast({
                            title: "Error",
                            description: "Failed to fetch user information"
                        })
                    }else {
                        const newMessage = {
                            ...payload.new,
                            users: data
                        }
                        addMessage(eventId, newMessage as Imessage);
                    }
                }
            )
            .subscribe();
        
        return () => {
            channel.unsubscribe();
        }

    }, [eventId, currentMessages, setMessages])
    
    return (
        <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto">
            <div className="flex-1"></div>
            <div className="space-y-7">
            {messages[eventId] && messages[eventId].length > 0 ? (
                messages[eventId].map((value) => (
                    <Message key={value.id} message={value} />
                ))
                ) : (
                <p>No messages available.</p>
            )}
            </div>
        </div>
    )
}