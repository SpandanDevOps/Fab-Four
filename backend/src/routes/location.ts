/**
 * ============================================================
 * JAAGRUK - YOUR VOICE
 * Location Router — Location & Maps Endpoints (OpenStreetMap)
 * ============================================================
 *
 * Uses OpenStreetMap (OSM) services:
 * - Nominatim: Geocoding & Reverse Geocoding
 * - Overpass: Nearby POIs (Police Stations, Hospitals, Offices)
 *
 * ENDPOINTS:
 * GET    /api/location/stations    → Get nearby police stations (OSM Overpass)
 * GET    /api/location/hospitals   → Get nearby hospitals
 * GET    /api/location/geocode     → Geocode address to coordinates (Nominatim)
 * GET    /api/location/reverse     → Reverse geocode coordinates to address
 * GET    /api/location/search      → Search places by name
 */

import { Router, Request, Response } from 'express';

const router = Router();

// OSM API Configuration
const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';
const USER_AGENT = 'JAAGRUK-CivicReporting/1.0';

// Rate limiting helper - Nominatim requires max 1 request per second
let lastNominatimRequest = 0;
async function nominatimThrottle() {
  const now = Date.now();
  const timeSinceLastRequest = now - lastNominatimRequest;
  if (timeSinceLastRequest < 1000) {
    await new Promise(resolve => setTimeout(resolve, 1000 - timeSinceLastRequest));
  }
  lastNominatimRequest = Date.now();
}

// Calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─── Overpass Query Builder ──────────────────────────────────

function buildOverpassQuery(lat: number, lng: number, amenityType: string, radius: number = 5000): string {
  // Overpass QL query to find amenities within radius
  return `
    [out:json][timeout:25];
    (
      node["amenity"="${amenityType}"](around:${radius},${lat},${lng});
      way["amenity"="${amenityType}"](around:${radius},${lat},${lng});
      relation["amenity"="${amenityType}"](around:${radius},${lat},${lng});
    );
    out center body;
  `;
}

// Fetch from Overpass API
async function fetchFromOverpass(query: string): Promise<any[]> {
  const response = await fetch(OVERPASS_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  return data.elements || [];
}

// Parse Overpass results to consistent format
function parseOverpassResults(elements: any[], userLat: number, userLng: number) {
  return elements
    .filter(el => el.tags && el.tags.name)
    .map(el => {
      // Get center coordinates (for ways/relations, use center; for nodes, use lat/lon)
      const lat = el.center?.lat || el.lat;
      const lng = el.center?.lon || el.lon;
      
      const distance = calculateDistance(userLat, userLng, lat, lng);
      
      return {
        id: String(el.id),
        name: el.tags.name,
        address: [
          el.tags['addr:street'],
          el.tags['addr:city'] || el.tags['addr:district'],
          el.tags['addr:state'],
        ].filter(Boolean).join(', ') || 'Address not available',
        phone: el.tags.phone || el.tags['contact:phone'] || 'N/A',
        lat,
        lng,
        distance: Math.round(distance * 10) / 10,
        type: el.tags.amenity,
        website: el.tags.website || el.tags['contact:website'],
        openingHours: el.tags.opening_hours,
      };
    })
    .sort((a, b) => a.distance - b.distance);
}

// ─── GET /api/location/stations ──────────────────────────────
// Get nearby police stations using OpenStreetMap Overpass API

router.get('/stations', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const limit = parseInt(req.query.limit as string) || 10;
    const radius = parseInt(req.query.radius as string) || 5000; // meters

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    console.log(`[Location] Fetching police stations near ${lat}, ${lng} (radius: ${radius}m)`);

    const query = buildOverpassQuery(lat, lng, 'police', radius);
    const elements = await fetchFromOverpass(query);
    const stations = parseOverpassResults(elements, lat, lng);

    res.json({
      success: true,
      count: Math.min(stations.length, limit),
      data: stations.slice(0, limit),
    });

  } catch (error) {
    console.error('[Location] Stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby police stations',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ─── GET /api/location/hospitals ─────────────────────────────
// Get nearby hospitals using OpenStreetMap

router.get('/hospitals', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const limit = parseInt(req.query.limit as string) || 10;
    const radius = parseInt(req.query.radius as string) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    console.log(`[Location] Fetching hospitals near ${lat}, ${lng}`);

    const query = buildOverpassQuery(lat, lng, 'hospital', radius);
    const elements = await fetchFromOverpass(query);
    const hospitals = parseOverpassResults(elements, lat, lng);

    res.json({
      success: true,
      count: Math.min(hospitals.length, limit),
      data: hospitals.slice(0, limit),
    });

  } catch (error) {
    console.error('[Location] Hospitals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby hospitals',
    });
  }
});

