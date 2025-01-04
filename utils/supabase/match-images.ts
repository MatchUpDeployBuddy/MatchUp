import { createClient } from "@/utils/supabase/client";

export async function getRandomImage(): Promise<string | null> {
  const supabase = createClient();


  const { data } = await supabase.storage
    .from("match_images")
    .list('', { limit: 100 }); ;

  if (!data || data.length === 0) {
    console.error("No images found.");
    return null;
  }

  const randomImage = data[Math.floor(Math.random() * data.length)];

  const { data: publicUrlData } = supabase.storage
    .from("match_images")
    .getPublicUrl(randomImage.name);

  if (!publicUrlData?.publicUrl) {
    console.error("Error getting public URL: no public URL found");
    return null;
  }

  return publicUrlData.publicUrl;
}

export async function getSportImage(sport: string): Promise<string> {
    const supabase = createClient();
  
    // Erstelle eine Liste der unterstützten Bildformate
    const supportedFormats = ['jpg', 'jpeg', 'png'];
  
    let imageUrl = '';
    
    // Versuche, das Bild für jedes Format zu laden
    for (const format of supportedFormats) {
      const imageName = `${sport.toLowerCase()}.${format}`;
      const { data: publicUrlData } = supabase.storage
        .from("match_images")
        .getPublicUrl(imageName);
  
      if (publicUrlData?.publicUrl) {
        imageUrl = publicUrlData.publicUrl; // Bild gefunden, URL speichern
        break; // Stoppe die Schleife, wenn ein Bild gefunden wurde
      }
    }
  
    if (!imageUrl) {
      console.error(`Error fetching image for sport "${sport}": No valid image found`);
      return `https://your-bucket-url.com/images/placeholder.jpg`; // Fallback-Bild
    }
  
    return imageUrl; // Gebe die URL des gefundenen Bildes zurück
  }
  