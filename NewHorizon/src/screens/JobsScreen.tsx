import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { supabase } from '../../lib/supabase'

type Job = {
  id: string
  title: string
  employer: string
  location: string
  description?: string
  created_at?: string
}

export default function JobsScreen() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchJobs() {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, employer, location, description, created_at')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setJobs(data ?? [])
      setError(null)
    }
  }

  useEffect(() => {
    fetchJobs().finally(() => setLoading(false))
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    await fetchJobs()
    setRefreshing(false)
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e94560" />
      </View>
    )
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Failed to load jobs: {error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={jobs}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />
      }
      ListHeaderComponent={
        <Text style={styles.header}>Job Opportunities</Text>
      }
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No approved jobs found yet.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.jobTitle}>{item.title}</Text>
          <Text style={styles.employer}>{item.employer}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.location}>{item.location}</Text>
          </View>
          {item.description ? (
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          ) : null}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  jobTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  employer: { color: '#e94560', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationIcon: { fontSize: 12, marginRight: 4 },
  location: { color: '#aab4d4', fontSize: 13 },
  description: { color: '#aab4d4', fontSize: 13, lineHeight: 18 },
  errorText: { color: '#e94560', fontSize: 15, textAlign: 'center' },
  emptyText: { color: '#aab4d4', fontSize: 15, textAlign: 'center' },
})
