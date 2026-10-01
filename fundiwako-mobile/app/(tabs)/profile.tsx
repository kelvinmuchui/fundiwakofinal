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
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#64748B',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 16,
  },
  loadingText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#64748B',
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#64748B',
    marginTop: 20,
  },
  bookingCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fundiName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  fundiSkill: {
    fontSize: 13,
    color: '#F97316',
  },
  bookingDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  bookingDetails: {
    marginBottom: 8,
  },
  bookingDetail: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 4,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    fontSize: 12,
    fontWeight: '700',
  },
  contactButton: {
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  settingButton: {
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  settingText: {
    fontSize: 15,
    color: '#0F172A',
  },
});