import type { Language } from '@lingua/core';
export const tokens = {
  ink: '#172C35',
  muted: '#647982',
  background: '#F5F8F8',
  card: '#FFFFFF',
  border: '#E4ECEC',
  radius: { sm: 12, md: 20, lg: 28 },
  space: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
};
export const themes = {
  ko: {
    primary: '#117C71',
    accent: '#58D9C1',
    soft: '#E0F7F0',
    deep: '#16473E',
    gradient: ['#D5F5E9', '#B3E8DC'],
    tag: 'Um novo mundo, uma conversa de cada vez.',
    scene: 'Hanok · descubra a Coreia',
  },
  ja: {
    primary: '#BA3345',
    accent: '#F47688',
    soft: '#FCE9EC',
    deep: '#682437',
    gradient: ['#FFF0ED', '#FAD1D9'],
    tag: 'Pequenos passos. Grandes descobertas.',
    scene: 'Torii & Fuji · descubra o Japão',
  },
  fr: {
    primary: '#305CA8',
    accent: '#7196E0',
    soft: '#E8EEFF',
    deep: '#233D73',
    gradient: ['#EEF2FF', '#D0DEF9'],
    tag: 'A próxima conversa pode mudar seu dia.',
    scene: 'Paris · vive la conversation',
  },
} satisfies Record<
  Language,
  {
    primary: string;
    accent: string;
    soft: string;
    deep: string;
    gradient: string[];
    tag: string;
    scene: string;
  }
>;
export const cardShadow = {
  shadowColor: '#183F3A',
  shadowOpacity: 0.045,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
  elevation: 2,
};
