import React from 'react';
import RestaurantMap from './components/RestaurantMap';
import Header from './components/Header';
import './utils/fixLeafletIcons'; // Fix Leaflet icon paths

const App: React.FC = () => {
  return (
    <div className="app">
      <Header />
      <main>
        <RestaurantMap />
      </main>
    </div>
  );
};

export default App;