'use client';
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

export default function ChatPage() {
    const [user, setUser] = useState({})

    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const {data, error} = await supabase.auth.getUser();
            
            if (error || !data?.user) {
                console.log('No user')
            } else {
                setUser(data.user)
            }
        }
        getUser()
    }, [])

    return (
        <div className="max-w-3x1 mx-auto md:py-10 h-screen">

            <div className="h-full border rounded-md">

                <div className="h-20">

                    <div className="p-5 border-b flex items-center justify-between">

                        <div>
                            <h1 className="text-x1 font-bold">Chat</h1>
                            <div className="flex items-center gap-1">
                                <div className="h-4 w-4 bg-green-500 rounded-full animate-pulse">
                                </div>
                                <h1 className="text-sm text-gray-400">2 online</h1>
                            </div>
                        </div>
                    <Button>Join</Button>
                    </div>

                </div>

            </div>

        </div>
    )
    }