# Funcionalidades

## Canvas e organização

- Canvas infinito com pan por roda do mouse, trackpad, botão do meio, ferramenta mão ou barra de espaço.
- Zoom por `Ctrl/Cmd + roda`, pinch, botões, menu de porcentagem (25%–200%) e atalhos.
- Enquadrar quadro (`Shift+1`), zoom 100% (`Ctrl/Cmd+0`), minimapa clicável e arrastável.
- Encaixe opcional em grade com tamanhos 8/16/24/32 px.
- Seleção múltipla por arraste, Shift+clique, `Ctrl/Cmd+A`, mover com setas (Shift = 10 px) e alinhadores no inspector.
- Duplicar, trazer para frente, enviar para trás, bloquear, ocultar e excluir com desfazer.
- Mover ou copiar a seleção para outro quadro pelo menu de contexto: colunas vão com os itens, subquadros acompanham o cartão e o conteúdo entra centralizado no destino.
- Arraste a seleção até um cartão de quadro no canvas ou até a linha do quadro na árvore lateral para mover (segure `Alt` no canvas para copiar); o destino reage ao arraste e pulsa ao receber os elementos.
- Duplo clique em área vazia cria uma nota; duplo clique em um elemento abre o editor correspondente.
- Arraste arquivos do sistema para o canvas: imagens, vídeos, arquivos, Markdown (vira nota), `.excalidraw` (vira desenho) e JSON (importa elementos).
- Arraste imagens/arquivos para uma **nota**: o anexo é salvo localmente, a miniatura aparece dentro do cartão e o elemento fica ao lado com referência bidirecional.
- Arraste arquivos para um **quadro aninhado**: eles entram diretamente no quadro filho (com aviso), sem duplicar no quadro atual.

## Elementos

| Elemento | Recursos |
| --- | --- |
| Nota | Markdown com barra de formatação, prévia, contagem de palavras, título e cores |
| Texto | Texto livre direto no canvas, sem cartão: duplo clique escreve, cresce com o conteúdo e aceita cores |
| Cartão | Título, descrição, etiqueta e cores |
| Tarefa | Concluir, prioridade, prazo, Enter cria a próxima tarefa |
| Checklist | Itens editáveis, progresso, adicionar/remover, concluir |
| Imagem / Vídeo | Anexo local, legenda, preenchimento/conter, lightbox |
| Arquivo | Nome, tipo, tamanho, download |
| Link | Título, descrição, URL e abertura no navegador padrão |
| Quadro | Subquadro real, estatísticas, prévia colorida e abertura em aba |
| Coluna | Filhos arrastáveis, recolher, redimensionar, menu de criação rápida |
| Comentário | Autor local, resolução, respostas e painel dedicado |
| Desenho | Excalidraw completo, miniatura, biblioteca de elementos, exportação |
| Desenho em nota | Vincule um desenho à nota (botão de caneta no cabeçalho da nota); as miniaturas aparecem dentro do cartão e abrem o editor |

## Excalidraw

- Editor em tela cheia aberto por duplo clique, botão do nó ou atalho `D`.
- Todas as ferramentas do Excalidraw: seleção, formas, linhas, setas, escrita manual, texto, imagem, borracha, moldura, laser, biblioteca e links.
- Salvamento automático do cena (elementos, app state serializável e arquivos) com debounce.
- Miniatura PNG gerada de forma adiada para manter o canvas leve.
- Biblioteca de elementos persistida localmente e importável/exportável em `.excalidrawlib` pela própria biblioteca.
- Exportação do desenho em PNG, SVG e PDF.
- Importação de arquivos `.excalidraw` por arraste ou pelo diálogo de importação.
- **Mesclagem de cenas** pelo menu **Cena**: colar do clipboard, importar um `.excalidraw` ou mesclar outro desenho do workspace (inclusive importado do Obsidian).
- A mesclagem gera novos IDs, remapeia textos/containers, setas/bindings, grupos e imagens, e desloca a cena para não sobrepor o conteúdo existente.

