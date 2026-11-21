# Release

As versões do EliasNote são publicadas por um workflow do GitHub Actions
(`.github/workflows/release.yml`), que gera os instaladores do Tauri e os anexa a uma
release do GitHub.

## Pré-requisitos (uma vez)

- Repositório no GitHub com Actions habilitado (padrão).
- Nenhum secret extra: o workflow usa o `GITHUB_TOKEN` embutido com permissão `contents: write`.
- Assinatura de código é opcional. Sem certificados, o Windows exibe o aviso do SmartScreen e o
  macOS bloqueia o app até a liberação manual (veja *Problemas comuns*).

## Publicar uma versão

Um comando faz tudo (checks, bump, commit, tag, push e acompanhamento do workflow):

```bash
npm run release -- "feat: descrição da mudança"
npm run release -- "feat: recurso novo" --minor   # incremento minor
npm run release -- --version 1.0.0                # versão explícita
npm run release -- --dry-run                      # só mostra o plano, sem alterar nada
```

O script `scripts/release.mjs` valida branch/sincronia/conflitos, roda `typecheck`, `npm test`,
`npm run build` e `npm run build:site` (mais `cargo check --locked` quando há arquivos Rust alterados),
sincroniza a versão nos manifestos/site/`Cargo.lock`, cria o commit e a tag `vX.Y.Z`, empurra
`main --follow-tags` e acompanha o run do GitHub até o fim, listando os assets da release.
Use `--skip-checks` / `--skip-cargo` só em emergências e defina `GITHUB_TOKEN` para elevar o limite
da API do GitHub.

**Fluxo manual** (equivalente, para quando precisar quebrar em etapas):

```bash
npm run version:set 0.2.0          # sincroniza manifestos, site (APP_VERSION) e Cargo.lock
git commit -am "chore: release v0.2.0"
git tag v0.2.0
git push origin main --follow-tags
```

O push da tag `v*` dispara o workflow:

| Job | O que faz |
| --- | --- |
| `checks` | `npm ci`, `npm run typecheck`, `npm test` e `npm run build` (ubuntu-22.04) |
| `release` | Gera as notas via API de `generate-notes`, cria a release da tag (ou reaproveita a existente) |
| `build` | Matriz **Windows** (`.msi` WiX pelo `tauri-action` + `.exe` do assistente visual), **Linux** (`.AppImage`, `.deb`, `.rpm`) e **macOS** (`.dmg` universal), enviando os instaladores para a release |
| `summary` | Publica um resumo do resultado no job summary |

Os instaladores aparecem em **Releases → vX.Y.Z**. Para publicar como rascunho, rode
`gh release edit vX.Y.Z --draft` antes de divulgar (ou crie a release manualmente e reexecute apenas
o job `build`).

O job `release` publica a release antes das builds (inclusive se ela estiver como rascunho) e o
upload do assistente usa o **id** da release, então rodar a mesma tag de novo substitui os assets
sem duplicar nomes.

O workflow roda `scripts/set-version.mjs` com a tag antes do build, então os artefatos saem com a
versão da tag mesmo que os manifestos estejam desatualizados no commit.

## Atualização no app

Depois que a release é publicada, quem já tem o EliasNote instalado passa a ver o botão **Atualizar**
no canto superior direito (ele consulta `https://api.github.com/repos/HenriqueNaTTo/EliasNote/releases/latest`
ao abrir e a cada 6 horas). O clique abre a página da release no navegador; a verificação manual fica em
**Configurações → Sobre**, junto da versão instalada. Releases marcadas como pré-release não são
oferecidas como atualização, porque a API `latest` só devolve a versão estável mais recente.

## Disparo manual

Actions → **Release** → *Run workflow* → informe uma tag que já exista no repositório (ex.: `v0.2.0`).
As notas e o vínculo com a tag são os mesmos do fluxo automático.

## Pré-releases

Tags com sufixo (`v0.3.0-beta.1`, `v1.0.0-rc.1`) são publicadas como **pré-release**.

## Ajustando a matriz de plataformas

Edite `build.strategy.matrix.include` em `.github/workflows/release.yml`:

- **Só Windows:** mantenha apenas a entrada `Windows (x64)`.
- **macOS por arquitetura:** troque `args` para `aarch64-apple-darwin` (`macos-latest`) ou
  `x86_64-apple-darwin` (`macos-13`) e remova o passo que adiciona os alvos do Rust.
- **Bundles específicos:** informe em `args`, ex.: `--bundles msi` ou `--bundles deb,appimage`.

## Conferir antes de criar a tag

```bash
npm ci
npm run typecheck && npm test && npm run build
npm run tauri build -- --bundles nsis      # build local (Windows)
```

## Instalador personalizado (Windows)

O `.exe` do NSIS não usa o assistente padrão do Tauri: o build aplica o template
`src-tauri/installer/installer.nsi` (cópia do template oficial, com a mesma lógica de
instalação) e a identidade visual da marca. Peças:

