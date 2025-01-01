// utils/supabase/storage.ts
import { createClient } from "@/utils/supabase/client";

export async function uploadProfilePicture(file: File): Promise<string | null> {
  const supabase = createClient();
  const { data: {user} } = await supabase.auth.getUser();

  if (!user) return null;
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}.${fileExt}`;

  const { error } = await supabase.storage
    .from('profile_pictures')
    .upload(fileName, file, {
      upsert: true, // Overwrite file if it already exists
    });

  if (error) {
    console.error('Error uploading file:', error.message);
    return null;
  }

  const { data } = supabase.storage
    .from('profile_pictures')
    .getPublicUrl(fileName);

    if (!data || !data.publicUrl) return null;

    const timestamp = new Date().getTime();
    const publicUrlWithTimestamp = `${data.publicUrl}?t=${timestamp}`;
  
    return publicUrlWithTimestamp;
}
