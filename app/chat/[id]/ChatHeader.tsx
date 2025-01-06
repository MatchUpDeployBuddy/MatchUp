"use client";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

export default function ChatHeader({ id }: { id: string}) {
    const user = useUserStore((state) => state.user)
    const [onlineUsers, setOnlineUsers] = useState(0);
    const supabase = createClient();

    useEffect(() => {
        const channel = supabase.channel(`event-sync-${id}`);
        channel.on("presence", { event: "sync"}, () => {
            const userIds = []
            for (const id in channel.presenceState()) {
                //@ts-expect-error dont have types
                userIds.push(channel.presenceState()[id][0].user_id)
            }
            setOnlineUsers([...new Set(userIds)].length)
        }).subscribe(async (status) => {
            if(status === "SUBSCRIBED")
            await channel.track({
                online_at: new Date().toISOString(),
                user_id: user?.id
            })
        })

    }, [user, id, supabase]);

    if(!user){
        return <div className="h-3 w-1"></div>
    }

    return (
        <div className="h-20 bg-gray-100 border-b flex items-center justify-between">
          <div className="p-5 flex flex-col">
            <h1 className="text-xl font-bold">Chat</h1>
            <div className="flex items-center gap-1">
              <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse"></div>
              <h2 className="text-sm text-gray-500">{onlineUsers} online</h2>
            </div>
          </div>
        </div>
      );
}