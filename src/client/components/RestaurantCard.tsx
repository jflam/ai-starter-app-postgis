import React from 'react';
import { Restaurant } from '../hooks/useRestaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  return (
    <div className="restaurant-card">
      <div className="restaurant-info">
        <h3>{restaurant.name}</h3>
        <p><strong>Cuisine:</strong> {restaurant.cuisine_type}</p>
        <p><strong>Specialty:</strong> {restaurant.specialty}</p>
        <p><strong>Rating:</strong> {restaurant.yelp_rating} ⭐</p>
        <p><strong>Price:</strong> {restaurant.price_range}</p>
        <p><strong>Address:</strong> {restaurant.address}, {restaurant.city}</p>
        {restaurant.distance_km && (
          <p><strong>Distance:</strong> {restaurant.distance_km} km</p>
        )}
      </div>
      {restaurant.image_url && (
        <div className="restaurant-image">
          <img src={restaurant.image_url} alt={restaurant.name} />
        </div>
      )}
    </div>
  );
};

export default RestaurantCard;