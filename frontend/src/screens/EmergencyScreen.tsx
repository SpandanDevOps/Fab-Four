/**
 * EmergencyScreen Component
 * Emergency SOS with live location tracking and dynamic police contacts
 */

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Building, Phone, Navigation, ArrowLeft, MapPin, Loader2, RefreshCw, ExternalLink, Heart, Flame } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '../context/AppContext.js';
import { apiService } from '../services/apiService.js';

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

// Custom markers
const userLocationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-5 h-5 bg-red-500 border-3 border-white rounded-full shadow-lg animate-pulse"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const policeStationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-blue-600 border-2 border-white rounded-lg shadow-lg flex items-center justify-center text-white text-xs">🚔</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const hospitalIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-red-500 border-2 border-white rounded-lg shadow-lg flex items-center justify-center text-white text-xs">🏥</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const fireStationIcon = new L.DivIcon({
  className: 'custom-marker',
  html: `<div class="w-8 h-8 bg-orange-500 border-2 border-white rounded-lg shadow-lg flex items-center justify-center text-white text-xs">🚒</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Map controller for live updates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface NearbyService {
  id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  distance: number;
  type: string;
}

interface EmergencyScreenProps {
  onBack: () => void;
}

export default function EmergencyScreen({ onBack }: EmergencyScreenProps) {
  const { t, theme } = useApp();
  
  // Location state
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [locating, setLocating] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  // Nearby services - store arrays for map display
  const [policeStations, setPoliceStations] = useState<NearbyService[]>([]);
  const [hospitals, setHospitals] = useState<NearbyService[]>([]);
  const [fireStations, setFireStations] = useState<NearbyService[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Get nearest of each for quick access
  const nearestPolice = policeStations[0] || null;
  const nearestHospital = hospitals[0] || null;
  const nearestFire = fireStations[0] || null;

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

  // Fetch nearest emergency services
  const fetchNearbyServices = useCallback(async (lat: number, lng: number) => {
    setLoadingServices(true);
    try {
      const response = await apiService.getNearbyAll(lat, lng, 10000);
      if (response.success && response.data) {
        // Store all nearby services for map display
        setPoliceStations(response.data.police || []);
        setHospitals(response.data.hospital || []);
        setFireStations(response.data.fire || []);
      }
    } catch (error) {
      console.error('Failed to fetch nearby services:', error);
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Get live location
  const updateLocation = useCallback(async () => {
    setLocating(true);
    
    if (navigator.geolocation) {
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0, // Always get fresh location for emergency
          });
        });
        
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLastUpdate(new Date());
        setLocating(false);
        setLocationError(null);
        fetchNearbyServices(latitude, longitude);
        return;
      } catch (error: any) {
        console.log('GPS failed:', error.message);
      }
    }

    // IP fallback
    const ipLocation = await getLocationFromIP();
    if (ipLocation) {
      setUserLocation({ lat: ipLocation.lat, lng: ipLocation.lng });
      setLastUpdate(new Date());
      setLocating(false);
      setLocationError(`Approximate location (${ipLocation.city})`);
      fetchNearbyServices(ipLocation.lat, ipLocation.lng);
      return;
    }

    setLocating(false);
    setLocationError('Could not detect location. Enable GPS for emergency services.');
  }, [getLocationFromIP, fetchNearbyServices]);

  // Initial location fetch
  useEffect(() => {
    updateLocation();
  }, [updateLocation]);

  // Live location updates every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
            setLastUpdate(new Date());
          },
          () => {}, // Silently fail on refresh
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Open directions
  const openDirections = (destLat: number, destLng: number, name: string) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${destLat},${destLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  // Calculate ETA (rough estimate: 2 min per km in city)
  const calculateETA = (distance: number) => {
    const minutes = Math.ceil(distance * 2);
    return minutes < 60 ? `~${minutes} min` : `~${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-600 to-red-800 dark:from-red-900 dark:to-red-950">
      <header className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <h1 className="text-lg font-semibold text-white">{t('emergency.title')}</h1>
        <button
          onClick={updateLocation}
          disabled={locating}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
        >
          {locating ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5 text-white" />
          )}
        </button>
      </header>

      <main className="px-4 pt-2 pb-8 text-white">
        {/* SOS Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center animate-pulse"
        >
          <AlertTriangle className="w-10 h-10" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <h2 className="text-2xl font-bold mb-1">{t('emergency.subtitle')}</h2>
          <p className="text-white/80 text-sm">{t('emergency.dispatching')}</p>
        </motion.div>

        {/* Live Location Map - Shows all nearby emergency services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-52 rounded-2xl overflow-hidden mb-3 border-2 border-white/30"
        >
          {userLocation ? (
            <MapContainer
              center={[userLocation.lat, userLocation.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapController center={[userLocation.lat, userLocation.lng]} zoom={14} />
              
              {/* User location with pulse */}
              <Circle
                center={[userLocation.lat, userLocation.lng]}
                radius={150}
                pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2 }}
              />
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>📍 Your Live Location</Popup>
              </Marker>

              {/* All nearby police stations */}
              {policeStations.map((station) => (
                <Marker 
                  key={`police-${station.id}`} 
                  position={[station.lat, station.lng]} 
                  icon={policeStationIcon}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <strong className="text-blue-600">🚔 {station.name}</strong>
                      <p className="text-xs text-gray-600 mt-1">{station.distance} km away</p>
                      {station.phone !== 'N/A' && (
                        <a href={`tel:${station.phone}`} className="text-xs text-blue-500 block mt-1">
                          📞 {station.phone.split(';')[0]}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* All nearby hospitals */}
              {hospitals.map((hospital) => (
                <Marker 
                  key={`hospital-${hospital.id}`} 
                  position={[hospital.lat, hospital.lng]} 
                  icon={hospitalIcon}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <strong className="text-red-600">🏥 {hospital.name}</strong>
                      <p className="text-xs text-gray-600 mt-1">{hospital.distance} km away</p>
                      {hospital.phone !== 'N/A' && (
                        <a href={`tel:${hospital.phone}`} className="text-xs text-red-500 block mt-1">
                          📞 {hospital.phone.split(';')[0]}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* All nearby fire stations */}
              {fireStations.map((station) => (
                <Marker 
                  key={`fire-${station.id}`} 
                  position={[station.lat, station.lng]} 
                  icon={fireStationIcon}
                >
                  <Popup>
                    <div className="min-w-[150px]">
                      <strong className="text-orange-600">🚒 {station.name}</strong>
                      <p className="text-xs text-gray-600 mt-1">{station.distance} km away</p>
                      {station.phone !== 'N/A' && (
                        <a href={`tel:${station.phone}`} className="text-xs text-orange-500 block mt-1">
                          📞 {station.phone.split(';')[0]}
                        </a>
                      )}
                    </div>
                  </Popup>
                </Marker>
              ))}

              {/* Line to nearest police (for emergency response) */}
              {nearestPolice && (
                <Polyline
                  positions={[[userLocation.lat, userLocation.lng], [nearestPolice.lat, nearestPolice.lng]]}
                  pathOptions={{ color: '#3b82f6', weight: 2, dashArray: '8, 8' }}
                />
              )}
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-white/10">
              {locating ? (
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Getting your location...</p>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm opacity-80">Location unavailable</p>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Map Legend */}
        <div className="flex items-center justify-center gap-4 mb-3 text-xs text-white/80">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded-full"></span> You
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-blue-600 rounded"></span> Police
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-500 rounded"></span> Hospital
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 bg-orange-500 rounded"></span> Fire
          </span>
        </div>

        {/* Location status */}
        {userLocation && (
          <div className="text-center text-xs text-white/70 mb-4 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live Location Active
            {lastUpdate && (
              <span className="opacity-70">
                • Updated {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
        )}

        {locationError && (
          <div className="text-center text-xs text-yellow-300 mb-4 flex items-center justify-center gap-2">
            <MapPin className="w-3 h-3" />
            {locationError}
          </div>
        )}

        {/* Nearest Police Station */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur rounded-2xl p-4 mb-3"
        >
          {loadingServices ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span className="text-sm">Finding nearest services...</span>
            </div>
          ) : nearestPolice ? (
            <>
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-blue-500/30 flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{nearestPolice.name}</div>
                  <div className="text-xs text-white/70 truncate">{nearestPolice.address}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                <div className="flex-1 text-center">
                  <div className="text-xs text-white/70">{t('emergency.distance')}</div>
                  <div className="text-base font-semibold">{nearestPolice.distance} km</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="flex-1 text-center">
                  <div className="text-xs text-white/70">{t('emergency.eta')}</div>
                  <div className="text-base font-semibold">{calculateETA(nearestPolice.distance)}</div>
                </div>
              </div>
              {/* Call & Directions */}
              <div className="flex gap-2 mt-3">
                {nearestPolice.phone !== 'N/A' && (
                  <a
                    href={`tel:${nearestPolice.phone.split(';')[0]}`}
                    className="flex-1 py-2 rounded-lg bg-green-500/30 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    Call Station
                  </a>
                )}
                <button
                  onClick={() => openDirections(nearestPolice.lat, nearestPolice.lng, nearestPolice.name)}
                  className="flex-1 py-2 rounded-lg bg-white/20 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  Directions
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-white/70 text-sm">
              No police stations found nearby
            </div>
          )}
        </motion.div>

        {/* Quick Emergency Numbers */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <motion.a
            href="tel:100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="py-3 rounded-xl bg-blue-500/30 text-center"
          >
            <Building className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Police</div>
            <div className="text-lg font-bold">100</div>
          </motion.a>

          <motion.a
            href="tel:102"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="py-3 rounded-xl bg-red-500/30 text-center"
          >
            <Heart className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Ambulance</div>
            <div className="text-lg font-bold">102</div>
          </motion.a>

          <motion.a
            href="tel:101"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="py-3 rounded-xl bg-orange-500/30 text-center"
          >
            <Flame className="w-5 h-5 mx-auto mb-1" />
            <div className="text-xs font-medium">Fire</div>
            <div className="text-lg font-bold">101</div>
          </motion.a>
        </div>

        {/* Nearby Hospital & Fire Station */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {nearestHospital && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="bg-white/10 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-red-400" />
                <span className="text-xs font-medium">Nearest Hospital</span>
              </div>
              <div className="text-sm font-semibold truncate">{nearestHospital.name}</div>
              <div className="text-xs text-white/70">{nearestHospital.distance} km away</div>
              <div className="flex gap-1 mt-2">
                {nearestHospital.phone !== 'N/A' && (
                  <a
                    href={`tel:${nearestHospital.phone.split(';')[0]}`}
                    className="flex-1 py-1.5 rounded bg-red-500/30 text-xs flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
                <button
                  onClick={() => openDirections(nearestHospital.lat, nearestHospital.lng, nearestHospital.name)}
                  className="flex-1 py-1.5 rounded bg-white/20 text-xs flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Map
                </button>
              </div>
            </motion.div>
          )}

          {nearestFire && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium">Fire Station</span>
              </div>
              <div className="text-sm font-semibold truncate">{nearestFire.name}</div>
              <div className="text-xs text-white/70">{nearestFire.distance} km away</div>
              <div className="flex gap-1 mt-2">
                {nearestFire.phone !== 'N/A' && (
                  <a
                    href={`tel:${nearestFire.phone.split(';')[0]}`}
                    className="flex-1 py-1.5 rounded bg-orange-500/30 text-xs flex items-center justify-center gap-1"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                )}
                <button
                  onClick={() => openDirections(nearestFire.lat, nearestFire.lng, nearestFire.name)}
                  className="flex-1 py-1.5 rounded bg-white/20 text-xs flex items-center justify-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Map
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Main Emergency Call Button */}
        <motion.a
          href="tel:112"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full py-4 rounded-xl bg-white text-red-600 font-bold flex items-center justify-center gap-3 shadow-lg"
        >
          <Phone className="w-6 h-6" />
          Emergency Helpline - 112
        </motion.a>

        <p className="text-center text-xs text-white/60 mt-3">
          Your location is being shared with emergency services
        </p>
      </main>
    </div>
  );
}
