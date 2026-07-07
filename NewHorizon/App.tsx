import "react-native-url-polyfill/auto";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import { AuthProvider } from "./src/context/AuthContext";
import { useAppStore, THEME } from "./src/context/AppContext";

// Screens
import HomeScreen from "./src/screens/HomeScreen";
import ResourcesScreen from "./src/screens/ResourcesScreen";
import CommunityScreen from "./src/screens/CommunityScreen";
import ConnectScreen from "./src/screens/ConnectScreen";
import MessagesScreen from "./src/screens/MessagesScreen";
import AIAssistantScreen from "./src/screens/AIAssistantScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

// ─── Tab navigator types ────────────────────────────────────────────────────
export type RootTabParamList = {
  Home: undefined;
  Resources: undefined;
  Community: undefined;
  Connect: undefined;
  Messages: undefined;
  Assistant: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

// ─── Tab icon helper ─────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, string> = {
  Home: "🏠",
  Resources: "📋",
  Community: "🤝",
  Connect: "❤️",
  Messages: "💬",
  Assistant: "✨",
  Profile: "👤",
  Settings: "⚙️",
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  return (
    <Text style={{ fontSize: focused ? 22 : 18, opacity: focused ? 1 : 0.6 }}>
      {TAB_ICONS[name] ?? "●"}
    </Text>
  );
}

// ─── Inner navigator (needs store access for theme) ──────────────────────────
function AppNavigator() {
  const { colors, unreadCount, authLoading } = useAppStore();

  if (authLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerStyle: { backgroundColor: colors.surface, shadowColor: colors.border },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: "800" },
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={route.name} focused={focused} color={color} />
          ),
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Resources" component={ResourcesScreen} />
        <Tab.Screen name="Community" component={CommunityScreen} />
        <Tab.Screen
          name="Connect"
          component={ConnectScreen}
        />
        <Tab.Screen
          name="Messages"
          component={MessagesScreen}
        />
        <Tab.Screen
          name="Assistant"
          component={AIAssistantScreen}
          options={{ title: "AI Assistant" }}
        />
        <Tab.Screen name="Profile" component={ProfileScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
});
