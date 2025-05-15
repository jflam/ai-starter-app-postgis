import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useUserLocation, useNearbyRestaurants, useAllRestaurants, Restaurant } from '../hooks/useRestaurants';
import RestaurantList from './RestaurantList';
import { useCluster } from '../hooks/useCluster';

// Component to recenter map when location changes
const RecenterOnChange = ({ position }: { position: L.LatLngExpression | null }) => {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView(position, 12);
    }
  }, [position, map]);
  
  return null;
};

// Component to display distance slider
const DistanceControl = ({ value, onChange }: { value: number, onChange: (value: number) => void }) => {
  return (
    <div className="controls">
      <label htmlFor="distance">Search radius: {value} km</label>
      <input
        id="distance"
        type="range"
        min="1"
        max="20"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};

const RestaurantMap: React.FC = () => {
  const { location, loading: locationLoading } = useUserLocation();
  const [searchDistance, setSearchDistance] = useState(5);
  const [mode, setMode] = useState<'nearby' | 'all'>('nearby');
  
  // Use either nearby or all restaurants based on mode
  const {
    restaurants: nearbyRestaurants,
    isLoading: nearbyLoading,
    error: nearbyError
  } = useNearbyRestaurants(
    location?.lng || -122.3321,
    location?.lat || 47.6062,
    searchDistance
  );
  
  const {
    restaurants: allRestaurants,
    isLoading: allLoading,
    error: allError
  } = useAllRestaurants();
  
  // Determine which set of restaurants to display
  const { restaurants, isLoading, error } = useMemo(() => {
    return mode === 'nearby'
      ? { restaurants: nearbyRestaurants, isLoading: nearbyLoading, error: nearbyError }
      : { restaurants: allRestaurants, isLoading: allLoading, error: allError };
  }, [mode, nearbyRestaurants, nearbyLoading, nearbyError, allRestaurants, allLoading, allError]);

  if (locationLoading) {
    return <div>Loading location...</div>;
  }

  if (error) {
    return <div>Error loading restaurants: {error.toString()}</div>;
  }

  const mapPosition: L.LatLngExpression = location 
    ? [location.lat, location.lng]
    : [47.6062, -122.3321]; // Seattle fallback
  
  return (
    <div>
      <div className="controls">
        <button 
          onClick={() => setMode('nearby')}
          disabled={mode === 'nearby'}
        >
          Nearby Restaurants
        </button>
        <button 
          onClick={() => setMode('all')}
          disabled={mode === 'all'}
        >
          All Restaurants
        </button>
        
        {mode === 'nearby' && (
          <DistanceControl 
            value={searchDistance} 
            onChange={setSearchDistance} 
          />
        )}
      </div>
      
      <MapContainer 
        center={mapPosition} 
        zoom={12} 
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        <RecenterOnChange position={mapPosition} />
        
        {/* User location marker */}
        {location && (
          <Marker position={[location.lat, location.lng]}>
            <Popup>You are here</Popup>
          </Marker>
        )}
        
        {/* Render restaurant markers with clustering */}
        <ClusteredMarkers restaurants={restaurants} />
      </MapContainer>
      
      <RestaurantList restaurants={restaurants} isLoading={isLoading} />
    </div>
  );
};

// Component for clustering markers
const ClusteredMarkers: React.FC<{ restaurants: Restaurant[] }> = ({ restaurants }) => {
  const map = useMap();
  
  // Use the clustering hook
  useCluster(map, restaurants);
  
  return null;
};

export default RestaurantMap;