import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LearningProvider, useLearning } from './src/state/LearningProvider';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { NotebookScreen } from './src/screens/NotebookScreen';
import { ConversationScreen } from './src/screens/ConversationScreen';
import { themes, tokens } from './src/theme';
export type Tabs = {
  Home: undefined;
  Journey: undefined;
  Notebook: undefined;
  Conversation: undefined;
};
const Tab = createBottomTabNavigator<Tabs>();
const icons: Record<keyof Tabs, React.ComponentProps<typeof Ionicons>['name']> = {
  Home: 'grid-outline',
  Journey: 'compass-outline',
  Notebook: 'book-outline',
  Conversation: 'chatbubbles-outline',
};
function Navigation() {
  const { ready, error, state, locked, retrySave } = useLearning();
  if (!ready)
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={themes.ko.primary} />
        <Text style={styles.loadingText}>Preparando sua jornada…</Text>
      </View>
    );
  if (locked)
    return (
      <SafeAreaView style={styles.loading}>
        <Text accessibilityRole="alert" style={[styles.loadingText, { padding: 24 }]}>
          {error}
        </Text>
      </SafeAreaView>
    );
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: tokens.background }}
      edges={['top', 'left', 'right']}
    >
      {error && (
        <View accessibilityRole="alert" style={styles.error}>
          <Text>{error}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tentar salvar novamente"
            onPress={retrySave}
            style={{ paddingVertical: 12 }}
          >
            <Text style={{ fontWeight: '700' }}>Tentar salvar novamente</Text>
          </Pressable>
        </View>
      )}
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarActiveTintColor: themes[state.selected].primary,
            tabBarInactiveTintColor: tokens.muted,
            tabBarStyle: { backgroundColor: 'white', borderTopColor: tokens.border },
            tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
            tabBarIcon: ({ color, size }) => (
              <Ionicons name={icons[route.name]} color={color} size={size} />
            ),
          })}
        >
          <Tab.Screen
            name="Home"
            component={DashboardScreen}
            options={{ title: 'Início', tabBarAccessibilityLabel: 'Início' }}
          />
          <Tab.Screen
            name="Journey"
            component={JourneyScreen}
            options={{ title: 'Jornada', tabBarAccessibilityLabel: 'Jornada' }}
          />
          <Tab.Screen
            name="Notebook"
            component={NotebookScreen}
            options={{ title: 'Caderno', tabBarAccessibilityLabel: 'Caderno' }}
          />
          <Tab.Screen
            name="Conversation"
            component={ConversationScreen}
            options={{ title: 'Conversar', tabBarAccessibilityLabel: 'Conversar' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <LearningProvider>
        <StatusBar style="dark" />
        <Navigation />
      </LearningProvider>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    backgroundColor: tokens.background,
  },
  loadingText: { color: tokens.muted },
  error: { backgroundColor: '#FFF0D5', padding: 12 },
});
