import { Imessage } from "@/store/messagesStore";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Message({message}: {message: Imessage}) {

    return(
        <div className="flex gap-2">
            <Avatar className="w-16 h-16 border-2 border-primary">
                <AvatarImage 
                    src={message.users?.profile_picture_url!}
                    alt={message.users?.name!}
                />
                <AvatarFallback>
                    {message.users?.username?.charAt(0) || 'U'}
                </AvatarFallback>
            </Avatar>
            <div flex-1>
                <div className="flex items-center gap-1">
                    <h1 className="font-bold">{message.users?.username || message.users?.name}</h1>
                    <h1 className="text-sm text-gray-400">
                        {new Date(message.created_at).toDateString()}
                    </h1>
                </div>
                <p>
                    {message.content}
                </p>
            </div>
            
        </div>
    );

}