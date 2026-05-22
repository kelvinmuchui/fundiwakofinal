import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';

interface Booking {
  _id: string;
  fundiId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
  status: string;
  createdAt: string;
  fundi: {
    name: string;
    skill: string;
  };
}

export default function ProfileScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    // Mock data for now - in real app, fetch from API
    const mockBookings: Booking[] = [
      {
        _id: '1',
        fundiId: 'f1',
        serviceType: 'repair',
        description: 'Fix leaking faucet',
        preferredDate: '2024-04-25',
        preferredTime: 'morning',
        location: 'Nairobi, Westlands',
        status: 'pending',
        createdAt: '2024-04-22',
        fundi: {
          name: 'John Doe',
          skill: 'Plumber',
        },
      },
    ];
    setBookings(mockBookings);
    setLoading(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'accepted': return '#4CAF50';
      case 'completed': return '#2196F3';
      default: return '#666';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>Manage your account and bookings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>My Bookings</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading bookings...</Text>
        ) : bookings.length === 0 ? (
          <Text style={styles.emptyText}>No bookings yet</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking._id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.fundiName}>{booking.fundi.name}</Text>
                <Text style={styles.fundiSkill}>{booking.fundi.skill}</Text>
              </View>
              <Text style={styles.bookingDescription}>{booking.description}</Text>
              <View style={styles.bookingDetails}>
                <Text style={styles.bookingDetail}>
                  📅 {new Date(booking.preferredDate).toLocaleDateString()} {booking.preferredTime}
                </Text>
                <Text style={styles.bookingDetail}>📍 {booking.location}</Text>
              </View>
              <View style={styles.bookingFooter}>
                <Text style={[styles.status, { color: getStatusColor(booking.status) }]}>
                  {booking.status.toUpperCase()}
                </Text>
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={() => Alert.alert('Contact', 'Call or message the fundi')}
                >
                  <Text style={styles.contactButtonText}>Contact</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingText}>Payment Methods</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingButton}>
          <Text style={styles.settingText}>Notifications</Text>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 20,
  },
  bookingCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fundiName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fundiSkill: {
    fontSize: 14,
    color: '#FF6B35',
  },
  bookingDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  bookingDetails: {
    marginBottom: 8,
  },
  bookingDetail: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  contactButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingButton: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});