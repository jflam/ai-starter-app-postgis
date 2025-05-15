import { useState, useEffect } from 'react';
import useSWR from 'swr';

export interface Restaurant {
  id: number;
  name: string;
  city: string;
  address: string;
  cuisine_type: string;
  specialty: string;
  yelp_rating: number;
  price_range: string;
  image_url: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  distance_km?: number;
}

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export function useAllRestaurants() {
  const { data, error, isLoading } = useSWR<Restaurant[]>(
    '/api/restaurants',
    fetcher
  );

  return {
    restaurants: data || [],
    isLoading,
    error
  };
}

export function useNearbyRestaurants(lon: number, lat: number, km = 5) {
  const { data, error, isLoading } = useSWR<Restaurant[]>(
    `/api/restaurants/nearby?lon=${lon}&lat=${lat}&km=${km}`,
    fetcher
  );

  return {
    restaurants: data || [],
    isLoading,
    error
  };
}

// Hook to get the user's current location
export function useUserLocation() {
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(`Error getting location: ${error.message}`);
        setLoading(false);
        
        // Fallback to Seattle coordinates
        setLocation({
          lat: 47.6062,
          lng: -122.3321
        });
      }
    );
  }, []);

  return { location, error, loading };
}