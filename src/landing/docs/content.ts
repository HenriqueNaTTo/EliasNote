import type { LucideIcon } from "lucide-react";
import { Boxes, FolderTree, Keyboard, LayoutGrid, Rocket, Terminal } from "lucide-react";
import type { DocId, DocSectionContent } from "@/landing/i18n/types";

/**
 * Metadados e textos de referência (português) das páginas de documentação.
 * Os demais idiomas ficam em `src/landing/i18n/locales/<idioma>/docs.ts` e
 * seguem exatamente esta estrutura.
 */

export interface DocPage {
  id: DocId;
  title: string;
  /** Nome curto usado na navegação lateral. */
  shortTitle: string;
  icon: LucideIcon;
  file: string;
  summary: string;
  sections: DocSectionContent[];
}

const FEATURES_PAGE: DocPage = {
  id: "funcionalidades",
  title: "Funcionalidades",
  shortTitle: "Funcionalidades",
  icon: LayoutGrid,
  file: "FEATURES.md",
  summary:
    "O inventário completo do que já está pronto: canvas, elementos, Excalidraw, organização, busca, produtividade e limites declarados.",
  sections: [
    {
      id: "canvas-e-organizacao",
      title: "Canvas e organização",
      hint: "features/canvas",
      blocks: [
        {
          kind: "list",
          items: [
            "Canvas infinito com pan por roda do mouse, trackpad, botão do meio, ferramenta mão ou barra de espaço.",
            "Zoom por `Ctrl/Cmd + roda`, pinch, botões, menu de porcentagem (25%–200%) e atalhos.",
            "Enquadrar quadro (`Shift+1`), zoom 100% (`Ctrl/Cmd+0`), minimapa clicável e arrastável.",
            "Encaixe opcional em grade com tamanhos 8/16/24/32 px.",
            "Seleção múltipla por arraste, Shift+clique, `Ctrl/Cmd+A`, mover com setas (Shift = 10 px) e alinhadores no inspector.",
            "Duplicar, trazer para frente, enviar para trás, bloquear, ocultar e excluir com desfazer.",
            "Mover ou copiar a seleção para outro quadro pelo menu de contexto: colunas vão com os itens, subquadros acompanham o cartão e o conteúdo entra centralizado no destino.",
            "Arraste a seleção até um cartão de quadro no canvas ou até a linha do quadro na árvore lateral para mover (segure `Alt` no canvas para copiar); o destino reage ao arraste e pulsa ao receber os elementos.",
            "Duplo clique em área vazia cria uma nota; duplo clique em um elemento abre o editor correspondente.",
            "Arraste arquivos do sistema para o canvas: imagens, vídeos, arquivos, Markdown (vira nota), `.excalidraw` (vira desenho) e JSON (importa elementos).",
            "Arraste imagens/arquivos para uma **nota**: o anexo é salvo localmente, a miniatura aparece dentro do cartão e o elemento fica ao lado com referência bidirecional.",
            "Arraste arquivos para um **quadro aninhado**: eles entram diretamente no quadro filho (com aviso), sem duplicar no quadro atual.",
          ],
        },
      ],
    },
    {
      id: "elementos",
      title: "Elementos",
      hint: "core/domain/nodes",
      blocks: [
        {
          kind: "table",
          columns: ["Elemento", "Recursos"],
          caption: "Tipos de nós do EliasNote e o que cada um oferece",
          rows: [
            ["Nota", "Markdown com barra de formatação, prévia, contagem de palavras, título e cores; o botão de expandir abre a nota em um editor grande"],
            ["Texto", "Texto livre direto no canvas, sem cartão: duplo clique escreve, cresce com o conteúdo e aceita cores"],
            ["Cartão", "Título, descrição, etiqueta e cores"],
            ["Tarefa", "Concluir, prioridade, prazo, Enter cria a próxima tarefa"],
            ["Checklist", "Itens editáveis, progresso, adicionar/remover, concluir"],
            ["Imagem / Vídeo", "Anexo local, legenda, preenchimento/conter, lightbox"],
            ["Arquivo", "Nome, tipo, tamanho, download"],
            ["Link", "Título, descrição, URL e abertura no navegador padrão"],
            ["Quadro", "Subquadro real, estatísticas, prévia colorida e abertura em aba"],
            ["Coluna", "Filhos arrastáveis, recolher, redimensionar, menu de criação rápida"],
            ["Comentário", "Autor local, resolução, respostas e painel dedicado"],
            ["Desenho", "Excalidraw completo, miniatura, biblioteca de elementos, exportação"],
            [
              "Desenho em nota",
              "Vincule um desenho à nota (botão de caneta no cabeçalho da nota); as miniaturas aparecem dentro do cartão e abrem o editor",
            ],
          ],
        },
      ],
    },
    {
      id: "excalidraw",
      title: "Excalidraw",
      hint: "features/drawing",
      blocks: [
        {
          kind: "list",
          items: [
            "Editor em tela cheia aberto por duplo clique, botão do nó ou atalho `D`.",
            "Todas as ferramentas do Excalidraw: seleção, formas, linhas, setas, escrita manual, texto, imagem, borracha, moldura, laser, biblioteca e links.",
            "Salvamento automático da cena (elementos, app state serializável e arquivos) com debounce.",
            "Miniatura PNG gerada de forma adiada para manter o canvas leve.",
            "Biblioteca de elementos persistida localmente e importável/exportável em `.excalidrawlib` pela própria biblioteca.",
            "Exportação do desenho em PNG, SVG e PDF.",
            "Importação de arquivos `.excalidraw` por arraste ou pelo diálogo de importação.",
            "**Mesclagem de cenas** pelo menu **Cena**: colar do clipboard, importar um `.excalidraw` ou mesclar outro desenho do workspace (inclusive importado do Obsidian).",
            "A mesclagem gera novos IDs, remapeia textos/containers, setas/bindings, grupos e imagens, e desloca a cena para não sobrepor o conteúdo existente.",
          ],
        },
      ],
    },
    {
      id: "quadros-workspaces-abas",
      title: "Quadros, workspaces e abas",
      blocks: [
        {
          kind: "list",
          items: [
            "Múltiplos workspaces com criação, renomeação e exclusão.",
            "Árvore lateral com expansão, arraste para aninhar, mover para a raiz, renomear, duplicar e excluir.",
            "Abas independentes por quadro, com fechamento por botão, clique do meio e `Ctrl/Cmd+W`.",
            "Subquadros recursivos criados pela barra, pelo inspector, pela árvore ou pelo atalho.",
          ],
        },
      ],
    },
    {
      id: "busca-e-referencias",
      title: "Busca e referências",
      hint: "core/search",
      blocks: [
        {
          kind: "list",
          items: [
            "Busca global em todos os workspaces com pontuação por campo e filtros por tipo.",
            "Resultados mostram trecho, tipo e caminho do quadro; Enter abre e centraliza o elemento.",
            "Painel de tarefas (`Ctrl/Cmd+Shift+P`) reúne tarefas de todos os quadros, com prazos, prioridade, filtros e abertura no canvas.",
            "Etiquetas editáveis no inspector, com sugestões do quadro, e filtro por etiqueta no canvas; o filtro é uma visão temporária e não altera os dados.",
            "Modo apresentação (`Ctrl/Cmd+Shift+F`) esconde a interface, enquadra o quadro e navega pela árvore do workspace sem editar nada.",
            "Referências bidirecionais: adicione quadros ou elementos em `Refs`; backlinks listam quem aponta para o item atual.",
          ],
        },
      ],
    },
    {
      id: "produtividade",
      title: "Produtividade",
      blocks: [
        {
          kind: "list",
          items: [
            "Undo/redo com agrupamento inteligente; `Ctrl/Cmd+Z` e `Ctrl/Cmd+Shift+Z` (ou `Ctrl+Y`).",
            "Templates embutidos: brainstorm, projeto, kanban, ata de reunião, pesquisa, moodboard, semana, roteiro e retrospectiva.",
            "Salvar o quadro atual como modelo reutilizável (payload serializável, persiste entre sessões).",
            "Exportação PNG/PDF do quadro inteiro com enquadramento automático e restauração do zoom.",
            "Exportação Markdown (colunas, tarefas, notas) e JSON (backup reimportável).",
            "Importação de JSON de quadro/workspace/fragmento, Markdown, `.excalidraw` e anexos.",
            "Importação de cofre Obsidian: hierarquia de pastas em quadros, notas com frontmatter/tags, wiki-links clicáveis com referências, anexos locais, `.canvas` (texto, links, arquivos, grupos e arestas) e `.excalidraw`.",
          ],
        },
      ],
    },
    {
      id: "obsidian",
      title: "Obsidian",
      hint: "core/import",
      blocks: [
        {
          kind: "text",
          text: "O menu **Arquivo → Cofre do Obsidian** (ou **Importar → Importar cofre do Obsidian**) cria um workspace novo a partir de uma pasta de cofre, sem modificar o original. No desktop, usa o seletor nativo de pastas; tudo roda localmente e a importação inteira é uma única entrada de undo.",
        },
        {
          kind: "list",
          items: [
            "Pastas viram quadros aninhados; notas viram notas Markdown posicionadas em grade.",
            "`[[Nota]]`, `[[Nota|alias]]` e `[[Nota#Título]]` viram links internos clicáveis + referências bidirecionais.",
            "`![[imagem]]`, links Markdown relativos e anexos são salvos localmente e viram nós de mídia referenciados.",
            "`.canvas` vira um subquadro com nós e conectores; grupos viram colunas.",
            "`.excalidraw` vira desenho editável.",
            "Limitações: plugins/temas/Dataview não são executados, transclusões viram links, grupos reorganizam os itens.",
          ],
        },
      ],
    },
    {
      id: "dados-e-configuracoes",
      title: "Dados e configurações",
      hint: "core/persistence",
      blocks: [
        {
          kind: "list",
          items: [
            "Visual inspirado no Milanote: canvas cinza neutro, cartões brancos, notas coloridas sem cabeçalho, quadros em tiles coloridos, colunas transparentes, conectores finos com rótulos escuros e cantos retos em toda a interface.",
            "Autosave incremental com indicador de status, armazenamento identificado (SQLite/IndexedDB).",
            "Backups automáticos por intervalo configurável e manuais, com retenção e restauração.",
            "Tema claro/escuro/sistema, cor de destaque, textura do canvas, densidade, escala de UI, sombra dos elementos, minimapa e rótulos de conectores.",
            "Atalhos totalmente remapeáveis com detecção de conflitos e restauração dos padrões.",
            "Anexos locais, armazenamento por dispositivo, nenhum upload.",
          ],
        },
      ],
    },
    {
      id: "limites-conhecidos",
      title: "Limites conhecidos",
      blocks: [
        {
          kind: "note",
          tone: "warning",
          text: "Transparência faz parte da documentação. Se um destes pontos for bloqueante para o seu fluxo, abra uma issue descrevendo o caso de uso.",
        },
        {
          kind: "list",
          items: [
            "Não há autenticação, colaboração, servidor ou sincronização (por design).",
            "Links abrem no navegador padrão; o conteúdo do app permanece offline.",
            "O editor Excalidraw carrega sob demanda (~4,6 MB comprimido) na primeira abertura.",
            "A exportação de imagem captura a área enquadrada do canvas; para quadros muito grandes use escala 2x/3x.",
            "O histórico de undo/redo é por sessão e não é persistido.",
          ],
        },
      ],
    },
  ],
};

