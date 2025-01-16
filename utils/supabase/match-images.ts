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
  
  const sportImageMapping: Record<string, string> = {
    soccer: "soccer.jpeg",
    basketball: "basketball.jpg",
    volleyball: "volleyball.jpeg",
    tennis: "tennis.jpg",
    swimming: "swimming.jpg",
    cycling: "cycling.jpeg",
    running: "running.jpg",
    badminton: "badminton.jpeg",
    tabletennis: "tabletennis.jpg",
    hiking: "hiking.jpg"
  };

  // getSportImage.ts
  export async function getSportImage(sport: string): Promise<string> {
    const supabase = createClient();
    const fileName = sportImageMapping[sport.toLowerCase().replace(/\s+/g, '')];
    
    if (!fileName) {
      throw new Error(`Error fetching image for sport "${sport}": No valid image found`);
    }
  
    const { data: publicUrlData } = supabase
      .storage
      .from("match_images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }
  