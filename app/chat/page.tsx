'use client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Buddy } from "@/types";
import { createClient } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";

export default function ChatPage() {
    const [user, setUser] = useState<Buddy | null>(null)

    useEffect(() => {
        async function getUser() {
            const supabase = createClient();
            const {data: userData, error} = await supabase.auth.getUser();
           
            
            if (error || !userData?.user) {
                console.log('No user')
            } else {
                const {data, error} = await supabase.from('users').select('*').eq('id', userData.user.id).single();
                setUser(data)
            }
        }
        getUser()
    }, [])

    return (
        <div className="max-w-3x1 mx-auto md:py-10 h-screen">

            <div className="h-full border rounded-md flex flex-col">

                <div className="h-20">

                    <div className="p-5 border-b flex items-center justify-between h-full">

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
                <div className="flex-1 flex flex-col p-5 h-full overflow-y-auto">
                    <div className="flex-1"></div>
                    <div className="space-y-7">
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13].map((value) => {
                            return(<div className="flex gap-2 key={value}">
                                <div className="h-10 w-10 bg-green-500 rounded-full"></div>
                                <div flex-1>
                                    <div className="flex items-center gap-1">
                                        <h1 className="font-bold">John Doe</h1>
                                        <h1 className="text-sm text-gray-400">{new Date().toDateString()}</h1>
                                    </div>
                                <p>
                                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
                                </p>
                                </div>
                                
                            </div>);
                        })}
                    </div>
                </div>
                <div className="p-5">
                    <Input placeholder="Send message" />
                </div>
            </div>

        </div>
    )
    }