const SHORTCUTS_PAGE: DocPage = {
  id: "atalhos",
  title: "Atalhos",
  shortTitle: "Atalhos",
  icon: Keyboard,
  file: "SHORTCUTS.md",
  summary:
    "Todos os atalhos do app, separados por navegação, criação, canvas e arquivo. Cada combinação pode ser remapeada em Configurações → Atalhos.",
  sections: [
    {
      id: "navegacao",
      title: "Navegação",
      blocks: [
        {
          kind: "shortcuts",
          items: [
            { action: "Busca global", keys: [["Mod", "K"]] },
            { action: "Painel de tarefas", keys: [["Mod", "Shift", "P"]] },
            { action: "Modo apresentação", keys: [["Mod", "Shift", "F"]] },
            { action: "Abrir/entrar no quadro selecionado", keys: [["Mod", "Enter"]] },
            { action: "Fechar aba", keys: [["Mod", "W"]] },
            { action: "Próxima aba", keys: [["Mod", "Tab"]] },
            { action: "Alternar barra lateral", keys: [["Mod", "B"]] },
            { action: "Alternar inspector", keys: [["Mod", "Shift", "I"]] },
            { action: "Alternar tema", keys: [["Mod", "Shift", "L"]] },
          ],
        },
      ],
    },
    {
      id: "criacao",
      title: "Criação",
      blocks: [
        {
          kind: "shortcuts",
          items: [
            { action: "Nova nota", keys: [["N"]] },
            { action: "Novo texto livre", keys: [["Shift", "T"]] },
            { action: "Novo cartão", keys: [["C"]] },
            { action: "Nova tarefa", keys: [["T"]] },
            { action: "Novo checklist", keys: [["L"]] },
            { action: "Nova coluna", keys: [["Mod", "Shift", "K"]] },
            { action: "Novo quadro", keys: [["Mod", "Shift", "N"]] },
            { action: "Novo desenho Excalidraw", keys: [["D"]] },
            { action: "Novo comentário", keys: [["M"]] },
            { action: "Novo subquadro na árvore", keys: [["Menu do quadro", "Novo subquadro"]] },
          ],
        },
      ],
    },
    {
      id: "canvas",
      title: "Canvas",
      blocks: [
        {
          kind: "shortcuts",
          items: [
            { action: "Ferramenta seleção", keys: [["V"]] },
            { action: "Ferramenta mão", keys: [["H"]] },
            { action: "Ferramenta conector", keys: [["R"]] },
            { action: "Mover seleção (1 px)", keys: [["Setas"]] },
            { action: "Mover seleção (10 px)", keys: [["Shift", "Setas"]] },
            { action: "Duplicar", keys: [["Mod", "D"]] },
            { action: "Excluir", keys: [["Delete"], ["Backspace"]] },
            { action: "Selecionar tudo", keys: [["Mod", "A"]] },
            { action: "Desfazer", keys: [["Mod", "Z"]] },
            { action: "Refazer", keys: [["Mod", "Shift", "Z"], ["Ctrl", "Y"]] },
            { action: "Zoom +", keys: [["Mod", "="]] },
            { action: "Zoom −", keys: [["Mod", "−"]] },
            { action: "Zoom 100%", keys: [["Mod", "0"]] },
            { action: "Enquadrar quadro", keys: [["Shift", "1"]] },
            { action: "Sair de ferramenta / fechar editor", keys: [["Esc"]] },
          ],
        },
      ],
    },
    {
      id: "arquivo",
      title: "Arquivo",
      blocks: [
        {
          kind: "shortcuts",
          items: [
            { action: "Salvar agora", keys: [["Mod", "S"]] },
            { action: "Exportar quadro", keys: [["Mod", "Shift", "E"]] },
            { action: "Modelos", keys: [["Mod", "Shift", "T"]] },
            { action: "Backups", keys: [["Mod", "Shift", "B"]] },
            { action: "Configurações", keys: [["Mod", ","]] },
          ],
        },
      ],
    },
    {
      id: "observacoes",
      title: "Observações",
      blocks: [
        {
          kind: "text",
          text: "`Mod` representa `Ctrl` no Windows/Linux e `⌘` no macOS. Todos os atalhos podem ser remapeados em **Configurações → Atalhos**, com detecção de conflitos e restauração dos padrões.",
        },
        {
          kind: "list",
          items: [
            "Atalhos de uma letra são ignorados enquanto você digita em campos de texto.",
            "Combinações com `Mod` continuam ativas para desfazer, salvar e buscar.",
            "No navegador, alguns atalhos do sistema (como `Ctrl+W` e `Ctrl+Tab`) podem ser interceptados. No app Tauri eles funcionam normalmente.",
          ],
        },
      ],
    },
  ],
};

