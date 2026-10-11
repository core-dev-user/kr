import React, { useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { languageInfo, languages, lessons, metrics, weekSeries, type Lesson } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { LanguageScene } from '../components/LanguageScene';
import { Button, Card, LanguageSwitcher, SectionTitle, common } from '../components/UI';
import { LessonModal } from '../components/LessonModal';
import { themes, tokens } from '../theme';
import type { Tabs } from '../../App';
export function DashboardScreen() {
  const { state, select } = useLearning(),
    code = state.selected,
    t = themes[code],
    info = languageInfo[code];
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<Tabs>>();
  const fade = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions(),
    compact = width < 400;
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (!alive) return;
      fade.setValue(reduced ? 1 : 0);
      if (!reduced)
        Animated.timing(fade, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    });
    return () => {
      alive = false;
    };
  }, [code]);
  const summary = metrics(state.sessions, code),
    series = weekSeries(state.sessions);
  const max = Math.max(
    20,
    ...series.map((day) => languages.reduce((sum, l) => sum + day.values[l], 0)),
  );
  const totalMinutes = Math.floor(state.sessions.reduce((n, s) => n + s.activeSeconds, 0) / 60);
  return (
    <ScrollView style={common.page} contentContainerStyle={common.content}>
      <View style={styles.header}>
        <View style={common.row}>
          <View style={styles.logo}>
            <Ionicons name="sparkles" color="white" size={20} />
          </View>
          <Text style={styles.brand}>
            lingua<Text style={{ color: t.primary }}>.</Text>
          </Text>
        </View>
        <View style={styles.avatar}>
          <Text style={{ fontWeight: '700', color: tokens.ink }}>EU</Text>
        </View>
      </View>
      <View>
        <Text style={common.label}>SEU MUNDO ESTÁ CRESCENDO</Text>
        <Text style={[common.title, { marginTop: 9 }]}>Uma conversa de cada vez.</Text>
        <Text style={[common.text, { marginTop: 8 }]}>Três caminhos. O seu próprio ritmo.</Text>
      </View>
      <LanguageSwitcher />
      <Animated.View testID="language-hero" style={{ opacity: fade }}>
        <LinearGradient
          colors={t.gradient as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={[styles.heroTop, compact && { flexDirection: 'column' }]}>
            <View style={{ flex: 1, gap: 10 }}>
              <View style={styles.pill}>
                <View style={[styles.dot, { backgroundColor: t.primary }]} />
                <Text style={[styles.pillText, { color: t.deep }]}>{info.city} · CAPÍTULO 01</Text>
              </View>
              <Text style={[styles.greeting, { color: t.deep }]}>
                {info.greeting}
                <Text style={{ color: t.primary }}>!</Text>
              </Text>
              <Text style={[styles.heroCopy, { color: t.deep }]}>{t.tag}</Text>
              <Text style={[styles.sceneLabel, { color: t.deep }]}>{t.scene}</Text>
            </View>
            <View style={compact ? { alignSelf: 'center' } : undefined}>
              <LanguageScene language={code} />
            </View>
          </View>
          <View style={styles.heroFooter}>
            <View>
              <Text style={[styles.footerLabel, { color: t.deep }]}>PRÓXIMA PRÁTICA</Text>
              <Text style={[styles.lessonTitle, { color: t.deep }]}>
                {lessons.find((l) => l.language === code)!.title}
              </Text>
            </View>
            <View style={common.row}>
              <Ionicons name="time-outline" color={t.deep} size={16} />
              <Text style={{ color: t.deep, fontSize: 12 }}>12 min</Text>
            </View>
          </View>
          <Button
            label="Começar a conversar"
            onPress={() => setLesson(lessons.find((l) => l.language === code)!)}
            icon="play"
          />
        </LinearGradient>
      </Animated.View>
      <SectionTitle title="Seu panorama" detail="Todo o seu progresso, em um só lugar" />
      <View style={styles.stats}>
        {[
          { value: String(totalMinutes), label: 'min estudados', icon: 'time-outline' },
          {
            value: String(languages.reduce((n, l) => n + metrics(state.sessions, l).completed, 0)),
            label: 'lições concluídas',
            icon: 'checkmark-circle-outline',
          },
          { value: `${summary.streak}`, label: `dias · ${info.name}`, icon: 'flame-outline' },
        ].map((item) => (
          <Card key={item.label} style={styles.stat}>
            <Ionicons name={item.icon as 'time-outline'} size={20} color={t.primary} />
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>
      <Card>
        <View style={styles.chartTitle}>
          <View>
            <Text style={styles.cardTitle}>Constância que transforma</Text>
            <Text style={[common.text, { fontSize: 12 }]}>Tempo de estudo · últimos 7 dias</Text>
          </View>
          <Ionicons name="bar-chart-outline" size={20} color={tokens.muted} />
        </View>
        <View
          accessibilityRole="image"
          accessibilityLabel={series
            .map(
              (d) =>
                `${d.label}: ${languages.map((l) => `${languageInfo[l].name} ${Math.round(d.values[l])} minutos`).join(', ')}`,
            )
            .join('; ')}
          style={styles.chart}
        >
          {series.map((day) => {
            const sum = languages.reduce((n, l) => n + day.values[l], 0);
            return (
              <View key={day.day} style={styles.column}>
                <Text style={styles.barNumber}>{sum ? Math.round(sum) : '—'}</Text>
                <View style={styles.barTrack}>
                  <View style={{ justifyContent: 'flex-end', height: 112 }}>
                    {languages.map((l) =>
                      day.values[l] > 0 ? (
                        <View
                          key={l}
                          style={{
                            height: (112 * day.values[l]) / max,
                            backgroundColor: themes[l].primary,
                          }}
                        />
                      ) : null,
                    )}
                  </View>
                </View>
                <Text style={styles.day}>{day.label}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          {languages.map((l) => (
            <View key={l} style={[common.row, { gap: 6 }]}>
              <View style={[styles.dot, { backgroundColor: themes[l].primary }]} />
              <Text style={styles.legendText}>{languageInfo[l].name}</Text>
            </View>
          ))}
        </View>
        {!state.sessions.length && (
          <Text style={[common.text, { fontSize: 12, marginTop: 14 }]}>
            Seu gráfico começa com a primeira prática. Cada minuto conta.
          </Text>
        )}
      </Card>
      <View style={styles.chartTitle}>
        <SectionTitle title="Três idiomas. Três jornadas." />
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('Journey')}
          style={{ padding: 8 }}
        >
          <Ionicons name="arrow-forward" size={20} color={t.primary} />
        </Pressable>
      </View>
      <Card style={{ paddingVertical: 6 }}>
        {languages.map((l, i) => {
          const m = metrics(state.sessions, l);
          return (
            <Pressable
              key={l}
              accessibilityRole="button"
              accessibilityLabel={`Abrir jornada de ${languageInfo[l].name}`}
              onPress={() => {
                select(l);
                navigation.navigate('Journey');
              }}
              style={[
                styles.languageRow,
                i < 2 && { borderBottomWidth: 1, borderBottomColor: tokens.border },
              ]}
            >
              <View style={[styles.languageBadge, { backgroundColor: themes[l].soft }]}>
                <Text style={{ fontWeight: '700', color: themes[l].primary }}>
                  {languageInfo[l].short}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={styles.rowTitle}>{languageInfo[l].name}</Text>
                <Text style={styles.rowDetail}>
                  {Math.floor(m.seconds / 60)} min · {m.completed} lições
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={[styles.level, { color: themes[l].primary }]}>A0</Text>
                <Text style={styles.rowDetail}>sem avaliação</Text>
              </View>
              <Ionicons name="chevron-forward" color={tokens.muted} size={16} />
            </Pressable>
          );
        })}
      </Card>
      <SectionTitle
        title={`Sua missão de hoje · ${info.name}`}
        detail="Uma pequena rotina vale mais que uma grande promessa"
      />
      <Card>
        <Mission
          done={summary.todaySeconds >= 1200}
          title="Dedique 20 minutos"
          detail={`${Math.floor(summary.todaySeconds / 60)} de 20 min · tempo ativo`}
          color={t.primary}
        />
        <View style={{ height: 16 }} />
        <Mission
          done={summary.todayCompleted}
          title="Complete uma prática"
          detail="Escute, compreenda e fale em voz alta"
          color={t.primary}
        />
      </Card>
      <Text style={styles.disclaimer}>
        Plano de 6 meses · progresso medido por prática e avaliações. O ritmo e o nível alcançado
        variam por pessoa e idioma.
      </Text>
      {lesson && <LessonModal lesson={lesson} onClose={() => setLesson(null)} />}
    </ScrollView>
  );
}
function Mission({
  done,
  title,
  detail,
  color,
}: {
  done: boolean;
  title: string;
  detail: string;
  color: string;
}) {
  return (
    <View style={common.row}>
      <Ionicons
        name={done ? 'checkmark-circle' : 'ellipse-outline'}
        size={25}
        color={done ? color : '#B9C9C9'}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={[styles.rowDetail, { marginTop: 4 }]}>{detail}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: {
    width: 35,
    height: 35,
    borderRadius: 12,
    backgroundColor: tokens.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 26, fontWeight: '800', letterSpacing: -1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#E7EFEE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { borderRadius: 28, padding: 22, gap: 20, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    backgroundColor: '#FFFFFF80',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  pillText: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  greeting: { fontSize: 30, fontWeight: '700', letterSpacing: -1 },
  heroCopy: { fontSize: 14, lineHeight: 21, maxWidth: 260 },
  sceneLabel: { fontSize: 9, opacity: 0.65 },
  heroFooter: { borderTopWidth: 1, borderColor: '#FFFFFF80', paddingTop: 18, gap: 8 },
  footerLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.4 },
  lessonTitle: { fontSize: 16, fontWeight: '700', marginTop: 6 },
  stats: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, padding: 14, gap: 9, minWidth: 0 },
  statValue: { fontSize: 28, fontWeight: '700', color: tokens.ink },
  statLabel: { fontSize: 10, lineHeight: 16, color: tokens.muted },
  chartTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: tokens.ink },
  chart: { flexDirection: 'row', gap: 10, marginTop: 22, marginBottom: 18 },
  column: { flex: 1, alignItems: 'center', gap: 8 },
  barTrack: {
    width: '100%',
    maxWidth: 42,
    height: 112,
    backgroundColor: '#F0F5F4',
    borderRadius: 7,
    overflow: 'hidden',
  },
  barNumber: { fontSize: 9, color: tokens.muted },
  day: { fontSize: 10, color: tokens.muted },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  legendText: { fontSize: 11, color: tokens.muted },
  languageRow: { paddingVertical: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  languageBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontSize: 14, fontWeight: '700', color: tokens.ink },
  rowDetail: { fontSize: 11, color: tokens.muted },
  level: { fontSize: 16, fontWeight: '700' },
  disclaimer: { fontSize: 11, lineHeight: 18, textAlign: 'center', color: tokens.muted },
});
