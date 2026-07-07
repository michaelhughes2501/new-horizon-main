import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useAppStore } from "../context/AppContext";
import {
  getMatches,
  getDiscoverProfiles,
  rankByCompatibility,
  likeUser,
  getConversationStarter,
  type ProfileWithCompatibility,
} from "../services/connect";
import type { Match } from "../../lib/types";

export default function ConnectScreen() {
  const { user, profile, colors } = useAppStore();
  const [tab, setTab] = useState<"discover" | "matches">("discover");
  const [candidates, setCandidates] = useState<ProfileWithCompatibility[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [starter] = useState(getConversationStarter());

  async function loadData() {
    if (!user || !profile) return;
    try {
      const [rawCandidates, rawMatches] = await Promise.all([
        getDiscoverProfiles(user.id),
        getMatches(user.id),
      ]);
      const ranked = rankByCompatibility(
        {
          interests: profile.interests ?? [],
          relationshipGoal: profile.relationship_goal,
          city: profile.city,
        },
        rawCandidates
      );
      setCandidates(ranked);
      setMatches(rawMatches);
    } catch {
      // errors visible via empty state
    }
  }

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, [user]);

  async function onRefresh() {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }

  async function handleLike(receiverId: string) {
    if (!user) return;
    await likeUser(user.id, receiverId);
    setCandidates((prev) => prev.filter((p) => p.id !== receiverId));
  }

  const s = makeStyles(colors);

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={s.container}>
      {/* Tab Bar */}
      <View style={s.tabs}>
        {(["discover", "matches"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[s.tab, tab === t && s.tabActive]}
            onPress={() => setTab(t)}
          >
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === "discover" ? "Discover" : `Matches (${matches.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "discover" ? (
        <FlatList
          contentContainerStyle={s.list}
          data={candidates}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />
          }
          ListHeaderComponent={
            <View style={s.starterBox}>
              <Text style={s.starterLabel}>Conversation starter</Text>
              <Text style={s.starterText}>"{starter}"</Text>
            </View>
          }
          ListEmptyComponent={
            <Text style={s.empty}>No new profiles to discover right now.</Text>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <View style={s.cardTop}>
                <View>
                  <Text style={s.username}>{item.username}</Text>
                  {item.city ? (
                    <Text style={s.location}>📍 {item.city}{item.state ? `, ${item.state}` : ""}</Text>
                  ) : null}
                </View>
                {item.compatibility && (
                  <View style={s.scoreBadge}>
                    <Text style={s.scoreText}>{item.compatibility.score}%</Text>
                  </View>
                )}
              </View>

              {item.bio ? (
                <Text style={s.bio} numberOfLines={2}>{item.bio}</Text>
              ) : null}

              {item.compatibility?.sharedInterests.length ? (
                <Text style={s.shared}>
                  Shared: {item.compatibility.sharedInterests.join(", ")}
                </Text>
              ) : null}

              <TouchableOpacity
                style={s.likeBtn}
                onPress={() => handleLike(item.id)}
              >
                <Text style={s.likeBtnText}>Connect ❤️</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <FlatList
          contentContainerStyle={s.list}
          data={matches}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={s.empty}>No matches yet — start connecting!</Text>
          }
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.username}>Match #{item.id.slice(0, 8)}</Text>
              <Text style={s.location}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(colors: ReturnType<typeof useAppStore>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
    tabs: { flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border },
    tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
    tabActive: { borderBottomWidth: 2, borderColor: colors.accent },
    tabText: { color: colors.textSecondary, fontSize: 14, fontWeight: "600" },
    tabTextActive: { color: colors.accent },
    list: { padding: 20, paddingBottom: 40 },
    starterBox: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    starterLabel: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
    starterText: { color: colors.textPrimary, fontSize: 14, fontStyle: "italic", lineHeight: 20 },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 18,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
    username: { color: colors.textPrimary, fontSize: 17, fontWeight: "700" },
    location: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
    scoreBadge: { backgroundColor: colors.accent, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    scoreText: { color: "#fff", fontSize: 12, fontWeight: "800" },
    bio: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginBottom: 8 },
    shared: { color: colors.accent, fontSize: 12, marginBottom: 10 },
    likeBtn: { backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 10, alignItems: "center" },
    likeBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
    empty: { color: colors.textMuted, textAlign: "center", marginTop: 40, fontSize: 14 },
  });
}
