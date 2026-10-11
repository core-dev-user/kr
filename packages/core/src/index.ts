export type Language = 'ko' | 'ja' | 'fr';
export const languages: Language[] = ['ko', 'ja', 'fr'];
export type Proficiency = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export const languageInfo = {
  ko: {
    name: 'Coreano',
    native: '한국어',
    locale: 'ko-KR',
    greeting: '안녕하세요',
    city: 'SEOUL',
    short: 'KO',
  },
  ja: {
    name: 'Japonês',
    native: '日本語',
    locale: 'ja-JP',
    greeting: 'こんにちは',
    city: 'TOKYO',
    short: 'JA',
  },
  fr: {
    name: 'Francês',
    native: 'Français',
    locale: 'fr-FR',
    greeting: 'Bonjour',
    city: 'PARIS',
    short: 'FR',
  },
} as const;
export interface Phrase {
  text: string;
  meaning: string;
  reading?: string;
}
export interface Lesson {
  id: string;
  language: Language;
  title: string;
  subtitle: string;
  minutes: number;
  week: number;
  phrases: Phrase[];
  task: string;
}
// Conteúdo piloto; o currículo completo exige revisão linguística/editorial.
export const lessons: Lesson[] = [
  {
    id: 'ko-w1-intro',
    language: 'ko',
    title: 'Seu primeiro 안녕하세요',
    subtitle: 'Cumprimente e apresente-se com respeito.',
    minutes: 12,
    week: 1,
    phrases: [
      { text: '안녕하세요.', reading: 'Annyeonghaseyo.', meaning: 'Olá. (forma educada)' },
      { text: '저는 마리아예요.', reading: 'Jeoneun Maria-yeyo.', meaning: 'Eu sou a Maria.' },
      {
        text: '만나서 반가워요.',
        reading: 'Mannaseo bangawoyo.',
        meaning: 'Prazer em conhecer você.',
      },
    ],
    task: 'Ouça as três frases. Depois, apresente-se substituindo Maria pelo seu nome. A terminação pode mudar conforme o nome; use o exemplo como prática inicial.',
  },
  {
    id: 'ja-w1-intro',
    language: 'ja',
    title: 'Uma conversa começa aqui',
    subtitle: 'Diga olá e faça sua primeira apresentação.',
    minutes: 12,
    week: 1,
    phrases: [
      { text: 'こんにちは。', reading: 'Konnichiwa.', meaning: 'Olá. (durante o dia)' },
      { text: 'マリアです。', reading: 'Maria desu.', meaning: 'Sou a Maria.' },
      {
        text: 'よろしくお願いします。',
        reading: 'Yoroshiku onegaishimasu.',
        meaning:
          'Expressão de cortesia ao se apresentar; aproximadamente “prazer em conhecer você”.',
      },
    ],
    task: 'Ouça, repita e apresente-se usando seu nome. Imagine uma primeira conversa com alguém da sua turma.',
  },
  {
    id: 'fr-w1-intro',
    language: 'fr',
    title: 'Votre première conversation',
    subtitle: 'Um bonjour e uma nova conexão.',
    minutes: 12,
    week: 1,
    phrases: [
      { text: 'Bonjour !', meaning: 'Olá! / Bom dia!' },
      { text: 'Je m’appelle Maria.', meaning: 'Eu me chamo Maria.' },
      { text: 'Et vous ?', meaning: 'E você? (forma de cortesia)' },
    ],
    task: 'Ouça, repita e diga seu nome. Alterne entre a apresentação e a pergunta “Et vous ?”.',
  },
];
export interface StudySession {
  id: string;
  language: Language;
  lessonId: string;
  startedAt: string;
  endedAt: string;
  activeSeconds: number;
  completed: boolean;
}
export interface Note {
  id: string;
  language: Language;
  body: string;
  updatedAt: string;
}
export interface LearningState {
  version: 1;
  selected: Language;
  sessions: StudySession[];
  notes: Note[];
}
export const initialState = (): LearningState => ({
  version: 1,
  selected: 'ko',
  sessions: [],
  notes: [],
});
export function localDay(iso: string, timeZone?: string): string {
  const d = new Date(iso);
  if (timeZone) {
    const parts = new Intl.DateTimeFormat('en', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d);
    const part = (type: string) => parts.find((p) => p.type === type)!.value;
    return `${part('year')}-${part('month')}-${part('day')}`;
  }
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
export function metrics(
  sessions: StudySession[],
  language: Language,
  now = new Date(),
  timeZone?: string,
) {
  const own = sessions.filter((s) => s.language === language);
  const today = localDay(now.toISOString(), timeZone);
  const todaySessions = own.filter((s) => localDay(s.endedAt, timeZone) === today);
  const days = new Set(
    own.filter((s) => s.activeSeconds >= 60).map((s) => localDay(s.endedAt, timeZone)),
  );
  let streak = 0;
  // Ontem mantém a sequência até a prática de hoje. Meios-dias evitam transições de DST.
  const cursor = new Date(`${today}T12:00:00Z`);
  if (!days.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return {
    seconds: own.reduce((n, s) => n + s.activeSeconds, 0),
    completed: new Set(own.filter((s) => s.completed).map((s) => s.lessonId)).size,
    todaySeconds: todaySessions.reduce((n, s) => n + s.activeSeconds, 0),
    todayCompleted: todaySessions.some((s) => s.completed),
    streak,
  };
}
export function weekSeries(sessions: StudySession[], now = new Date()) {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(now);
    date.setDate(date.getDate() - 6 + i);
    const day = localDay(date.toISOString());
    return {
      day,
      label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      values: Object.fromEntries(
        languages.map((l) => [
          l,
          sessions
            .filter((s) => s.language === l && localDay(s.endedAt) === day)
            .reduce((n, s) => n + s.activeSeconds / 60, 0),
        ]),
      ) as Record<Language, number>,
    };
  });
}
export const roadmap = [
  {
    month: 1,
    weeks: '01–04',
    title: 'Construir a base',
    detail: 'Sons, escrita essencial, apresentações e frases de sobrevivência.',
    goal: 'Apresentar-se e compreender frases curtas.',
  },
  {
    month: 2,
    weeks: '05–08',
    title: 'Viver o cotidiano',
    detail: 'Cafés, refeições, horários, compras e transporte.',
    goal: 'Fazer um pedido e entender perguntas previsíveis.',
  },
  {
    month: 3,
    weeks: '09–12',
    title: 'Criar conexões',
    detail: 'Rotina, interesses, família e perguntas de acompanhamento.',
    goal: 'Sustentar uma conversa simples com apoio.',
  },
  {
    month: 4,
    weeks: '13–16',
    title: 'Contar histórias',
    detail: 'Experiências, planos, preferências e narrativas curtas.',
    goal: 'Relatar algo vivido e perguntar sobre o outro.',
  },
  {
    month: 5,
    weeks: '17–20',
    title: 'Ganhar autonomia',
    detail: 'Hotéis, problemas cotidianos e diálogos menos previsíveis.',
    goal: 'Resolver situações práticas e pedir esclarecimentos.',
  },
  {
    month: 6,
    weeks: '21–26',
    title: 'Conversar com confiança',
    detail: 'Conversas abertas, simulações e duas semanas de consolidação.',
    goal: 'Avaliar compreensão e interação com rubrica oral.',
  },
];
export interface SrsState {
  intervalDays: number;
  ease: number;
  repetitions: number;
}
// SM-2 simplificado; notas 0–5 correspondem à qualidade da recuperação.
export function scheduleReview(previous: SrsState, quality: number, now = new Date()) {
  if (!Number.isInteger(quality) || quality < 0 || quality > 5)
    throw new Error('Quality must be 0–5');
  const ease = Math.max(1.3, previous.ease + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  const repetitions = quality < 3 ? 0 : previous.repetitions + 1;
  const intervalDays =
    quality < 3
      ? 1
      : repetitions === 1
        ? 1
        : repetitions === 2
          ? 6
          : Math.round(previous.intervalDays * previous.ease);
  return {
    ease,
    repetitions,
    intervalDays,
    dueAt: new Date(now.getTime() + intervalDays * 86400000).toISOString(),
  };
}
