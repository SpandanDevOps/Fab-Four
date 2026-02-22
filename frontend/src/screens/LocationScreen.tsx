/**
 * LocationScreen Component
 * Select police station and confirm location with OpenStreetMap (Leaflet)
 * Fetches real police stations from OSM based on user's actual location
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { Search, MapPin, Phone, Building, CheckCircle, Navigation, Loader2, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext.js';
import { PoliceStation } from '../types/index.js';
import { apiService } from '../services/apiService.js';
import Header from '../components/Header.js';

// Fix Leaflet default marker icon issue
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

// Custom marker icons
const userLocationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-4 h-4 bg-green-500 border-2 border-white rounded-full shadow-lg animate-pulse"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const policeStationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-purple-500 border-2 border-white rounded-lg shadow-lg flex items-center justify-center">
    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const selectedStationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white rounded-lg shadow-xl flex items-center justify-center animate-bounce">
    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Component to control map view
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface LocationScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
  selectedStation: PoliceStation | null;
  onSelectStation: (station: PoliceStation) => void;
}

export default function LocationScreen({
  onNavigate,
  onBack,
  selectedStation,
  onSelectStation,
}: LocationScreenProps) {
  const { t, theme } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [locating, setLocating] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // Fetch stations from API based on user location
  const [stations, setStations] = useState<PoliceStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);

  // Fallback: Get approximate location from IP address
  const getLocationFromIP = useCallback(async () => {
    try {
      // Try multiple free IP geolocation services
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
            if (lat && lng) {
              return { lat, lng, city: data.city || 'Unknown', approximate: true };
            }
          }
        } catch {
          continue; // Try next service
        }
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Fetch police stations from API based on location
  const fetchNearbyStations = useCallback(async (lat: number, lng: number) => {
    setLoadingStations(true);
    try {
      const response = await apiService.getNearbyStations(lat, lng, { limit: 15, radius: 10000 });
      if (response.success && response.data) {
        // Map API response to PoliceStation type
        const mappedStations: PoliceStation[] = response.data.map((s: any) => ({
          id: s.id,
          name: s.name,
          address: s.address || 'Address not available',
          phone: s.phone || 'N/A',
          lat: s.lat,
          lng: s.lng,
          distance: s.distance,
        }));
        setStations(mappedStations);
      }
    } catch (error) {
      console.error('Failed to fetch nearby stations:', error);
    } finally {
      setLoadingStations(false);
    }
  }, []);

  // Get user's location on mount with fallback
  useEffect(() => {
    const getLocation = async () => {
      setLocating(true);
      setLocationError(null);

      // First try browser geolocation (precise GPS)
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 60000,
            });
          });
          
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setMapCenter([latitude, longitude]);
          setMapZoom(14);
          setLocating(false);
          // Fetch stations based on actual GPS location
          fetchNearbyStations(latitude, longitude);
          return;
        } catch (geoError: any) {
          console.log('GPS failed, trying IP fallback...', geoError.message);
        }
      }

      // Fallback to IP-based location
      const ipLocation = await getLocationFromIP();
      if (ipLocation) {
        setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
        setMapCenter([ipLocation.lat, ipLocation.lng]);
        setMapZoom(12);
        setLocating(false);
        setLocationError(`Approximate location (${ipLocation.city}). Enable GPS for precise location.`);
        // Fetch stations based on IP location
        fetchNearbyStations(ipLocation.lat, ipLocation.lng);
        return;
      }

      // All methods failed
      setLocating(false);
      setLocationError('Could not detect your location. Please enable GPS or check your internet connection.');
    };

    getLocation();
  }, [getLocationFromIP, fetchNearbyStations]);

  const filteredStations = useMemo(() => 
    stations.filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.address.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [stations, searchQuery]
  );

  const handleStationSelect = useCallback((station: PoliceStation) => {
    onSelectStation(station);
    setMapCenter([station.lat, station.lng]);
    setMapZoom(16);
  }, [onSelectStation]);

  const handleLocateMe = useCallback(async () => {
    setLocating(true);
    setLocationError(null);

    // Try GPS first
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setMapZoom(15);
        setLocating(false);
        // Refresh stations for new location
        fetchNearbyStations(latitude, longitude);
        return;
      } catch {
        console.log('GPS failed, trying IP fallback...');
      }
    }

    // Fallback to IP geolocation
    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
      setMapCenter([ipLocation.lat, ipLocation.lng]);
      setMapZoom(12);
      setLocating(false);
      setLocationError(`Approximate location. Enable GPS for precision.`);
      // Refresh stations for IP location
      fetchNearbyStations(ipLocation.lat, ipLocation.lng);
      return;
    }

    setLocating(false);
    setLocationError('Unable to detect location. Check GPS permissions.');
  }, [getLocationFromIP, fetchNearbyStations]);

  // Tile layer URL based on theme
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const tileAttribution = theme === 'dark'
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'gradient-dark-bg' : 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50'}`}>
      {theme === 'dark' && <div className="fixed inset-0 gradient-mesh pointer-events-none" />}
      
      <Header title={t('location.selectPoliceStation')} showBack onBack={onBack} />

      <main className="px-4 pt-4 pb-8 relative">
        {/* Search with locate button */}
        <div className="relative mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('location.search')}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/80 backdrop-blur-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLocateMe}
            disabled={locating}
            className="px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md hover:shadow-lg hover:shadow-purple-500/30 transition-all disabled:opacity-50"
          >
            {locating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* Location status banner */}
        {locationError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-4 p-3 rounded-xl text-sm flex items-center gap-2 ${
              locationError.includes('Approximate') 
                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200'
            }`}
          >
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{locationError}</span>
            {!locating && (
              <button
                onClick={handleLocateMe}
                className="text-xs underline hover:no-underline"
              >
                Retry GPS
              </button>
            )}
          </motion.div>
        )}

        {/* OpenStreetMap */}
        <div className="h-64 rounded-2xl overflow-hidden mb-4 border border-gray-200 dark:border-gray-700 shadow-lg relative z-10">
          {locating && !mapCenter ? (
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">Detecting your location...</p>
            </div>
          ) : !mapCenter ? (
            <div className="h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30">
              <AlertCircle className="w-10 h-10 text-yellow-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">Location not available</p>
              <button onClick={handleLocateMe} className="mt-2 text-purple-600 text-sm underline">
                Try again
              </button>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={mapZoom}
              style={{ height: '100%', width: '100%' }}
              zoomControl={true}
            >
              <TileLayer url={tileUrl} attribution={tileAttribution} />
              <MapController center={mapCenter} zoom={mapZoom} />

            {/* User location marker with accuracy circle */}
            {userLocation && (
              <>
                <Circle
                  center={[userLocation.lat, userLocation.lng]}
                  radius={100}
                  pathOptions={{
                    color: '#10b981',
                    fillColor: '#10b981',
                    fillOpacity: 0.15,
                    weight: 2,
                  }}
                />
                <Marker
                  position={[userLocation.lat, userLocation.lng]}
                  icon={userLocationIcon}
                >
                  <Popup>
                    <div className="text-center">
                      <strong className="text-green-600">📍 Your Location</strong>
                      <p className="text-xs text-gray-500 mt-1">
                        {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Police station markers */}
            {filteredStations.map((station) => (
              <Marker
                key={station.id}
                position={[station.lat, station.lng]}
                icon={selectedStation?.id === station.id ? selectedStationIcon : policeStationIcon}
                eventHandlers={{
                  click: () => handleStationSelect(station),
                }}
              >
                <Popup>
                  <div className="min-w-[180px]">
                    <h4 className="font-semibold text-gray-900">{station.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{station.address}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-3 h-3 text-purple-500" />
                      <a href={`tel:${station.phone}`} className="text-sm text-purple-600 font-medium">
                        {station.phone}
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">📏 {station.distance} km away</p>
                  </div>
                </Popup>
              </Marker>
            ))}
            </MapContainer>
          )}
        </div>

        {/* Map legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span> Your location
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-purple-500 rounded"></span> Police station
          </span>
        </div>

        <h3 className="font-semibold mb-3 flex items-center gap-2 text-gray-900 dark:text-white">
          <Building className="w-5 h-5 text-purple-500" />
          {t('location.nearestHub')}
          {loadingStations && <Loader2 className="w-4 h-4 animate-spin text-purple-500" />}
        </h3>
        
        {/* Loading stations */}
        {loadingStations && stations.length === 0 && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-purple-500 mr-2" />
            <span className="text-gray-600 dark:text-gray-400">Finding nearby police stations...</span>
          </div>
        )}

        {/* No stations found */}
        {!loadingStations && stations.length === 0 && userLocation && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 dark:text-gray-400">No police stations found nearby</p>
            <p className="text-sm text-gray-500 mt-1">Try expanding your search area</p>
          </div>
        )}

        {/* Stations list */}
        <div className="space-y-3">
          {filteredStations.map((station) => (
            <motion.button
              key={station.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleStationSelect(station)}
              className={`w-full p-4 rounded-xl text-left transition-all card-hover ${
                selectedStation?.id === station.id
                  ? 'bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-white dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    selectedStation?.id === station.id
                      ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-md'
                      : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate text-gray-900 dark:text-white">{station.name}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{station.address}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {station.distance} km
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {station.phone}
                    </span>
                  </div>
                </div>
                {selectedStation?.id === station.id && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0"
                  >
                    <CheckCircle className="w-5 h-5 text-purple-500" />
                  </motion.div>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onNavigate('EVIDENCE')}
          disabled={!selectedStation}
          className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-purple-500/30 btn-hover-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all"
        >
          {t('location.confirm')}
        </motion.button>
      </main>
    </div>
  );
}
