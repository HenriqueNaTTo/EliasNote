# EliasNote — instruções para agentes

App desktop local-first (Tauri 2 + React + TypeScript + Tailwind), canvas infinito estilo Milanote com Excalidraw embutido. Público-alvo principal: **game developers** (GDD, sistemas, balanceamento, produção).

## Comandos

```bash
npm run dev            # Vite em http://localhost:1420
npm run typecheck      # tsc --noEmit
npm test               # vitest run (suíte completa)
npm run build          # assets + typecheck + build (main/landing/setup)
npm run build:site     # build do site (vite.config.site.ts → dist-site)
npm run tauri build -- --bundles nsis   # instalador Windows local
```

`src-tauri/.cargo/config.toml` redireciona o target do Cargo para `F:/cargo-target/eliasnote` nesta máquina (arquivo local, não versionado).

## Rotina obrigatória ao final de toda alteração relevante

Sempre que uma mudança alterar comportamento, UI, conteúdo ou documentação de forma perceptível:

1. **Atualizar as infos do site** quando a mudança for visível para o usuário:
   - `src/landing/data.ts` — catálogo de funcionalidades (`FEATURE_META`).
   - `src/landing/site.ts` — `ELEMENT_META`, atalhos e `APP_VERSION` (o script de versão atualiza `APP_VERSION`).
   - `src/landing/i18n/locales/{pt,en,es,zh}/site.ts` — textos dos 4 idiomas (o teste de estrutura cobra todos).
   - `docs/FEATURES.md`, `docs/SHORTCUTS.md`, `README.md` conforme o caso.
2. **Publicar com o script único** — ele roda tudo e acompanha o workflow:
   ```bash
   npm run release -- "feat: descrição da mudança"
   npm run release -- "feat: recurso novo" --minor   # recurso novo
   npm run release -- --dry-run                      # só o plano, sem alterar nada
   ```
   O `scripts/release.mjs` valida branch/sincronia/conflitos, roda `typecheck` + testes + build do app +
   build do site (`cargo check --locked` quando há `.rs` alterado), sincroniza a versão nos dois
   `tauri.conf.json`, nos dois `Cargo.toml`, nos dois `Cargo.lock` e no `APP_VERSION` do site, cria o
   commit e a tag `vX.Y.Z`, empurra `main --follow-tags` e acompanha o run até listar os assets.
   Defina `GITHUB_TOKEN` para elevar o limite da API do GitHub.
3. **Fluxo manual** (só se precisar quebrar em etapas): `npm run version:set 0.2.2` → `git commit` →
   `git tag -a v0.2.2 -m "EliasNote v0.2.2"` → `git push origin main --follow-tags` → acompanhar o run.
4. O site (Vercel) é publicado pelo push na `main`. Se o script avisar que nada em `src/landing` mudou,
   revise as infos do site antes de divulgar a release.

Detalhes e ajustes da matriz de plataformas: `docs/RELEASE.md`.

## Convenções

- TypeScript estrito (`noUnusedLocals`/`noUnusedParameters`); alias `@/`.
- Estado mutável só dentro de `commit`/`set` do Zustand com Immer.
- `core/` não importa de `features/`; utilitários puros em `lib/` e `core/domain`.
- Textos de interface em português; identificadores e código em inglês.
- Novos tipos de nó (`NodeType`) exigem atualizar: `types.ts`, `constants.ts` (`NODE_WIDTHS`/`NODE_LABELS`/`NODE_ICONS`), `factories.ts`, `NodeRenderer.tsx`, `nodeUi.tsx`, `canvasTypes.ts`, `Canvas.tsx`, `CanvasToolbar.tsx`, `hotkeys.ts` + `useAppHotkeys.ts`, `exporter.ts`, `GlobalSearchDialog.tsx`, `Inspector.tsx`, `templates.ts` (defaults) e o site.