// ─── GET /api/location/fire-stations ─────────────────────────
// Get nearby fire stations using OpenStreetMap

router.get('/fire-stations', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const limit = parseInt(req.query.limit as string) || 10;
    const radius = parseInt(req.query.radius as string) || 8000; // Larger radius for fire stations

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    console.log(`[Location] Fetching fire stations near ${lat}, ${lng}`);

    const query = buildOverpassQuery(lat, lng, 'fire_station', radius);
    const elements = await fetchFromOverpass(query);
    const fireStations = parseOverpassResults(elements, lat, lng);

    res.json({
      success: true,
      count: Math.min(fireStations.length, limit),
      data: fireStations.slice(0, limit),
    });

  } catch (error) {
    console.error('[Location] Fire stations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby fire stations',
    });
  }
});

// ─── GET /api/location/civic-offices ─────────────────────────
// Get nearby government/civic offices

router.get('/civic-offices', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const limit = parseInt(req.query.limit as string) || 10;
    const radius = parseInt(req.query.radius as string) || 5000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    // Query for government offices
    const query = `
      [out:json][timeout:25];
      (
        node["office"="government"](around:${radius},${lat},${lng});
        way["office"="government"](around:${radius},${lat},${lng});
        node["amenity"="townhall"](around:${radius},${lat},${lng});
        way["amenity"="townhall"](around:${radius},${lat},${lng});
        node["amenity"="courthouse"](around:${radius},${lat},${lng});
        way["amenity"="courthouse"](around:${radius},${lat},${lng});
      );
      out center body;
    `;

    const elements = await fetchFromOverpass(query);
    const offices = parseOverpassResults(elements, lat, lng);

    res.json({
      success: true,
      count: Math.min(offices.length, limit),
      data: offices.slice(0, limit),
    });

  } catch (error) {
    console.error('[Location] Civic offices error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby civic offices',
    });
  }
});

// ─── GET /api/location/geocode ───────────────────────────────
// Convert address to coordinates using Nominatim

