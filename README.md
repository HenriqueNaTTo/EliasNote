# EliasNote

Aplicativo desktop **local-first** de organização visual inspirado no Milanote, com canvas infinito, quadros aninhados e **Excalidraw nativo** para desenhos editáveis. 100% offline: sem contas, servidores, colaboração ou sincronização.

![stack](https://img.shields.io/badge/stack-Tauri%202%20%2B%20React%20%2B%20TypeScript%20%2B%20Tailwind-7c5cff)

## O que está pronto

- **Canvas infinito** com zoom/pan por mouse, trackpad e barra de espaço, culling de elementos visíveis, minimapa, encaixe em grade e seleção múltipla com caixa.
- **Elementos**: nota Markdown, texto livre com **negrito, itálico, tamanho, fonte e alinhamento**, **bloco de código com realce** (GDScript, C#, shader, JSON, YAML…), cartão, tarefa, checklist com progresso, imagem, vídeo, arquivo, link, quadro aninhado, coluna, comentário local e desenho Excalidraw.
- **Colunas inteligentes**: arraste elementos para dentro, reordene, recolha, redimensione e mova a coluna inteira com os filhos.
- **Imagens por arraste**: solte arquivos sobre uma nota para anexá-los com miniatura dentro do cartão ou sobre um quadro aninhado para enviá-los ao quadro filho.
- **Conectores e setas**: curva, reta ou cotovelo; rótulos, cores, tracejado e setas nas pontas.
- **Excalidraw integrado**: editor em tela cheia com salvamento automático, miniaturas no canvas, biblioteca local, importação `.excalidraw` e exportação PNG/SVG/PDF. O menu **Cena** mescla outra cena (clipboard, arquivo ou outro desenho do workspace) preservando bindings e imagens.
- **Workspaces e abas** com árvore de quadros arrastável, subquadros recursivos, duplicação e ordenação.
- **Busca global** (Ctrl/Cmd+K) em títulos, notas, tarefas, checklists, links, comentários, etiquetas e quadros.
- **Painel de tarefas** (Ctrl/Cmd+Shift+P) com prazos, prioridades e tarefas de todos os quadros; conclua ou abra o elemento no canvas.
- **Referências bidirecionais** entre quadros e elementos, com painel de backlinks.
- **Histórico** undo/redo com transações (um arraste = uma entrada) e coalescência de digitação.
- **Autosave incremental** por quadro em SQLite (Tauri) ou IndexedDB (navegador), com backups rotativos restauráveis.
- **Exportação/importação**: PNG, PDF, Markdown, JSON do quadro ou workspace; importa JSON, Markdown, `.excalidraw` e arquivos.
- **Cofre Obsidian**: importa pastas, notas, frontmatter, tags, wiki-links clicáveis, anexos, `.canvas` com conectores e `.excalidraw` para um workspace novo (veja [docs/OBSIDIAN.md](docs/OBSIDIAN.md)).
- **Temas claro/escuro/sistema**, 6 cores de destaque, densidade, escala de UI, textura do canvas e atalhos remapeáveis.
- **Modelos para game dev**: GDD, design de nível, sistemas e mecânicas, sprint de jogo — com snippets de GDScript, JSON e shader já preenchidos.
- **Interface premium**: sidebar com árvore, abas, inspector contextual redimensionável (largura salva), barra flutuante, overlays e toasts.
- **Atualizações**: consulta a última release no GitHub e mostra o botão **Atualizar** no topo quando há versão mais nova.

## Como executar

Pré-requisitos:

- Node.js 20+ (testado com Node 26)
- Rust 1.77.2+ e as dependências do Tauri 2 (para o app desktop)
- Windows: WebView2 + Build Tools do Visual Studio

```bash
npm install
npm run dev        # frontend no navegador (IndexedDB)
npm test           # testes unitários, de componentes e de integração
npm run build      # typecheck + build de produção
npm run tauri dev  # aplicativo desktop com SQLite
npm run tauri build -- --bundles nsis
```

Pré-requisitos do desktop: Rust 1.77.2+ (toolchain MSVC) e as dependências do Tauri 2. Neste ambiente a build completa foi validada (MSI + NSIS).

> O target do Cargo está em `F:/cargo-target/eliasnote` via `src-tauri/.cargo/config.toml`, porque o disco C: tem pouco espaço livre. Ajuste esse arquivo se necessário.

No primeiro `npm run dev`/`build`, as fontes do Excalidraw são copiadas para `public/excalidraw-assets` (scripts/copy-excalidraw-assets.mjs) para funcionar sem CDN.

## Landing page

A página de divulgação é uma segunda entrada do Vite (`landing.html` + `src/landing`), com o mesmo Tailwind, os mesmos tokens de tema e a mesma marca do app. Tem abas **Principal**, **Funcionalidades**, **Downloads**, **Sobre** e **Contato**, alternância de tema, seletor de cor de destaque e um formulário que gera uma issue pré-preenchida no GitHub (sem backend). Na aba Funcionalidades, cada cartão abre uma prévia da interface ao passar o mouse ou focar pelo teclado.

```bash
npm run dev     # http://localhost:1420/landing.html
npm run build   # gera dist/index.html (app) e dist/landing.html (site)
```

O conteúdo de `dist/landing.html` e de `dist/assets` pode ser publicado em qualquer host estático. Para GitHub Pages em subpasta, rode o build com `npx vite build --base=/EliasNote/`.

## Marca

A arte da marca fica em `public/logoNova.png`. `npm run icons` gera as máscaras em `src/assets/brand` (arte completa e cabeça), o favicon e os ícones do app; `npm run installer:assets` regenera as artes do instalador NSIS. O componente `AppMark` pinta o livro/herói com `currentColor` e a cabeça com `--primary`, então o logo acompanha tema e cor de destaque no app, na landing e no assistente.

## Release

```bash
npm run release -- "feat: descrição da mudança"
```

Um comando faz o pacote inteiro: checks (typecheck/testes/build/build do site), bump de versão nos
manifestos + site + `Cargo.lock`, commit, tag `vX.Y.Z`, push de `main --follow-tags` e acompanhamento
do workflow até a release sair com os instaladores. Use `--minor`, `--version x.y.z` ou `--dry-run`
conforme o caso.

A tag `v*` dispara o workflow `.github/workflows/release.yml`: typecheck + testes + build, criação da
release e compilação paralela para **Windows** (`.msi`/`.exe`), **Linux** (`.AppImage`/`.deb`) e
**macOS** (`.dmg` universal), com os instaladores anexados à release do GitHub. Detalhes, disparo
manual e ajustes da matriz em [docs/RELEASE.md](docs/RELEASE.md).

## Estrutura

```
landing.html          landing page de divulgação (segunda entrada do Vite)
src/
  landing/            shell, seções, prévia do app e dados da landing page
  app/                App, shell e providers
  core/
    domain/           tipos, fábricas, layout, árvore, templates, referências
    store/            Zustand + Immer, slices, histórico, seletores
    persistence/      adaptadores (SQLite/IndexedDB/memória), migrações, autosave, backups
    search/           busca global, snippets e backlinks
    export/           JSON, Markdown, importação
    import/           parser de cofres Obsidian e plano de importação
    media/            anexos locais e importação de arquivos
  features/
    canvas/           canvas infinito, nós, conectores, minimapa, controles
    nodes/            componentes de cada tipo de elemento
    drawing/          editor Excalidraw e exportações
    inspector/        painel de propriedades, referências e comentários
    tasks/            painel global de tarefas
    shell/            sidebar, árvore, abas, diálogos
    search/           command palette global
    templates/        galeria de modelos
    settings/         configurações avançadas e atalhos
    export/           diálogos de exportação/importação
    import/           diálogo de importação de cofre Obsidian
    backups/          gerenciador de snapshots
  lib/                geometria, markdown, atalhos, utilitários
  components/ui/      componentes no estilo shadcn/ui
src-tauri/            backend Tauri 2 com SQLite, anexos e backups
docs/                 arquitetura, funcionalidades, atalhos e desenvolvimento
```

## Modelo local-first

- Documentos são gravados por chave (`app`, `settings`, `board:<id>`, `library`) em uma tabela `documents` (SQLite) ou object store equivalente (IndexedDB).
- O autosave observa o store, marca apenas os quadros alterados e grava com debounce (padrão 700 ms).
- Backups guardam um snapshot completo com retenção configurável e restauração pelo painel **Backups**.
- Anexos ficam no diretório de dados do app (Tauri) ou em IndexedDB (navegador); nenhum byte sai do dispositivo.
- Migrações normalizam documentos antigos ou parcialmente corrompidos em vez de descartá-los.

## Licenças e créditos

Código original sob MIT. Bibliotecas de terceiros mantêm suas licenças: Excalidraw (MIT), React, TypeScript, Vite, Tailwind CSS, Radix UI, lucide, Zustand, Immer, marked, DOMPurify, html-to-image, jsPDF, Tauri 2 e rusqlite. Nenhum código ou asset proprietário do Milanote foi utilizado.

Consulte [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [docs/FEATURES.md](docs/FEATURES.md), [docs/OBSIDIAN.md](docs/OBSIDIAN.md), [docs/SHORTCUTS.md](docs/SHORTCUTS.md), [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) e [docs/RELEASE.md](docs/RELEASE.md).
