import type { UpdatesContent } from "@/landing/i18n/types";

export const ptUpdates: UpdatesContent = {
  header: {
    eyebrow: "Atualizações",
    title: "Tudo o que mudou, versão por versão.",
    description:
      "O histórico público do EliasNote: cada recurso, correção e marco de infraestrutura que chegou às releases, da primeira beta ao desenho nativo e às notas com live preview.",
  },
  current: "Versão atual",
  allReleases: "Ver todas no GitHub",
  releaseLink: "Abrir release",
  changesLabel: "O que mudou",
  kindLabels: {
    initial: "Beta inicial",
    feature: "Novidades",
    fix: "Correção",
    infra: "Infraestrutura",
  },
  releases: {
    "0.7.0": {
      title: "Desenho nativo e notas com live preview",
      summary: "Um motor de desenho próprio, edição de notas no estilo Obsidian e duplicação mais clara.",
      changes: [
        "Editor de desenho nativo com caneta, formas, setas, texto, zoom, histórico e exportação PNG/SVG/PDF",
        "Notas com live preview: a marcação só aparece na linha ativa, com barra de formatação inferior",
        "Duplicar seleção no canvas e dentro do desenho nativo, com feedback e atalhos",
      ],
    },
    "0.6.0": {
      title: "Notas em modal e inspector mais limpo",
      summary: "Notas longas agora abrem em um editor amplo, com título e Markdown no mesmo lugar.",
      changes: [
        "Botão de expandir no cartão da nota, no inspector e no menu de contexto",
        "Editor modal grande com título e Markdown, mantendo autosave e histórico",
        "Títulos com HTML aparecem como texto limpo no inspector e na busca",
      ],
    },
    "0.5.0": {
      title: "Modo apresentação",
      summary: "Apresente um quadro sem a interface do app e navegue pelo workspace.",
      changes: [
        "Modo somente leitura que esconde sidebar, topbar, inspector e controles",
        "Enquadramento automático e navegação por setas, PageUp/PageDown ou botões",
        "Ao sair, restaura abas, aba ativa e viewports; filtro de etiqueta é preservado",
      ],
    },
    "0.4.0": {
      title: "Etiquetas editáveis e filtro por tag",
      summary: "Organize elementos com etiquetas e mantenha o foco no que importa.",
      changes: [
        "Editor de etiquetas com chips, sugestões do quadro e deduplicação",
        "Filtro por etiqueta no canvas, mantendo colunas de contexto",
        "Conectores, minimapa e seleção respeitam o filtro ativo",
      ],
    },
    "0.3.0": {
      title: "Painel global de tarefas",
      summary: "Prazos e prioridades de todos os quadros em uma única visão.",
      changes: [
        "Tarefas de todos os workspaces com caminho do quadro",
        "Agrupamento por atrasadas, hoje, próximos 7 dias, depois e sem prazo",
        "Concluir e abrir no canvas; atalho Ctrl/Cmd+Shift+P",
      ],
    },
    "0.2.6": {
      title: "Setas centralizadas e pan sobre elementos",
      summary: "Conectores mais precisos e navegação mais fluida no canvas.",
      changes: [
        "Setas conectadas apontam para o centro dos elementos",
        "Pan com espaço ou botão do meio mesmo sobre um elemento",
        "Tolerância de 12 px para soltar um conector no destino",
      ],
    },
    "0.2.5": {
      title: "Release mais resiliente",
      summary: "O fluxo de publicação passou a respeitar o limite da API do GitHub.",
      changes: [
        "Acompanhamento do workflow com controle de requisições",
        "Correções no processo de publicação e anexos",
        "Nenhuma mudança no formato dos dados",
      ],
    },
    "0.2.4": {
      title: "Texto livre com formatação",
      summary: "Escreva direto no canvas com controle de tipografia.",
      changes: [
        "Negrito, itálico, sublinhado, riscado e cores",
        "Tamanho, família tipográfica e alinhamento por elemento",
        "Barra flutuante, inspector e atalhos de formatação",
      ],
    },
    "0.2.3": {
      title: "Release em um comando",
      summary: "Checks, versão, tag, push e site em um único fluxo.",
      changes: [
        "Script único de release com typecheck, testes e builds",
        "Sincronização de versão nos manifestos e Cargo.lock",
        "Acompanhamento do workflow até os instaladores",
      ],
    },
    "0.2.2": {
      title: "Código, modelos de jogo e release",
      summary: "Mais ferramentas para game devs e uma rotina de publicação.",
      changes: [
        "Nó de código com realce para GDScript, C#, shader, JSON e outros",
        "Modelos GDD, design de nível, sistemas e sprint de jogo",
        "Primeira rotina de release e assets do projeto",
      ],
    },
    "0.2.1": {
      title: "Inspector flexível e atualizações",
      summary: "Mais espaço para editar e aviso quando uma nova versão está disponível.",
      changes: [
        "Inspector redimensionável com largura salva",
        "Verificação da última release no GitHub",
        "Botão Atualizar no topo quando há versão mais nova",
      ],
    },
    "0.2.0": {
      title: "Primeira beta pública",
      summary: "O canvas local-first, offline e com Excalidraw nativo chega ao público.",
      changes: [
        "Canvas infinito, quadros aninhados e Excalidraw editável",
        "Notas, tarefas, checklists, colunas, conectores, busca e referências",
        "Autosave em SQLite/IndexedDB, backups e importação de cofre Obsidian",
      ],
    },
  },
};