router.get('/geocode', async (req: Request, res: Response) => {
  try {
    const address = req.query.address as string;
    const countryCode = req.query.country as string || 'in'; // Default to India

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Address query parameter is required',
      });
    }

    await nominatimThrottle();

    const params = new URLSearchParams({
      q: address,
      format: 'json',
      addressdetails: '1',
      limit: '1',
      countrycodes: countryCode,
    });

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found',
      });
    }

    const result = results[0];

    res.json({
      success: true,
      data: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        formatted: result.display_name,
        address: {
          road: result.address?.road,
          suburb: result.address?.suburb,
          city: result.address?.city || result.address?.town || result.address?.village,
          district: result.address?.state_district,
          state: result.address?.state,
          postcode: result.address?.postcode,
          country: result.address?.country,
        },
        boundingBox: result.boundingbox,
        importance: result.importance,
        osmId: result.osm_id,
        osmType: result.osm_type,
      },
    });

  } catch (error) {
    console.error('[Location] Geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to geocode address',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ─── GET /api/location/reverse ───────────────────────────────
// Convert coordinates to address using Nominatim

router.get('/reverse', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const zoom = parseInt(req.query.zoom as string) || 18; // Detail level (0-18)

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    await nominatimThrottle();

    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lng.toString(),
      format: 'json',
      addressdetails: '1',
      zoom: zoom.toString(),
    });

    const response = await fetch(`${NOMINATIM_BASE}/reverse?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      return res.status(404).json({
        success: false,
        message: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        address: result.display_name,
        details: {
          houseNumber: result.address?.house_number,
          road: result.address?.road,
          suburb: result.address?.suburb || result.address?.neighbourhood,
          city: result.address?.city || result.address?.town || result.address?.village,
          district: result.address?.state_district,
          state: result.address?.state,
          postcode: result.address?.postcode,
          country: result.address?.country,
          countryCode: result.address?.country_code,
        },
        area: result.address?.suburb || result.address?.neighbourhood || result.address?.city,
        osmId: result.osm_id,
        osmType: result.osm_type,
      },
    });

  } catch (error) {
    console.error('[Location] Reverse geocode error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reverse geocode coordinates',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ─── GET /api/location/search ────────────────────────────────
// Search for places by name using Nominatim

router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 5;
    const viewbox = req.query.viewbox as string; // SW_lng,SW_lat,NE_lng,NE_lat

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query (q) parameter is required',
      });
    }

    await nominatimThrottle();

    const params = new URLSearchParams({
      q: query,
      format: 'json',
      addressdetails: '1',
      limit: limit.toString(),
      countrycodes: 'in',
    });

    // If viewbox provided, restrict search to area
    if (viewbox) {
      params.append('viewbox', viewbox);
      params.append('bounded', '1');
    }

    const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'en',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const results = await response.json();

    res.json({
      success: true,
      count: results.length,
      data: results.map((r: any) => ({
        placeId: r.place_id,
        osmId: r.osm_id,
        osmType: r.osm_type,
        lat: parseFloat(r.lat),
        lng: parseFloat(r.lon),
        displayName: r.display_name,
        type: r.type,
        category: r.class,
        address: {
          road: r.address?.road,
          suburb: r.address?.suburb,
          city: r.address?.city || r.address?.town || r.address?.village,
          state: r.address?.state,
          postcode: r.address?.postcode,
        },
        importance: r.importance,
      })),
    });

  } catch (error) {
    console.error('[Location] Search error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search places',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// ─── GET /api/location/nearby ────────────────────────────────
// Get all nearby amenities (combined)

router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt(req.query.radius as string) || 3000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: 'Valid lat and lng query parameters are required',
      });
    }

    // Combined query for multiple amenity types including fire stations
    const query = `
      [out:json][timeout:30];
      (
        node["amenity"="police"](around:${radius},${lat},${lng});
        way["amenity"="police"](around:${radius},${lat},${lng});
        node["amenity"="hospital"](around:${radius},${lat},${lng});
        way["amenity"="hospital"](around:${radius},${lat},${lng});
        node["amenity"="fire_station"](around:${radius},${lat},${lng});
        way["amenity"="fire_station"](around:${radius},${lat},${lng});
        node["office"="government"](around:${radius},${lat},${lng});
        way["office"="government"](around:${radius},${lat},${lng});
      );
      out center body;
    `;

    const elements = await fetchFromOverpass(query);
    const results = parseOverpassResults(elements, lat, lng);

    // Group by type
    const grouped = {
      police: results.filter(r => r.type === 'police').slice(0, 5),
      hospital: results.filter(r => r.type === 'hospital').slice(0, 5),
      fire: results.filter(r => r.type === 'fire_station').slice(0, 5),
      government: results.filter(r => !['police', 'hospital', 'fire_station'].includes(r.type)).slice(0, 5),
    };

    res.json({
      success: true,
      data: grouped,
    });

  } catch (error) {
    console.error('[Location] Nearby error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch nearby amenities',
    });
  }
});

export default router;
