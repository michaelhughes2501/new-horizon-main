import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useAppStore } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";

export default function SettingsScreen() {
  const { theme, colors, setTheme } = useAppStore();
  const { signOut } = useAuth();
  const s = makeStyles(colors);

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.header}>Settings</Text>

      {/* Appearance */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Appearance</Text>
        <View style={s.row}>
          <Text style={s.rowLabel}>Dark Mode</Text>
          <Switch
            value={theme === "dark"}
            onValueChange={(val) => setTheme(val ? "dark" : "light")}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* Notifications */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Notifications</Text>
        {[
          "New matches",
          "New messages",
          "Community activity",
          "Job alerts",
        ].map((item) => (
          <View key={item} style={s.row}>
            <Text style={s.rowLabel}>{item}</Text>
            <Switch
              value={true}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      {/* Privacy */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Privacy</Text>
        {[
          { label: "Profile visible to others", value: true },
          { label: "Show online status", value: false },
        ].map((item) => (
          <View key={item.label} style={s.row}>
            <Text style={s.rowLabel}>{item.label}</Text>
            <Switch
              value={item.value}
              trackColor={{ false: colors.border, true: colors.accent }}
              thumbColor="#fff"
            />
          </View>
        ))}
      </View>

      {/* About */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>About</Text>
        {[
          { label: "Version", value: "1.0.0" },
          { label: "Platform", value: "New Horizon" },
        ].map((item) => (
          <View key={item.label} style={[s.row, s.rowInfo]}>
            <Text style={s.rowLabel}>{item.label}</Text>
            <Text style={s.rowValue}>{item.value}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.signOutBtn} onPress={signOut}>
        <Text style={s.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function makeStyles(colors: ReturnType<typeof useAppStore>["colors"]) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 60 },
    header: { color: colors.textPrimary, fontSize: 26, fontWeight: "800", marginBottom: 28 },
    section: { marginBottom: 28 },
    sectionTitle: { color: colors.textMuted, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 },
    row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: colors.surface, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
    rowInfo: {},
    rowLabel: { color: colors.textPrimary, fontSize: 15 },
    rowValue: { color: colors.textSecondary, fontSize: 14 },
    signOutBtn: { backgroundColor: "#c0392b", borderRadius: 12, padding: 16, alignItems: "center", marginTop: 12 },
    signOutText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  });
}
