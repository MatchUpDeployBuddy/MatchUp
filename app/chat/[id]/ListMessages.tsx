"use client";
import { Imessage } from "@/store/messagesStore";
import React, { useEffect, useRef, useState } from "react";
import { useMessagesStore } from "@/store/messagesStore";
import Message from "./Message";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FaArrowDown } from "react-icons/fa";
import { MESSAGE_LIMIT } from "@/constants";
import { Button } from "@/components/ui/button";

export default function ListMessages({ eventId, currentMessages }: { eventId: string, currentMessages: Imessage[]}) {
    const { page, messages, setMessages, addMessage, addMessages, setPage, setHasMore, hasMore } = useMessagesStore();
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();
    const { toast } = useToast();
    const [userScroll, setUserScroll] = useState(false);
    const [notification, setNotification] = useState(0);

    useEffect(() => {
        // Initialize messages if not already set
        if (!messages[eventId] || messages[eventId].length === 0) {
          console.log("Initializing messages");
          setMessages(eventId, currentMessages);
          setPage(eventId, 1);
          setHasMore(eventId, currentMessages.length >= MESSAGE_LIMIT);
        }
      }, [eventId, currentMessages, messages[eventId], setMessages, setHasMore, setPage]);

    useEffect(() => {

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
                    const scrollContainer = scrollRef.current;
                    if (scrollContainer) {
                        const isScroll = scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;
                        if (isScroll) {
                            setNotification((prev) => prev + 1);
                        }
                    }
                    
                }
            )
            .subscribe();
        
        return () => {
            channel.unsubscribe();
        }

    }, [eventId, messages, addMessage, toast, supabase])

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer && !userScroll) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }, [messages, userScroll])
    
    const handleOnScroll = () => {
        const scrollContainer = scrollRef.current;
        if (scrollContainer) {
            const isScroll = scrollContainer.scrollTop < scrollContainer.scrollHeight - scrollContainer.clientHeight - 10;
            setUserScroll(isScroll);
            if (scrollContainer.scrollTop === scrollContainer.scrollHeight - scrollContainer.clientHeight) {
                setNotification(0);
            }
        }
    }

    const handleScrollDown = () => {
        setNotification(0);
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }

    const getFromAndTo = (page: number, itemPerPage: number) => {
        let from = page * itemPerPage;
        const to = from + itemPerPage;

        if (page > 0) {
            from += 1;
        }
        return { from, to };
    }

    const fetchMoreMessages = async () => {
        const { from, to } = getFromAndTo(page[eventId], MESSAGE_LIMIT);
        const { data, error } = await supabase.from("messages")
                            .select("*, users(id, name, username, profile_picture_url)")
                            .eq("event_id", eventId)
                            .range(from, to)
                            .order("created_at", { ascending: false });

        if (error) {
            toast({
                title: "Error",
                description: "Failed to fetch more messages"
            })
        } else {
            addMessages(eventId, data.reverse());
        }

    }

    return (
        <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto gap-5" 
             ref={scrollRef}
             onScroll={handleOnScroll}
             >
            <div className="flex-1">
                {hasMore[eventId] && (
                    <Button variant="outline" className="w-full mb-4" onClick={fetchMoreMessages}>
                        Load More
                    </Button>
                )}
                
            </div>
            <div className="space-y-4">
            {messages[eventId] && messages[eventId].length > 0 ? (
                messages[eventId].map((value) => (
                    <Message key={value.id} message={value} />
                ))
                ) : (
                <p className="text-center text-gray-500">No messages available.</p>
            )}
            </div>
            {userScroll && (
                <div className="absolute bottom-20 w-full">
                    {notification ? (
                        <div className="w-36 mx-auto bg-green-500 p-1 text-white rounded-md cursor-pointer"
                             onClick={handleScrollDown}
                            >
                            <h1> New {notification} messages</h1>
                        </div>
                        ) : (
                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center mx-auto border cursor-pointer hover:scale-110 transition-all"
                            onClick={handleScrollDown}>
                            <FaArrowDown />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}