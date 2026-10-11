import React, { useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { languageInfo, type Language, type Note } from '@lingua/core';
import { useLearning } from '../state/LearningProvider';
import { Button, Card, LanguageSwitcher, common } from '../components/UI';
import { themes, tokens } from '../theme';
export function NotebookScreen() {
  const { state, removeNote } = useLearning(),
    t = themes[state.selected];
  const [editor, setEditor] = useState<{ language: Language; note?: Note } | null>(null);
  const notes = state.notes.filter((n) => n.language === state.selected);
  function remove(id: string) {
    if (Platform.OS === 'web') {
      if (window.confirm('Excluir esta anotação?')) removeNote(id);
    } else
      Alert.alert('Excluir anotação?', 'Esta ação remove a nota deste dispositivo.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: () => removeNote(id) },
      ]);
  }
  return (
    <ScrollView
      style={common.page}
      contentContainerStyle={common.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={common.label}>SUAS PALAVRAS, SUAS DESCOBERTAS</Text>
      <Text style={common.title}>
        Caderno de {languageInfo[state.selected].name.toLowerCase()}.
      </Text>
      <LanguageSwitcher />
      <Button
        label="Nova anotação"
        icon="add"
        onPress={() => setEditor({ language: state.selected })}
      />
      {!notes.length && (
        <Card>
          <Ionicons name="book-outline" size={40} color={t.primary} />
          <Text style={styles.heading}>Guarde o que faz sentido para você.</Text>
          <Text style={common.text}>
            Uma regra, uma frase que você ouviu, uma pergunta. Este caderno pertence apenas ao
            idioma selecionado.
          </Text>
        </Card>
      )}
      {notes.map((note) => (
        <Card key={note.id}>
          <Text style={styles.date}>
            {new Date(note.updatedAt).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <Text style={[common.text, { color: tokens.ink, marginVertical: 14 }]}>{note.body}</Text>
          <View style={common.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Editar"
              onPress={() => setEditor({ language: note.language, note })}
              style={styles.action}
            >
              <Ionicons name="create-outline" size={18} color={t.primary} />
              <Text style={{ color: t.primary }}>Editar</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Excluir"
              onPress={() => remove(note.id)}
              style={styles.action}
            >
              <Ionicons name="trash-outline" size={18} color={tokens.muted} />
              <Text style={{ color: tokens.muted }}>Excluir</Text>
            </Pressable>
          </View>
        </Card>
      ))}
      <Text style={common.text}>
        Salvo automaticamente neste dispositivo após confirmar a anotação. Sincronização de conta é
        uma próxima etapa; limpar os dados do app remove o caderno.
      </Text>
      {editor && (
        <NoteEditor language={editor.language} note={editor.note} onClose={() => setEditor(null)} />
      )}
    </ScrollView>
  );
}
function NoteEditor({
  language,
  note,
  onClose,
}: {
  language: Language;
  note?: Note;
  onClose: () => void;
}) {
  const { saveNote } = useLearning(),
    [body, setBody] = useState(note?.body ?? '');
  const t = themes[language];
  const close = () => {
    if (body === (note?.body ?? '')) {
      onClose();
      return;
    }
    if (Platform.OS === 'web') {
      if (window.confirm('Descartar alterações não salvas?')) onClose();
    } else
      Alert.alert('Descartar alterações?', 'Sua versão anterior será preservada.', [
        { text: 'Continuar editando', style: 'cancel' },
        { text: 'Descartar', style: 'destructive', onPress: onClose },
      ]);
  };
  return (
    <Modal animationType="slide" onRequestClose={close}>
      <SafeAreaView style={common.page}>
        <ScrollView contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
          <Text style={common.title}>{note ? 'Editar' : 'Nova'} anotação</Text>
          <Text style={[common.label, { color: t.primary }]}>
            {languageInfo[language].name.toUpperCase()}
          </Text>
          <TextInput
            autoFocus
            multiline
            maxLength={20000}
            value={body}
            onChangeText={setBody}
            placeholder="O que você descobriu hoje?"
            placeholderTextColor={tokens.muted}
            accessibilityLabel="Conteúdo da anotação"
            textAlignVertical="top"
            style={[styles.input, { borderColor: t.accent }]}
          />
          <Text style={styles.date}>{body.length}/20000 caracteres</Text>
          <Button
            label="Salvar anotação"
            disabled={!body.trim()}
            icon="checkmark"
            onPress={() => {
              saveNote(language, body, note?.id);
              onClose();
            }}
          />
          <Button secondary label="Cancelar" icon="close" onPress={close} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
const styles = StyleSheet.create({
  heading: { fontSize: 21, fontWeight: '700', color: tokens.ink, marginTop: 18, marginBottom: 10 },
  date: { fontSize: 11, color: tokens.muted },
  action: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
    minHeight: 280,
    fontSize: 17,
    lineHeight: 26,
    color: tokens.ink,
  },
});
