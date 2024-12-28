// app/api/update-user/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

const userSchema = z.object({
    userId: z.string(),
    username: z
      .string()
      .min(1, { message: "Name is required" })
      .max(50, { message: "Name must be 50 characters or less" }),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: "Please enter a valid date in YYYY-MM-DD format",
    }),
    sportInterests: z
      .array(z.string())
      .min(1, { message: "Please select at least one sport" }),
    city: z.string().min(1, { message: "Please select a city" }),
    profilePicture: z
      .string()
      .url({ message: "Please upload a profile picture" })
      .optional(),
  });

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const body = await request.json();

    const parsedData = userSchema.safeParse(body);

    if (!parsedData.success) {
      const errors = parsedData.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { userId, ...updateData } = parsedData.data;

    const { data, error } = await supabase
      .from('users')
      .update({
        username: updateData.username,
        birthday: updateData.birthday,
        sport_interests: updateData.sportInterests,
        city: updateData.city,
        profile_picture_url: updateData.profilePicture || null,
      })
      .eq('id', userId)
      .select();

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'User updated successfully', data }, { status: 200 });
  } catch (error: any) {
        console.error('Error updating user:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
