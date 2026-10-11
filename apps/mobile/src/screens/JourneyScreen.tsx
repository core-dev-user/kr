import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { languageInfo, lessons, roadmap, type Lesson } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { Button, Card, LanguageSwitcher, common } from '../components/UI';
import { LessonModal } from '../components/LessonModal';
import { themes, tokens } from '../theme';
export function JourneyScreen() {
  const { state } = useLearning(),
    t = themes[state.selected];
  const [lesson, setLesson] = useState<Lesson | null>(null);
  return (
    <ScrollView style={common.page} contentContainerStyle={common.content}>
      <Text style={common.label}>UM PLANO. UM DIA DE CADA VEZ.</Text>
      <Text style={common.title}>
        Sua jornada em {languageInfo[state.selected].name.toLowerCase()}.
      </Text>
      <LanguageSwitcher />
      <Card style={{ backgroundColor: t.soft }}>
        <Text style={[styles.heading, { color: t.deep }]}>20–40 minutos por dia</Text>
        <Text style={common.text}>
          Input compreensível → recuperação com SRS → fala contextualizada. Uma conversa maior por
          semana e uma avaliação oral por mês.
        </Text>
      </Card>
      {roadmap.map((item, i) => (
        <View key={item.month} style={common.row}>
          <View style={{ alignSelf: 'flex-start', alignItems: 'center', paddingTop: 18 }}>
            <View style={[styles.marker, { backgroundColor: i === 0 ? t.primary : '#E4ECEB' }]}>
              <Text style={{ color: i === 0 ? 'white' : tokens.muted, fontWeight: '700' }}>
                {String(item.month).padStart(2, '0')}
              </Text>
            </View>
            <View style={[styles.line, { backgroundColor: t.soft }]} />
          </View>
          <Card style={{ flex: 1 }}>
            <Text style={[common.label, { color: t.primary }]}>
              MÊS {item.month} · SEMANAS {item.weeks}
            </Text>
            <Text style={[styles.heading, { marginTop: 12 }]}>{item.title}</Text>
            <Text style={common.text}>{item.detail}</Text>
            <Text style={[common.text, { color: t.deep, marginTop: 10 }]}>{item.goal}</Text>
            {i === 0 ? (
              <View style={{ marginTop: 16, gap: 12 }}>
                <Button
                  label="Abrir lição piloto"
                  onPress={() => setLesson(lessons.find((l) => l.language === state.selected)!)}
                  icon="play"
                />
                <Text style={styles.status}>1 lição disponível · demais conteúdos em produção</Text>
              </View>
            ) : (
              <View style={[common.row, { marginTop: 16, gap: 6 }]}>
                <Ionicons name="construct-outline" size={14} color={tokens.muted} />
                <Text style={styles.status}>Planejamento editorial · sem lições publicadas</Text>
              </View>
            )}
          </Card>
        </View>
      ))}
      <Text style={common.text}>
        A0 é o ponto de partida, não uma avaliação. CEFR descreve competências; JLPT e TOPIK podem
        ser referências adicionais e não substituem avaliação de conversação. Estudar as três
        línguas exige dividir o tempo.
      </Text>
      {lesson && <LessonModal lesson={lesson} onClose={() => setLesson(null)} />}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  heading: { fontSize: 19, fontWeight: '700', color: tokens.ink, marginBottom: 10 },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  line: { width: 2, height: 130, marginTop: 12 },
  status: { fontSize: 11, lineHeight: 17, color: tokens.muted },
});
