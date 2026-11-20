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

1. **Verificar**: `npm run typecheck`, `npm test` e `npm run build`. Se mexeu no Rust (`src-tauri`, `setup/src-tauri`), rode `cargo check --locked` na pasta correspondente. Se mexeu no site, rode `npm run build:site`.
2. **Atualizar as infos do site** quando a mudança for visível para o usuário:
   - `src/landing/data.ts` — catálogo de funcionalidades (`FEATURE_META`).
   - `src/landing/site.ts` — `ELEMENT_META`, atalhos e `APP_VERSION` (o script de versão atualiza `APP_VERSION`).
   - `src/landing/i18n/locales/{pt,en,es,zh}/site.ts` — textos dos 4 idiomas (o teste de estrutura cobra todos).
   - `docs/FEATURES.md`, `docs/SHORTCUTS.md`, `README.md` conforme o caso.
3. **Commit** descritivo em português (ex.: `feat: ...`, `fix: ...`, `docs: ...`).
4. **Subir a versão** para o próximo número (patch por padrão; minor quando o recurso é novo):
   ```bash
   npm run version:set 0.2.2
   ```
   O script sincroniza `package.json`, `src-tauri/tauri.conf.json`, `src-tauri/Cargo.toml`, `setup/src-tauri/*`, `src/landing/site.ts` e os dois `Cargo.lock`.
5. **Tag + push** (dispara o workflow de release do GitHub):
   ```bash
   git tag -a v0.2.2 -m "EliasNote v0.2.2"
   git push origin main --follow-tags
   ```
6. **Acompanhar o workflow** até o fim e confirmar os assets da release (`gh` pode não existir no ambiente; use a API do GitHub com `Invoke-RestMethod`). Os instaladores vão para a release; o site (Vercel) é publicado pelo push na `main`.

Detalhes e ajustes da matriz de plataformas: `docs/RELEASE.md`.

## Convenções

- TypeScript estrito (`noUnusedLocals`/`noUnusedParameters`); alias `@/`.
- Estado mutável só dentro de `commit`/`set` do Zustand com Immer.
- `core/` não importa de `features/`; utilitários puros em `lib/` e `core/domain`.
- Textos de interface em português; identificadores e código em inglês.
- Novos tipos de nó (`NodeType`) exigem atualizar: `types.ts`, `constants.ts` (`NODE_WIDTHS`/`NODE_LABELS`/`NODE_ICONS`), `factories.ts`, `NodeRenderer.tsx`, `nodeUi.tsx`, `canvasTypes.ts`, `Canvas.tsx`, `CanvasToolbar.tsx`, `hotkeys.ts` + `useAppHotkeys.ts`, `exporter.ts`, `GlobalSearchDialog.tsx`, `Inspector.tsx`, `templates.ts` (defaults) e o site.
