export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Forward Geocoding: Address to coordinates
export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Mapbox Access Token is not defined.");
    return null;
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${accessToken}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Error in the geocoding request:", response.statusText);
      return null;
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      const topResult = data.features[0];

      if (topResult.relevance < 0.8) {
        console.warn("Relevance too low. Address may be invalid:", address);
        return null;
      }

      const [longitude, latitude] = topResult.center;
      return { latitude, longitude };
    } else {
      console.warn("No geocoding results found.");
      return null;
    }
  } catch (error) {
    console.error("Error in the geocoding request:", error);
    return null;
  }
}

// Reverse geocoding: Coordinates to address
export async function reverseGeocodeCoordinates( // TODO: nutze das hier gleich für longitude und latitude
  latitude: number,
  longitude: number
): Promise<string | null> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!accessToken) {
    console.error("Mapbox Access Token is not defined.");
    return null;
  }

  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${accessToken}&limit=1`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error(
        "Error with the reverse geocoding request:",
        response.statusText
      );
      return null;
    }

    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].place_name;
    } else {
      console.warn("No reverse geocoding results found.");
      return null;
    }
  } catch (error) {
    console.error("Error in the reverse geocoding request:", error);
    return null;
  }
}

export const formatAddress = (address: string) => {
  const addressParts = address
    .split(",")
    .slice(-2)
    .map((part) => part.replace(/\d+/g, "").trim());
  return addressParts.join(", ");
};
