import { useState, useEffect } from 'react';
import { LocationModel } from '../lib/models/location';
import { Location } from '../types';

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    try {
      const data = await LocationModel.findAll();
      setLocations(data);
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const addLocation = async (location: Omit<Location, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLocation = await LocationModel.create(location);
      setLocations([...locations, newLocation]);
      return newLocation;
    } catch (error) {
      console.error('Failed to add location:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return { locations, loading, addLocation, refreshLocations: fetchLocations };
};