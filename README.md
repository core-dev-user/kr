# lingua. — conversas que abrem o mundo

Base mobile para aprender **coreano, japonês e francês** com progresso independente. A primeira etapa entrega dashboard, navegação, temas, timer de lições, cadernos locais e API com PostgreSQL. Interface em português.

## Stack escolhida

| Camada                | Tecnologia                                            | Por quê                                                                                                                   |
| --------------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Mobile                | React Native + Expo SDK 54 + TypeScript               | Android/iOS com uma base; preview web ajuda a validar UI; TTS e armazenamento nativos sem manter três aplicações.         |
| Navegação/UI          | React Navigation, SVG, LinearGradient                 | Abas acessíveis, componentes reutilizáveis, ambientações leves com placeholders para assets 3D.                           |
| Estado local          | Context + AsyncStorage                                | MVP independente de conexão/conta; notas e histórico particionados por idioma.                                            |
| API                   | Node.js 22+ + Fastify 5 + Zod                         | Contratos explícitos, validação, autenticação por token e testes HTTP com injeção.                                        |
| Banco                 | PostgreSQL 17 + SQL versionado + pg                   | Relações e transações para impedir progresso/tempo duplicado; portável para Supabase ou outro PostgreSQL gerenciado.      |
| Autenticação proposta | Supabase Auth/OIDC com JWT/JWKS                       | Login gerenciado; API verifica assinatura, emissor, audiência e sujeito. Não há login implementado no mobile nesta etapa. |
| Voz                   | expo-speech agora; STT → LLM → TTS no servidor depois | Prática guiada funciona sem chave; as credenciais futuras ficam exclusivamente no servidor.                               |

Flutter também seria adequado, mas TypeScript permite compartilhar os modelos e regras entre app e API. PostgreSQL oferece relações/relatórios e transações mais diretas para este domínio que um modelo documental Firebase.

## Executar

Requisitos: Node.js **22+**, npm, Docker Compose para a API. O aplicativo local funciona sem banco, conta ou chave de IA.

```bash
cd /workspace/kr
npm ci
npm run mobile
# Ou, para desenvolvimento no navegador:
npm run web
```

Use Expo Go compatível com SDK 54 ou um development build; Android/iOS não foram executados nesta máquina. Não há dependência de notificações, microfone ou GPU nesta etapa.

```bash
# API e banco local (credencial de exemplo apenas para este banco local):
docker compose up -d --wait db
export DATABASE_URL=postgresql://lingua:lingua_local@127.0.0.1:5432/lingua
npm run db:migrate
npm run api
```

A API não lê `.env` automaticamente. Exporte as variáveis do [exemplo](apps/api/.env.example) no shell ou use o carregamento de env do seu runner. Sem configuração de OIDC, saúde e catálogo funcionam e rotas privadas retornam 401. Nunca existe bypass de autenticação no servidor de desenvolvimento.

Validação HTTP local: `curl --fail http://127.0.0.1:3001/health` e `curl --fail http://127.0.0.1:3001/v1/catalog`. Endereços locais servem para testes internos.

Em uma máquina com diretório pessoal restrito, use `npm ci --cache /workspace/.npm-cache` e `EXPO_NO_TELEMETRY=1 CI=1 npm run build:web`. Para iniciar o Metro sem acesso externo, use `EXPO_NO_TELEMETRY=1 npm run mobile -- --offline`; se o runner não encaminhar argumentos de workspace, execute `npm run start -w @lingua/mobile -- --offline`.

## Entregas

Para hospedar a versão web, veja [Publicar na Vercel](docs/vercel.md). O deploy usa o export estático de `apps/mobile/dist`; a API não precisa iniciar para abrir o aplicativo.

- [Arquitetura, fluxos, API e evolução](docs/architecture.md).
- [Schema SQL executável](database/001_initial.sql) e [modelo de dados explicado](docs/data-model.md).
- [Design system e regras de interação](docs/design-system.md).
- [Plano editorial de 26 semanas](docs/curriculum.md).
- [Dashboard](apps/mobile/src/screens/DashboardScreen.tsx), [navegação](apps/mobile/App.tsx) e [temas](apps/mobile/src/theme.ts).
- [API](apps/api/src/app.ts), [cliente tipado para integração futura](apps/mobile/src/api.ts) e regras compartilhadas em `packages/core`.

```text
apps/
  mobile/        app Expo, componentes, telas, persistência e adaptador HTTP
  api/           Fastify, verificação JWT, migrations e testes de integração
packages/core/   idiomas, lições piloto, métricas, roteiro e algoritmo SRS
database/        schema PostgreSQL versionado
docs/            decisões arquiteturais, modelo, design e currículo
tests/           fluxos do app com Playwright
```

## Verificar

```bash
npm run typecheck
# Sem TEST_DATABASE_URL, o teste de integração é explicitamente marcado como skipped.
TEST_DATABASE_URL=postgresql://lingua:lingua_local@127.0.0.1:5432/lingua npm test
EXPO_NO_TELEMETRY=1 CI=1 npm run build:web
# Instale Chromium pelo Playwright em sua máquina, ou indique o binário instalado:
npx playwright install chromium
npm run test:e2e
# Na máquina cloud usada nesta entrega:
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Testes da API criam e removem **apenas um schema isolado** com nome aleatório no banco de teste. Use um banco dedicado em CI. Migrations são transacionais, verificam checksum e podem ser repetidas.

## Limites desta etapa

O app usa um perfil local e não sincroniza com a API automaticamente. API e adaptador HTTP estão preparados para a próxima etapa de login, fila offline e sincronização. Há **uma lição piloto por idioma** e planejamento para 26 semanas, não um curso completo. O algoritmo SRS e seu schema estão presentes, mas a fila de revisões e suas rotas ainda não estão implementadas. A aba Conversar é um roteiro com TTS, não um chatbot; a API retorna 501 para conversas até conectar um provedor. Proficiência A0 indica ausência de avaliação, e não melhora automaticamente por tempo de uso.

Tempo e notas persistem ao concluir/sair da lição e ao salvar uma nota. Fechamento forçado durante uma lição pode perder a sessão ainda aberta; recuperação de sessão e exportação de notas fazem parte da evolução. AsyncStorage não é armazenamento criptografado e os dados pertencem apenas à instalação atual.

Seis meses são uma janela de planejamento. A fluência depende de carga horária, idioma, interação real e avaliação; não é garantida, especialmente ao estudar três línguas em paralelo. O plano propõe conversação prática progressiva e medidas de competência.
