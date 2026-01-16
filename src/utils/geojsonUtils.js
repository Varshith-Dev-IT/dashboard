// Utility functions for GeoJSON processing
export const calculateBounds = (geojson) => {
  if (!geojson || !geojson.features) return null;
  
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  geojson.features.forEach(feature => {
    if (feature.geometry) {
      const processCoordinates = (coords) => {
        if (Array.isArray(coords[0])) {
          coords.forEach(coord => processCoordinates(coord));
        } else if (coords.length >= 2) {
          const [lng, lat] = coords;
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
          minLng = Math.min(minLng, lng);
          maxLng = Math.max(maxLng, lng);
        }
      };
      
      if (feature.geometry.coordinates) {
        processCoordinates(feature.geometry.coordinates);
      }
    }
  });

  if (minLat === Infinity) return null;

  return [
    [minLat, minLng],
    [maxLat, maxLng]
  ];
};

export const calculateCenter = (bounds) => {
  if (!bounds) return [23.0225, 72.5714]; // Default center if bounds not available
  
  return [
    (bounds[0][0] + bounds[1][0]) / 2,
    (bounds[0][1] + bounds[1][1]) / 2
  ];
};
