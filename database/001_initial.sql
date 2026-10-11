CREATE TABLE users (
  id uuid PRIMARY KEY,
  display_name text NOT NULL DEFAULT 'Estudante',
  timezone text NOT NULL DEFAULT 'UTC',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE languages (
  code text PRIMARY KEY CHECK (code IN ('ko', 'ja', 'fr')),
  name text NOT NULL, locale text NOT NULL
);
INSERT INTO languages VALUES ('ko','Coreano','ko-KR'),('ja','Japonês','ja-JP'),('fr','Francês','fr-FR');
CREATE TABLE user_languages (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES languages(code),
  daily_goal_minutes smallint NOT NULL DEFAULT 20 CHECK (daily_goal_minutes BETWEEN 5 AND 180),
  proficiency text NOT NULL DEFAULT 'A0' CHECK (proficiency IN ('A0','A1','A2','B1','B2','C1','C2')),
  assessed_at timestamptz,
  started_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, language_code)
);
CREATE TABLE curriculum_weeks (
  language_code text NOT NULL REFERENCES languages(code),
  week smallint NOT NULL CHECK (week BETWEEN 1 AND 26),
  month smallint NOT NULL CHECK (month BETWEEN 1 AND 6),
  theme text NOT NULL, oral_goal text NOT NULL,
  PRIMARY KEY (language_code, week)
);
CREATE TABLE lessons (
  id text PRIMARY KEY,
  language_code text NOT NULL REFERENCES languages(code),
  week smallint NOT NULL, title text NOT NULL,
  estimated_minutes smallint NOT NULL CHECK (estimated_minutes > 0),
  content jsonb NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','reviewed','published')),
  UNIQUE (id, language_code),
  FOREIGN KEY (language_code, week) REFERENCES curriculum_weeks(language_code, week)
);
CREATE TABLE study_sessions (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL,
  language_code text NOT NULL,
  lesson_id text NOT NULL,
  started_at timestamptz NOT NULL, ended_at timestamptz NOT NULL,
  active_seconds integer NOT NULL CHECK (active_seconds BETWEEN 1 AND 21600),
  completed boolean NOT NULL DEFAULT false,
  received_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ended_at >= started_at),
  CHECK (active_seconds <= ceil(extract(epoch FROM ended_at - started_at))),
  FOREIGN KEY (user_id, language_code) REFERENCES user_languages(user_id, language_code) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id, language_code) REFERENCES lessons(id, language_code)
);
CREATE INDEX sessions_dashboard ON study_sessions(user_id, language_code, ended_at DESC);
CREATE TABLE lesson_progress (
  user_id uuid NOT NULL, language_code text NOT NULL, lesson_id text NOT NULL,
  completed_at timestamptz NOT NULL, attempts integer NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, lesson_id),
  FOREIGN KEY (user_id, language_code) REFERENCES user_languages(user_id, language_code) ON DELETE CASCADE,
  FOREIGN KEY (lesson_id, language_code) REFERENCES lessons(id, language_code)
);
CREATE TABLE notes (
  id uuid PRIMARY KEY, user_id uuid NOT NULL, language_code text NOT NULL,
  body text NOT NULL CHECK (length(body) BETWEEN 1 AND 20000),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id, language_code) REFERENCES user_languages(user_id, language_code) ON DELETE CASCADE
);
CREATE INDEX notes_owner ON notes(user_id, language_code, updated_at DESC);
CREATE TABLE srs_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), language_code text NOT NULL REFERENCES languages(code),
  lesson_id text NOT NULL, front text NOT NULL, back text NOT NULL,
  FOREIGN KEY (lesson_id, language_code) REFERENCES lessons(id, language_code)
);
CREATE TABLE user_card_reviews (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES srs_cards(id) ON DELETE CASCADE,
  interval_days integer NOT NULL DEFAULT 0 CHECK (interval_days >= 0),
  ease numeric NOT NULL DEFAULT 2.5 CHECK (ease >= 1.3),
  repetitions integer NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  due_at timestamptz NOT NULL DEFAULT now(), last_review_at timestamptz,
  PRIMARY KEY (user_id, card_id)
);
CREATE INDEX reviews_due ON user_card_reviews(user_id, due_at);
CREATE TABLE review_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  card_id uuid NOT NULL REFERENCES srs_cards(id) ON DELETE CASCADE,
  quality smallint NOT NULL CHECK (quality BETWEEN 0 AND 5), reviewed_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE proficiency_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, language_code text NOT NULL,
  level text NOT NULL CHECK (level IN ('A0','A1','A2','B1','B2','C1','C2')),
  rubric jsonb NOT NULL, assessed_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (user_id, language_code) REFERENCES user_languages(user_id, language_code) ON DELETE CASCADE
);
CREATE TABLE conversation_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL, language_code text NOT NULL,
  scenario text NOT NULL, started_at timestamptz NOT NULL DEFAULT now(), ended_at timestamptz,
  feedback jsonb, -- Não armazenar áudio/transcrição por padrão; exigir consentimento e retenção explícitos.
  FOREIGN KEY (user_id, language_code) REFERENCES user_languages(user_id, language_code) ON DELETE CASCADE
);
-- Missões, streak e gráficos são derivados do histórico no fuso do usuário,
-- evitando contadores independentes que possam divergir. CEFR requer avaliação.
