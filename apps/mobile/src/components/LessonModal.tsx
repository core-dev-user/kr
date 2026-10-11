import React, { useEffect, useRef, useState } from 'react';
import { AppState, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Crypto from 'expo-crypto';
import * as Speech from 'expo-speech';
import { SafeAreaView } from 'react-native-safe-area-context';
import { languageInfo, type Lesson } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { Button, Card, common } from './UI';
import { themes } from '../theme';
export function LessonModal({ lesson, onClose }: { lesson: Lesson; onClose: () => void }) {
  const { record } = useLearning(),
    theme = themes[lesson.language];
  const [elapsed, setElapsed] = useState(0),
    [paused, setPaused] = useState(false);
  const start = useRef(new Date().toISOString()),
    id = useRef(Crypto.randomUUID());
  const accumulated = useRef(0),
    activeSince = useRef<number | null>(Date.now()),
    closed = useRef(false),
    manualPause = useRef(false);
  const seconds = () =>
    Math.floor(
      (accumulated.current +
        (activeSince.current === null ? 0 : Date.now() - activeSince.current)) /
        1000,
    );
  const suspend = () => {
    if (activeSince.current !== null) {
      accumulated.current += Date.now() - activeSince.current;
      activeSince.current = null;
    }
  };
  useEffect(() => {
    const interval = setInterval(() => setElapsed(seconds()), 250);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        suspend();
        void Speech.stop();
      } else if (!manualPause.current) activeSince.current = Date.now();
      setPaused(manualPause.current || status !== 'active');
    });
    return () => {
      clearInterval(interval);
      subscription.remove();
      void Speech.stop();
    };
  }, []);
  function toggle() {
    manualPause.current = !manualPause.current;
    if (manualPause.current) {
      suspend();
      void Speech.stop();
    } else activeSince.current = Date.now();
    setElapsed(seconds());
    setPaused(manualPause.current);
  }
  function finish(completed: boolean) {
    if (closed.current) return;
    closed.current = true;
    suspend();
    const activeSeconds = seconds();
    if (activeSeconds > 0)
      record({
        id: id.current,
        language: lesson.language,
        lessonId: lesson.id,
        startedAt: start.current,
        endedAt: new Date().toISOString(),
        activeSeconds,
        completed,
      });
    onClose();
  }
  return (
    <Modal animationType="slide" onRequestClose={() => finish(false)}>
      <SafeAreaView style={common.page}>
        <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
          <View style={[styles.timer, { backgroundColor: theme.soft }]}>
            <Text style={{ color: theme.deep, fontWeight: '700' }}>
              TEMPO ATIVO · {paused ? 'PAUSADO' : 'ESTUDANDO'}
            </Text>
            <Text
              accessibilityLabel={`${elapsed} segundos de estudo`}
              style={[styles.clock, { color: theme.primary }]}
            >
              {String(Math.floor(elapsed / 60)).padStart(2, '0')}:
              {String(elapsed % 60).padStart(2, '0')}
            </Text>
          </View>
          <Text style={common.label}>
            {languageInfo[lesson.language].name.toUpperCase()} · SEMANA {lesson.week}
          </Text>
          <Text style={common.title}>{lesson.title}</Text>
          <Text style={common.text}>
            Ouça, compreenda e depois tente dizer sem olhar. O cronômetro pausa quando o app sai de
            primeiro plano.
          </Text>
          {lesson.phrases.map((phrase, i) => (
            <Card key={phrase.text}>
              <Text style={[styles.phrase, { color: theme.deep }]}>{phrase.text}</Text>
              {phrase.reading && <Text style={common.text}>{phrase.reading}</Text>}
              <Text style={[common.text, { marginVertical: 12 }]}>{phrase.meaning}</Text>
              <Button
                secondary
                disabled={paused}
                label={`Ouvir frase ${i + 1}`}
                icon="volume-medium-outline"
                onPress={() => {
                  void Speech.stop().then(() =>
                    Speech.speak(phrase.text, {
                      language: languageInfo[lesson.language].locale,
                      rate: 0.8,
                    }),
                  );
                }}
              />
            </Card>
          ))}
          <Card>
            <Text style={styles.taskTitle}>Sua vez de conversar</Text>
            <Text style={common.text}>{lesson.task}</Text>
          </Card>
          <Text style={common.text}>
            Voz sintetizada do dispositivo; a disponibilidade depende das vozes instaladas. Não
            avalia pronúncia.
          </Text>
          <Button
            secondary
            label={paused ? 'Retomar cronômetro' : 'Pausar cronômetro'}
            icon={paused ? 'play-outline' : 'pause-outline'}
            onPress={toggle}
          />
          <Button
            label="Concluir prática"
            disabled={elapsed < 1}
            icon="checkmark"
            onPress={() => finish(true)}
          />
          <Button
            secondary
            label="Salvar tempo e sair"
            icon="close-outline"
            onPress={() => finish(false)}
          />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  timer: { padding: 22, borderRadius: 24, alignItems: 'center', gap: 10 },
  clock: { fontSize: 48, fontVariant: ['tabular-nums'], fontWeight: '700' },
  phrase: { fontSize: 24, fontWeight: '600', lineHeight: 34 },
  taskTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
});
