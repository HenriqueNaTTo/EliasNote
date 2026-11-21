import type { SiteContent } from "@/landing/i18n/types";
import { ptDocs } from "@/landing/i18n/locales/pt/docs";

export const ptSite: SiteContent = {
  beta: {
    badge: "Beta",
    message:
      "EliasNote está em desenvolvimento (beta): recursos, atalhos e o formato dos dados ainda podem mudar entre versões.",
    link: "Acompanhar releases",
    downloads: {
      title: "Versão em desenvolvimento",
      description:
        "Esta é uma beta pública: o app já é estável para o uso diário, mas a interface, os atalhos e o formato dos dados ainda mudam entre versões.",
      items: [
        "Faça backup antes de atualizar: Backups → Criar snapshot.",
        "Recursos podem mudar ou ser reorganizados sem aviso prévio.",
        "Encontrou um problema? Abra uma issue com os passos para reproduzir.",
      ],
    },
  },
  meta: {
    titles: {
      principal: "EliasNote — canvas infinito, 100% offline",
      funcionalidades: "Funcionalidades · EliasNote",
      downloads: "Downloads · EliasNote",
      documentacao: "Documentação · EliasNote",
      sobre: "Sobre · EliasNote",
      contato: "Contato · EliasNote",
    },
    docTitle: "{page} · Documentação · EliasNote",
    description:
      "EliasNote é um app desktop local-first de organização visual: canvas infinito, quadros aninhados, notas, tarefas e Excalidraw nativo. Sem contas, sem nuvem, sem sincronização.",
  },
  nav: {
    brand: "EliasNote",
    brandSubtitle: "Canvas local-first",
    homeAria: "EliasNote — página principal",
    sectionsAria: "Seções do site",
    download: "Baixar",
    downloadAria: "Baixar instaladores do EliasNote",
    tabs: {
      principal: "Principal",
      funcionalidades: "Funcionalidades",
      downloads: "Downloads",
      documentacao: "Documentação",
      sobre: "Sobre",
      contato: "Contato",
    },
    accentGroup: "Cor de destaque",
    accentPrefix: "Cor",
    accentNames: { blue: "Azul", emerald: "Esmeralda", rose: "Rosa", amber: "Âmbar", slate: "Ardósia" },
    themeToLight: "Ativar tema claro",
    themeToDark: "Ativar tema escuro",
    language: "Idioma",
    languageAria: "Escolher idioma do site",
    backToTop: "Voltar ao topo",
  },
  footer: {
    summary:
      "Organização visual local-first com canvas infinito e Excalidraw nativo. 100% offline, sem contas e sem sincronização.",
    offline: "Feito para rodar sem internet",
    navigate: "Navegar",
    resources: "Recursos",
    links: {
      repo: "Repositório",
      releases: "Releases",
      issues: "Issues",
      docs: "Fontes da documentação",
      license: "Licença MIT",
    },
    copyright: "© {year} EliasNote · código aberto sob licença MIT",
    tech: "Tauri 2 · React · Excalidraw · sem cookies de rastreio",
  },
  home: {
    hero: {
      badge: "Local-first · 100% offline",
      titleBefore: "Seu próximo projeto começa em um ",
      titleHighlight: "canvas infinito",
      titleAfter: ".",
      description:
        "Notas, tarefas, imagens, quadros e desenhos Excalidraw no mesmo espaço visual. Tudo salvo no seu computador — sem conta, sem nuvem, sem sincronização.",
      primaryCta: "Baixar EliasNote",
      secondaryCta: "Ver funcionalidades",
      footnote: "Windows, Linux e macOS · instaladores anexados na release oficial · licença MIT",
    },
    statsLabel: "EliasNote em números",
    stats: ["dos dados no seu dispositivo", "tipos de elementos", "modelos prontos", "contas, nuvem ou assinatura"],
    pillars: {
      eyebrow: "Por que local-first",
      title: "Sem nuvem. Sem conta. Sem surpresas.",
      description:
        "O EliasNote foi desenhado para quem quer pensar visualmente sem entregar o próprio material para um serviço de terceiros.",
      items: [
        {
          title: "Seus dados no seu disco",
          description:
            "Cada quadro é gravado em SQLite no desktop ou IndexedDB no navegador, com autosave incremental e backups rotativos restauráveis.",
          proof: "Autosave a cada 700 ms",
        },
        {
          title: "Funciona sem internet",
          description:
            "Abra, escreva e desenhe em qualquer lugar. O app não depende de servidor, conta ou sincronização para funcionar.",
          proof: "Zero requisições de dados",
        },
        {
          title: "Sem contas, sem rastreio",
          description:
            "Nenhum login, telemetria ou assinatura. Links abrem no navegador padrão e o conteúdo do workspace fica sempre com você.",
          proof: "Código aberto sob MIT",
        },
      ],
    },
    flow: {
      eyebrow: "Como funciona",
      title: "Do rascunho à entrega, no mesmo quadro.",
      description:
        "Cada etapa reaproveita o que você já criou. Sem exportar para outra ferramenta, sem recomeçar o contexto.",
      templatesLabel: "Comece com um modelo",
      steps: [
        {
          title: "Capture sem formatar",
          description:
            "Crie notas, tarefas e checklists com um atalho. Solte arquivos direto no canvas: imagem vira cartão, Markdown vira nota.",
        },
        {
          title: "Conecte as ideias",
          description:
            "Colunas, quadros aninhados e conectores organizam o caos sem perder o contexto. Ctrl/Cmd+K encontra tudo.",
        },
        {
          title: "Desenhe e entregue",
          description:
            "Abra o Excalidraw para diagramar, mescle cenas e exporte em PNG, SVG, PDF, Markdown ou JSON reimportável.",
        },
      ],
    },
    toolkit: {
      eyebrow: "A caixa de ferramentas",
      title: "Tudo no mesmo lugar — inclusive o desenho.",
      description:
        "A organização visual e o diagrama vivem no mesmo workspace. Sem trocar de app no meio da ideia.",
      items: [
        "Treze tipos de elementos, de notas Markdown a desenhos editáveis",
        "Busca global em títulos, notas, tarefas, links, comentários e etiquetas",
        "Quadros aninhados, workspaces independentes e abas por quadro",
        "Excalidraw nativo com biblioteca local, autosave e mesclagem de cenas",
        "Nove modelos prontos: brainstorm, kanban, ata, pesquisa, semana e mais",
        "Undo/redo com transações: um arraste é uma entrada no histórico",
      ],
      cta: "Ver todas as funcionalidades",
    },
    obsidian: {
      eyebrow: "Integração",
      title: "Já tem um cofre do Obsidian?",
      description:
        "Importe a pasta inteira como um workspace novo, sem alterar o original e sem enviar nada para a internet. A importação é uma única entrada no histórico.",
      items: [
        "Pastas viram quadros aninhados, notas viram Markdown",
        "Wiki-links, tags e frontmatter viram referências clicáveis",
        "Imagens e anexos ficam salvos localmente",
        "Arquivos .canvas e .excalidraw entram editáveis",
      ],
      link: "Ler a documentação de importação",
    },
    cta: {
      eyebrow: "Comece em um minuto",
      title: "Seu próximo quadro começa vazio. Como todo projeto interessante.",
      description:
        "Instale o app, escolha um modelo e comece a organizar. Quando precisar desenhar, o Excalidraw já está ali.",
      primary: "Baixar agora",
      secondary: "Ver no GitHub",
    },
    templates: [
      "Brainstorm",
      "Projeto",
      "Kanban",
      "Ata de reunião",
      "Pesquisa",
      "Moodboard",
      "Semana",
      "Roteiro",
      "Retrospectiva",
      "GDD",
      "Design de nível",
      "Sistemas e mecânicas",
      "Sprint de jogo",
    ],
  },
  features: {
    header: {
      eyebrow: "Funcionalidades",
      title: "Tudo que o EliasNote faz",
      description:
        "Um app só para capturar, organizar, desenhar e entregar. Abaixo, o inventário completo do que já está pronto na versão atual.",
    },
    filterAria: "Filtrar funcionalidades por categoria",
    allCategories: "Todos",
    categories: {
      canvas: "Canvas",
      elementos: "Elementos",
      desenho: "Desenho",
      organizacao: "Organização",
      dados: "Dados e integrações",
    },
    countOne: "{count} recurso nesta categoria",
    countMany: "{count} recursos nesta categoria",
    meta: "Atalhos remapeáveis · interface em português",
    items: {
      "canvas-infinito": {
        title: "Canvas infinito",
        description:
          "Pan por roda, trackpad, botão do meio ou barra de espaço. Zoom de 25% a 200%, minimapa clicável e enquadrar com Shift+1.",
      },
      "encaixe-grade": {
        title: "Encaixe e alinhadores",
        description:
          "Grade opcional de 8, 16, 24 ou 32 px, alinhadores no inspector e movimento fino com as setas do teclado.",
      },
      "selecao-multipla": {
        title: "Seleção múltipla",
        description:
          "Caixa de seleção, Shift+clique e Ctrl/Cmd+A com ações em lote para duplicar, bloquear, ocultar e ordenar.",
      },
      "mover-entre-quadros": {
        title: "Mover entre quadros",
        description:
          "Arraste a seleção para um cartão de quadro ou para a árvore lateral. Segure Alt para copiar em vez de mover.",
      },
      "tipos-de-elementos": {
        title: "13 tipos de elementos",
        description:
          "Notas, texto, cartões, tarefas, checklists, imagens, vídeos, arquivos, links, quadros, colunas, comentários e desenhos.",
      },
      "notas-markdown": {
        title: "Notas Markdown",
        description:
          "Barra de formatação, prévia, contagem de palavras, título e cores. Solte uma imagem na nota para embutir a miniatura.",
      },
      "tarefas-checklists": {
        title: "Tarefas e checklists",
        description:
          "Conclua itens, defina prioridade e prazo, acompanhe o progresso e crie a próxima tarefa com Enter.",
      },
      "midia-local": {
        title: "Mídia local",
        description:
          "Imagens, vídeos e arquivos com anexo no dispositivo, legenda, lightbox e nenhum upload para servidores.",
      },
      colunas: {
        title: "Colunas inteligentes",
        description:
          "Arraste elementos para dentro, reordene, recolha, redimensione e mova a coluna inteira com os filhos.",
      },
      comentarios: {
        title: "Comentários locais",
        description: "Discussões com autor, respostas e resolução, sem depender de uma conta ou de um serviço externo.",
      },
      conectores: {
        title: "Conectores e setas",
        description:
          "Curva, reta ou cotovelo, com rótulos, cores, tracejado e setas nas pontas para mostrar relações.",
      },
      excalidraw: {
        title: "Excalidraw nativo",
        description:
          "Editor em tela cheia com todas as ferramentas, salvamento automático, biblioteca local e miniaturas no canvas.",
      },
      "mesclar-cenas": {
        title: "Mesclar cenas",
        description:
          "Combine um desenho com o clipboard, um arquivo .excalidraw ou outro desenho do workspace preservando bindings e imagens.",
      },
      "exportar-desenho": {
        title: "PNG, SVG e PDF",
        description:
          "Exporte qualquer desenho nos três formatos direto do editor, sem sair do app e sem perder a cena original.",
      },
      "quadros-aninhados": {
        title: "Quadros aninhados",
        description:
          "Subquadros recursivos com árvore arrastável, duplicação, ordenação e tiles coloridos no canvas.",
      },
      "workspaces-abas": {
        title: "Workspaces e abas",
        description:
          "Vários workspaces independentes e abas por quadro, fechadas pelo botão, clique do meio ou Ctrl/Cmd+W.",
      },
      "busca-global": {
        title: "Busca global",
        description:
          "Ctrl/Cmd+K procura em títulos, notas, tarefas, checklists, links, comentários, etiquetas e quadros.",
      },
      referencias: {
        title: "Referências e backlinks",
        description:
          "Aponte quadros e elementos em Refs e veja quem referencia o item atual no painel de backlinks.",
      },
      modelos: {
        title: "9 modelos prontos",
        description:
          "Brainstorm, projeto, kanban, ata de reunião, pesquisa, moodboard, semana, roteiro e retrospectiva.",
      },
      autosave: {
        title: "Autosave em SQLite",
        description:
          "Gravação incremental por quadro no desktop (SQLite) e no navegador (IndexedDB), com debounce de 700 ms.",
      },
      backups: {
        title: "Backups e restauração",
        description:
          "Snapshots automáticos por intervalo ou manuais, com retenção configurável e restauração pelo painel.",
      },
      "exportar-importar": {
        title: "Exportar e importar",
        description:
          "PNG e PDF do quadro inteiro, Markdown, JSON reimportável e importação por arraste de arquivos e .excalidraw.",
      },
      obsidian: {
        title: "Cofre do Obsidian",
        description:
          "Pastas viram quadros, notas viram Markdown com wiki-links, anexos ficam locais e .canvas vira subquadro com conectores.",
      },
      personalizacao: {
        title: "Tema e personalização",
        description:
          "Claro, escuro ou sistema, seis cores de destaque, densidade, escala de UI, textura do canvas e atalhos remapeáveis.",
      },
      historico: {
        title: "Histórico confiável",
        description:
          "Undo e redo com transações: um arraste é uma entrada, e a digitação é agrupada de forma inteligente.",
      },
      "codigo-snippets": {
        title: "Código com realce",
        description:
          "Blocos de código no canvas com realce para GDScript, C#, shader, JSON e YAML, linguagem inferida pela extensão do título e cópia em um clique.",
      },
      "texto-formatado": {
        title: "Texto com estilo",
        description:
          "Negrito, itálico, sublinhado, riscado, tamanho de 10 a 96 px, fonte sans, serifa ou mono e alinhamento — na barra flutuante, no inspector ou por Ctrl+B, Ctrl+I e Ctrl+U.",
      },
      "modelos-jogo": {
        title: "Modelos para game dev",
        description:
          "GDD, design de nível, sistemas e mecânicas e sprint de jogo, já com snippets de GDScript, JSON e shader preenchidos.",
      },
    },
    elements: {
      eyebrow: "Elementos",
      title: "Cada conteúdo tem o formato certo.",
      description:
        "Arraste do sistema para o canvas: imagem vira mídia, Markdown vira nota, .excalidraw vira desenho e JSON importa elementos.",
      columnName: "Elemento",
      columnDescription: "O que faz",
      caption: "Tipos de elementos do EliasNote e o que cada um faz",
      footnote: "Todos os elementos aceitam cor, redimensionamento, bloqueio, ocultação e referências bidirecionais.",
      items: {
        nota: {
          name: "Nota",
          description: "Markdown com barra de formatação, prévia, contagem de palavras, título e cores.",
        },
        texto: {
          name: "Texto",
          description: "Texto livre direto no canvas, sem cartão: cresce com o conteúdo, aceita cores e ganha negrito, itálico, tamanho, fonte e alinhamento.",
        },
        cartao: { name: "Cartão", description: "Título, descrição, etiqueta e cor para agrupar referências e resumos." },
        tarefa: {
          name: "Tarefa",
          description: "Concluir, prioridade e prazo; Enter cria a próxima tarefa da sequência.",
        },
        checklist: { name: "Checklist", description: "Itens editáveis com progresso, adicionar, remover e concluir." },
        midia: {
          name: "Imagem e vídeo",
          description: "Anexo local, legenda, preenchimento ou conter e lightbox.",
        },
        arquivo: { name: "Arquivo", description: "Nome, tipo, tamanho e download do anexo guardado no dispositivo." },
        link: { name: "Link", description: "Título, descrição, URL e abertura no navegador padrão." },
        quadro: {
          name: "Quadro",
          description: "Subquadro real com estatísticas, prévia colorida e abertura em aba.",
        },
        coluna: {
          name: "Coluna",
          description: "Filhos arrastáveis, recolher, redimensionar e menu de criação rápida.",
        },
        comentario: {
          name: "Comentário",
          description: "Autor local, resolução, respostas e painel dedicado dentro do inspector.",
        },
        desenho: {
          name: "Desenho",
          description: "Excalidraw completo, miniatura no canvas, biblioteca local e exportação.",
        },
        "desenho-nota": {
          name: "Desenho em nota",
          description: "Vincule um desenho à nota: a miniatura aparece no cartão e abre o editor.",
        },
        codigo: {
          name: "Código",
          description:
            "Bloco monoespaçado com realce (GDScript, C#, shader, JSON, YAML), cópia rápida e linguagem pela extensão.",
        },
      },
    },
    shortcuts: {
      title: "Atalhos essenciais",
      subtitle: "Todos remapeáveis em Configurações → Atalhos.",
      note: "Ctrl/Cmd representa ⌘ no macOS. Atalhos de uma letra são ignorados enquanto você digita.",
      actions: {
        busca: "Busca global",
        "nova-nota": "Nova nota",
        "nova-tarefa": "Nova tarefa",
        desenho: "Novo desenho Excalidraw",
        enquadrar: "Enquadrar quadro",
        zoom: "Zoom 100%",
        sidebar: "Alternar barra lateral",
        desfazer: "Desfazer",
      },
    },
    drawing: {
      title: "Desenho sem trocar de app",
      description:
        "O editor Excalidraw abre em tela cheia e a cena fica salva no próprio quadro, com miniatura no canvas. A biblioteca de elementos é local e pode ser importada ou exportada em .excalidrawlib.",
      items: [
        "Mesclagem de cenas com remapeamento de bindings e imagens",
        "Exportação do desenho em PNG, SVG e PDF",
        "Importação de arquivos .excalidraw por arraste",
      ],
      link: "Conhecer o Excalidraw",
    },
    obsidian: {
      title: "Cofre do Obsidian em um clique",
      description:
        "A importação cria um workspace novo com a hierarquia de pastas, notas, anexos, canvases e desenhos. O cofre original não é modificado.",
      link: "Ver o que é convertido",
    },
    footnote: {
      start: "Detalhes técnicos e limites conhecidos estão na ",
      featuresLink: "página de funcionalidades",
      middle: " e a lista completa de combinações fica em ",
      shortcutsLink: "Atalhos",
      end: ".",
    },
  },
  downloads: {
    header: {
      eyebrow: "Downloads",
      title: "Baixe uma vez. Funcione para sempre.",
      description:
        "Instaladores oficiais publicados no GitHub. Nenhum cadastro, nenhuma licença para ativar: baixe, instale e comece a organizar.",
    },
    version: "Versão {version}",
    free: "Gratuito · código aberto",
    allReleases: "Todas as releases",
    downloadButton: "Baixar instalador",
    unsigned: {
      title: "Instaladores não assinados",
      description:
        "Os pacotes são gerados pelo workflow de release e não têm assinatura de código, então o sistema pode exibir um aviso na primeira execução.",
      windowsLabel: "Windows:",
      windows: "no SmartScreen, use “Mais informações” → “Executar assim mesmo”.",
      macosLabel: "macOS:",
      macos: "se o sistema bloquear a abertura, remova a quarentena do app.",
      codeTitle: "macOS · terminal",
      codeNote: "Só é necessário quando o macOS impede a primeira abertura.",
    },
    requirements: {
      title: "Requisitos",
      windowsLabel: "Windows 10/11",
      windows: "com WebView2 atualizado.",
      linuxLabel: "Linux",
      linux: "com WebKitGTK 4.1; o AppImage é portátil e o .deb resolve as dependências.",
      macosLabel: "macOS 11+",
      macos: "em Intel ou Apple Silicon, com um único DMG universal.",
      buildLabel: "Para compilar:",
      build: "Node 20+ e Rust 1.77.2+, além das dependências do Tauri 2.",
      footnote: "O app não pede permissões de rede para funcionar: o workspace fica no dispositivo.",
    },
    platforms: {
      windows: {
        name: "Windows",
        requirement: "Windows 10/11 · WebView2",
        note: "Assistente visual (.exe) e WiX (MSI) para instalação silenciosa.",
      },
      linux: {
        name: "Linux",
        requirement: "Distribuições com WebKitGTK 4.1",
        note: "AppImage portátil e pacote Debian.",
      },
      macos: {
        name: "macOS",
        requirement: "macOS 11+ · universal (Intel e Apple Silicon)",
        note: "Um único DMG universal para as duas arquiteturas.",
      },
    },
    source: {
      title: "Compilar do código-fonte",
      description:
        "Clone o repositório e rode o app em modo de desenvolvimento. No navegador, a persistência usa IndexedDB; no desktop, SQLite.",
      codeNote: "No Linux e no macOS, use npm run tauri build para gerar o pacote nativo da plataforma.",
      repository: "Código no GitHub",
      guide: "Guia de desenvolvimento",
    },
    data: {
      title: "Onde ficam seus dados",
      subtitle: "Documentos, anexos e backups ficam no diretório de dados do app.",
      caption: "Diretórios de dados do EliasNote por sistema operacional",
      footnote:
        "Desinstalar o app não apaga a pasta de dados; remova-a manualmente se quiser zerar o workspace.",
      browserPath: "IndexedDB do próprio navegador",
      systems: {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        browser: "Navegador",
      },
    },
    workflow: {
      before: "Cada tag v* dispara o workflow de release, que roda typecheck, testes e build e anexa os instaladores de Windows, Linux e macOS à release. Acompanhe as execuções em ",
      actionsLink: "GitHub Actions",
      middle: ". Se algo falhar, abra uma issue em ",
      repoLink: "github.com/HenriqueNaTTo/EliasNote",
      after: ".",
    },
  },
  about: {
    header: {
      eyebrow: "Sobre",
      title: "Uma ferramenta de pensamento que cabe no seu computador.",
      description:
        "EliasNote combina a organização visual do Milanote com o desenho do Excalidraw — sem contas, servidores ou sincronização. O material continua sendo seu, inclusive quando o app está fechado.",
    },
    paragraphs: [
      "nasceu de uma necessidade simples: pensar visualmente sem entregar o rascunho para um serviço de terceiros. Em vez de uma pilha de apps entre a ideia e a entrega, o projeto reúne notas, tarefas, referências, quadros e diagramas em um único canvas infinito.",
      "O app é feito com Tauri 2 e React, usa SQLite no desktop e IndexedDB no navegador, e trata o desenho como parte do fluxo — não como um anexo. O Excalidraw é embutido e editável, com cenas mescláveis e exportação em PNG, SVG e PDF.",
      "Não há login, assinatura ou telemetria. A release é gerada por um workflow público que roda typecheck, testes e build antes de anexar os instaladores das três plataformas.",
    ],
    tags: ["Tauri 2", "React 18", "TypeScript", "Tailwind CSS", "Excalidraw", "SQLite"],
    summary: {
      title: "Em resumo",
      rows: [
        { label: "Modelo", value: "Local-first · 100% offline" },
        { label: "Plataformas", value: "Windows, Linux e macOS" },
        { label: "Licença", value: "MIT" },
        { label: "Versão atual", value: "{version}" },
      ],
      repository: "Repositório",
      license: "Licença MIT",
    },
    principles: {
      eyebrow: "Princípios",
      title: "Quatro decisões que definem o app.",
      description: "Elas aparecem na arquitetura, na interface e nos limites do produto.",
      items: [
        {
          title: "O arquivo é seu",
          description:
            "Quadros ficam em SQLite no desktop ou IndexedDB no navegador, com exportação para JSON e Markdown. Nada de formato fechado.",
        },
        {
          title: "Offline por padrão",
          description:
            "O app abre e funciona sem internet. Links abrem no navegador padrão; o conteúdo do workspace nunca sai do dispositivo.",
        },
        {
          title: "Sem contas e sem telemetria",
          description:
            "Não existe login, assinatura, sincronização ou servidor. A instalação não pede nenhum dado pessoal.",
        },
        {
          title: "Código aberto",
          description:
            "Código original sob licença MIT, bibliotecas com suas próprias licenças e nenhum asset proprietário do Milanote.",
        },
      ],
    },
    limits: {
      title: "Limites conhecidos",
      subtitle: "Transparência importa tanto quanto o recurso novo.",
      items: [
        "Não há autenticação, colaboração, servidor ou sincronização — por design.",
        "O histórico de desfazer/refazer é por sessão e não é persistido.",
        "O editor Excalidraw carrega sob demanda (~4,6 MB comprimido) na primeira abertura.",
        "A exportação de imagem captura a área enquadrada do canvas; para quadros grandes use escala 2x ou 3x.",
        "Os instaladores da release não são assinados, então o sistema pode exibir um aviso na primeira execução.",
      ],
      link: "Ver a lista completa",
    },
    stack: {
      title: "Stack e decisões técnicas",
      subtitle: "Tudo aberto e auditável no repositório.",
      layers: [
        "Aplicativo desktop",
        "Interface",
        "Base visual",
        "Desenho",
        "Estado e histórico",
        "Persistência",
        "Build e testes",
      ],
      footnote: { start: "Documentação de arquitetura em ", link: "Arquitetura", end: "." },
    },
    credits: {
      title: "Créditos e licenças",
      text: "Código original sob licença MIT. As bibliotecas de terceiros mantêm suas próprias licenças: Excalidraw (MIT), React, TypeScript, Vite, Tailwind CSS, Radix UI, lucide, Zustand, Immer, marked, DOMPurify, html-to-image, jsPDF, Tauri 2 e rusqlite. Nenhum código ou asset proprietário do Milanote foi utilizado.",
      license: "Ler a licença",
      docs: "Documentação completa",
    },
  },
  contact: {
    header: {
      eyebrow: "Contato",
      title: "Fale direto com o projeto.",
      description:
        "Sem central de atendimento e sem formulário em servidor: a mensagem vira uma issue pré-preenchida no repositório oficial. Você revisa e decide publicar.",
    },
    channels: [
      {
        title: "Bugs e sugestões",
        description: "Descreva o problema com passos para reproduzir ou proponha uma funcionalidade nova.",
        action: "Abrir issues",
      },
      {
        title: "Downloads e versões",
        description: "Instaladores e notas de cada release publicada para Windows, Linux e macOS.",
        action: "Ver releases",
      },
      {
        title: "Documentação",
        description: "Arquitetura, funcionalidades, atalhos, importação do Obsidian e guia de desenvolvimento.",
        action: "Ler a documentação",
      },
    ],
    privacy: {
      title: "Nada passa por um servidor",
      description:
        "O EliasNote não tem backend. O único destino possível deste formulário é o GitHub, e nada é enviado até você confirmar a publicação da issue.",
    },
    startFresh: {
      before: "Prefere começar do zero? ",
      issue: "Abra uma issue em branco",
      middle: " ou consulte o ",
      repo: "repositório oficial",
      after: ".",
    },
    form: {
      title: "Abrir uma issue",
      subtitle: "O texto abaixo vira o corpo da mensagem no GitHub.",
      labels: { name: "Nome", email: "E-mail", subject: "Assunto", topic: "Tipo de mensagem", message: "Mensagem" },
      placeholders: {
        name: "Como podemos chamar você",
        email: "voce@exemplo.com",
        subject: "Resumo em uma linha",
        message:
          "Conte o que aconteceu, o que você esperava e como reproduzir. Se for uma sugestão, descreva o caso de uso.",
      },
      topics: {
        sugestao: "Sugestão de recurso",
        bug: "Relatório de bug",
        duvida: "Dúvida de uso",
        outro: "Outro assunto",
      },
      errors: {
        name: "Informe seu nome.",
        email: "Informe um e-mail válido.",
        subject: "Resuma o assunto em pelo menos 3 caracteres.",
        message: "Descreva com pelo menos 20 caracteres.",
      },
      counter: "{count} de 4000 caracteres",
      submit: "Abrir issue no GitHub",
      disclaimer: "Nada é publicado automaticamente.",
      successTitle: "Rascunho de issue gerado",
      successDescription:
        "Se o GitHub não abriu em outra aba, use o link abaixo. Revise o texto e clique em “Submit new issue” para publicar.",
      successLink: "Abrir rascunho",
      copyLink: "Copiar link",
      edit: "Editar mensagem",
      issue: { name: "Nome", email: "E-mail", type: "Tipo", footer: "Mensagem escrita no formulário da landing page do EliasNote." },
    },
  },
  docs: ptDocs,
};
