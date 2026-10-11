# Publicar o aplicativo web na Vercel

O aplicativo Expo desta etapa funciona com dados locais no navegador. Seu deploy é estático: arquivos HTML, JavaScript, fontes e imagens gerados pelo Metro. A API Fastify/PostgreSQL é um serviço independente e não precisa iniciar para abrir o app.

## Configuração do projeto

Conecte `core-dev-user/kr` e use a branch `main`. Em **Settings → Build and Deployment**, mantenha:

| Campo | Valor |
|---|---|
| Root Directory | Raiz do repositório, campo vazio (não `apps/api` nem `apps/mobile`) |
| Framework Preset | Other |
| Install Command | `npm ci` |
| Build Command | `EXPO_NO_TELEMETRY=1 npm run build:web` |
| Output Directory | `apps/mobile/dist` |
| Node.js Version | 22.x ou 24.x |

O [vercel.json](../vercel.json) já define instalação, build, diretório de saída e fallback de navegação para `index.html`. A raiz precisa incluir todos os npm workspaces e o lockfile; Root Directory é uma configuração do projeto na Vercel, não um campo deste JSON. Overrides antigos no painel devem corresponder aos valores acima.

Não use `npm run api`, `npm run web` ou `npm run mobile` como Build Command: são processos de servidor/desenvolvimento. O comando de produção é o export web, que encerra depois de gerar `apps/mobile/dist/index.html`.

## Atualizar um projeto já hospedado

1. Confirme a Root Directory e o preset acima e salve as configurações.
2. O push na branch de produção dispara um deploy quando a integração Git está ativa. Se necessário, em **Deployments**, publique o commit mais recente de `main`; não faça Redeploy de um commit anterior à adição do `vercel.json`.
3. Verifique o log: ele deve executar `expo export --platform web` e terminar com `Exported: dist`.
4. Depois de Ready, abra o endereço de produção, alterne os idiomas e crie uma nota. Recarregue a página para conferir a persistência local.

O ambiente cloud e o projeto da Vercel são configurações separadas. Publicar o ambiente cloud não realiza o deploy na Vercel.

## Erro `500 FUNCTION_INVOCATION_FAILED`

Esse código informa que uma função executada no servidor falhou; não identifica sozinho a causa. Neste projeto, um deploy do front-end corretamente configurado serve o export estático e não inicia `apps/api/src/server.ts`.

Se o erro continuar no commit novo, confirme que o domínio aponta para esse deploy e consulte **Logs** do projeto na Vercel. Verifique também Root Directory, preset e regras de roteamento anteriores. Não compartilhe valores de variáveis ou tokens ao enviar logs; somente a mensagem e a stack do erro.

O servidor Fastify existente exige `DATABASE_URL`, migrations e configuração JWT para rotas privadas. Hospedar a API requer uma configuração própria de backend e PostgreSQL acessível; não adicione o banco apenas para abrir o front-end. O MVP web não envia dados automaticamente à API.

## Validação local

```bash
npm ci
EXPO_NO_TELEMETRY=1 npm run build:web
npm run test:e2e
```

Os testes existentes validam o export estático em viewport móvel, navegação, notas e timer. Eles não equivalem a um teste do domínio hospedado na Vercel.
