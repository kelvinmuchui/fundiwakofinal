import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import { loginUser } from '../lib/services';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      await loginUser(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Login failed', 'Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to FundiWako</Text>
        <Text style={styles.subtitle}>Sign in to book fundis and access opportunities.</Text>
        <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" onChangeText={setEmail} value={email} />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry onChangeText={setPassword} value={password} />
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  title: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  button: { backgroundColor: '#F97316', borderRadius: 12, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
