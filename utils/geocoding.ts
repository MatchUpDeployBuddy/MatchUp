export interface Coordinates {
    latitude: number;
    longitude: number;
  }
  
  // Forward Geocoding: Adresse zu Koordinaten
  export async function geocodeAddress(address: string): Promise<Coordinates | null> {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Mapbox Access Token ist nicht definiert.");
      return null;
    }
  
    const encodedAddress = encodeURIComponent(address);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&limit=1`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Fehler bei der Geocoding-Anfrage:", response.statusText);
        return null;
      }
  
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const topResult = data.features[0];
  
        // Relevance-Wert ausgeben
        console.log("Relevance für die Adresse:", topResult.relevance);
  
        // Relevance prüfen (z. B. Schwellenwert 0.8)
        if (topResult.relevance < 0.8) {
          console.warn(
            "Relevance zu niedrig. Adresse möglicherweise ungültig:",
            address
          );
          return null;
        }
  
        const [longitude, latitude] = topResult.center;
        return { latitude, longitude };
      } else {
        console.warn("Keine Geocoding-Ergebnisse gefunden.");
        return null;
      }
    } catch (error) {
      console.error("Fehler bei der Geocoding-Anfrage:", error);
      return null;
    }
  }
  
  
  // Reverse Geocoding: Koordinaten zu Adresse
  export async function reverseGeocodeCoordinates(
    latitude: number,
    longitude: number
  ): Promise<string | null> {
    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Mapbox Access Token ist nicht definiert.");
      return null;
    }
  
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&limit=1`;
  
    try {
      const response = await fetch(url);
      if (!response.ok) {
        console.error("Fehler bei der Reverse Geocoding-Anfrage:", response.statusText);
        return null;
      }
  
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].place_name;
      } else {
        console.warn("Keine Reverse Geocoding-Ergebnisse gefunden.");
        return null;
      }
    } catch (error) {
      console.error("Fehler bei der Reverse Geocoding-Anfrage:", error);
      return null;
    }
  }
  