// Mobile App Geolocation Hook
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permission to access location was denied');
          setLoading(false);
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        setLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
          timestamp: location.timestamp,
        });
      } catch (err) {
        setError('Failed to get location');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { location, error, loading };
};

// Real-time location tracking for active jobs
export const useLocationTracking = (jobId: string | null, isActive: boolean) => {
  const [location, setLocation] = useState<LocationData | null>(null);

  useEffect(() => {
    if (!isActive || !jobId) return;

    const startTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Or every 10 meters
        },
        (newLocation) => {
          const locationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          };
          setLocation(locationData);

          // Send to backend
          updateLocation(jobId, locationData);
        }
      );

      return subscription;
    };

    const subscriptionPromise = startTracking();

    return () => {
      subscriptionPromise.then(subscription => subscription?.remove());
    };
  }, [jobId, isActive]);

  return location;
};

const updateLocation = async (jobId: string, location: LocationData) => {
  try {
    await fetch(`/api/jobs/${jobId}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(location),
    });
  } catch (error) {
    console.error('Failed to update location:', error);
  }
};