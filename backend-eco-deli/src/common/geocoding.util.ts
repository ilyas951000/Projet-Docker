import axios from 'axios';

interface OpenCageResponse {
  results: {
    geometry: {
      lat: number;
      lng: number;
    };
  }[];
}

/**
 * Géocode une adresse en latitude / longitude via l'API OpenCage
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
  const apiKey = process.env.OPENCAGE_API_KEY;

  if (!apiKey) {
    throw new Error('❌ Clé OpenCage manquante. Vérifie .env ou ConfigModule.');
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
    address,
  )}&key=${apiKey}&language=fr&limit=1`;

  const res = await axios.get<OpenCageResponse>(url);
  const results = res.data?.results;

  if (!results || results.length === 0) {
    throw new Error(`Adresse non trouvée : ${address}`);
  }

  const { lat, lng } = results[0].geometry;
  return { lat, lng };
}
