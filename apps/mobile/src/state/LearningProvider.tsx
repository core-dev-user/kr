import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import {
  initialState,
  languages,
  type Language,
  type LearningState,
  type StudySession,
} from '@lingua/core';
const KEY = 'lingua.local.v1';
type Store = {
  state: LearningState;
  ready: boolean;
  locked: boolean;
  error: string | null;
  retrySave: () => void;
  select: (language: Language) => void;
  saveNote: (language: Language, body: string, id?: string) => void;
  removeNote: (id: string) => void;
  record: (session: StudySession) => void;
};
const Context = createContext<Store | null>(null);
function validate(value: unknown): value is LearningState {
  if (!value || typeof value !== 'object') return false;
  const s = value as LearningState;
  return (
    s.version === 1 &&
    languages.includes(s.selected) &&
    Array.isArray(s.notes) &&
    s.notes.every(
      (n) =>
        typeof n.id === 'string' &&
        languages.includes(n.language) &&
        typeof n.body === 'string' &&
        Number.isFinite(Date.parse(n.updatedAt)),
    ) &&
    Array.isArray(s.sessions) &&
    s.sessions.every(
      (n) =>
        typeof n.id === 'string' &&
        languages.includes(n.language) &&
        typeof n.lessonId === 'string' &&
        Number.isFinite(Date.parse(n.startedAt)) &&
        Number.isFinite(Date.parse(n.endedAt)) &&
        Number.isInteger(n.activeSeconds) &&
        n.activeSeconds >= 1 &&
        typeof n.completed === 'boolean',
    )
  );
}
export function LearningProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LearningState>(initialState);
  const [ready, setReady] = useState(false),
    [error, setError] = useState<string | null>(null);
  const blocked = useRef(false),
    writes = useRef(Promise.resolve());
  function persist(snapshot: LearningState) {
    const serialized = JSON.stringify(snapshot);
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, serialized))
      .then(() => setError(null))
      .catch(() =>
        setError(
          'Não foi possível salvar neste dispositivo. Mantenha o app aberto e tente novamente.',
        ),
      );
  }
  useEffect(() => {
    let alive = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!alive) return;
        if (raw) {
          const parsed: unknown = JSON.parse(raw);
          if (!validate(parsed)) throw new Error('Dados locais incompatíveis.');
          setState(parsed);
        }
      })
      .catch(() => {
        if (alive) {
          blocked.current = true;
          setError(
            'Não foi possível ler seu histórico. Os dados existentes foram preservados; reinicie o app antes de estudar.',
          );
        }
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (!ready || blocked.current) return;
    // Serializa escritas: uma atualização antiga nunca sobrescreve a mais recente.
    persist(state);
  }, [state, ready]);
  const change = (fn: (s: LearningState) => LearningState) => {
    if (!blocked.current) setState(fn);
  };
  const store: Store = {
    state,
    ready,
    locked: blocked.current,
    error,
    retrySave: () => {
      if (!blocked.current) persist(state);
    },
    select: (selected) => change((s) => ({ ...s, selected })),
    record: (session) =>
      change((s) =>
        s.sessions.some((item) => item.id === session.id)
          ? s
          : { ...s, sessions: [...s.sessions, session] },
      ),
    saveNote: (language, body, id) =>
      change((s) => {
        const note = {
          id: id ?? Crypto.randomUUID(),
          language,
          body: body.trim(),
          updatedAt: new Date().toISOString(),
        };
        return { ...s, notes: [note, ...s.notes.filter((n) => n.id !== note.id)] };
      }),
    removeNote: (id) => change((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) })),
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function useLearning() {
  const store = useContext(Context);
  if (!store) throw new Error('LearningProvider required');
  return store;
}
