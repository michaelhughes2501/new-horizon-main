import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { useAuth } from '../context/AuthContext'

type FeatureCard = {
  title: string
  description: string
  color: string
  emoji: string
}

const features: FeatureCard[] = [
  {
    title: 'Jobs',
    description: 'Browse approved job listings from employers who believe in second chances.',
    color: '#0f3460',
    emoji: '💼',
  },
  {
    title: 'Housing',
    description: 'Find reentry-friendly housing and transitional living options.',
    color: '#16213e',
    emoji: '🏠',
  },
  {
    title: 'Community',
    description: 'Connect with peers, share stories, and find support in shared experiences.',
    color: '#0f3460',
    emoji: '🤝',
  },
  {
    title: 'Resources',
    description: 'Access legal aid, mental health support, and reentry services.',
    color: '#16213e',
    emoji: '📋',
  },
]

export default function HomeScreen() {
  const { user } = useAuth()

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.welcome}>Welcome back</Text>
        <Text style={styles.username}>{user?.email ?? 'Friend'}</Text>
        <Text style={styles.tagline}>Your journey to a new horizon starts here.</Text>
      </View>

      <Text style={styles.sectionTitle}>What are you looking for?</Text>

      {features.map((card) => (
        <View key={card.title} style={[styles.card, { backgroundColor: card.color }]}>
          <Text style={styles.cardEmoji}>{card.emoji}</Text>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{card.title}</Text>
            <Text style={styles.cardDesc}>{card.description}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  banner: {
    backgroundColor: '#e94560',
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
  },
  welcome: { color: '#fff', fontSize: 14, opacity: 0.85 },
  username: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  tagline: { color: '#fff', fontSize: 13, opacity: 0.85, marginTop: 8 },
  sectionTitle: {
    color: '#aab4d4',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    alignItems: 'center',
  },
  cardEmoji: { fontSize: 32, marginRight: 16 },
  cardBody: { flex: 1 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  cardDesc: { color: '#aab4d4', fontSize: 13, lineHeight: 18 },
})
