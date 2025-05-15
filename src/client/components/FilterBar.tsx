import React from 'react';

interface FilterBarProps {
  cuisineFilter: string;
  setCuisineFilter: (cuisine: string) => void;
  priceFilter: string;
  setPriceFilter: (price: string) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  cuisineFilter,
  setCuisineFilter,
  priceFilter,
  setPriceFilter
}) => {
  // Cuisine types from our data
  const cuisineTypes = [
    'All',
    'Chinese',
    'Japanese',
    'Vietnamese',
    'Malaysian',
    'Cantonese',
    'Cambodian',
    'Pan-Asian'
  ];

  // Price ranges
  const priceRanges = [
    { label: 'All', value: 'All' },
    { label: 'Budget ($)', value: '$' },
    { label: 'Moderate ($$)', value: '$$' }
  ];

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <h3>Cuisine</h3>
        <div className="filter-options">
          {cuisineTypes.map(cuisine => (
            <button
              key={cuisine}
              className={`filter-button ${cuisineFilter === cuisine ? 'active' : ''}`}
              onClick={() => setCuisineFilter(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Price</h3>
        <div className="filter-options">
          {priceRanges.map(price => (
            <button
              key={price.value}
              className={`filter-button ${priceFilter === price.value ? 'active' : ''}`}
              onClick={() => setPriceFilter(price.value)}
            >
              {price.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterBar;