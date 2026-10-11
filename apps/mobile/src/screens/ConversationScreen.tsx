import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useIsFocused } from '@react-navigation/native';
import { languageInfo, lessons } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { Button, Card, LanguageSwitcher, common } from '../components/UI';
import { themes } from '../theme';
export function ConversationScreen() {
  const { state } = useLearning(),
    t = themes[state.selected],
    info = languageInfo[state.selected];
  const focused = useIsFocused();
  useEffect(() => {
    void Speech.stop();
    return () => {
      void Speech.stop();
    };
  }, [state.selected, focused]);
  const lesson = lessons.find((l) => l.language === state.selected)!;
  return (
    <ScrollView style={common.page} contentContainerStyle={common.content}>
      <Text style={common.label}>DA PRIMEIRA FRASE À CONVERSA</Text>
      <Text style={common.title}>Vamos falar?</Text>
      <LanguageSwitcher />
      <Card style={{ backgroundColor: t.soft }}>
        <View style={[common.row, { marginBottom: 18 }]}>
          <Ionicons name="chatbubbles-outline" size={30} color={t.primary} />
          <Text style={{ color: t.deep, fontWeight: '700', fontSize: 18 }}>Primeiro encontro</Text>
        </View>
        <Text style={common.text}>
          Roteiro guiado · escute, responda em voz alta e repita. Este exercício usa síntese de voz
          do dispositivo.
        </Text>
      </Card>
      {lesson.phrases.map((p, i) => (
        <Card key={p.text}>
          <Text style={[common.label, { color: t.primary }]}>PASSO {i + 1}</Text>
          <Text style={{ fontSize: 24, color: t.deep, marginVertical: 16 }}>{p.text}</Text>
          <Text style={common.text}>{p.meaning}</Text>
          <View style={{ height: 16 }} />
          <Button
            secondary
            icon="volume-medium-outline"
            label="Escutar e responder"
            onPress={() => {
              void Speech.stop().then(() =>
                Speech.speak(p.text, { language: info.locale, rate: 0.85 }),
              );
            }}
          />
        </Card>
      ))}
      <Card>
        <Text style={{ fontSize: 19, fontWeight: '700', color: t.deep, marginBottom: 12 }}>
          Seu parceiro de conversa por IA
        </Text>
        <Text style={common.text}>
          Próxima etapa: reconhecimento de voz, diálogos adaptativos em restaurantes e hotéis e
          feedback de pronúncia. O provedor de IA ainda não está conectado. Nenhum áudio é gravado
          ou enviado.
        </Text>
      </Card>
    </ScrollView>
  );
}