const OBSIDIAN_PAGE: DocPage = {
  id: "obsidian",
  title: "Importar cofre do Obsidian",
  shortTitle: "Obsidian",
  icon: FolderTree,
  file: "OBSIDIAN.md",
  summary:
    "Como transformar um cofre inteiro em um workspace novo: o que é convertido, como a organização é gerada, limites e privacidade.",
  sections: [
    {
      id: "como-usar",
      title: "Como usar",
      blocks: [
        {
          kind: "text",
          text: "O EliasNote importa um cofre (vault) do Obsidian como um **workspace novo**, sem alterar o cofre original e sem enviar nada para a internet. Toda a leitura acontece na sua máquina.",
        },
        {
          kind: "list",
          ordered: true,
          items: [
            "Abra o menu **Arquivo (⋯) → Cofre do Obsidian**, ou **Importar → Importar cofre do Obsidian**.",
            "Selecione a **pasta raiz** do cofre. No desktop o seletor nativo de pastas do sistema é aberto; no navegador, use o seletor de pasta do próprio navegador.",
            "Confira o resumo (notas, pastas, canvas, desenhos e anexos), ajuste o nome do workspace e escolha se deseja importar anexos não referenciados.",
            "Clique em **Importar cofre**. O EliasNote abre o quadro raiz do novo workspace.",
          ],
        },
        {
          kind: "note",
          text: "Há um cofre de exemplo em examples/obsidian-vault no repositório para testar o fluxo inteiro.",
        },
        {
          kind: "text",
          text: "Depois de importar um `.excalidraw` do cofre, ele vira um nó de desenho. Para reaproveitar essa cena em outro desenho, abra o desenho de destino, use **Cena → Mesclar desenho do workspace** e escolha o desenho importado. Também é possível usar **Cena → Colar cena do clipboard** ou importar o arquivo `.excalidraw` diretamente no editor.",
        },
        {
          kind: "text",
          text: "A importação é uma única operação no histórico: `Ctrl/Cmd + Z` desfaz o workspace inteiro. O cofre no disco não é modificado.",
        },
      ],
    },
    {
      id: "o-que-e-convertido",
      title: "O que é convertido",
      hint: "obsidianParser.ts · obsidianPlan.ts",
      blocks: [
        {
          kind: "table",
          columns: ["Obsidian", "EliasNote"],
          caption: "Equivalência entre os elementos do cofre e o resultado no workspace",
          rows: [
            ["Pastas", "Quadros aninhados (a raiz vira o quadro inicial; cada subpasta vira um subquadro)"],
            ["Notas `.md`", "Notas Markdown com título, conteúdo, frontmatter de tags/aliases e tarefas"],
            ["`[[Nota]]` / `[[Nota|alias]]`", "Link interno clicável (`eliasnote://node/...`) + referência bidirecional"],
            ["`[[Nota#Título]]`", "Link interno com o trecho no título do link e referência para a nota"],
            ["`![[imagem.png]]`", "Anexo local + nó de imagem/vídeo/arquivo no quadro, referenciado pela nota"],
            ["`[[arquivo.pdf]]`", "Anexo local + nó de arquivo"],
            ["`[[Quadro.canvas]]`", "Link para o quadro importado do canvas"],
            ["`[[desenho.excalidraw]]`", "Link para o nó de desenho Excalidraw"],
            [
              "Links Markdown relativos (`[Nota](Pasta/Nota.md)`, `![](img.png)`)",
              "Convertidos para links internos/anexos quando o alvo existe no cofre",
            ],
            [".canvas", "Quadro próprio com notas, links, imagens, grupos e conectores"],
            [".excalidraw", "Nó de desenho editável (mesma cena)"],
            ["Imagens, vídeos e arquivos", "Anexos locais; a referência vira nó de mídia"],
            ["Canvas `group`", "Coluna com os elementos contidos no grupo (reorganizados verticalmente)"],
            [
              "Cores do canvas (1–6)",
              "Paleta de cores do EliasNote (rosa, areia, âmbar, menta, céu, lilás)",
            ],
            ["Arestas do canvas", "Conectores com rótulo, cor e setas conforme `fromEnd`/`toEnd`"],
          ],
        },
      ],
    },
    {
      id: "organizacao-gerada",
      title: "Organização gerada",
      blocks: [
        {
          kind: "list",
          items: [
            "O workspace recebe o nome `Obsidian · <cofre>` (editável).",
            "A raiz do workspace é um quadro com o nome do cofre. Ele contém cartões de quadro para cada pasta de primeiro nível e para canvases da raiz, além das notas que estão na raiz.",
            "Cada pasta tem seu próprio quadro, com subpastas, canvases, notas, desenhos e uma área de anexos à direita.",
            "Notas são posicionadas em uma grade de três colunas; anexos ficam em uma coluna reservada à direita.",
            "Quadros de canvas abrem como subquadros e aparecem como cartões no quadro da pasta.",
          ],
        },
      ],
    },
    {
      id: "limitacoes",
      title: "Limitações conhecidas",
      blocks: [
        {
          kind: "list",
          items: [
            "**Plugins e temas do Obsidian não são executados nem importados** (`.obsidian` é ignorado). Dataview, Templater, metadados de plugins e CSS snippets não têm efeito.",
            "**Dataview e blocos de consulta** entram como texto/código, não como resultados.",
            "**Transclusão** (`![[Nota]]`) vira um link para a nota, não um conteúdo embutido.",
            "**Callouts** do Obsidian são renderizados como citações comuns; HTML é sanitizado.",
            "**Grupos de canvas** viram colunas e os itens são reorganizados verticalmente — a posição original dentro do grupo não é preservada.",
            "Links Markdown com espaços no caminho entre `<...>` podem não ser resolvidos; prefira `[[...]]`.",
            "Nomes de notas repetidos em pastas diferentes podem ser resolvidos pelo caminho mais curto; use `[[Pasta/Nota]]` para desambiguar.",
            "Cofres com mais de **20.000 arquivos** são lidos parcialmente; o app avisa e você pode importar subpastas separadamente.",
            "Arquivos de texto acima de 8 MB são ignorados.",
            "A importação não cria modelos/templates a partir do cofre; use **Modelos → Salvar quadro atual** depois, se quiser.",
          ],
        },
      ],
    },
    {
      id: "privacidade",
      title: "Privacidade",
      blocks: [
        {
          kind: "list",
          items: [
            "A pasta é lida pelo seletor local do sistema (`webkitdirectory`); nada é enviado à rede.",
            "Anexos são copiados para o armazenamento local do EliasNote (SQLite/IndexedDB), mantendo o cofre intacto.",
            "Links internos abrem dentro do app; links externos (`http`, `mailto`) abrem no navegador padrão.",
          ],
        },
      ],
    },
    {
      id: "solucao-de-problemas",
      title: "Solução de problemas",
      blocks: [
        {
          kind: "list",
          items: [
            "**Nada foi encontrado:** confirme que selecionou a pasta que contém os `.md`, não uma pasta acima do cofre.",
            "**Faltam imagens:** verifique se os anexos estão dentro do cofre e se o link usa `![[...]]`/caminho relativo válido. Ative “Anexos não referenciados” para importar imagens sem links.",
            "**Links quebrados:** o app mostra a contagem de links não resolvidos no resumo; eles permanecem como texto.",
            "**Canvas vazio:** o arquivo `.canvas` precisa ser JSON válido no formato JSON Canvas; arquivos inválidos aparecem como ignorados.",
            "**Muitos arquivos:** selecione uma subpasta do cofre e repita a importação; cada importação gera um workspace novo.",
          ],
        },
      ],
    },
  ],
};

