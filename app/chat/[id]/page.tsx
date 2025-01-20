import React from "react";
import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import { NAVBAR_HEIGHT } from "@/constants";

export default async function ChatPage({ params }: { params: { id: string } }) {
    const awaitedParams = await Promise.resolve(params);
    const { id } = awaitedParams;
    
    return (
        <div className="max-w-3x1 mx-auto md:py-10 h-screen"
        style={{ paddingBottom: `${NAVBAR_HEIGHT + 20}px` }}>
            <div className="h-full border rounded-md flex flex-col relative">
                <ChatHeader id={id} />
                <ChatMessages id={id} />
                <ChatInput id={id} />
            </div>

        </div>
    )
}