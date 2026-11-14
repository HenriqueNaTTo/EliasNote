# Importar um cofre do Obsidian

O EliasNote importa um cofre (vault) do Obsidian como um **workspace novo**, sem alterar o cofre original e sem enviar nada para a internet. Toda a leitura acontece na sua máquina.

## Como usar

1. Abra o menu **Arquivo (⋯) → Cofre do Obsidian**, ou **Importar → Importar cofre do Obsidian**.
2. Selecione a **pasta raiz** do cofre. No desktop o seletor nativo de pastas do sistema é aberto; no navegador, use o seletor de pasta do próprio navegador.
3. Confira o resumo (notas, pastas, canvas, desenhos e anexos), ajuste o nome do workspace e escolha se deseja importar anexos não referenciados.
4. Clique em **Importar cofre**. O EliasNote abre o quadro raiz do novo workspace.

Há um cofre de exemplo em [`examples/obsidian-vault`](../examples/obsidian-vault) para testar o fluxo.

A importação é uma única operação no histórico: `Ctrl/Cmd + Z` desfaz o workspace inteiro. O cofre no disco não é modificado.

## O que é convertido

| Obsidian | EliasNote |
| --- | --- |
| Pastas | Quadros aninhados (a raiz vira o quadro inicial; cada subpasta vira um subquadro) |
| Notas `.md` | Notas Markdown com título, conteúdo, frontmatter de tags/aliases e tarefas |
| `[[Nota]]` / `[[Nota\|alias]]` | Link interno clicável (`eliasnote://node/...`) + referência bidirecional |
| `[[Nota#Título]]` | Link interno com o trecho no título do link e referência para a nota |
| `![[imagem.png]]` | Anexo local + nó de imagem/vídeo/arquivo no quadro, referenciado pela nota |
| `[[arquivo.pdf]]` | Anexo local + nó de arquivo |
| `[[Quadro.canvas]]` | Link para o quadro importado do canvas |
| `[[desenho.excalidraw]]` | Link para o nó de desenho Excalidraw |
| Links Markdown relativos (`[Nota](Pasta/Nota.md)`, `![](img.png)`) | Convertidos para links internos/anexos quando o alvo existe no cofre |
| `.canvas` | Quadro próprio com notas, links, imagens, grupos e conectores |
| `.excalidraw` | Nó de desenho editável (mesma cena) |
| Imagens, vídeos e arquivos | Anexos locais; a referência vira nó de mídia |
| Canvas `group` | Coluna com os elementos contidos no grupo (reorganizados verticalmente) |
| Cores do canvas (1–6) | Paleta de cores do EliasNote (rosa, areia, âmbar, menta, céu, lilás) |
| Arestas do canvas | Conectores com rótulo, cor e setas conforme `fromEnd`/`toEnd` |

### Organização gerada

- O workspace recebe o nome `Obsidian · <cofre>` (editável).
- A raiz do workspace é um quadro com o nome do cofre. Ele contém cartões de quadro para cada pasta de primeiro nível e para canvases da raiz, além das notas que estão na raiz.
- Cada pasta tem seu próprio quadro, com subpastas, canvases, notas, desenhos e uma área de anexos à direita.
- Notas são posicionadas em uma grade de três colunas; anexos ficam em uma coluna reservada à direita.
- Quadros de canvas abrem como subquadros e aparecem como cartões no quadro da pasta.

## Limitações conhecidas

- **Plugins e temas do Obsidian não são executados nem importados** (`.obsidian` é ignorado). Dataview, Templater, metadados de plugins e CSS snippets não têm efeito.
- **Dataview e blocos de consulta** entram como texto/código, não como resultados.
- **Transclusão** (`![[Nota]]`) vira um link para a nota, não um conteúdo embutido.
- **Callouts** do Obsidian são renderizados como citações comuns; HTML é sanitizado.
- **Grupos de canvas** viram colunas e os itens são reorganizados verticalmente — a posição original dentro do grupo não é preservada.
- Links Markdown com espaços no caminho entre `<...>` podem não ser resolvidos; prefira `[[...]]`.
- Nomes de notas repetidos em pastas diferentes podem ser resolvidos pelo caminho mais curto; use `[[Pasta/Nota]]` para desambiguar.
- Cofres com mais de **20.000 arquivos** são lidos parcialmente; o app avisa e você pode importar subpastas separadamente.
- Arquivos de texto acima de 8 MB são ignorados.
- A importação não cria modelos/templates a partir do cofre; use **Modelos → Salvar quadro atual** depois, se quiser.

## Privacidade

- A pasta é lida pelo seletor local do sistema (`webkitdirectory`); nada é enviado à rede.
- Anexos são copiados para o armazenamento local do EliasNote (SQLite/IndexedDB), mantendo o cofre intacto.
- Links internos abrem dentro do app; links externos (`http`, `mailto`) abrem no navegador padrão.

## Solução de problemas

- **Nada foi encontrado:** confirme que selecionou a pasta que contém os `.md`, não uma pasta acima do cofre.
- **Faltam imagens:** verifique se os anexos estão dentro do cofre e se o link usa `![[...]]`/caminho relativo válido. Ative “Anexos não referenciados” para importar imagens sem links.
- **Links quebrados:** o app mostra a contagem de links não resolvidos no resumo; eles permanecem como texto.
- **Canvas vazio:** o arquivo `.canvas` precisa ser JSON válido no formato JSON Canvas; arquivos inválidos aparecem como ignorados.
- **Muitos arquivos:** selecione uma subpasta do cofre e repita a importação; cada importação gera um workspace novo.
