import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useAppStore } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { updateProfile } from "../services/auth";
import { suggestProfileImprovements } from "../ai/profileSuggestions";

export default function ProfileScreen() {
  const { user, profile, setProfile, colors } = useAppStore();
  const { signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [saving, setSaving] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { bio, city });
      setProfile({ ...profile!, bio, city });
      setEditing(false);
    } catch (err: any) {
      Alert.alert("Error", err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleAiSuggest() {
    setAiLoading(true);
    setAiSuggestion(null);
    try {
      const result = await suggestProfileImprovements({
        bio: profile?.bio,
        interests: profile?.interests,
        relationship_goal: profile?.relationship_goal,
      });
      setAiSuggestion(result);
    } catch (err: any) {
      Alert.alert("AI Error", err.message);
    } finally {
      setAiLoading(false);
    }
  }

  const s = makeStyles(colors);

  if (!user || !profile) {
    return (
      <View style={s.centered}>
        <Text style={s.muted}>Not signed in.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.header}>My Profile</Text>

      {/* Avatar placeholder */}
      <View style={s.avatarWrap}>
        <View style={s.avatar}>
          <Text style={s.avatarText}>
            {profile.username?.charAt(0).toUpperCase() ?? "?"}
          </Text>
        </View>
        <Text style={s.username}>{profile.username}</Text>
        {profile.verified && <Text style={s.badge}>✓ Verified</Text>}
      </View>

      {/* Fields */}
      <View style={s.section}>
        <Text style={s.label}>Email</Text>
        <Text style={s.value}>{user.email}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.label}>Bio</Text>
        {editing ? (
          <TextInput
            style={s.input}
            value={bio}
            onChangeText={setBio}
            multiline
            placeholder="Tell your story…"
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={s.value}>{profile.bio || "—"}</Text>
        )}
      </View>

      <View style={s.section}>
        <Text style={s.label}>City</Text>
        {editing ? (
          <TextInput
            style={s.input}
            value={city}
            onChangeText={setCity}
            placeholder="Your city"
            placeholderTextColor={colors.textMuted}
          />
        ) : (
          <Text style={s.value}>{profile.city || "—"}</Text>
        )}
      </View>

      {profile.interests?.length ? (
        <View style={s.section}>
          <Text style={s.label}>Interests</Text>
          <View style={s.chips}>
            {profile.interests.map((i) => (
              <View key={i} style={s.chip}>
                <Text style={s.chipText}>{i}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Edit / Save */}
      {editing ? (
        <View style={s.row}>
          <TouchableOpacity style={s.btn} onPress={handleSave} disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>Save</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={[s.btn, s.btnOutline]} onPress={() => setEditing(false)}>
            <Text style={[s.btnText, s.btnOutlineText]}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={s.btn} onPress={() => setEditing(true)}>
          <Text style={s.btnText}>Edit Profile</Text>
        </TouchableOpacity>
      )}

      {/* AI suggestions */}
      <TouchableOpacity
        style={[s.btn, s.btnSecondary]}
        onPress={handleAiSuggest}
        disabled={aiLoading}
      >
        {aiLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={s.btnText}>✨ AI Profile Tips</Text>
        )}
      </TouchableOpacity>

      {aiSuggestion ? (
        <View style={s.aiBox}>
          <Text style={s.aiLabel}>AI Suggestions</Text>
          <Text style={s.aiText}>{aiSuggestion}</Text>
        </View>
      ) : null}

      {/* Sign out */}
      <TouchableOpacity style={[s.btn, s.btnDanger]} onPress={signOut}>
        <Text style={s.btnText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppStore>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 60 },
    centered: { flex: 1, backgroundColor: colors.background, alignItems: "center", justifyContent: "center" },
    header: { color: colors.textPrimary, fontSize: 26, fontWeight: "800", marginBottom: 24 },
    avatarWrap: { alignItems: "center", marginBottom: 28 },
    avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 10 },
    avatarText: { color: "#fff", fontSize: 32, fontWeight: "800" },
    username: { color: colors.textPrimary, fontSize: 18, fontWeight: "700" },
    badge: { color: colors.accent, fontSize: 13, marginTop: 4 },
    section: { marginBottom: 20 },
    label: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 },
    value: { color: colors.textPrimary, fontSize: 15, lineHeight: 22 },
    input: { backgroundColor: colors.surface, borderRadius: 10, padding: 12, color: colors.textPrimary, fontSize: 14, borderWidth: 1, borderColor: colors.border },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: { backgroundColor: colors.surface, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: colors.border },
    chipText: { color: colors.textSecondary, fontSize: 13 },
    row: { flexDirection: "row", gap: 12, marginBottom: 12 },
    btn: { backgroundColor: colors.accent, borderRadius: 12, padding: 14, alignItems: "center", marginBottom: 12 },
    btnOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: colors.border },
    btnSecondary: { backgroundColor: "#7c5cd8" },
    btnDanger: { backgroundColor: "#c0392b", marginTop: 12 },
    btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
    btnOutlineText: { color: colors.textSecondary },
    aiBox: { backgroundColor: colors.surface, borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
    aiLabel: { color: colors.accent, fontSize: 12, fontWeight: "700", marginBottom: 8 },
    aiText: { color: colors.textPrimary, fontSize: 13, lineHeight: 20 },
    muted: { color: colors.textMuted },
  });
}
