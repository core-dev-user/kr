# Conversação em seis meses — planejamento editorial

26 semanas (aproximadamente seis meses), com objetivo de interação cotidiana progressiva. Não representa uma promessa de fluência universal: coreano/japonês exigem familiaridade com escrita e estruturas diferentes do português; francês também demanda escuta e prática oral. Três idiomas em paralelo precisam de tempos independentes. Recomendar um idioma prioritário, sem limitar a alternância.

## Rotina

- 8–12 min de input compreensível: diálogo curto contextualizado, áudio de falante competente, imagens/texto graduados.
- 5–8 min de recuperação ativa com SRS: entender, tentar lembrar, então revelar/responder. Evitar memorização de tradução isolada.
- 7–15 min de fala: shadowing, variação de frases e diálogo com perguntas reais. O timer registra somente tempo ativo.
- Uma sessão oral mais longa por semana; revisão e avaliação formativa ao final de cada mês.

Carga inicial 20–40 min/dia por língua + interação ao vivo semanal sempre que possível. Ajustar com evidência de compreensão e retenção. Começar com input majoritariamente compreensível, acrescentando poucos itens por lição; a dificuldade é calibrada por pessoa, não por um percentual rígido.

## Escopo semanal por idioma

Esta tabela define **temas**, não lições prontas. Só o piloto de apresentação da semana 1 está implementado em cada idioma.

| Semana | Coreano                                 | Japonês                                   | Francês                             | Produção oral esperada                         |
| ------ | --------------------------------------- | ----------------------------------------- | ----------------------------------- | ---------------------------------------------- |
| 1      | Hangeul e cumprimentos educados         | Sons, hiragana inicial e apresentação     | Sons, bonjour e apresentação        | Dizer nome e cumprimentar                      |
| 2      | Blocos silábicos; nomes/origem          | Hiragana; nomes/origem e です             | Pronomes, être e origem             | Perguntar nome/origem                          |
| 3      | Números, horas e perguntas básicas      | Números, horas, か                        | Números, horários, perguntas        | Combinar um horário                            |
| 4      | Revisão contextual, partículas iniciais | Revisão, leitura gradual e partículas     | Revisão, gênero/artigos em contexto | Apresentação curta com perguntas               |
| 5      | Café, 주세요 e contadores úteis         | Café, ください e contadores úteis         | Café, je voudrais e polidez         | Pedir bebida e quantidade                      |
| 6      | Restaurantes e preferências             | Restaurantes e gostos                     | Restaurantes e restrições           | Pedir comida e esclarecer opção                |
| 7      | Transporte e localização                | Transporte, destinos e katakana funcional | Transporte e direções               | Perguntar como chegar                          |
| 8      | Compras e preços; revisão               | Compras, preços e revisão                 | Compras, preços e revisão           | Comprar um item com perguntas                  |
| 9      | Rotina com verbos no presente           | Rotina com forma ます                     | Rotina no presente                  | Descrever um dia típico                        |
| 10     | Família e relações                      | Família e relações                        | Família e relações                  | Perguntar sobre pessoas próximas               |
| 11     | Hobbies e preferências                  | Hobbies, gostos e convites                | Hobbies, gostos e convites          | Conversar sobre interesses                     |
| 12     | Conectores simples e revisão            | Conectores simples e revisão              | Conectores simples e revisão        | Manter trocas curtas com apoio                 |
| 13     | Experiências passadas                   | Passado polido em contexto                | Passé composé em contexto           | Contar o que fez ontem                         |
| 14     | Planos e intenção                       | Planos e intenção                         | Futur proche                        | Explicar planos próximos                       |
| 15     | Descrições e comparações                | Descrições e comparações                  | Descrições e comparações            | Comparar duas opções                           |
| 16     | Narrativa e esclarecimentos             | Narrativa e esclarecimentos               | Narrativa e esclarecimentos         | Relatar e pedir para repetir                   |
| 17     | Check-in e reservas                     | Check-in e reservas                       | Check-in e reservas                 | Fazer check-in e confirmar dados               |
| 18     | Pedir ajuda e resolver problemas        | Pedir ajuda e resolver problemas          | Pedir ajuda e resolver problemas    | Explicar um problema cotidiano                 |
| 19     | Saúde cotidiana e necessidades          | Saúde cotidiana e necessidades            | Saúde cotidiana e necessidades      | Descrever necessidade sem depender de script   |
| 20     | Revisão de situações imprevistas        | Revisão de situações imprevistas          | Revisão de situações imprevistas    | Concluir uma tarefa com reformulação           |
| 21     | Opiniões simples e justificativas       | Opiniões simples e justificativas         | Opiniões simples e justificativas   | Dizer preferência e um motivo                  |
| 22     | Conversa sobre cultura cotidiana        | Conversa sobre cultura cotidiana          | Conversa sobre cultura cotidiana    | Fazer perguntas de acompanhamento              |
| 23     | Conversas com ritmo variado             | Conversas com ritmo variado               | Conversas com ritmo variado         | Reconhecer quando pedir esclarecimento         |
| 24     | Simulações abertas                      | Simulações abertas                        | Simulações abertas                  | Navegar cenário sem memorizar sequência        |
| 25     | Consolidação de lacunas individuais     | Consolidação de lacunas individuais       | Consolidação de lacunas individuais | Retomar tópicos difíceis com apoio menor       |
| 26     | Avaliação oral e próximo plano          | Avaliação oral e próximo plano            | Avaliação oral e próximo plano      | Demonstrar competências e definir continuidade |

## Qualidade de cada lição

Contrato de conteúdo: objetivo observável, situação comunicativa, pré-requisitos, input de 30–90 s com texto/áudio, significado e contexto de registro, perguntas de compreensão, produção com variação, cartões SRS e rubrica de conclusão. Romanização auxilia no começo, mas é progressivamente retirada; escrita nativa é central. O francês não depende de romanização.

Para publicar conteúdo em produção: revisão por professor/falante competente, áudio com pronúncia e ritmo adequados, revisão cultural/de registro, equivalência funcional da tradução e validação de compreensão com iniciantes. Os pilotos atuais são amostras técnicas/textuais, com TTS do sistema; não substituem esse processo. A tabela `lessons.status` permite draft → reviewed → published; o catálogo retorna somente published. Os três pilotos são publicados para desenvolvimento e identificados como piloto na API.

## SRS e avaliação

`scheduleReview` implementa SM-2 simplificado: primeira recuperação bem-sucedida em 1 dia, segunda em 6 dias, próximas por intervalo × facilidade; erro retorna a 1 dia com repetições reiniciadas. Qualidade 0–5 registra recuperação, não tempo assistido. O schema guarda estado e eventos; a fila de vencidos, a apresentação dos cartões e a transação de submissão são próximas entregas.

Rubrica oral mensal: compreensão, realização da tarefa, inteligibilidade, manutenção de turnos, adequação de registro e estratégias de reparo. Registrar nível, rubrica e data; não inferir nível por streak. CEFR pode orientar competências comunicativas, enquanto JLPT/TOPIK ajudam com referências específicas de repertório e leitura sem equivaler diretamente a fluência oral. A meta final é conversar com autonomia crescente em cenários conhecidos; a avaliação decide o próximo percurso.
