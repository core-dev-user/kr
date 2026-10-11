# Design system

## Direção visual

Identidade premium com superfícies claras, tipografia legível, hierarquia editorial, cards arredondados e ilustrações com volume. Trocar idioma muda cores de ações/abas, gradiente do hero, saudação, escrita nativa, ilustração, cidade, lição e conteúdo de caderno. O dashboard unificado mantém as três cores na legenda para comparação estável.

| Token                             | Coreano                  | Japonês                             | Francês                       |
| --------------------------------- | ------------------------ | ----------------------------------- | ----------------------------- |
| primary — ações/texto de destaque | `#117C71`                | `#BA3345`                           | `#305CA8`                     |
| accent — ornamentação             | `#58D9C1`                | `#F47688`                           | `#7196E0`                     |
| soft — cards leves                | `#E0F7F0`                | `#FCE9EC`                           | `#E8EEFF`                     |
| deep — texto no hero              | `#16473E`                | `#682437`                           | `#233D73`                     |
| ambientação                       | Verde-água, jardim/Hanok | Vermelho, branco, Sakura/Fuji/Torii | Azul, branco, vermelho; Paris |

Neutros: fundo `#F5F8F8`, superfície `#FFFFFF`, texto `#172C35`, texto secundário `#647982`, borda `#E4ECEC`. Vermelho francês aparece como detalhe da ilustração, enquanto azul orienta as ações. Cores claras de accent não são usadas para texto principal sobre branco.

## Componentes implementados

| Componente            | Contrato / estados                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------------------- |
| LanguageSwitcher      | Três botões com nome em português/escrita nativa; selected exposto à acessibilidade; progresso preservado |
| Card                  | Superfície, borda suave, sombra discreta; padding 22 px, raio 24 px                                       |
| Button                | Primário/secundário, ícone, pressed/disabled; altura mínima 50 px                                         |
| SectionTitle          | Título e contexto curto; hierarquia sem depender só da cor                                                |
| LanguageScene         | SVG de Hanok/Torii+Fuji/Eiffel com perspectiva; placeholder 3D identificado                               |
| Dashboard hero        | Saudação nativa, gradiente, ilustração, lição piloto e CTA                                                |
| Study chart           | Sete dias; barras empilhadas por idioma, valores, legenda e descrição acessível                           |
| Language progress row | Idioma, minutos, conclusões e A0/sem avaliação; toque abre jornada selecionada                            |
| Mission               | Ícone de concluída/pendente e descrição textual; cálculo por idioma/dia                                   |
| LessonModal           | Cronômetro ativo/pausado, input compreensível, TTS e tarefa oral                                          |
| NoteEditor            | Modal com idioma capturado; multiline, limite, salvar, descartar com confirmação                          |
| Bottom tabs           | Início, Jornada, Caderno, Conversar; preserva o idioma selecionado                                        |

Tokens reutilizáveis estão em [theme.ts](../apps/mobile/src/theme.ts); primitives em [UI.tsx](../apps/mobile/src/components/UI.tsx). Tipografia de sistema: títulos 30/700, seções 20/700, corpo 14 com entrelinha 22, métricas 28/700 e números monoespaçados no timer. Espaçamento base 4/8/16/24/32; raio 12/20/28. Os rótulos pequenos de 9–11 px são decorativos/contextuais; revisar em testes de legibilidade em aparelhos antes de produção.

## Movimento e adaptação

Fade de 240 ms ao trocar idioma, desativado quando o sistema solicita reduzir movimento; navegação/modal usa transição nativa. Feedback de toque altera opacidade. A ilustração fica acima do CTA e se empilha em larguras menores que 400 px. Conteúdo tem largura máxima de 860 px; o app continua priorizando smartphone. Não há animação contínua nem renderização 3D pesada nesta etapa.

Próximos assets: GLB comprimido ou renders WebP estáticos com variantes de resolução e fallback. Lottie pode oferecer animação pontual; 3D interativo precisa de profiling de GPU/bateria e suporte nativo. O slot `LanguageScene` permite a troca sem mudar o layout.

## Acessibilidade e conteúdo

Botões têm papel/estado, tabs possuem rótulos, timer recebe descrição em segundos e gráfico tem resumo textual. Não usar flags como único identificador de idioma. Escrita asiática permanece em Unicode com fontes do sistema; verificar glifos e TTS em Android/iOS. O app oferece textos completos junto das falas; síntese não exige microfone. Um estado vazio convida à primeira prática, sem exibir progresso fictício. Conteúdos não publicados são marcados como planejamento.

Antes do release: testar VoiceOver/TalkBack, tamanho de fonte ampliado, contraste WCAG AA, foco/restauração dos modais, navegação por teclado no web e áreas de toque em aparelhos reais. A navegação segura considera insets do dispositivo. Tema escuro, localização da interface e avaliação de pronúncia estão fora desta primeira etapa.
