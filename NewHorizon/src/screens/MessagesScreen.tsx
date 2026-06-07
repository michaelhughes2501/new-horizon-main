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
import { useAuth } from '../context/AuthContext'

type Message = {
  id: string
  content: string
  created_at: string
  sender_id: string
  receiver_id: string
  sender?: { username?: string } | null
  receiver?: { username?: string } | null
}

export default function MessagesScreen() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function fetchMessages() {
    if (!user) return
    const { data, error } = await supabase
      .from('messages')
      .select(
        'id, content, created_at, sender_id, receiver_id, sender:profiles!messages_sender_id_fkey(username), receiver:profiles!messages_receiver_id_fkey(username)'
      )
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
    if (error) {
      setError(error.message)
    } else {
      setMessages(data ?? [])
      setError(null)
    }
  }

  useEffect(() => {
    fetchMessages().finally(() => setLoading(false))
  }, [user])

  async function onRefresh() {
    setRefreshing(true)
    await fetchMessages()
    setRefreshing(false)
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
        <Text style={styles.errorText}>Failed to load messages: {error}</Text>
      </View>
    )
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.content}
      data={messages}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#e94560" />
      }
      ListHeaderComponent={<Text style={styles.header}>Messages</Text>}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No messages yet.</Text>
        </View>
      }
      renderItem={({ item }) => {
        const isSent = item.sender_id === user?.id
        const otherUser = isSent ? item.receiver : item.sender
        return (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.otherUser}>
                {isSent ? '➤ To: ' : '← From: '}
                {otherUser?.username ?? 'Unknown'}
              </Text>
              <Text style={styles.time}>{formatDate(item.created_at)}</Text>
            </View>
            <Text style={styles.messageContent} numberOfLines={2}>
              {item.content}
            </Text>
          </View>
        )
      }}
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
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#0f3460',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  otherUser: { color: '#e94560', fontSize: 14, fontWeight: '600' },
  time: { color: '#6b7a99', fontSize: 12 },
  messageContent: { color: '#aab4d4', fontSize: 14, lineHeight: 20 },
  errorText: { color: '#e94560', fontSize: 15, textAlign: 'center' },
  emptyWrap: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#aab4d4', fontSize: 15, textAlign: 'center' },
})
