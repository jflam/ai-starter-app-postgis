import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RestaurantCard from '../../src/client/components/RestaurantCard';
import { Restaurant } from '../../src/client/hooks/useRestaurants';

describe('RestaurantCard', () => {
  const mockRestaurant: Restaurant = {
    id: 1,
    name: 'Test Restaurant',
    city: 'Seattle',
    address: '123 Test St',
    cuisine_type: 'Italian',
    specialty: 'Pizza',
    yelp_rating: 4.5,
    price_range: '$$',
    image_url: 'https://example.com/image.png',
    location: {
      type: 'Point',
      coordinates: [-122.3321, 47.6062]
    },
    distance_km: 2.5
  };

  it('renders essential restaurant information', () => {
    render(<RestaurantCard restaurant={mockRestaurant} />);
    
    // Check that essential information is displayed
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    expect(screen.getByText(/Italian/)).toBeInTheDocument();
    expect(screen.getByText(/Pizza/)).toBeInTheDocument();
    expect(screen.getByText(/4.5/)).toBeInTheDocument();
    expect(screen.getByText(/\$\$/)).toBeInTheDocument();
    expect(screen.getByText(/123 Test St, Seattle/)).toBeInTheDocument();
    expect(screen.getByText(/2.5 km/)).toBeInTheDocument();
    
    // Check that the image is displayed
    const image = screen.getByAltText('Test Restaurant');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/image.png');
  });

  it('renders without distance if not provided', () => {
    const restaurantWithoutDistance = { ...mockRestaurant, distance_km: undefined };
    render(<RestaurantCard restaurant={restaurantWithoutDistance} />);
    
    // Check that the restaurant name is still there
    expect(screen.getByText('Test Restaurant')).toBeInTheDocument();
    
    // Check that distance is not shown
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });
});