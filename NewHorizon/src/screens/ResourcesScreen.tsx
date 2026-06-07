import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native'

type Resource = {
  name: string
  description: string
  url: string
}

type Category = {
  title: string
  emoji: string
  resources: Resource[]
}

const categories: Category[] = [
  {
    title: 'Housing',
    emoji: '🏠',
    resources: [
      {
        name: 'Reentry Housing Network',
        description: 'Find transitional housing and reentry-friendly landlords.',
        url: 'https://www.reentrycouncil.org/housing',
      },
      {
        name: 'HUD Reentry Resources',
        description: 'Federal housing assistance programs for people leaving incarceration.',
        url: 'https://www.hud.gov/program_offices/public_indian_housing/programs/ph/reentry',
      },
    ],
  },
  {
    title: 'Jobs & Employment',
    emoji: '💼',
    resources: [
      {
        name: 'National HIRE Network',
        description: 'Job training and placement for people with criminal records.',
        url: 'https://www.hirenetwork.org',
      },
      {
        name: 'Honest Jobs',
        description: 'Job board specifically for people with records.',
        url: 'https://www.honestjobs.com',
      },
    ],
  },
  {
    title: 'Legal Aid',
    emoji: '⚖️',
    resources: [
      {
        name: 'Legal Services Corporation',
        description: 'Free civil legal aid for low-income Americans.',
        url: 'https://www.lsc.gov/about-lsc/find-legal-aid',
      },
      {
        name: 'Restoration of Rights Project',
        description: 'State-by-state guide to restoring rights after conviction.',
        url: 'https://ccresourcecenter.org/state-restoration-profiles',
      },
    ],
  },
  {
    title: 'Mental Health',
    emoji: '🧠',
    resources: [
      {
        name: 'SAMHSA Helpline',
        description: '24/7 free, confidential treatment referral service.',
        url: 'https://www.samhsa.gov/find-help/national-helpline',
      },
      {
        name: 'Crisis Text Line',
        description: 'Text HOME to 741741 for free 24/7 crisis support.',
        url: 'https://www.crisistextline.org',
      },
    ],
  },
]

async function openLink(url: string) {
  const supported = await Linking.canOpenURL(url)
  if (supported) {
    await Linking.openURL(url)
  } else {
    Alert.alert('Unable to open link', `Cannot open: ${url}`)
  }
}

export default function ResourcesScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Reentry Resources</Text>
      <Text style={styles.subheader}>
        Vetted resources to support your journey across key areas of reentry.
      </Text>

      {categories.map((cat) => (
        <View key={cat.title} style={styles.category}>
          <View style={styles.categoryHeader}>
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={styles.categoryTitle}>{cat.title}</Text>
          </View>
          {cat.resources.map((res) => (
            <TouchableOpacity
              key={res.name}
              style={styles.resourceCard}
              onPress={() => openLink(res.url)}
              activeOpacity={0.75}
            >
              <Text style={styles.resourceName}>{res.name}</Text>
              <Text style={styles.resourceDesc}>{res.description}</Text>
              <Text style={styles.linkHint}>Tap to open ↗</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  header: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 8 },
  subheader: { color: '#aab4d4', fontSize: 14, marginBottom: 24, lineHeight: 20 },
  category: { marginBottom: 28 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  categoryEmoji: { fontSize: 22, marginRight: 10 },
  categoryTitle: { color: '#e94560', fontSize: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 },
  resourceCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  resourceName: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  resourceDesc: { color: '#aab4d4', fontSize: 13, lineHeight: 18, marginBottom: 8 },
  linkHint: { color: '#e94560', fontSize: 12, fontWeight: '600' },
})
