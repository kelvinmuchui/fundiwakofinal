import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { searchWorkers, Worker } from '../../lib/services';
import { useGeolocation } from '../../lib/geolocation';

export default function SearchScreen() {
  const router = useRouter();
  const { location: userLocation, loading: locationLoading, error: locationError } = useGeolocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userLocation) {
      loadWorkers();
    }
  }, [userLocation]);

  const loadWorkers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userLocation) {
      params.append('lat', userLocation.latitude.toString());
      params.append('lng', userLocation.longitude.toString());
      params.append('radius', '20');
    }
    if (searchQuery) {
      params.append('skill', searchQuery);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/location/search?${params}`);
      const data = await response.json();
      const workersData = Array.isArray(data) ? data : data?.data ?? [];
      setWorkers(workersData);
    } catch (error) {
      console.error('Error loading workers:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (userLocation) {
      params.append('lat', userLocation.latitude.toString());
      params.append('lng', userLocation.longitude.toString());
      params.append('radius', '20');
    }
    if (searchQuery) {
      params.append('skill', searchQuery);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/location/search?${params}`);
      const data = await response.json();
      const workersData = Array.isArray(data) ? data : data?.data ?? [];
      setWorkers(workersData);
    } catch (error) {
      console.error('Search error:', error);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (worker: Worker) => {
    Alert.alert(
      'Book Now',
      `Book ${worker.name} for ${worker.skill}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => {
          // Navigate to booking screen or show modal
          Alert.alert('Success', 'Booking request sent! The fundi will contact you soon.');
        }},
      ]
    );
  };

  const renderWorker = ({ item }: { item: Worker }) => (
    <TouchableOpacity
      style={styles.workerCard}
      onPress={() => router.push(`/fundi/${item.id}`)}
    >
      <Image source={{ uri: item.photoURL }} style={styles.workerImage} />
      <View style={styles.workerInfo}>
        <Text style={styles.workerName}>{item.name}</Text>
        <Text style={styles.workerSkill}>{item.skill}</Text>
        <Text style={styles.workerLocation}>{item.location}, {item.neighborhood}</Text>
        <Text style={styles.workerRating}>⭐ {item.rating} ({item.jobsCompleted} jobs)</Text>
        <Text style={styles.workerRate}>{item.hourlyRate}/hr</Text>
      </View>
      <TouchableOpacity
        style={styles.bookButton}
        onPress={(e) => {
          e.stopPropagation();
          handleBookNow(item);
        }}
      >
        <Text style={styles.bookButtonText}>Book Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for services or workers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {locationLoading && (
        <Text style={styles.locationText}>Getting your location...</Text>
      )}
      {locationError && (
        <Text style={styles.locationError}>Location error: {locationError}</Text>
      )}
      {userLocation && (
        <Text style={styles.locationText}>
          Showing fundis near you ({userLocation.latitude.toFixed(2)}, {userLocation.longitude.toFixed(2)})
        </Text>
      )}

      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : (
        <FlatList
          data={workers}
          renderItem={renderWorker}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
  },
  searchButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  locationError: {
    fontSize: 12,
    color: '#FF6B35',
    textAlign: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginVertical: 12,
  },
  listContainer: {
    padding: 16,
  },
  workerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  workerInfo: {
    flex: 1,
  },
  workerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  workerSkill: {
    fontSize: 14,
    color: '#FF6B35',
    marginBottom: 4,
  },
  workerLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  workerRating: {
    fontSize: 12,
    color: '#333',
    marginBottom: 4,
  },
  workerRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});