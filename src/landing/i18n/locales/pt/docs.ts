import type { DocId, DocPageContent, DocsContent } from "@/landing/i18n/types";
import { DOC_PAGES } from "@/landing/docs/content";

const pages = Object.fromEntries(
  DOC_PAGES.map((doc) => [
    doc.id,
    { title: doc.title, shortTitle: doc.shortTitle, summary: doc.summary, sections: doc.sections },
  ]),
) as Record<DocId, DocPageContent>;

export const ptDocs: DocsContent = {
  hub: {
    eyebrow: "Documentação",
    title: "A documentação inteira, dentro do site.",
    description:
      "Seis páginas cobrindo o produto, os atalhos, a importação do Obsidian, a arquitetura, o ambiente de desenvolvimento e a publicação de versões — no mesmo visual do app.",
    searchLabel: "Filtrar páginas da documentação",
    searchPlaceholder: "Filtrar por assunto ou termo técnico",
    count: "{count} de {total} páginas",
    emptyTitle: "Nenhuma página corresponde a “{query}”.",
    emptyDescription: "Tente um termo mais curto — por exemplo “canvas”, “Obsidian”, “atalhos” ou “release”.",
    clear: "Limpar filtro",
    trailsEyebrow: "Por onde começar",
    trailsTitle: "Trilhas curtas para o seu objetivo.",
    trailsDescription:
      "Cada trilha leva direto às páginas que importam para o próximo passo, sem precisar ler tudo em ordem.",
    fileFooterBefore: "O conteúdo acompanha os arquivos Markdown de ",
    fileFooterAfter: " no repositório.",
    fileLink: "Ver os arquivos originais",
    cardSections: "{count} seções",
    cardMinutes: "{minutes} min",
    trails: [
      {
        title: "Vou usar o app",
        description: "Entenda o produto, os elementos e as combinações de teclado antes do primeiro quadro.",
        pages: ["funcionalidades", "atalhos"],
      },
      {
        title: "Vou trazer meu Obsidian",
        description: "Veja o que é convertido, como a hierarquia vira quadros e quais limites existem.",
        pages: ["obsidian", "funcionalidades"],
      },
      {
        title: "Vou contribuir ou publicar",
        description: "Ambiente local, testes, backend Rust, arquitetura e o caminho de uma nova versão.",
        pages: ["desenvolvimento", "arquitetura", "release"],
      },
    ],
  },
  page: {
    breadcrumb: "Documentação",
    breadcrumbAria: "Trilha da documentação",
    eyebrow: "Documentação",
    minutes: "{minutes} min de leitura",
    sections: "{count} seções",
    editOnGithub: "Editar no GitHub",
    onThisPage: "Nesta página",
    mobileToc: "Nesta página · {count} seções",
    previous: "Anterior",
    next: "Próxima",
    index: "Índice",
    allPages: "Ver todas as páginas",
    navAria: "Navegação entre páginas da documentação",
    docsNav: "Documentação",
  },
  pages,
};
