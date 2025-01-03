import { createClient } from "@/utils/supabase/client";

export async function getRandomImage(): Promise<string | null> {
  const supabase = createClient();

  // Hole eine Liste von Bildern aus dem "match_images" Bucket
  const { data } = await supabase.storage
    .from("match_images")
    .list('', { limit: 100 }); ;

  if (!data || data.length === 0) {
    console.error("No images found.");
    return null;
  }

  // Wähle ein zufälliges Bild aus der Liste
  const randomImage = data[Math.floor(Math.random() * data.length)];

  // Hole die öffentliche URL des ausgewählten Bildes
  const { data: publicUrlData } = supabase.storage
    .from("match_images")
    .getPublicUrl(randomImage.name);

  if (!publicUrlData?.publicUrl) {
    console.error("Error getting public URL: no public URL found");
    return null;
  }

  return publicUrlData.publicUrl; // Gib die URL zurück
}