const ARCHITECTURE_PAGE: DocPage = {
  id: "arquitetura",
  title: "Arquitetura",
  shortTitle: "Arquitetura",
  icon: Boxes,
  file: "ARCHITECTURE.md",
  summary:
    "Como o app é montado: camadas com dependência unidirecional, modelo de domínio, store com histórico, renderização do canvas, persistência e backend Tauri.",
  sections: [
    {
      id: "visao-geral",
      title: "Visão geral",
      blocks: [
        {
          kind: "text",
          text: "EliasNote é uma SPA React executada dentro do Tauri 2 (ou em um navegador, em modo de desenvolvimento). A arquitetura é organizada em camadas com dependência unidirecional:",
        },
        {
          kind: "code",
          title: "camadas",
          code: `features/     → componentes e fluxos de UI
core/         → domínio, estado, persistência, busca, exportação
lib/          → utilidades puras (geometria, markdown, atalhos)
components/ui → primitivas visuais`,
        },
        {
          kind: "text",
          text: "Nada em `core/` importa de `features/`. O backend Rust (`src-tauri`) expõe apenas comandos genéricos de documentos, anexos e backups — não conhece o modelo de quadros.",
        },
      ],
    },
    {
      id: "modelo-de-dominio",
      title: "Modelo de domínio",
      hint: "core/domain",
      blocks: [
        {
          kind: "list",
          items: [
            "`Workspace` agrupa quadros. Cada `Board` pertence a um workspace e pode ter um `parentId` (subquadro) e uma lista `childOrder` para a árvore.",
            "`CanvasNode` é um registro tipado com um discriminante `type` e campos opcionais específicos (`content`, `items`, `attachmentId`, `scene`, `references`, etc.). Essa escolha mantém atualizações e migrações simples; as fábricas garantem os campos obrigatórios por tipo.",
            "Colunas não contêm filhos em árvore DOM: os filhos têm `parentId = column.id` e posições recalculadas por `layoutColumnNodes`. O canvas renderiza todos os nós como elementos irmãos, o que simplifica culling, seleção e z-order.",
            "`Connector` referencia elementos (`nodeId`) ou pontos livres. A geometria (`anchorPoint`, `connectorGeometry`) é recalculada no render, então mover um elemento reposiciona a seta automaticamente.",
            "Referências usam o formato `node:<id>` / `board:<id>`. Backlinks são derivados por varredura (sem índice persistido), com custo linear por consulta.",
          ],
        },
      ],
    },
    {
      id: "estado",
      title: "Estado e slices",
      hint: "core/store · Zustand 5 + Immer",
      blocks: [
        {
          kind: "text",
          text: "O store usa Zustand 5 + middleware Immer e é dividido em slices:",
        },
        {
          kind: "table",
          columns: ["Slice", "Responsabilidade"],
          rows: [
            ["`historySlice`", "`commit`, transações, undo/redo, `beginTransaction`/`endTransaction`"],
            ["`boardSlice`", "workspaces, quadros, abas, árvore, templates, importação"],
            ["`nodeSlice`", "nós, colunas, seleção, conectores, referências, comentários, desenho"],
            ["`uiSlice`", "viewports, canvas size, diálogos, status de salvamento, hidratação"],
            ["`settingsSlice`", "preferências, temas, atalhos remapeáveis"],
          ],
        },
      ],
    },
    {
      id: "historico",
      title: "Histórico de undo/redo",
      hint: "core/store/historySlice",
      blocks: [
        {
          kind: "list",
          items: [
            "`commit(label, recipe, options)` captura os snapshots imutáveis de `boards/workspaces` antes e depois da mutação. Immer garante compartilhamento estrutural, então guardar referências é barato.",
            "Digitação usa `coalesceKey` para fundir alterações consecutivas em uma única entrada (janela de 1,6 s).",
            "Arraste e redimensionamento usam transação: várias mutações silenciosas e uma única entrada ao soltar.",
            "Limite de 80 entradas; undo/redo não são persistidos (histórico por sessão).",
          ],
        },
      ],
    },
    {
      id: "renderizacao",
      title: "Renderização do canvas",
      hint: "core/domain/layout · features/canvas",
      blocks: [
        {
          kind: "list",
          items: [
            "Uma única camada DOM é transformada com `translate(x, y) scale(zoom)`; coordenadas dos nós ficam em unidades do mundo.",
            "`renderOrder` ordena por `z` e insere os filhos imediatamente após a coluna, evitando `z-index` fracionário.",
            "`visibleNodes` faz culling por interseção com o viewport + margem. Com 5.000 elementos, apenas algumas dezenas são montadas (teste dedicado).",
            "`CanvasNodeView` é memoizado e só recebe `node`, `zoom` e flags; arraste/resize usam listeners globais com transação, sem re-render extra por frame além do necessário.",
            "Nós de desenho não montam o Excalidraw: usam a miniatura PNG armazenada na cena; o editor completo é carregado sob demanda (`React.lazy`).",
            "Drops de arquivos são roteados por alvo: notas criam anexos e referências; quadros aninhados usam `addNode` com `boardId` e recebem os elementos no quadro filho.",
            "O editor Excalidraw expõe o menu `Cena`, que usa `mergeExcalidrawScenes` para remapear elementos, bindings, grupos e arquivos antes de `updateScene`/`addFiles`.",
          ],
        },
      ],
    },
    {
      id: "importacao-externa",
      title: "Importação externa",
      hint: "core/import",
      blocks: [
        {
          kind: "list",
          items: [
            "`obsidianParser.ts` lê entradas de cofre (`.md`, `.canvas`, `.excalidraw`, anexos), remove `.obsidian`/`.trash`, interpreta frontmatter, tags, wiki-links, links Markdown relativos e resolve destinos por caminho, nome ou alias.",
            "`obsidianPlan.ts` gera um plano com IDs estáveis: quadros por pasta, notas em grade, anexos em área própria, canvas com grupos/arestas e referências já apontando para os IDs finais.",
            "`importVault(plan)` no `boardSlice` materializa o plano em um único `commit`, cria o workspace, abre o quadro raiz e preserva undo/redo como uma única entrada.",
            "A UI usa o **seletor nativo de pastas** do Tauri (`tauri-plugin-dialog`) e o comando `vault_scan` para ler o cofre no Rust, sem trafegar o conteúdo pelo webview. No navegador, há fallback com `webkitdirectory`.",
            "Anexos do cofre são copiados para o armazenamento local por `attachment_import_path`, sem passar bytes pela interface.",
            "A importação tem limites de 20.000 arquivos e 8 MB por texto.",
          ],
        },
      ],
    },
    {
      id: "persistencia",
      title: "Persistência",
      hint: "core/persistence",
      blocks: [
        {
          kind: "code",
          title: "adapters",
          code: `StorageAdapter (interface)
├── TauriSqliteAdapter   → invoke() → comandos Rust → SQLite
├── IndexedDbAdapter     → idb → object stores
└── MemoryAdapter        → testes`,
        },
        {
          kind: "list",
          items: [
            "`repository.ts` traduz o estado em documentos (`app`, `settings`, `board:<id>`) e reconstrói `HydratePayload` com migrações.",
            "`persistenceService.ts` assina o store, detecta quadros alterados por identidade, agenda flush e grava somente o necessário. Também agenda backups automáticos e expõe restauração.",
            "`migrations.ts` normaliza campos ausentes, números em string, conectores incompletos e ignora nós inválidos.",
            "Anexos são imutáveis e referenciados por `attachmentId`; `attachments.ts` resolve URLs (asset protocol no Tauri, object URL no navegador) e mantém cache.",
          ],
        },
      ],
    },
    {
      id: "backend-tauri",
      title: "Backend Tauri",
      hint: "src-tauri",
      blocks: [
        {
          kind: "list",
          items: [
            "`db.rs`: conexão rusqlite com WAL, tabelas `documents`, `attachments` e `backups`; gravação de anexos no diretório de dados e limpeza de backups antigos.",
            "`lib.rs`: estado `Mutex<Database>` e comandos `doc_*`, `attachment_*`, `backup_*`, `clear_all`.",
            "A janela desabilita `dragDropEnabled` para que o HTML5 drag-and-drop de arquivos funcione no webview, e habilita o asset protocol com escopo restrito a `$APPDATA`.",
          ],
        },
      ],
    },
    {
      id: "colaboracao-futura",
      title: "Prontidão para colaboração futura",
      blocks: [
        {
          kind: "list",
          items: [
            "Domínio normalizado com IDs estáveis e timestamps por entidade.",
            "`StorageAdapter` isola o meio de persistência; uma implementação remota pode substituir o adaptador sem tocar na UI.",
            "`commit` centraliza mutações, o que permite emitir operações (event sourcing) posteriormente.",
            "Referências e comentários já são entidades locais, mapeáveis para autoria e threads remotas.",
            "Nenhuma decisão arquitetural impede autenticação, sync ou CRDT: a UI não assume que o estado é exclusivo do processo.",
          ],
        },
      ],
    },
    {
      id: "testes",
      title: "Testes",
      blocks: [
        {
          kind: "list",
          items: [
            "`vitest` + `jsdom` + Testing Library.",
            "Cobertura de geometria, layout/culling, markdown/sanitização, store/histórico, templates, busca/backlinks, exportação/importação, migrações, persistência/backups e três componentes de nó.",
            "O backend Rust é verificado por `cargo check` e pela build real (`npm run tauri build`); o binário empacotado foi iniciado como smoke test, criando o SQLite e hidratando o seed.",
          ],
        },
      ],
    },
  ],
};

