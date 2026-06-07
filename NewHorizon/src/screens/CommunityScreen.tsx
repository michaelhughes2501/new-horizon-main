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

type BlogPost = {
  id: string
  title: string
  content: string
  created_at: string
  profiles?: { username?: string } | null
}

export default function CommunityScreen() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchPosts() {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id, title, content, created_at, profiles(username)')
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setPosts(data ?? [])
      setError(null)
    }
  }

  useEffect(() => {
    fetchPosts().finally(() => setLoading(false))
  }, [])

  async function onRefresh() {
    setRefreshing(true)
    await fetchPosts()
    setRefreshing(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
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
        <Text style={styles.errorText}>Failed to load posts: {error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={posts}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />
      }
      ListHeaderComponent={<Text style={styles.header}>Community</Text>}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No posts yet. Be the first to share!</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.postTitle}>{item.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.author}>
              {item.profiles?.username ?? 'Anonymous'}
            </Text>
            <Text style={styles.date}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.preview} numberOfLines={4}>
            {item.content}
          </Text>
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
  header: { color: '#fff', fontSize: 26, fontWeight: '800', marginBottom: 20 },
  card: {
    backgroundColor: '#16213e',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  postTitle: { color: '#fff', fontSize: 17, fontWeight: '700', marginBottom: 8 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  author: { color: '#e94560', fontSize: 13, fontWeight: '600' },
  date: { color: '#6b7a99', fontSize: 12 },
  preview: { color: '#aab4d4', fontSize: 13, lineHeight: 19 },
  errorText: { color: '#e94560', fontSize: 15, textAlign: 'center' },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#aab4d4', fontSize: 15, textAlign: 'center' },
})
