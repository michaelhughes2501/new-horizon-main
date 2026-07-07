import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useAppStore } from "../context/AppContext";
import {
  continueConversation,
  detectTopic,
  type AssistantTopic,
} from "../services/ai";
import type { AssistantMessage } from "../services/ai";

const TOPIC_PILLS: { label: string; topic: AssistantTopic }[] = [
  { label: "💼 Jobs", topic: "jobs" },
  { label: "🏠 Housing", topic: "housing" },
  { label: "⚖️ Legal", topic: "legal" },
  { label: "🤝 Community", topic: "community" },
  { label: "❤️ Connect", topic: "connect" },
];

export default function AIAssistantScreen() {
  const {
    assistant,
    setAssistantHistory,
    setAssistantTopic,
    setAssistantLoading,
    setAssistantError,
    clearAssistant,
    colors,
  } = useAppStore();

  const [input, setInput] = useState("");
  const listRef = useRef<FlatList>(null);

  async function handleSend() {
    const text = input.trim();
    if (!text || assistant.loading) return;
    setInput("");

    const topic = detectTopic(text);
    setAssistantTopic(topic);
    setAssistantLoading(true);
    setAssistantError(null);

    try {
      const updated = await continueConversation(assistant.history, text, topic);
      setAssistantHistory(updated);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err: any) {
      setAssistantError(err.message ?? "Failed to get a response.");
    } finally {
      setAssistantLoading(false);
    }
  }

  const s = makeStyles(colors);

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      {/* Topic pills */}
      <View style={s.pills}>
        {TOPIC_PILLS.map(({ label, topic }) => (
          <TouchableOpacity
            key={topic}
            style={[s.pill, assistant.topic === topic && s.pillActive]}
            onPress={() => setAssistantTopic(topic)}
          >
            <Text style={[s.pillText, assistant.topic === topic && s.pillTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Message list */}
      {assistant.history.length === 0 ? (
        <View style={s.emptyWrap}>
          <Text style={s.emptyTitle}>New Horizon AI Assistant</Text>
          <Text style={s.emptyBody}>
            Ask me anything about jobs, housing, legal aid, community resources, or making connections.
          </Text>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          style={s.list}
          contentContainerStyle={s.listContent}
          data={assistant.history}
          keyExtractor={(_, i) => String(i)}
          renderItem={({ item }: { item: AssistantMessage }) => (
            <View style={[s.bubble, item.role === "user" ? s.bubbleUser : s.bubbleAssistant]}>
              <Text style={[s.bubbleText, item.role === "user" ? s.bubbleTextUser : s.bubbleTextAssistant]}>
                {item.content}
              </Text>
            </View>
          )}
        />
      )}

      {/* Error */}
      {assistant.error ? (
        <Text style={s.error}>{assistant.error}</Text>
      ) : null}

      {/* Input row */}
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask anything…"
          placeholderTextColor={colors.textMuted}
          multiline
          onSubmitEditing={handleSend}
          returnKeyType="send"
          blurOnSubmit
        />
        {assistant.loading ? (
          <ActivityIndicator color={colors.accent} style={s.sendBtn} />
        ) : (
          <TouchableOpacity style={s.sendBtn} onPress={handleSend}>
            <Text style={s.sendText}>Send</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Clear */}
      {assistant.history.length > 0 && (
        <TouchableOpacity style={s.clearBtn} onPress={clearAssistant}>
          <Text style={s.clearText}>Clear conversation</Text>
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppStore>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pills: { flexDirection: "row", flexWrap: "wrap", padding: 12, gap: 8, borderBottomWidth: 1, borderColor: colors.border },
    pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: colors.border },
    pillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
    pillText: { color: colors.textSecondary, fontSize: 13 },
    pillTextActive: { color: "#fff", fontWeight: "700" },
    emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyTitle: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 12, textAlign: "center" },
    emptyBody: { color: colors.textSecondary, fontSize: 14, lineHeight: 22, textAlign: "center" },
    list: { flex: 1 },
    listContent: { padding: 16, paddingBottom: 8 },
    bubble: { maxWidth: "85%", borderRadius: 16, padding: 12, marginBottom: 10 },
    bubbleUser: { backgroundColor: colors.accent, alignSelf: "flex-end", borderBottomRightRadius: 4 },
    bubbleAssistant: { backgroundColor: colors.surface, alignSelf: "flex-start", borderBottomLeftRadius: 4, borderWidth: 1, borderColor: colors.border },
    bubbleText: { fontSize: 14, lineHeight: 20 },
    bubbleTextUser: { color: "#fff" },
    bubbleTextAssistant: { color: colors.textPrimary },
    error: { color: colors.accent, textAlign: "center", padding: 8, fontSize: 13 },
    inputRow: { flexDirection: "row", padding: 12, borderTopWidth: 1, borderColor: colors.border, alignItems: "flex-end", gap: 8 },
    input: { flex: 1, backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: colors.textPrimary, fontSize: 14, maxHeight: 100, borderWidth: 1, borderColor: colors.border },
    sendBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, justifyContent: "center", alignItems: "center", minWidth: 60 },
    sendText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    clearBtn: { alignItems: "center", paddingVertical: 8 },
    clearText: { color: colors.textMuted, fontSize: 12 },
  });
}
