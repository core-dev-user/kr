import test from 'node:test';
import assert from 'node:assert/strict';
import { metrics, scheduleReview, weekSeries, type StudySession } from './index';
const session = (
  language: StudySession['language'],
  id: string,
  seconds: number,
  endedAt = '2026-10-11T14:00:00Z',
): StudySession => ({
  id,
  language,
  lessonId: `${language}-w1-intro`,
  startedAt: '2026-10-11T13:00:00Z',
  endedAt,
  activeSeconds: seconds,
  completed: true,
});
test('tempo e conclusões ficam separados por língua e repetição não duplica lições', () => {
  const all = [session('ko', 'a', 120), session('fr', 'b', 300), session('ko', 'c', 60)];
  assert.equal(metrics(all, 'ko').seconds, 180);
  assert.equal(metrics(all, 'ko').completed, 1);
  assert.equal(metrics(all, 'ja').seconds, 0);
});
test('histórico semanal soma minutos no dia e língua corretos', () => {
  const days = weekSeries([session('fr', 'a', 180)], new Date('2026-10-11T15:00:00Z'));
  assert.equal(days.length, 7);
  assert.equal(days[6].values.fr, 3);
  assert.equal(days[6].values.ko, 0);
});
test('missões e streak seguem o fuso do perfil e toleram hoje ainda sem estudo', () => {
  const all = [
    session('ko', 'a', 120, '2026-10-11T01:00:00Z'),
    session('ko', 'b', 120, '2026-10-09T18:00:00Z'),
  ];
  const m = metrics(all, 'ko', new Date('2026-10-11T15:00:00Z'), 'America/Sao_Paulo');
  assert.equal(m.streak, 2);
  assert.equal(m.todaySeconds, 0);
});
test('SRS agenda sucesso e reinicia recuperação após erro', () => {
  const first = scheduleReview(
    { ease: 2.5, repetitions: 0, intervalDays: 0 },
    4,
    new Date('2026-01-01T00:00:00Z'),
  );
  assert.equal(first.dueAt, '2026-01-02T00:00:00.000Z');
  assert.equal(scheduleReview(first, 4).intervalDays, 6);
  assert.equal(scheduleReview(first, 1).repetitions, 0);
  assert.throws(() => scheduleReview(first, 6));
});
