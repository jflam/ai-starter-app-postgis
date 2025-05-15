import React from 'react';
import { Restaurant } from '../hooks/useRestaurants';
import RestaurantCard from './RestaurantCard';

interface RestaurantListProps {
  restaurants: Restaurant[];
  isLoading: boolean;
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants, isLoading }) => {
  if (isLoading) {
    return <div>Loading restaurants...</div>;
  }

  if (!restaurants.length) {
    return <div>No restaurants found.</div>;
  }

  return (
    <div className="restaurant-list">
      <h2>Restaurants {restaurants.length > 0 ? `(${restaurants.length})` : ''}</h2>
      {restaurants.map(restaurant => (
        <RestaurantCard key={restaurant.id} restaurant={restaurant} />
      ))}
    </div>
  );
};

export default RestaurantList;