| Arquivo | Papel |
| --- | --- |
| `src-tauri/installer/installer.nsi` | Template do NSIS; só as seções de marcação visual diferem do original |
| `src-tauri/installer/brand.nsh` | Paleta (`MUI_BGCOLOR`, `MUI_TEXTCOLOR`) e textos pt-BR das páginas |
| `src-tauri/installer/assets/sidebar.bmp` | Painel de 164×314 das páginas de boas-vindas e conclusão |
| `src-tauri/installer/assets/header.bmp` | Cabeçalho de 150×57 das páginas internas e do desinstalador |
| `scripts/generate-installer-assets.mjs` | Gera os BMPs a partir da geometria da marca (`scripts/lib/brand-mark.mjs`) |
| `src-tauri/installer/…` + `tauri.conf.json` | Cabeamento em `bundle.windows.nsis` e `bundle.licenseFile` |

As artes são commitadas. Depois de mexer na marca, rode `npm run installer:assets`;
o teste `src/test/installerAssets.test.ts` falha se os BMPs ficarem desatualizados ou
se o template perder um placeholder usado pelo bundler.

Ao atualizar o `@tauri-apps/cli`, compare o template local com
`crates/tauri-bundler/src/bundle/windows/nsis/installer.nsi` da tag correspondente
no repositório do Tauri e traga as mudanças de lógica (WebView2, MultiUser,
reinstalação, `/P`, `/S`, `/UPDATE`) para o arquivo local.

Para testar o assistente sem publicar:

```bash
npm run tauri build -- --bundles nsis
# Windows: <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe
```

O MSI (WiX), o DMG e os pacotes Linux continuam com o instalador padrão da plataforma.

## Instalador visual (assistente próprio)

O consumidor final recebe `EliasNote_<versão>_x64-setup.exe`, um assistente em Tauri +
WebView2 com a mesma linguagem visual do app: etapas laterais (Bem-vindo, Opções,
Instalação, Concluído), tema claro/escuro, escolha de pasta, atalhos e progresso real.

```bash
npm run setup:build     # frontend + app + assistente → dist-setup/EliasNote_<versão>_x64-setup.exe
npm run setup:dev       # só a interface, com `npm run dev` em outro terminal
```

O que existe por baixo:

| Peça | Onde |
| --- | --- |
| Interface (React + Tailwind do app) | `setup.html`, `src/setup/**` |
| Backend do assistente (Rust/Tauri) | `setup/src-tauri/**` (`src/install.rs`, `src/lib.rs`) |
| App embutido no `.exe` | `setup/src-tauri/payload/eliasnote.exe` (gerado, não versionado) |
| Saída final | `dist-setup/EliasNote_<versão>_x64-setup.exe` |

Regras do assistente:

- instala só para o usuário atual (`%LOCALAPPDATA%\EliasNote`, `HKCU`), sem UAC;
- copia o app e o próprio assistente como `uninstall.exe` (modo `--uninstall`), cria
  atalhos via `WScript.Shell` e registra em *Aplicativos* com tamanho estimado;
- a remoção mantém `%APPDATA%\com.eliasnote.desktop` por padrão, com uma opção explícita
  para apagar quadros, anexos e configurações;
- atualização é o mesmo `.exe` rodado de novo: a versão instalada é detectada no registro.

O instalador NSIS (`bundle.windows.nsis`) continua disponível como alternativa silenciosa
(`/S`, `/P`) com o wizard clássico, mas **não** é publicado pelo CI: ele sai com o mesmo nome do
assistente (`EliasNote_<versão>_x64-setup.exe`) e um sobrescreveria o outro. Para gerá-lo localmente:

```bash
npm run tauri build -- --bundles nsis   # → <target>/release/bundle/nsis/EliasNote_<versão>_x64-setup.exe
```

No CI o Windows publica o assistente visual (`.exe`) e o MSI (`.msi`), que cobre instalação
silenciosa (`msiexec /i EliasNote_<versão>_x64_en-US.msi /qn`).

## Problemas comuns

- **`cargo` reclama da versão no `Cargo.lock`:** rode qualquer `cargo build`/`cargo check` em
  `src-tauri` (o lock é atualizado) ou `cargo update -p eliasnote`.
- **Release sem todos os instaladores:** veja o job `build` da plataforma que falhou e use
  *Re-run failed jobs*; os assets são enviados para a mesma release.
- **Workflow rodado de novo:** o job `release` reaproveita a release da tag; o build apenas
  reenvia/substitui os assets.
- **Linux sem `webkit2gtk`:** o job instala as dependências em `ubuntu-22.04`; ao trocar de runner,
  ajuste a lista de pacotes.
- **macOS "app is damaged":** build sem assinatura; libere com
  `xattr -dr com.apple.quarantine /Applications/EliasNote.app` ou assine/notarize com certificado.
- **Não quer publicar:** rode o workflow em um fork/branch ou remova temporariamente o gatilho
  `push.tags`.
