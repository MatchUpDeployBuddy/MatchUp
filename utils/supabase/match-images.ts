import { createClient } from "@/utils/supabase/client";

// getRandomImage.ts
export async function getRandomImage(): Promise<string> {
    const supabase = createClient();
  
    const { data } = await supabase.storage
      .from("match_images")
      .list('', { limit: 100 });
  
    if (!data || data.length === 0) {
      throw new Error("No images found");
    }
  
    const randomImage = data[Math.floor(Math.random() * data.length)];
  
    const { data: publicUrlData } = supabase.storage
      .from("match_images")
      .getPublicUrl(randomImage.name);
  
    if (!publicUrlData?.publicUrl) {
      throw new Error("Error getting public URL: no public URL found");
    }
  
    return publicUrlData.publicUrl;
  }
  
  // getSportImage.ts
  export async function getSportImage(sport: string): Promise<string> {
    const supabase = createClient();
  
    // Erstelle eine Liste der unterstützten Bildformate
    const supportedFormats = ['jpg', 'jpeg', 'png'];
  
    let imageUrl = '';
  
    // Versuche, das Bild für jedes Format zu laden
    for (const format of supportedFormats) {
      let imageName = ""
      if (sport === "Soccer") {
        imageName = `${sport.toLowerCase()}.jpeg`;
      }
      else {
        imageName = `${sport.toLowerCase()}.${format}`;
      }
      const { data: publicUrlData } = supabase.storage
        .from("match_images")
        .getPublicUrl(imageName);

      if (publicUrlData?.publicUrl) {
        imageUrl = publicUrlData.publicUrl; 
        break; 
      }
    }
  
    if (!imageUrl) {
      throw new Error(`Error fetching image for sport "${sport}": No valid image found`);
    }
  
    return imageUrl; 
  }
  