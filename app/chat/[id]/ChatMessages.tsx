"use server";
import ListMessages from "./ListMessages";
import React, { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { MESSAGE_LIMIT } from "@/constants";

export default async function ChatMessages({ id }: { id: string }) {

    const supabase = await createClient();

    const { data, error } = await supabase.from("messages")
                            .select("*, users(id, name, username, profile_picture_url)")
                            .eq("event_id", id)
                            .range(0, MESSAGE_LIMIT)
                            .order("created_at", { ascending: false });

    return (
        <Suspense fallback={"loading..."}>
            <ListMessages eventId={id} currentMessages={data?.reverse() || []} />
        </Suspense>
    )
}