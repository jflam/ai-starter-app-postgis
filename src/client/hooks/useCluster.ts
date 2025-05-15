import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import { Restaurant } from './useRestaurants';

export function useCluster(map: L.Map | null, restaurants: Restaurant[]) {
  useEffect(() => {
    if (!map || !restaurants.length) return;
    
    // Create a marker cluster group
    const markerCluster = L.markerClusterGroup();
    
    // Add markers to the cluster
    restaurants.forEach(restaurant => {
      const coords = restaurant.location.coordinates;
      const marker = L.marker([coords[1], coords[0]]);
      
      // Create popup content
      const popupContent = `
        <div class="restaurant-popup">
          <h3>${restaurant.name}</h3>
          <p><strong>Cuisine:</strong> ${restaurant.cuisine_type}</p>
          <p><strong>Specialty:</strong> ${restaurant.specialty}</p>
          <p><strong>Rating:</strong> ${restaurant.yelp_rating} ⭐</p>
          <p><strong>Price:</strong> ${restaurant.price_range}</p>
          <p><strong>Address:</strong> ${restaurant.address}, ${restaurant.city}</p>
          ${restaurant.distance_km ? `<p><strong>Distance:</strong> ${restaurant.distance_km} km</p>` : ''}
        </div>
      `;
      
      marker.bindPopup(popupContent);
      markerCluster.addLayer(marker);
    });
    
    // Add the marker cluster to the map
    map.addLayer(markerCluster);
    
    // Cleanup when component unmounts or restaurants change
    return () => {
      map.removeLayer(markerCluster);
    };
  }, [map, restaurants]);
}