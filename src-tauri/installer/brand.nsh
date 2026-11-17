; Identidade visual do assistente de instalação do EliasNote (pt-BR).
;
; Este arquivo é incluído pelo template do NSIS através de
; `bundle.windows.nsis.installerHooks` (src-tauri/tauri.conf.json), então o
; caminho absoluto é resolvido pelo bundler do Tauri — nada aqui depende do
; diretório de trabalho do makensis.
;
; Só há `!define` de tempo de compilação: nenhuma função e nenhum efeito em
; tempo de execução. A paleta e os textos espelham o app
; (src/styles/globals.css, src/styles/landing.css e src/landing/site.ts).

!ifndef ELIASNOTE_BRAND_NSH
!define ELIASNOTE_BRAND_NSH

; ------------------------------------------------------------------ *
; Paleta
; ------------------------------------------------------------------ *

!define ELIASNOTE_INK "1F1F1F"
!define ELIASNOTE_MUTED "737373"
!define ELIASNOTE_PRIMARY "2463EB"

; Páginas claras, como as superfícies do app; o cabeçalho e o painel lateral
; (src-tauri/installer/assets) usam o mesmo branco no fundo.
!define MUI_BGCOLOR "FFFFFF"
!define MUI_TEXTCOLOR "${ELIASNOTE_INK}"

; ------------------------------------------------------------------ *
; Página de boas-vindas
; ------------------------------------------------------------------ *

!define MUI_WELCOMEPAGE_TITLE "Bem-vindo ao EliasNote"
!define MUI_WELCOMEPAGE_TEXT "Organização visual local-first: notas, quadros, tarefas e desenhos Excalidraw em um canvas infinito.$\r$\n$\r$\n• Funciona offline, sem contas e sem telemetria.$\r$\n• Seus quadros ficam em %APPDATA%\com.eliasnote.desktop, com exportação para JSON e Markdown.$\r$\n• Código aberto sob licença MIT, sem pedir nenhum dado pessoal.$\r$\n$\r$\nA instalação é só para o seu usuário e não pede privilégios de administrador."

; ------------------------------------------------------------------ *
; Licença e escolha da pasta
; ------------------------------------------------------------------ *

!define MUI_LICENSEPAGE_TEXT_TOP "O EliasNote é software livre, distribuído sob a licença MIT."
!define MUI_LICENSEPAGE_TEXT_BOTTOM "A instalação não pede conta, assinatura nem dados pessoais."
!define MUI_LICENSEPAGE_CHECKBOX
!define MUI_LICENSEPAGE_CHECKBOX_TEXT "Aceito os termos da licença MIT"

!define MUI_DIRECTORYPAGE_TEXT_TOP "Escolha a pasta do programa. Seus quadros ficam em %APPDATA%\com.eliasnote.desktop, fora desta pasta, e continuam intactos ao desinstalar enquanto o desinstalador não pedir para apagar os dados."

; ------------------------------------------------------------------ *
; Instalação e conclusão
; ------------------------------------------------------------------ *

!define MUI_INSTFILESPAGE_PROGRESSBAR "smooth"

!define MUI_FINISHPAGE_TITLE "Tudo pronto"
!define MUI_FINISHPAGE_TEXT "O EliasNote foi instalado em:$\r$\n$INSTDIR$\r$\n$\r$\nSeus quadros e anexos continuam em %APPDATA%\com.eliasnote.desktop e o app abre sem internet."
!define MUI_FINISHPAGE_RUN_TEXT "Abrir o EliasNote agora"
; "Criar atalho na área de trabalho" vem de $(createDesktop), no idioma do Tauri.

; ------------------------------------------------------------------ *
; Rodapé do assistente
; ------------------------------------------------------------------ *

!define ELIASNOTE_BRANDING "EliasNote · software livre (MIT)"

!endif ; ELIASNOTE_BRAND_NSH
