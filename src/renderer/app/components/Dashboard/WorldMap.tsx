import React from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface Location {
  name: string;
  coordinates: [number, number];
  value: number;
}

interface WorldMapProps {
  locations: Location[];
}

const WorldMap: React.FC<WorldMapProps> = ({ locations }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Customers Growth</h2>
        <select className="border rounded-md px-3 py-1">
          <option value="country">Country</option>
          <option value="region">Region</option>
        </select>
      </div>
      <ComposableMap projection="geoMercator">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E5E7EB"
                stroke="#D1D5DB"
                style={{
                  default: { outline: 'none' },
                  hover: { fill: '#D1D5DB', outline: 'none' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>
        {locations.map((location, index) => (
          <Marker key={index} coordinates={location.coordinates}>
            <circle
              r={Math.sqrt(location.value) / 2}
              fill="#2196F3"
              fillOpacity={0.6}
              stroke="#FFFFFF"
              strokeWidth={2}
            />
          </Marker>
        ))}
      </ComposableMap>
    </div>
  );
};

export default WorldMap; 