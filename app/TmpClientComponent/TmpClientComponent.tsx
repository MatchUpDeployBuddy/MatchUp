'use client'

import { createClient } from "@/utils/supabase/client"
import { useEffect, useState } from "react"

export default function TmpClientComponent() {
    const [user, setUser] = useState({})
// TODO: abchecken ob wir das noch brauchen oder ob wir das löschen können
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
    console.log({user})

    return <p>Client Comp Test</p>
}