const DEVELOPMENT_PAGE: DocPage = {
  id: "desenvolvimento",
  title: "Desenvolvimento",
  shortTitle: "Desenvolvimento",
  icon: Terminal,
  file: "DEVELOPMENT.md",
  summary:
    "Requisitos, comandos, assistente de instalação, ambiente de testes, verificação do backend Rust e solução de problemas do ambiente local.",
  sections: [
    {
      id: "requisitos",
      title: "Requisitos",
      blocks: [
        {
          kind: "list",
          items: [
            "Node.js 20+ e npm.",
            "Rust 1.77.2+ (recomendado: rustup).",
            "Tauri 2: dependências de sistema conforme a plataforma (Windows: WebView2 + Microsoft C++ Build Tools; macOS: Xcode Command Line Tools; Linux: webkit2gtk).",
            "SQLite é compilado embutido (`rusqlite` com feature `bundled`), sem dependência externa.",
          ],
        },
      ],
    },
    {
      id: "comandos",
      title: "Comandos",
      blocks: [
        {
          kind: "code",
          title: "terminal",
          code: `npm install
npm run dev              # Vite em http://localhost:1420
npm run typecheck        # tsc --noEmit
npm test                 # vitest run
npm run build            # assets + typecheck + build de produção
npm run tauri dev        # desktop com SQLite
npm run tauri build -- --bundles nsis
npm run icons            # regenera src-tauri/icons
npm run installer:assets # regenera as artes do instalador
npm run setup:dev        # assistente de instalação em modo dev
npm run setup:build      # instalador visual (.exe) em dist-setup/
npm run version:set 0.2.0  # sincroniza a versão nos manifestos`,
          note: "scripts/copy-excalidraw-assets.mjs copia as fontes e dados do Excalidraw para public/excalidraw-assets; ele roda antes de dev e build para o app funcionar sem CDN.",
        },
      ],
    },
    {
      id: "assistente-de-instalacao",
      title: "Assistente de instalação",
      hint: "setup/",
      blocks: [
        {
          kind: "text",
          text: "`npm run setup:build` monta `dist-setup/EliasNote_<versão>_x64-setup.exe`: um app Tauri próprio (`setup/src-tauri`, interface em `setup.html` + `src/setup/**`) que embute o `eliasnote.exe` em `setup/src-tauri/payload` e instala o programa no escopo do usuário.",
        },
        {
          kind: "list",
          items: [
            "Os ícones (`setup/src-tauri/icons`) e o payload são **gerados** pelo script; um `cargo build` isolado em `setup/src-tauri` falha até o payload existir.",
            "O build usa o CLI do Tauri nas duas etapas (app e assistente): só ele define as variáveis `TAURI_ENV_*` que embutem o frontend de produção no binário.",
            "`npm run setup:dev` abre só a interface (rode `npm run dev` para o Vite em `:1420`).",
            "O assistente copia a si mesmo como `uninstall.exe`; ele abre a tela de remoção com `--uninstall` e apaga a pasta de instalação quando o processo termina.",
          ],
        },
      ],
    },
    {
      id: "release",
      title: "Release",
      blocks: [
        {
          kind: "text",
          text: "O repositório publica os instaladores por GitHub Actions em `.github/workflows/release.yml`:",
        },
        {
          kind: "code",
          title: "terminal",
          code: `npm run version:set 0.2.0
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --follow-tags`,
        },
        {
          kind: "text",
          text: "A tag `v*` dispara os checks (typecheck, testes, build), cria a release e compila Windows, Linux e macOS em paralelo, anexando `.msi`, `.exe`, `.AppImage`, `.deb` e `.dmg`. Detalhes, disparo manual e ajustes da matriz estão na página Release desta documentação.",
        },
      ],
    },
    {
      id: "estrutura-de-dados",
      title: "Estrutura de dados",
      blocks: [
        {
          kind: "text",
          text: "**Tauri (produção)**",
        },
        {
          kind: "code",
          title: "diretório de dados",
          code: String.raw`<app_data_dir>/
  eliasnote.sqlite3
  attachments/<id>_<nome>
  eliasnote.sqlite3-wal`,
        },
        {
          kind: "text",
          text: "**Navegador (desenvolvimento)**",
        },
        {
          kind: "list",
          items: [
            "Banco IndexedDB `eliasnote` com object stores `documents`, `attachments` e `backups`.",
            "Sem persistência entre perfis diferentes do navegador.",
          ],
        },
      ],
    },
    {
      id: "testes",
      title: "Testes",
      blocks: [
        {
          kind: "list",
          items: [
            "`src/lib/*.test.ts` — geometria, markdown.",
            "`src/core/domain/layout.test.ts` — ordenação, culling com 5.000 elementos, colunas.",
            "`src/core/domain/templates.test.ts` — modelos e round-trip de template.",
            "`src/core/store/store.test.ts` — criação, undo/redo, transações, colunas, duplicação, referências.",
            "`src/core/search/search.test.ts` — busca e backlinks.",
            "`src/core/export/exporter.test.ts` — JSON/Markdown e importação.",
            "`src/core/import/obsidian.test.ts` — parser do cofre, frontmatter, canvas, wiki-links e plano.",
            "`src/core/import/obsidianExample.test.ts` — validade do cofre de exemplo do repositório.",
            "`src/core/import/importVault.test.ts` — importação no store, referências e undo.",
            "`src/features/import/ObsidianImportDialog.test.tsx` — fluxo completo: pasta, resumo, importação e workspace.",
            "`src/features/nodes/drops.test.tsx` — drop de imagens em notas e quadros aninhados.",
            "`src/features/drawing/sceneMerge.test.ts` — remapeamento e mesclagem de cenas Excalidraw.",
            "`src-tauri/src/vault.rs` — teste Rust de leitura recursiva do cofre (`cargo test`).",
            "`src/core/persistence/persistence.test.ts` — migrações, snapshot, autosave e backups.",
            "`src/features/nodes/nodes.test.tsx` — interação real com tarefa, checklist e nota.",
            "`src/app.test.tsx` — integração completa: bootstrap, hidratação do seed e montagem da interface.",
          ],
        },
        {
          kind: "text",
          text: "O ambiente de testes usa jsdom com polyfills de `ResizeObserver`, `matchMedia`, `requestAnimationFrame` e `URL.createObjectURL`.",
        },
      ],
    },
    {
      id: "backend-rust",
      title: "Verificação do backend Rust",
      blocks: [
        {
          kind: "text",
          text: "O backend foi verificado neste ambiente com Rust 1.100 (MSVC):",
        },
        {
          kind: "code",
          title: "src-tauri",
          code: `cd src-tauri
cargo check        # Finished dev profile
cargo test         # leitura recursiva de cofre (vault.rs)
cargo build --release`,
        },
        {
          kind: "text",
          text: "A build completa também foi executada com `npm run tauri build`, gerando `EliasNote_0.1.0_x64_en-US.msi`, `EliasNote_0.1.0_x64-setup.exe` (NSIS) e o executável `eliasnote.exe`. O binário empacotado foi aberto como smoke test e gravou os documentos iniciais em SQLite (`app`, `settings`, dois `board`).",
        },
      ],
    },
    {
      id: "diretorio-de-build",
      title: "Diretório de build",
      blocks: [
        {
          kind: "text",
          text: "`src-tauri/.cargo/config.toml` redireciona o `target-dir` para `F:/cargo-target/eliasnote` porque o disco C: deste ambiente tem pouco espaço livre. Se mover o projeto de máquina, remova ou ajuste esse arquivo:",
        },
        {
          kind: "code",
          title: ".cargo/config.toml",
          code: `[build]
target-dir = "F:/cargo-target/eliasnote"`,
        },
        {
          kind: "text",
          text: "Sem esse redirecionamento, os artefatos ficam em `src-tauri/target`. Para inspecionar o banco local:",
        },
        {
          kind: "code",
          title: "terminal",
          code: String.raw`node scripts/inspect-db.mjs "%APPDATA%\com.eliasnote.desktop\eliasnote.sqlite3"`,
        },
      ],
    },
    {
      id: "troubleshooting",
      title: "Solução de problemas",
      blocks: [
        {
          kind: "list",
          items: [
            "**Seletor de pastas não abre no desktop:** o app usa o plugin nativo de diálogo; confirme que a build inclui `tauri-plugin-dialog` e a permissão `dialog:allow-open` (já configuradas). Reinstale o app após atualizar o projeto.",
            "**Fontes do Excalidraw não carregam:** confirme que `public/excalidraw-assets/fonts` existe (`npm run dev` recria).",
            "**CSP bloqueia algo no desktop:** ajuste `app.security.csp` em `src-tauri/tauri.conf.json`; use `null` apenas em desenvolvimento.",
            "**Navegador não persiste:** verifique IndexedDB nas ferramentas de desenvolvedor; o app mostra o tipo de armazenamento no rodapé da sidebar.",
            "**Drag-and-drop de arquivos não funciona no desktop:** `dragDropEnabled` deve permanecer `false` em `tauri.conf.json`.",
            "**Atalhos conflitantes:** a tela de atalhos sinaliza duplicados; o primeiro da lista tem prioridade.",
            "**Exportação PNG em branco:** abra o quadro e tente novamente; a captura depende do viewport enquadrado.",
          ],
        },
      ],
    },
    {
      id: "convencoes",
      title: "Convenções",
      blocks: [
        {
          kind: "list",
          items: [
            "TypeScript estrito (`noUnusedLocals`/`noUnusedParameters`), alias `@/`.",
            "Estado mutável somente dentro de `commit`/`set` do Zustand com Immer.",
            "Utilitários puros e testáveis em `lib/` e `core/domain`.",
            "Nenhum componente de `features/` é importado por `core/`.",
            "Textos de interface em português; código e identificadores em inglês.",
          ],
        },
      ],
    },
  ],
};

