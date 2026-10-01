import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'http://localhost:3000'; // Adjust for production

const getAuthHeaders = async () => {
  const token = await SecureStore.getItemAsync('auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface Worker {
  id: string;
  name: string;
  skill: string;
  skills?: string[];
  experience: string;
  description: string;
  location: string;
  neighborhood: string;
  availability: string;
  hourlyRate: string;
  jobsCompleted: number;
  rating: number;
  photoURL: string;
  isVerified: boolean;
}

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password });
    const token = response.data?.token || response.data?.data?.token;
    if (token) {
      await SecureStore.setItemAsync('auth_token', token);
    }
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const searchWorkers = async (query: string = ''): Promise<Worker[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workers?search=${query}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching workers:', error);
    return [];
  }
};

export const getWorkerById = async (id: string): Promise<Worker | null> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/workers/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching worker:', error);
    return null;
  }
};

export const createBooking = async (bookingData: {
  fundiId: string;
  serviceType: string;
  description: string;
  preferredDate: string;
  preferredTime: string;
  location: string;
}) => {
  try {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${API_BASE_URL}/api/bookings`, bookingData, { headers });
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};