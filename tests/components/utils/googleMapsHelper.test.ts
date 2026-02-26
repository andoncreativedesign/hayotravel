import { generateGoogleMapsUrl, LocationData } from '@/utils/helpers/googleMapsHelper';

describe('googleMapsHelper', () => {
  describe('generateGoogleMapsUrl', () => {
    it('should generate URL with coordinates when available', () => {
      const location: LocationData = {
        coordinates: {
          latitude: 40.7589,
          longitude: -73.9851,
        },
        name: 'Empire State Building',
      };

      const result = generateGoogleMapsUrl(location);
      expect(result).toBe('https://www.google.com/maps/search/40.7589,-73.9851');
    });

    it('should generate URL with address components when no coordinates', () => {
      const location: LocationData = {
        name: 'NEMA Design Hotel and Spa Resort',
        address: '123 Hotel Street',
        city: 'New York',
        country: 'USA',
      };

      const result = generateGoogleMapsUrl(location);
      const expectedQuery = encodeURIComponent('NEMA Design Hotel and Spa Resort, 123 Hotel Street, New York, USA');
      expect(result).toBe(`https://www.google.com/maps/search/${expectedQuery}`);
    });

    it('should handle partial location data', () => {
      const location: LocationData = {
        city: 'London',
        country: 'UK',
      };

      const result = generateGoogleMapsUrl(location);
      const expectedQuery = encodeURIComponent('London, UK');
      expect(result).toBe(`https://www.google.com/maps/search/${expectedQuery}`);
    });

    it('should handle empty location data', () => {
      const location: LocationData = {};

      const result = generateGoogleMapsUrl(location);
      expect(result).toBe('https://www.google.com/maps/search/');
    });

    it('should properly encode special characters in address', () => {
      const location: LocationData = {
        name: 'Hôtel & Spa',
        address: '123 Rue Saint-Honoré',
        city: 'Paris',
        country: 'France',
      };

      const result = generateGoogleMapsUrl(location);
      const expectedQuery = encodeURIComponent('Hôtel & Spa, 123 Rue Saint-Honoré, Paris, France');
      expect(result).toBe(`https://www.google.com/maps/search/${expectedQuery}`);
    });
  });
});