## Quadros, workspaces e abas

- Múltiplos workspaces com criação, renomeação e exclusão.
- Árvore lateral com expansão, arraste para aninhar, mover para a raiz, renomear, duplicar e excluir.
- Abas independentes por quadro, com fechamento por botão, clique do meio e `Ctrl/Cmd+W`.
- Subquadros recursivos criados pela barra, pelo inspector, pela árvore ou pelo atalho.

## Busca e referências

- Busca global em todos os workspaces com pontuação por campo e filtros por tipo.
- Resultados mostram trecho, tipo e caminho do quadro; Enter abre e centraliza o elemento.
- Referências bidirecionais: adicione quadros ou elementos em `Refs`; backlinks listam quem aponta para o item atual.

## Produtividade

- Undo/redo com agrupamento inteligente; `Ctrl/Cmd+Z` e `Ctrl/Cmd+Shift+Z` (ou `Ctrl+Y`).
- Templates embutidos: brainstorm, projeto, kanban, ata de reunião, pesquisa, moodboard, semana, roteiro e retrospectiva.
- Salvar o quadro atual como modelo reutilizável (payload serializável, persiste entre sessões).
- Exportação PNG/PDF do quadro inteiro com enquadramento automático e restauração do zoom.
- Exportação Markdown (colunas, tarefas, notas) e JSON (backup reimportável).
- Importação de JSON de quadro/workspace/fragmento, Markdown, `.excalidraw` e anexos.
- Importação de cofre Obsidian: hierarquia de pastas em quadros, notas com frontmatter/tags, wiki-links clicáveis com referências, anexos locais, `.canvas` (texto, links, arquivos, grupos e arestas) e `.excalidraw`.

## Obsidian

O menu **Arquivo → Cofre do Obsidian** (ou **Importar → Importar cofre do Obsidian**) cria um workspace novo a partir de uma pasta de cofre, sem modificar o original. No desktop, usa o seletor nativo de pastas; tudo roda localmente e a importação inteira é uma única entrada de undo.

- Pastas viram quadros aninhados; notas viram notas Markdown posicionadas em grade.
- `[[Nota]]`, `[[Nota|alias]]` e `[[Nota#Título]]` viram links internos clicáveis + referências bidirecionais.
- `![[imagem]]`, links Markdown relativos e anexos são salvos localmente e viram nós de mídia referenciados.
- `.canvas` vira um subquadro com nós e conectores; grupos viram colunas.
- `.excalidraw` vira desenho editável.
- Limitações: plugins/temas/Dataview não são executados, transclusões viram links, grupos reorganizam os itens. Detalhes em [docs/OBSIDIAN.md](docs/OBSIDIAN.md).

## Dados e configurações

- Visual inspirado no Milanote: canvas cinza neutro, cartões brancos, notas coloridas sem cabeçalho, quadros em tiles coloridos, colunas transparentes, conectores finos com rótulos escuros e cantos retos em toda a interface.
- Autosave incremental com indicador de status, armazenamento identificado (SQLite/IndexedDB).
- Backups automáticos por intervalo configurável e manuais, com retenção e restauração.
- Tema claro/escuro/sistema, cor de destaque, textura do canvas, densidade, escala de UI, sombra dos elementos, minimapa e rótulos de conectores.
- Atalhos totalmente remapeáveis com detecção de conflitos e restauração dos padrões.
- Anexos locais, armazenamento por dispositivo, nenhum upload.

## Limites conhecidos

- Não há autenticação, colaboração, servidor ou sincronização (por design).
- Links abrem no navegador padrão; o conteúdo do app permanece offline.
- O editor Excalidraw carrega sob demanda (~4,6 MB comprimido) na primeira abertura.
- A exportação de imagem captura a área enquadrada do canvas; para quadros muito grandes use escala 2x/3x.
- O histórico de undo/redo é por sessão e não é persistido.
