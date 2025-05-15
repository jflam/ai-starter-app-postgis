import React from 'react';
import { Restaurant } from '../hooks/useRestaurants';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant }) => {
  // Generate star rating display
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`star-${i}`} className="star full-star">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half-star" className="star half-star">★</span>);
    }
    
    return <div className="star-rating">{stars}</div>;
  };

  return (
    <div className="restaurant-card">
      <div className="card-header">
        {restaurant.image_url ? (
          <div className="restaurant-image" style={{ backgroundImage: `url(${restaurant.image_url})` }}>
            <div className="image-overlay"></div>
          </div>
        ) : (
          <div className="restaurant-image no-image">
            <div className="image-overlay"></div>
          </div>
        )}
        <div className="restaurant-badge">
          {restaurant.price_range}
        </div>
      </div>
      
      <div className="card-content">
        <h3 className="restaurant-name">{restaurant.name}</h3>
        
        <div className="restaurant-rating">
          {renderStars(restaurant.yelp_rating || 0)}
          <span className="rating-text">{restaurant.yelp_rating}</span>
        </div>
        
        <div className="restaurant-tags">
          <span className="tag cuisine-tag">{restaurant.cuisine_type}</span>
          {restaurant.specialty && <span className="tag specialty-tag">{restaurant.specialty}</span>}
        </div>
        
        <div className="restaurant-details">
          <div className="detail-item">
            <span className="detail-icon">📍</span>
            <span className="detail-text">{restaurant.address}, {restaurant.city}</span>
          </div>
          
          {restaurant.distance_km && (
            <div className="detail-item">
              <span className="detail-icon">🚶</span>
              <span className="detail-text">{restaurant.distance_km} km away</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;