const RELEASE_PAGE: DocPage = {
  id: "release",
  title: "Release",
  shortTitle: "Release",
  icon: Rocket,
  file: "RELEASE.md",
  summary:
    "O caminho de uma versão: workflow do GitHub Actions, matriz de plataformas, instalador personalizado do Windows, assistente visual e problemas comuns.",
  sections: [
    {
      id: "pre-requisitos",
      title: "Pré-requisitos (uma vez)",
      blocks: [
        {
          kind: "list",
          items: [
            "Repositório no GitHub com Actions habilitado (padrão).",
            "Nenhum secret extra: o workflow usa o `GITHUB_TOKEN` embutido com permissão `contents: write`.",
            "Assinatura de código é opcional. Sem certificados, o Windows exibe o aviso do SmartScreen e o macOS bloqueia o app até a liberação manual.",
          ],
        },
      ],
    },
    {
      id: "publicar",
      title: "Publicar uma versão",
      blocks: [
        {
          kind: "code",
          title: "terminal",
          code: `npm run version:set 0.2.0          # sincroniza package.json, tauri.conf.json e Cargo.toml
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --follow-tags`,
        },
        {
          kind: "text",
          text: "O push da tag `v*` dispara o workflow:",
        },
        {
          kind: "table",
          columns: ["Job", "O que faz"],
          rows: [
            ["`checks`", "`npm ci`, `npm run typecheck`, `npm test` e `npm run build` (ubuntu-22.04)"],
            ["`release`", "Gera as notas via API de `generate-notes`, cria a release da tag (ou reaproveita a existente)"],
            [
              "`build`",
              "Matriz **Windows** (`.msi` WiX pelo `tauri-action` + `.exe` do assistente visual), **Linux** (`.AppImage`, `.deb`, `.rpm`) e **macOS** (`.dmg` universal), enviando os instaladores para a release",
            ],
            ["`summary`", "Publica um resumo do resultado no job summary"],
          ],
        },
        {
          kind: "text",
          text: "Os instaladores aparecem em **Releases → vX.Y.Z**. Para publicar como rascunho, rode `gh release edit vX.Y.Z --draft` antes de divulgar (ou crie a release manualmente e reexecute apenas o job `build`).",
        },
        {
          kind: "text",
          text: "O job `release` publica a release antes das builds (inclusive se ela estiver como rascunho) e o upload do assistente usa o **id** da release, então rodar a mesma tag de novo substitui os assets sem duplicar nomes.",
        },
        {
          kind: "text",
          text: "O workflow roda `scripts/set-version.mjs` com a tag antes do build, então os artefatos saem com a versão da tag mesmo que os manifestos estejam desatualizados no commit.",
        },
      ],
    },
    {
      id: "disparo-manual",
      title: "Disparo manual",
      blocks: [
        {
          kind: "text",
          text: "Actions → **Release** → *Run workflow* → informe uma tag que já exista no repositório (ex.: `v0.2.0`). As notas e o vínculo com a tag são os mesmos do fluxo automático.",
        },
      ],
    },
    {
      id: "pre-releases",
      title: "Pré-releases",
      blocks: [
        {
          kind: "text",
          text: "Tags com sufixo (`v0.3.0-beta.1`, `v1.0.0-rc.1`) são publicadas como **pré-release**.",
        },
      ],
    },
    {
      id: "matriz",
      title: "Ajustando a matriz de plataformas",
      hint: ".github/workflows/release.yml",
      blocks: [
        {
          kind: "text",
          text: "Edite `build.strategy.matrix.include` em `.github/workflows/release.yml`:",
        },
        {
          kind: "list",
          items: [
            "**Só Windows:** mantenha apenas a entrada `Windows (x64)`.",
            "**macOS por arquitetura:** troque `args` para `aarch64-apple-darwin` (`macos-latest`) ou `x86_64-apple-darwin` (`macos-13`) e remova o passo que adiciona os alvos do Rust.",
            "**Bundles específicos:** informe em `args`, ex.: `--bundles msi` ou `--bundles deb,appimage`.",
          ],
        },
      ],
    },
    {
      id: "conferir-antes-da-tag",
      title: "Conferir antes de criar a tag",
      blocks: [
        {
          kind: "code",
          title: "terminal",
          code: `npm ci
npm run typecheck && npm test && npm run build
npm run tauri build -- --bundles nsis      # build local (Windows)`,
        },
      ],
    },
    {
      id: "instalador-nsis",
      title: "Instalador personalizado (Windows)",
      hint: "src-tauri/installer",
      blocks: [
        {
          kind: "text",
          text: "O `.exe` do NSIS não usa o assistente padrão do Tauri: o build aplica o template `src-tauri/installer/installer.nsi` (cópia do template oficial, com a mesma lógica de instalação) e a identidade visual da marca.",
        },
        {
          kind: "table",
          columns: ["Arquivo", "Papel"],
          rows: [
            [
              "`src-tauri/installer/installer.nsi`",
              "Template do NSIS; só as seções de marcação visual diferem do original",
            ],
            ["`src-tauri/installer/brand.nsh`", "Paleta (`MUI_BGCOLOR`, `MUI_TEXTCOLOR`) e textos pt-BR das páginas"],
            ["`src-tauri/installer/assets/sidebar.bmp`", "Painel de 164×314 das páginas de boas-vindas e conclusão"],
            ["`src-tauri/installer/assets/header.bmp`", "Cabeçalho de 150×57 das páginas internas e do desinstalador"],
            [
              "`scripts/generate-installer-assets.mjs`",
              "Gera os BMPs a partir da geometria da marca (`scripts/lib/brand-mark.mjs`)",
            ],
            ["`src-tauri/installer/…` + `tauri.conf.json`", "Cabeamento em `bundle.windows.nsis` e `bundle.licenseFile`"],
          ],
        },
        {
          kind: "text",
          text: "As artes são commitadas. Depois de mexer na marca, rode `npm run installer:assets`; o teste `src/test/installerAssets.test.ts` falha se os BMPs ficarem desatualizados ou se o template perder um placeholder usado pelo bundler.",
        },
        {
          kind: "text",
          text: "Ao atualizar o `@tauri-apps/cli`, compare o template local com `crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi` da tag correspondente no repositório do Tauri e traga as mudanças de lógica (WebView2, MultiUser, reinstalação, `/P`, `/S`, `/UPDATE`) para o arquivo local.",
        },
        {
          kind: "code",
          title: "terminal",
          code: `npm run tauri build -- --bundles nsis
# Windows: <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe`,
          note: "O MSI (WiX), o DMG e os pacotes Linux continuam com o instalador padrão da plataforma.",
        },
      ],
    },
    {
      id: "instalador-visual",
      title: "Instalador visual (assistente próprio)",
      hint: "setup/ · dist-setup/",
      blocks: [
        {
          kind: "text",
          text: "O consumidor final recebe `EliasNote_<versão>_x64-setup.exe`, um assistente em Tauri + WebView2 com a mesma linguagem visual do app: etapas laterais (Bem-vindo, Opções, Instalação, Concluído), tema claro/escuro, escolha de pasta, atalhos e progresso real.",
        },
        {
          kind: "code",
          title: "terminal",
          code: `npm run setup:build     # frontend + app + assistente → dist-setup/EliasNote_<versão>_x64-setup.exe
npm run setup:dev       # só a interface, com npm run dev em outro terminal`,
        },
        {
          kind: "table",
          columns: ["Peça", "Onde"],
          rows: [
            ["Interface (React + Tailwind do app)", "`setup.html`, `src/setup/**`"],
            ["Backend do assistente (Rust/Tauri)", "`setup/src-tauri/**` (`src/install.rs`, `src/lib.rs`)"],
            [
              "App embutido no `.exe`",
              "`setup/src-tauri/payload/eliasnote.exe` (gerado, não versionado)",
            ],
            ["Saída final", "`dist-setup/EliasNote_<versão>_x64-setup.exe`"],
          ],
        },
        {
          kind: "text",
          text: "Regras do assistente:",
        },
        {
          kind: "list",
          items: [
            "instala só para o usuário atual (`%LOCALAPPDATA%\\EliasNote`, `HKCU`), sem UAC;",
            "copia o app e o próprio assistente como `uninstall.exe` (modo `--uninstall`), cria atalhos via `WScript.Shell` e registra em *Aplicativos* com tamanho estimado;",
            "a remoção mantém `%APPDATA%\\com.eliasnote.desktop` por padrão, com uma opção explícita para apagar quadros, anexos e configurações;",
            "atualização é o mesmo `.exe` rodado de novo: a versão instalada é detectada no registro.",
          ],
        },
        {
          kind: "note",
          text: "O instalador NSIS (`bundle.windows.nsis`) continua disponível como alternativa silenciosa (`/S`, `/P`) com o wizard clássico, mas não é publicado pelo CI: ele sai com o mesmo nome do assistente e um sobrescreveria o outro.",
        },
        {
          kind: "text",
          text: "No CI o Windows publica o assistente visual (`.exe`) e o MSI (`.msi`), que cobre instalação silenciosa (`msiexec /i EliasNote_<versão>_x64_en-US.msi /qn`).",
        },
      ],
    },
    {
      id: "problemas-comuns",
      title: "Problemas comuns",
      blocks: [
        {
          kind: "list",
          items: [
            "**`cargo` reclama da versão no `Cargo.lock`:** rode qualquer `cargo build`/`cargo check` em `src-tauri` (o lock é atualizado) ou `cargo update -p eliasnote`.",
            "**Release sem todos os instaladores:** veja o job `build` da plataforma que falhou e use *Re-run failed jobs*; os assets são enviados para a mesma release.",
            "**Workflow rodado de novo:** o job `release` reaproveita a release da tag; o build apenas reenvia/substitui os assets.",
            "**Linux sem `webkit2gtk`:** o job instala as dependências em `ubuntu-22.04`; ao trocar de runner, ajuste a lista de pacotes.",
            "**macOS “app is damaged”:** build sem assinatura; libere com `xattr -dr com.apple.quarantine /Applications/EliasNote.app` ou assine/notarize com certificado.",
            "**Não quer publicar:** rode o workflow em um fork/branch ou remova temporariamente o gatilho `push.tags`.",
          ],
        },
      ],
    },
  ],
};

