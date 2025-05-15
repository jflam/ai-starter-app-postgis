import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useUserLocation, useNearbyRestaurants, useAllRestaurants, Restaurant } from '../hooks/useRestaurants';
import RestaurantList from './RestaurantList';
import FilterBar from './FilterBar';
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
  const [mapboxToken, setMapboxToken] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('All');
  const [priceFilter, setPriceFilter] = useState('All');
  
  // Fetch Mapbox token from server
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch('/api/config/mapbox');
        const data = await response.json();
        if (data.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }
    };
    
    fetchMapboxToken();
  }, []);
  
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
  
  // Determine which set of restaurants to display and apply filters
  const { restaurants, isLoading, error } = useMemo(() => {
    // First, select nearby or all restaurants
    const baseRestaurants = mode === 'nearby'
      ? { restaurants: nearbyRestaurants, isLoading: nearbyLoading, error: nearbyError }
      : { restaurants: allRestaurants, isLoading: allLoading, error: allError };
    
    // Then apply filters
    let filteredRestaurants = [...baseRestaurants.restaurants];
    
    // Apply cuisine filter
    if (cuisineFilter !== 'All') {
      filteredRestaurants = filteredRestaurants.filter(
        restaurant => restaurant.cuisine_type.includes(cuisineFilter)
      );
    }
    
    // Apply price filter
    if (priceFilter !== 'All') {
      filteredRestaurants = filteredRestaurants.filter(
        restaurant => restaurant.price_range === priceFilter
      );
    }
    
    return {
      ...baseRestaurants,
      restaurants: filteredRestaurants
    };
  }, [
    mode,
    nearbyRestaurants,
    nearbyLoading,
    nearbyError,
    allRestaurants,
    allLoading,
    allError,
    cuisineFilter,
    priceFilter
  ]);

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
      <FilterBar
        cuisineFilter={cuisineFilter}
        setCuisineFilter={setCuisineFilter}
        priceFilter={priceFilter}
        setPriceFilter={setPriceFilter}
      />
      
      <div className="map-controls">
        <button
          className={`control-button ${mode === 'nearby' ? 'active' : ''}`}
          onClick={() => setMode('nearby')}
          disabled={mode === 'nearby'}
        >
          Nearby Restaurants
        </button>
        <button
          className={`control-button ${mode === 'all' ? 'active' : ''}`}
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
        {mapboxToken ? (
          <TileLayer
            url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token=${mapboxToken}`}
            attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
        ) : (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0',
            zIndex: 1000
          }}>
            Loading map...
          </div>
        )}
        
        <RecenterOnChange position={mapPosition} />
        
        {/* Only render markers when we have a token */}
        {mapboxToken && (
          <>
            {/* User location marker */}
            {location && (
              <Marker position={[location.lat, location.lng]}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            
            {/* Render restaurant markers with clustering */}
            <ClusteredMarkers restaurants={restaurants} />
          </>
        )}
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