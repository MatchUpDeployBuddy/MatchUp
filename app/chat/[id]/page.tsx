import React, { useEffect, useState } from "react";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";

export default function ChatPage() {
    
    const event_id = "12714bda-3e84-44b3-8d2a-c42832e37aee";
    return (
        <div className="max-w-3x1 mx-auto md:py-10 h-screen">

            <div className="h-full border rounded-md flex flex-col">
                <ChatHeader />
                <ChatMessages id={event_id} />
                <ChatInput id={event_id} />
            </div>

        </div>
    )
    }