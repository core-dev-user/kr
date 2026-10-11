import React from 'react';
import { Pressable, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { languages, languageInfo } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { tokens, themes, cardShadow } from '../theme';
export function LanguageSwitcher() {
  const { state, select } = useLearning();
  return (
    <View style={styles.switcher}>
      {languages.map((code) => {
        const active = state.selected === code,
          theme = themes[code];
        return (
          <Pressable
            key={code}
            onPress={() => select(code)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar ${languageInfo[code].name}`}
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.language,
              {
                backgroundColor: active ? theme.primary : 'transparent',
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.native, { color: active ? 'white' : tokens.muted }]}>
              {languageInfo[code].native}
            </Text>
            <Text style={[styles.languageName, { color: active ? 'white' : tokens.ink }]}>
              {languageInfo[code].name}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon = 'arrow-forward',
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const { state } = useLearning(),
    t = themes[state.selected];
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: secondary ? t.soft : t.primary,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: secondary ? t.deep : 'white' }]}>{label}</Text>
      <Ionicons name={icon} size={18} color={secondary ? t.deep : 'white'} />
    </Pressable>
  );
}
export function SectionTitle({ title, detail }: { title: string; detail?: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {detail && <Text style={styles.detail}>{detail}</Text>}
    </View>
  );
}
export const common = StyleSheet.create({
  page: { flex: 1, backgroundColor: tokens.background },
  content: {
    padding: 24,
    paddingBottom: 36,
    gap: 22,
    width: '100%',
    maxWidth: 860,
    alignSelf: 'center',
  },
  title: { fontSize: 30, fontWeight: '700', letterSpacing: -1, color: tokens.ink },
  text: { fontSize: 14, lineHeight: 22, color: tokens.muted },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1.7, color: tokens.muted },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
const styles = StyleSheet.create({
  switcher: {
    flexDirection: 'row',
    padding: 5,
    borderRadius: 20,
    backgroundColor: '#EAF0EF',
    gap: 4,
  },
  language: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    gap: 4,
    minHeight: 64,
  },
  native: { fontSize: 12, fontWeight: '500' },
  languageName: { fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: tokens.card,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: tokens.border,
    ...cardShadow,
  },
  button: {
    minHeight: 50,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  buttonText: { fontSize: 14, fontWeight: '700', flexShrink: 1 },
  section: { gap: 5 },
  sectionTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.5, color: tokens.ink },
  detail: { fontSize: 12, color: tokens.muted },
});
