"use client";

import { Input } from "@/components/ui/input";
import React from "react";
import { createClient } from "@/utils/supabase/client";

export default function ChatInput() {
    const supabase = createClient();
    const handleSendMessage = (message: string) => {
        alert(message);
        
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