import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const quickActions = [
  { title: 'Hire a fundi', icon: 'tools', color: '#F97316' },
  { title: 'Find internships', icon: 'graduation-cap', color: '#2563EB' },
  { title: 'TVET training', icon: 'school', color: '#059669' },
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>FundiWako Mobile</Text>
        <Text style={styles.title}>Connect skilled artisans, trainees, and employers</Text>
        <Text style={styles.subtitle}>Book trusted fundis, discover internships, and access TVET opportunities from one place.</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.title} style={styles.actionCard}>
              <View style={[styles.iconCircle, { backgroundColor: `${action.color}15` }] }>
                <FontAwesome5 name={action.icon as any} size={20} color={action.color} />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why fundis use FundiWako</Text>
        <View style={styles.bulletCard}>
          <Text style={styles.bullet}>• Verified profiles and skill matching</Text>
          <Text style={styles.bullet}>• Easy job and internship discovery</Text>
          <Text style={styles.bullet}>• Secure hiring and training opportunities</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  heroCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  eyebrow: {
    color: '#F97316',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '31%',
    minWidth: 100,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'center',
  },
  bulletCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  bullet: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
  },
});