export const DOC_PAGES: readonly DocPage[] = [
  FEATURES_PAGE,
  SHORTCUTS_PAGE,
  OBSIDIAN_PAGE,
  ARCHITECTURE_PAGE,
  DEVELOPMENT_PAGE,
  RELEASE_PAGE,
];

export const DOC_IDS: readonly DocId[] = DOC_PAGES.map((doc) => doc.id);

export function isDocId(value: string | undefined | null): value is DocId {
  return typeof value === "string" && DOC_IDS.includes(value as DocId);
}

/** Metadados que não dependem do idioma: ícone e arquivo de origem. */
export function getDocMeta(id: DocId): DocPage {
  return DOC_PAGES.find((doc) => doc.id === id) ?? DOC_PAGES[0];
}

/** Número de palavras em blocos de texto, usado no tempo de leitura. */
export function docReadingMinutes(page: { sections: DocSectionContent[] }): number {
  const words = page.sections
    .flatMap((section) =>
      section.blocks.flatMap((block) => {
        switch (block.kind) {
          case "text":
            return [block.text];
          case "list":
            return block.items;
          case "table":
            return [...block.columns, ...block.rows.flat()];
          case "shortcuts":
            return block.items.map((item) => item.action);
          case "note":
            return [block.text];
          default:
            return [];
        }
      }),
    )
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(2, Math.round(words / 180));
}

/** Texto plano de uma página, usado no filtro do índice. */
export function docSearchText(
  page: { title: string; summary: string; sections: DocSectionContent[] },
  extra = "",
): string {
  return [page.title, page.summary, extra, ...page.sections.map((section) => section.title)]
    .join(" ")
    .toLowerCase();
}
