import type { Language, Note, StudySession, Lesson } from '@lingua/core';
// Adaptador pronto para a etapa de login/sincronização. O MVP local não envia dados.
// getToken recebe o access token do SDK de autenticação, nunca uma service-role key.
export function createApiClient(baseUrl: string, getToken: () => Promise<string | null>) {
  async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await getToken();
    if (!token) throw new Error('Entre na sua conta antes de sincronizar.');
    const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (!response.ok)
      throw new Error(`A API respondeu ${response.status}. Os dados locais devem ser preservados.`);
    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
  return {
    dashboard: () =>
      request<{
        timezone: string;
        sessions: StudySession[];
        languages: Array<{
          code: Language;
          proficiency: string;
          seconds: number;
          completed: number;
        }>;
      }>('/v1/dashboard'),
    saveSession: (session: StudySession) =>
      request<{ id: string; duplicate: boolean }>('/v1/study-sessions', {
        method: 'POST',
        body: JSON.stringify(session),
      }),
    notes: (language: Language) => request<{ notes: Note[] }>(`/v1/notes?language=${language}`),
    saveNote: (note: Note) =>
      request<Note>(`/v1/notes/${note.id}`, {
        method: 'PUT',
        body: JSON.stringify({ language: note.language, body: note.body }),
      }),
    removeNote: (id: string) => request<void>(`/v1/notes/${id}`, { method: 'DELETE' }),
    timezone: (timezone: string) =>
      request<{ timezone: string }>('/v1/profile', {
        method: 'PATCH',
        body: JSON.stringify({ timezone }),
      }),
  };
}
export async function fetchCatalog(baseUrl: string): Promise<Lesson[]> {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/v1/catalog`);
  if (!response.ok) throw new Error('Não foi possível carregar o catálogo.');
  return (await response.json()).lessons;
}
