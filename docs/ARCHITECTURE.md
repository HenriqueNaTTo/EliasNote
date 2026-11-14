# Arquitetura

## Visão geral

EliasNote é uma SPA React executada dentro do Tauri 2 (ou em um navegador, em modo de desenvolvimento). A arquitetura é organizada em camadas com dependência unidirecional:

```
features/  → componentes e fluxos de UI
core/      → domínio, estado, persistência, busca, exportação
lib/       → utilidades puras (geometria, markdown, atalhos)
components/ui → primitivas visuais
```

Nada em `core/` importa de `features/`. O backend Rust (`src-tauri`) expõe apenas comandos genéricos de documentos, anexos e backups — não conhece o modelo de quadros.

## Modelo de domínio (`core/domain`)

- `Workspace` agrupa quadros. Cada `Board` pertence a um workspace e pode ter um `parentId` (subquadro) e uma lista `childOrder` para a árvore.
- `CanvasNode` é um registro tipado com um discriminante `type` e campos opcionais específicos (`content`, `items`, `attachmentId`, `scene`, `references`, etc.). Essa escolha mantém atualizações e migrações simples; as fábricas garantem os campos obrigatórios por tipo.
- Colunas não contêm filhos em árvore DOM: os filhos têm `parentId = column.id` e posições recalculadas por `layoutColumnNodes`. O canvas renderiza todos os nós como elementos irmãos, o que simplifica culling, seleção e z-order.
- `Connector` referencia elementos (`nodeId`) ou pontos livres. A geometria (`anchorPoint`, `connectorGeometry`) é recalculada no render, então mover um elemento reposiciona a seta automaticamente.
- Referências usam o formato `node:<id>` / `board:<id>`. Backlinks são derivados por varredura (sem índice persistido), com custo linear por consulta.

## Estado (`core/store`)

O store usa Zustand 5 + middleware Immer e é dividido em slices:

| Slice | Responsabilidade |
| --- | --- |
| `historySlice` | `commit`, transações, undo/redo, `beginTransaction`/`endTransaction` |
| `boardSlice` | workspaces, quadros, abas, árvore, templates, importação |
| `nodeSlice` | nós, colunas, seleção, conectores, referências, comentários, desenho |
| `uiSlice` | viewports, canvas size, diálogos, status de salvamento, hidratação |
| `settingsSlice` | preferências, temas, atalhos remapeáveis |

### Histórico

- `commit(label, recipe, options)` captura os snapshots imutáveis de `boards/workspaces` antes e depois da mutação. Immer garante compartilhamento estrutural, então guardar referências é barato.
- Digitação usa `coalesceKey` para fundir alterações consecutivas em uma única entrada (janela de 1,6 s).
- Arraste e redimensionamento usam transação: várias mutações silenciosas e uma única entrada ao soltar.
- Limite de 80 entradas; undo/redo não são persistidos (histórico por sessão).

## Renderização do canvas (`core/domain/layout`, `features/canvas`)

- Uma única camada DOM é transformada com `translate(x, y) scale(zoom)`; coordenadas dos nós ficam em unidades do mundo.
- `renderOrder` ordena por `z` e insere os filhos imediatamente após a coluna, evitando `z-index` fracionário.
- `visibleNodes` faz culling por interseção com o viewport + margem. Com 5.000 elementos, apenas algumas dezenas são montadas (teste dedicado).
- `CanvasNodeView` é memoizado e só recebe `node`, `zoom` e flags; arraste/resize usam listeners globais com transação, sem re-render extra por frame além do necessário.
- Nós de desenho não montam o Excalidraw: usam a miniatura PNG armazenada na cena; o editor completo é carregado sob demanda (`React.lazy`).
- Drops de arquivos são roteados por alvo: notas criam anexos e referências; quadros aninhados usam `addNode` com `boardId` e recebem os elementos no quadro filho.
- O editor Excalidraw expõe o menu `Cena`, que usa `mergeExcalidrawScenes` para remapear elementos, bindings, grupos e arquivos antes de `updateScene`/`addFiles`.

## Importação externa (`core/import`)

- `obsidianParser.ts` lê entradas de cofre (`.md`, `.canvas`, `.excalidraw`, anexos), remove `.obsidian`/`.trash`, interpreta frontmatter, tags, wiki-links, links Markdown relativos e resolve destinos por caminho, nome ou alias.
- `obsidianPlan.ts` gera um plano com IDs estáveis: quadros por pasta, notas em grade, anexos em área própria, canvas com grupos/arestas e referências já apontando para os IDs finais.
- `importVault(plan)` no `boardSlice` materializa o plano em um único `commit`, cria o workspace, abre o quadro raiz e preserva undo/redo como uma única entrada.
- A UI usa o **seletor nativo de pastas** do Tauri (`tauri-plugin-dialog`) e o comando `vault_scan` para ler o cofre no Rust, sem trafegar o conteúdo pelo webview. No navegador, há fallback com `webkitdirectory`.
- Anexos do cofre são copiados para o armazenamento local por `attachment_import_path`, sem passar bytes pela interface.
- A importação tem limites de 20.000 arquivos e 8 MB por texto.

## Persistência (`core/persistence`)

```
StorageAdapter (interface)
├── TauriSqliteAdapter   → invoke() → comandos Rust → SQLite
├── IndexedDbAdapter     → idb → object stores
└── MemoryAdapter        → testes
```

- `repository.ts` traduz o estado em documentos (`app`, `settings`, `board:<id>`) e reconstrói `HydratePayload` com migrações.
- `persistenceService.ts` assina o store, detecta quadros alterados por identidade, agenda flush e grava somente o necessário. Também agenda backups automáticos e expõe restauração.
- `migrations.ts` normaliza campos ausentes, números em string, conectores incompletos e ignora nós inválidos.
- Anexos são imutáveis e referenciados por `attachmentId`; `attachments.ts` resolve URLs (asset protocol no Tauri, object URL no navegador) e mantém cache.

## Backend Tauri (`src-tauri`)

- `db.rs`: conexão rusqlite com WAL, tabelas `documents`, `attachments` e `backups`; gravação de anexos no diretório de dados e limpeza de backups antigos.
- `lib.rs`: estado `Mutex<Database>` e comandos `doc_*`, `attachment_*`, `backup_*`, `clear_all`.
- A janela desabilita `dragDropEnabled` para que o HTML5 drag-and-drop de arquivos funcione no webview, e habilita o asset protocol com escopo restrito a `$APPDATA`.

## Prontidão para colaboração futura

- Domínio normalizado com IDs estáveis e timestamps por entidade.
- `StorageAdapter` isola o meio de persistência; uma implementação remota pode substituir o adaptador sem tocar na UI.
- `commit` centraliza mutações, o que permite emitir operações (event sourcing) posteriormente.
- Referências e comentários já são entidades locais, mapeáveis para autoria e threads remotas.
- Nenhuma decisão arquitetural impede autenticação, sync ou CRDT: a UI não assume que o estado é exclusivo do processo.

## Testes

- `vitest` + `jsdom` + Testing Library.
- Cobertura de geometria, layout/culling, markdown/sanitização, store/histórico, templates, busca/backlinks, exportação/importação, migrações, persistência/backups e três componentes de nó.
- O backend Rust é verificado por `cargo check` e pela build real (`npm run tauri build`); o binário empacotado foi iniciado como smoke test, criando o SQLite e hidratando o seed.
