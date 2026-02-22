/**
 * NearbyScreen Component
 * Display nearby emergency services using OpenStreetMap
 * Shows: Police Stations, Hospitals, Fire Stations, Government Offices
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Phone, Building, Landmark, Heart, Flame, Loader2, Navigation, AlertCircle, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/apiService.js';
import Header from '../components/Header.js';
import BottomNav from '../components/BottomNav.js';
import Footer from '../components/Footer.js';

// Fix Leaflet default marker icon
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Service type definition
interface NearbyPlace {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number;
  type: string;
  website?: string;
}

// Custom marker icons
const createMarkerIcon = (color: string, icon: string) => new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 ${color} border-2 border-white rounded-lg shadow-lg flex items-center justify-center text-white text-xs font-bold">${icon}</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const markerIcons = {
  police: createMarkerIcon('bg-blue-600', '🚔'),
  hospital: createMarkerIcon('bg-red-500', '🏥'),
  fire_station: createMarkerIcon('bg-orange-500', '🚒'),
  government: createMarkerIcon('bg-purple-600', '🏛️'),
  user: new L.DivIcon({
    className: 'custom-marker',
    html: `<div class="w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  }),
};

// Map controller component
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface NearbyScreenProps {
  onNavigate: (screen: string) => void;
}

export default function NearbyScreen({ onNavigate }: NearbyScreenProps) {
  const { t, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'police' | 'hospital' | 'fire' | 'government'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(13);
  const [locating, setLocating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Store all nearby places by category
  const [places, setPlaces] = useState<{
    police: NearbyPlace[];
    hospital: NearbyPlace[];
    fire: NearbyPlace[];
    government: NearbyPlace[];
  }>({
    police: [],
    hospital: [],
    fire: [],
    government: [],
  });

  const filters = [
    { key: 'all' as const, label: 'All Services', icon: MapPin, color: 'from-indigo-500 via-purple-500 to-pink-500' },
    { key: 'police' as const, label: t('nearby.policeStations'), icon: Building, color: 'bg-blue-600' },
    { key: 'hospital' as const, label: t('nearby.hospitals'), icon: Heart, color: 'bg-red-500' },
    { key: 'fire' as const, label: 'Fire Stations', icon: Flame, color: 'bg-orange-500' },
    { key: 'government' as const, label: t('nearby.civicOffices'), icon: Landmark, color: 'bg-purple-600' },
  ];

  // IP-based location fallback
  const getLocationFromIP = useCallback(async () => {
    const services = [
      'https://ipapi.co/json/',
      'https://ip-api.com/json/?fields=lat,lon,city,country',
      'https://ipwho.is/',
    ];
    
    for (const url of services) {
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const lat = data.latitude || data.lat;
          const lng = data.longitude || data.lon;
          if (lat && lng) return { lat, lng, city: data.city || 'Unknown' };
        }
      } catch { continue; }
    }
    return null;
  }, []);

  // Fetch nearby places from backend
  const fetchNearbyPlaces = useCallback(async (lat: number, lng: number) => {
    setLoading(true);
    try {
      const response = await apiService.getNearbyAll(lat, lng, 5000);
      if (response.success && response.data) {
        setPlaces({
          police: response.data.police || [],
          hospital: response.data.hospital || [],
          fire: response.data.fire || [],
          government: response.data.government || [],
        });
      }
    } catch (error) {
      console.error('Failed to fetch nearby places:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user location on mount
  useEffect(() => {
    const getLocation = async () => {
      setLocating(true);
      setLocationError(null);

      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 300000,
            });
          });
          
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setLocating(false);
          fetchNearbyPlaces(latitude, longitude);
          return;
        } catch {
          console.log('GPS failed, trying IP fallback...');
        }
      }

      // Fallback to IP
      const ipLocation = await getLocationFromIP();
      if (ipLocation) {
        setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
        setMapCenter([ipLocation.lat, ipLocation.lng]);
        setLocating(false);
        setLocationError(`Approximate location (${ipLocation.city})`);
        fetchNearbyPlaces(ipLocation.lat, ipLocation.lng);
        return;
      }

      setLocating(false);
      setLocationError('Could not detect location');
      // Fetch with default location
      fetchNearbyPlaces(28.6139, 77.2090);
    };

    getLocation();
  }, [getLocationFromIP, fetchNearbyPlaces]);

  // Filter places by search and category
  const filteredPlaces = useMemo(() => {
    let allPlaces: NearbyPlace[] = [];
    
    if (activeFilter === 'all') {
      allPlaces = [
        ...places.police.map(p => ({ ...p, type: 'police' })),
        ...places.hospital.map(p => ({ ...p, type: 'hospital' })),
        ...places.fire.map(p => ({ ...p, type: 'fire_station' })),
        ...places.government.map(p => ({ ...p, type: 'government' })),
      ];
    } else if (activeFilter === 'fire') {
      allPlaces = places.fire.map(p => ({ ...p, type: 'fire_station' }));
    } else {
      allPlaces = places[activeFilter].map(p => ({ ...p, type: activeFilter }));
    }

    // Sort by distance
    allPlaces.sort((a, b) => a.distance - b.distance);

    // Filter by search
    if (searchQuery) {
      allPlaces = allPlaces.filter(
        p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             p.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allPlaces;
  }, [places, activeFilter, searchQuery]);

  // Locate me handler
  const handleLocateMe = useCallback(async () => {
    setLocating(true);
    setLocationError(null);

    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 8000,
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(14);
        setLocating(false);
        fetchNearbyPlaces(latitude, longitude);
        return;
      } catch { /* fallback */ }
    }

    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
      setMapCenter([ipLocation.lat, ipLocation.lng]);
      setMapZoom(13);
      setLocating(false);
      setLocationError(`Approximate location`);
      fetchNearbyPlaces(ipLocation.lat, ipLocation.lng);
    } else {
      setLocating(false);
      setLocationError('Unable to detect location');
    }
  }, [getLocationFromIP, fetchNearbyPlaces]);

  // Get icon for place type
  const getPlaceIcon = (type: string) => {
    switch (type) {
      case 'police': return Building;
      case 'hospital': return Heart;
      case 'fire_station': return Flame;
      case 'government': return Landmark;
      default: return MapPin;
    }
  };

  const getPlaceColor = (type: string) => {
    switch (type) {
      case 'police': return 'bg-blue-500';
      case 'hospital': return 'bg-red-500';
      case 'fire_station': return 'bg-orange-500';
      case 'government': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  // Tile layer based on theme
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header title={t('nearby.title')} onNavigate={onNavigate} />

      <main className="px-4 pt-4 pb-24 relative">
        {/* Search with locate button */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('nearby.searchArea')}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/50 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLocateMe}
            disabled={locating}
            className="p-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg disabled:opacity-50"
          >
            {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Location status */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-sm flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            {locationError}
          </motion.div>
        )}

        {/* Map */}
        <div className="h-56 rounded-2xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-700 shadow-lg relative z-10">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <TileLayer url={tileUrl} />
            <MapController center={mapCenter} zoom={mapZoom} />

            {/* User location */}
            {userLocation && (
              <>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={200}
                  pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.1 }}
                />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={markerIcons.user}>
                  <Popup>Your Location</Popup>
                </Marker>
              </>
            )}

            {/* Place markers */}
            {filteredPlaces.map((place) => (
              <Marker
                key={`${place.type}-${place.id}`}
                position={[place.lat, place.lng]}
                icon={markerIcons[place.type as keyof typeof markerIcons] || markerIcons.government}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <strong>{place.name}</strong>
                    <p className="text-xs text-gray-600 mt-1">{place.address}</p>
                    {place.phone !== 'N/A' && (
                      <a href={`tel:${place.phone}`} className="text-xs text-blue-600 block mt-1">
                        📞 {place.phone}
                      </a>
                    )}
                    <span className="text-xs text-gray-500 block mt-1">{place.distance} km away</span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
          {filters.map(({ key, label, icon: Icon, color }) => (
            <button
              key={key}
              onClick={() => setActiveFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                activeFilter === key
                  ? key === 'all' 
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg'
                    : `${color} text-white shadow-lg`
                  : 'bg-white dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 border border-gray-200 dark:border-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <span className="ml-2 text-gray-600 dark:text-gray-400">Finding nearby services...</span>
          </div>
        )}

        {/* Results count */}
        {!loading && (
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Found {filteredPlaces.length} {activeFilter === 'all' ? 'services' : filters.find(f => f.key === activeFilter)?.label.toLowerCase() || 'places'} nearby
          </div>
        )}

        {/* Places list */}
        <div className="space-y-3">
          {!loading && filteredPlaces.length === 0 && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 dark:text-gray-400">No services found nearby</p>
              <p className="text-sm text-gray-500">Try expanding your search area</p>
            </div>
          )}

          {filteredPlaces.map((place, index) => {
            const Icon = getPlaceIcon(place.type);
            const bgColor = getPlaceColor(place.type);
            
            return (
              <motion.div
                key={`${place.type}-${place.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="bg-white dark:bg-gray-900/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
                onClick={() => {
                  setMapCenter([place.lat, place.lng]);
                  setMapZoom(16);
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{place.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{place.address}</p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                        {place.distance} km
                      </span>
                      {place.phone !== 'N/A' && (
                        <a
                          href={`tel:${place.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-purple-500 flex items-center gap-1 hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {place.phone.split(';')[0]}
                        </a>
                      )}
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-xs text-blue-500 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <Footer variant="minimal" className="mt-8" />
      </main>

      <BottomNav onNavigate={onNavigate} />
    </div>
  );
}
