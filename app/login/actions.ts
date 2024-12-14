'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import * as z from 'zod';

import { createClient } from '@/utils/supabase/server'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
  
const signupSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
});

export async function login(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }
    console.log(data)
    const parsedData = loginSchema.safeParse(data)

    if (!parsedData.success) {
        redirect('/error');
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const parsedData = signupSchema.safeParse(data)

    if (!parsedData.success) {
        redirect('/error');
    }

    const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
            data: {
                name: data.name
            }
        }
    })

    if (error) {
        redirect('/error')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}