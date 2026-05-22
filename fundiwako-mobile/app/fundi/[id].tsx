import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getWorkerById, Worker } from '../../lib/services';

export default function FundiProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [worker, setWorker] = useState<Worker | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorker();
  }, [id]);

  const loadWorker = async () => {
    if (typeof id === 'string') {
      const data = await getWorkerById(id);
      setWorker(data);
    }
    setLoading(false);
  };

  const handleBookNow = () => {
    Alert.alert(
      'Book Now',
      `Book ${worker?.name} for ${worker?.skill}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Book', onPress: () => {
          Alert.alert('Success', 'Booking request sent! The fundi will contact you soon.');
        }},
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!worker) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Fundi not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileCard}>
        <Image source={{ uri: worker.photoURL }} style={styles.profileImage} />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>{worker.name}</Text>
          <Text style={styles.skill}>{worker.skill}</Text>
          <Text style={styles.location}>{worker.location}, {worker.neighborhood}</Text>
          <Text style={styles.rating}>⭐ {worker.rating} ({worker.jobsCompleted} jobs)</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Text style={styles.description}>{worker.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience</Text>
        <Text style={styles.experience}>{worker.experience}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        <View style={styles.skillsContainer}>
          {(worker.skills || [worker.skill]).map((skill, index) => (
            <View key={index} style={styles.skillTag}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Portfolio</Text>
        <View style={styles.portfolioGrid}>
          <View style={styles.portfolioItem}>
            <Text style={styles.portfolioText}>Project 1</Text>
          </View>
          <View style={styles.portfolioItem}>
            <Text style={styles.portfolioText}>Project 2</Text>
          </View>
          <View style={styles.portfolioItem}>
            <Text style={styles.portfolioText}>Project 3</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Certifications</Text>
        <View style={styles.certification}>
          <Text style={styles.certificationText}>✓ TVET Certified</Text>
        </View>
        <View style={styles.certification}>
          <Text style={styles.certificationText}>✓ Licensed Professional</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reviews</Text>
        <View style={styles.review}>
          <Text style={styles.reviewRating}>⭐⭐⭐⭐⭐</Text>
          <Text style={styles.reviewText}>"Great work! Very professional."</Text>
        </View>
        <View style={styles.review}>
          <Text style={styles.reviewRating}>⭐⭐⭐⭐</Text>
          <Text style={styles.reviewText}>"Good quality service."</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.contactButton}>
          <Text style={styles.contactButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  backText: {
    fontSize: 16,
    color: '#FF6B35',
  },
  header: {
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#FF6B35',
  },
  profileCard: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  skill: {
    fontSize: 16,
    color: '#FF6B35',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  experience: {
    fontSize: 16,
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#FFE5D9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 14,
    color: '#FF6B35',
  },
  portfolioGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  portfolioItem: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  portfolioText: {
    fontSize: 12,
    color: '#666',
  },
  certification: {
    marginBottom: 8,
  },
  certificationText: {
    fontSize: 16,
    color: '#4CAF50',
  },
  review: {
    marginBottom: 12,
  },
  reviewRating: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  reviewText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
  },
  bookButton: {
    flex: 1,
    backgroundColor: '#FF6B35',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  contactButton: {
    flex: 1,
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});