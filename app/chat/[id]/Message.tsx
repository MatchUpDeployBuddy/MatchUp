import { Imessage } from "@/store/messagesStore";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Message({message, currentUserId}: {message: Imessage, currentUserId: string}) {
    const isCurrentUser = message.users?.id === currentUserId
    return (
        <div
          className={`flex items-start gap-4 p-2 ${isCurrentUser ? "flex-row-reverse ml-auto" : ""}`}
        >
          <Avatar className="w-12 h-12 rounded-full border-2 border-primary shadow-sm">
            <AvatarImage
              src={message.users?.profile_picture_url || ''}
              alt={message.users?.name}
            />
            <AvatarFallback>
              {message.users?.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
    
          <div className={`flex flex-col max-w-[80%] ${isCurrentUser ? "items-end" : "items-start"}`}>
            <div
              className={`flex items-center gap-2 text-sm text-gray-500 ${isCurrentUser ? "justify-end" : ""}`}
            >
              <h1 className="font-medium text-gray-800">
                {message.users?.username || 'Unknown User'}
              </h1>
              <span className="text-xs">
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p
              className={`px-4 py-2 mt-1 rounded-lg shadow-sm ${
                isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.content}
            </p>
          </div>
        </div>
      );

}