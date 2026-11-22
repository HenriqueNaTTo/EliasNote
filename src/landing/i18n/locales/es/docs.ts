import type { DocsContent } from "@/landing/i18n/types";
import { esDocsExtra } from "@/landing/i18n/locales/es/docs-extra";

export const esDocs: DocsContent = {
  hub: {
    eyebrow: "Documentación",
    title: "Toda la documentación, dentro del sitio.",
    description:
      "Seis páginas que cubren el producto, los atajos, la importación de Obsidian, la arquitectura, el entorno de desarrollo y la publicación de versiones — con el mismo aspecto de la app.",
    searchLabel: "Filtrar páginas de la documentación",
    searchPlaceholder: "Filtrar por tema o término técnico",
    count: "{count} de {total} páginas",
    emptyTitle: "Ninguna página coincide con “{query}”.",
    emptyDescription:
      "Prueba con un término más corto — por ejemplo “canvas”, “Obsidian”, “atajos” o “release”.",
    clear: "Limpiar filtro",
    trailsEyebrow: "Por dónde empezar",
    trailsTitle: "Rutas cortas hacia tu objetivo.",
    trailsDescription:
      "Cada ruta lleva directo a las páginas que importan para el siguiente paso, sin necesidad de leerlo todo en orden.",
    fileFooterBefore: "El contenido acompaña a los archivos Markdown de ",
    fileFooterAfter: " en el repositorio.",
    fileLink: "Ver los archivos originales",
    cardSections: "{count} secciones",
    cardMinutes: "{minutes} min",
    trails: [
      {
        title: "Voy a usar la app",
        description:
          "Entiende el producto, los elementos y las combinaciones de teclado antes del primer tablero.",
        pages: ["funcionalidades", "atalhos"],
      },
      {
        title: "Voy a traer mi Obsidian",
        description:
          "Mira qué se convierte, cómo la jerarquía se transforma en tableros y qué límites existen.",
        pages: ["obsidian", "funcionalidades"],
      },
      {
        title: "Voy a contribuir o publicar",
        description:
          "Entorno local, pruebas, backend de Rust, arquitectura y el camino de una nueva versión.",
        pages: ["desenvolvimento", "arquitetura", "release"],
      },
    ],
  },
  page: {
    breadcrumb: "Documentación",
    breadcrumbAria: "Ruta de la documentación",
    eyebrow: "Documentación",
    minutes: "{minutes} min de lectura",
    sections: "{count} secciones",
    editOnGithub: "Editar en GitHub",
    onThisPage: "En esta página",
    mobileToc: "En esta página · {count} secciones",
    previous: "Anterior",
    next: "Siguiente",
    index: "Índice",
    allPages: "Ver todas las páginas",
    navAria: "Navegación entre páginas de la documentación",
    docsNav: "Documentación",
  },
  pages: {
    funcionalidades: {
      title: "Funciones",
      shortTitle: "Funciones",
      summary:
        "El inventario completo de lo que ya está listo: canvas, elementos, Excalidraw, organización, búsqueda, productividad y límites declarados.",
      sections: [
        {
          id: "canvas-e-organizacao",
          title: "Canvas y organización",
          hint: "features/canvas",
          blocks: [
            {
              kind: "list",
              items: [
                "Canvas infinito con pan por rueda del ratón, trackpad, botón central, herramienta de mano o barra espaciadora.",
                "Zoom por `Ctrl/Cmd + rueda`, pinch, botones, menú de porcentaje (25%–200%) y atajos.",
                "Encuadrar tablero (`Shift+1`), zoom 100% (`Ctrl/Cmd+0`), minimapa clicable y arrastrable.",
                "Ajuste opcional a rejilla con tamaños 8/16/24/32 px.",
                "Selección múltiple por arrastre, Shift+clic, `Ctrl/Cmd+A`, mover con flechas (Shift = 10 px) y alineadores en el inspector.",
                "Duplicar, traer al frente, enviar al fondo, bloquear, ocultar y eliminar con deshacer.",
                "Mover o copiar la selección a otro tablero desde el menú contextual: las columnas van con sus elementos, los subtableros acompañan a la tarjeta y el contenido entra centrado en el destino.",
                "Arrastra la selección hasta una tarjeta de tablero en el canvas o hasta la fila del tablero en el árbol lateral para moverla (mantén `Alt` en el canvas para copiar); el destino reacciona al arrastre y pulsa al recibir los elementos.",
                "Doble clic en un área vacía crea una nota; doble clic en un elemento abre el editor correspondiente.",
                "Arrastra archivos del sistema al canvas: imágenes, vídeos, archivos, Markdown (se convierte en nota), `.excalidraw` (se convierte en dibujo) y JSON (importa elementos).",
                "Arrastra imágenes y archivos a una **nota**: el adjunto se guarda localmente, la miniatura aparece dentro de la tarjeta y el elemento queda al lado con referencia bidireccional.",
                "Arrastra archivos a un **tablero anidado**: entran directamente en el tablero hijo (con aviso), sin duplicarse en el tablero actual.",
              ],
            },
          ],
        },
        {
          id: "elementos",
          title: "Elementos",
          hint: "core/domain/nodes",
          blocks: [
            {
              kind: "table",
              columns: ["Elemento", "Recursos"],
              caption: "Tipos de nodo de EliasNote y qué ofrece cada uno",
              rows: [
                ["Nota", "Markdown con barra de formato, vista previa, recuento de palabras, título y colores; el botón de expandir abre la nota en un editor grande"],
                ["Texto", "Texto libre directamente en el canvas, sin tarjeta: doble clic escribe, crece con el contenido y acepta colores"],
                ["Tarjeta", "Título, descripción, etiqueta y colores"],
                ["Tarea", "Completar, prioridad, fecha límite, Enter crea la siguiente tarea"],
                ["Checklist", "Elementos editables, progreso, añadir y quitar, completar"],
                ["Imagen / Vídeo", "Adjunto local, leyenda, relleno/ajuste, lightbox"],
                ["Archivo", "Nombre, tipo, tamaño, descarga"],
                ["Enlace", "Título, descripción, URL y apertura en el navegador predeterminado"],
                ["Tablero", "Subtablero real, estadísticas, vista previa coloreada y apertura en pestaña"],
                ["Columna", "Hijos arrastrables, plegar, redimensionar, menú de creación rápida"],
                ["Comentario", "Autor local, resolución, respuestas y panel dedicado"],
                ["Dibujo", "Excalidraw completo, miniatura, biblioteca de elementos, exportación"],
                [
                  "Dibujo en nota",
                  "Vincula un dibujo a la nota (botón de lápiz en la cabecera de la nota); las miniaturas aparecen dentro de la tarjeta y abren el editor",
                ],
              ],
            },
          ],
        },
        {
          id: "excalidraw",
          title: "Excalidraw",
          hint: "features/drawing",
          blocks: [
            {
              kind: "list",
              items: [
                "Editor a pantalla completa abierto con doble clic, el botón del nodo o el atajo `D`.",
                "Todas las herramientas de Excalidraw: selección, formas, líneas, flechas, escritura a mano, texto, imagen, borrador, marco, láser, biblioteca y enlaces.",
                "Guardado automático de la escena (elementos, app state serializable y archivos) con debounce.",
                "Miniatura PNG generada de forma diferida para mantener ligero el canvas.",
                "Biblioteca de elementos persistida localmente e importable/exportable en `.excalidrawlib` desde la propia biblioteca.",
                "Exportación del dibujo en PNG, SVG y PDF.",
                "Importación de archivos `.excalidraw` por arrastre o desde el diálogo de importación.",
                "**Fusión de escenas** desde el menú **Escena**: pegar del portapapeles, importar un `.excalidraw` o fusionar otro dibujo del workspace (incluido uno importado de Obsidian).",
                "La fusión genera nuevos IDs, remapea textos y contenedores, flechas y bindings, grupos e imágenes, y desplaza la escena para no solaparse con el contenido existente.",
              ],
            },
          ],
        },
        {
          id: "quadros-workspaces-abas",
          title: "Tableros, workspaces y pestañas",
          blocks: [
            {
              kind: "list",
              items: [
                "Múltiples workspaces con creación, cambio de nombre y eliminación.",
                "Árbol lateral con expansión, arrastre para anidar, mover a la raíz, renombrar, duplicar y eliminar.",
                "Pestañas independientes por tablero, con cierre por botón, clic central y `Ctrl/Cmd+W`.",
                "Subtableros recursivos creados desde la barra, el inspector, el árbol o el atajo.",
              ],
            },
          ],
        },
        {
          id: "busca-e-referencias",
          title: "Búsqueda y referencias",
          hint: "core/search",
          blocks: [
            {
              kind: "list",
              items: [
                "Búsqueda global en todos los workspaces con puntuación por campo y filtros por tipo.",
                "Los resultados muestran un fragmento, el tipo y la ruta del tablero; Enter abre y centra el elemento.",
                "Panel de tareas (`Ctrl/Cmd+Shift+P`) reúne tareas de todos los tableros, con fechas límite, prioridad, filtros y apertura en el canvas.",
                "Etiquetas editables en el inspector, con sugerencias del tablero, y filtro por etiqueta en el canvas; el filtro es una vista temporal y no altera los datos.",
                "Modo presentación (`Ctrl/Cmd+Shift+F`) oculta la interfaz, encuadra el tablero y navega por el árbol del workspace sin editar nada.",
                "Referencias bidireccionales: añade tableros o elementos en `Refs`; los backlinks listan quién apunta al elemento actual.",
              ],
            },
          ],
        },
        {
          id: "produtividade",
          title: "Productividad",
          blocks: [
            {
              kind: "list",
              items: [
                "Undo/redo con agrupación inteligente; `Ctrl/Cmd+Z` y `Ctrl/Cmd+Shift+Z` (o `Ctrl+Y`).",
                "Plantillas integradas: brainstorm, proyecto, kanban, acta de reunión, investigación, moodboard, semana, guion y retrospectiva.",
                "Guardar el tablero actual como modelo reutilizable (payload serializable, persiste entre sesiones).",
                "Exportación PNG/PDF del tablero completo con encuadre automático y restauración del zoom.",
                "Exportación Markdown (columnas, tareas, notas) y JSON (copia reimportable).",
                "Importación de JSON de tablero/workspace/fragmento, Markdown, `.excalidraw` y adjuntos.",
                "Importación de cofre de Obsidian: jerarquía de carpetas en tableros, notas con frontmatter/tags, wiki-links clicables con referencias, adjuntos locales, `.canvas` (texto, enlaces, archivos, grupos y aristas) y `.excalidraw`.",
              ],
            },
          ],
        },
        {
          id: "obsidian",
          title: "Obsidian",
          hint: "core/import",
          blocks: [
            {
              kind: "text",
              text: "El menú **Archivo → Cofre de Obsidian** (o **Importar → Importar cofre de Obsidian**) crea un workspace nuevo a partir de una carpeta de cofre, sin modificar el original. En el escritorio usa el selector nativo de carpetas; todo se ejecuta localmente y la importación completa es una única entrada de undo.",
            },
            {
              kind: "list",
              items: [
                "Las carpetas se convierten en tableros anidados; las notas se convierten en notas Markdown colocadas en rejilla.",
                "`[[Nota]]`, `[[Nota|alias]]` y `[[Nota#Título]]` se convierten en enlaces internos clicables + referencias bidireccionales.",
                "`![[imagem]]`, los enlaces Markdown relativos y los adjuntos se guardan localmente y se convierten en nodos de medios referenciados.",
                "`.canvas` se convierte en un subtablero con nodos y conectores; los grupos se convierten en columnas.",
                "`.excalidraw` se convierte en un dibujo editable.",
                "Limitaciones: los plugins, los temas y Dataview no se ejecutan, las transclusiones se convierten en enlaces y los grupos reorganizan los elementos.",
              ],
            },
          ],
        },
        {
          id: "dados-e-configuracoes",
          title: "Datos y ajustes",
          hint: "core/persistence",
          blocks: [
            {
              kind: "list",
              items: [
                "Aspecto inspirado en Milanote: canvas gris neutro, tarjetas blancas, notas de color sin cabecera, tableros en mosaicos de color, columnas transparentes, conectores finos con etiquetas oscuras y esquinas rectas en toda la interfaz.",
                "Autoguardado incremental con indicador de estado y almacenamiento identificado (SQLite/IndexedDB).",
                "Copias de seguridad automáticas por intervalo configurable y manuales, con retención y restauración.",
                "Tema claro/oscuro/sistema, color de acento, textura del canvas, densidad, escala de UI, sombra de los elementos, minimapa y etiquetas de conectores.",
                "Atajos totalmente reasignables con detección de conflictos y restauración de los valores por defecto.",
                "Adjuntos locales, almacenamiento por dispositivo, sin subidas.",
              ],
            },
          ],
        },
        {
          id: "limites-conhecidos",
          title: "Límites conocidos",
          blocks: [
            {
              kind: "note",
              tone: "warning",
              text: "La transparencia forma parte de la documentación. Si alguno de estos puntos es bloqueante para tu flujo, abre una issue describiendo el caso de uso.",
            },
            {
              kind: "list",
              items: [
                "No hay autenticación, colaboración, servidor ni sincronización (por diseño).",
                "Los enlaces se abren en el navegador predeterminado; el contenido de la app permanece offline.",
                "El editor Excalidraw se carga bajo demanda (~4,6 MB comprimido) en la primera apertura.",
                "La exportación de imagen captura el área encuadrada del canvas; para tableros muy grandes usa escala 2x/3x.",
                "El historial de undo/redo es por sesión y no se persiste.",
              ],
            },
          ],
        },
      ],
    },
    atalhos: {
      title: "Atajos",
      shortTitle: "Atajos",
      summary:
        "Todos los atajos de la app, separados por navegación, creación, canvas y archivo. Cada combinación se puede reasignar en Ajustes → Atajos.",
      sections: [
        {
          id: "navegacao",
          title: "Navegación",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Búsqueda global", keys: [["Mod", "K"]] },
                { action: "Panel de tareas", keys: [["Mod", "Shift", "P"]] },
                { action: "Modo presentación", keys: [["Mod", "Shift", "F"]] },
                { action: "Abrir/entrar en el tablero seleccionado", keys: [["Mod", "Enter"]] },
                { action: "Cerrar pestaña", keys: [["Mod", "W"]] },
                { action: "Pestaña siguiente", keys: [["Mod", "Tab"]] },
                { action: "Alternar barra lateral", keys: [["Mod", "B"]] },
                { action: "Alternar inspector", keys: [["Mod", "Shift", "I"]] },
                { action: "Alternar tema", keys: [["Mod", "Shift", "L"]] },
              ],
            },
          ],
        },
        {
          id: "criacao",
          title: "Creación",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Nueva nota", keys: [["N"]] },
                { action: "Nuevo texto libre", keys: [["Shift", "T"]] },
                { action: "Nueva tarjeta", keys: [["C"]] },
                { action: "Nueva tarea", keys: [["T"]] },
                { action: "Nuevo checklist", keys: [["L"]] },
                { action: "Nueva columna", keys: [["Mod", "Shift", "K"]] },
                { action: "Nuevo tablero", keys: [["Mod", "Shift", "N"]] },
                { action: "Nuevo dibujo Excalidraw", keys: [["D"]] },
                { action: "Nuevo comentario", keys: [["M"]] },
                { action: "Nuevo subtablero en el árbol", keys: [["Menú del tablero", "Nuevo subtablero"]] },
              ],
            },
          ],
        },
        {
          id: "canvas",
          title: "Canvas",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Herramienta de selección", keys: [["V"]] },
                { action: "Herramienta de mano", keys: [["H"]] },
                { action: "Herramienta de conector", keys: [["R"]] },
                { action: "Mover la selección (1 px)", keys: [["Flechas"]] },
                { action: "Mover la selección (10 px)", keys: [["Shift", "Flechas"]] },
                { action: "Duplicar", keys: [["Mod", "D"]] },
                { action: "Eliminar", keys: [["Delete"], ["Backspace"]] },
                { action: "Seleccionar todo", keys: [["Mod", "A"]] },
                { action: "Deshacer", keys: [["Mod", "Z"]] },
                { action: "Rehacer", keys: [["Mod", "Shift", "Z"], ["Ctrl", "Y"]] },
                { action: "Zoom +", keys: [["Mod", "="]] },
                { action: "Zoom −", keys: [["Mod", "−"]] },
                { action: "Zoom 100%", keys: [["Mod", "0"]] },
                { action: "Encuadrar tablero", keys: [["Shift", "1"]] },
                { action: "Salir de la herramienta / cerrar el editor", keys: [["Esc"]] },
              ],
            },
          ],
        },
        {
          id: "arquivo",
          title: "Archivo",
          blocks: [
            {
              kind: "shortcuts",
              items: [
                { action: "Guardar ahora", keys: [["Mod", "S"]] },
                { action: "Exportar tablero", keys: [["Mod", "Shift", "E"]] },
                { action: "Modelos", keys: [["Mod", "Shift", "T"]] },
                { action: "Copias de seguridad", keys: [["Mod", "Shift", "B"]] },
                { action: "Ajustes", keys: [["Mod", ","]] },
              ],
            },
          ],
        },
        {
          id: "observacoes",
          title: "Observaciones",
          blocks: [
            {
              kind: "text",
              text: "`Mod` representa `Ctrl` en Windows/Linux y `⌘` en macOS. Todos los atajos se pueden reasignar en **Ajustes → Atajos**, con detección de conflictos y restauración de los valores por defecto.",
            },
            {
              kind: "list",
              items: [
                "Los atajos de una sola letra se ignoran mientras escribes en campos de texto.",
                "Las combinaciones con `Mod` siguen activas para deshacer, guardar y buscar.",
                "En el navegador, algunos atajos del sistema (como `Ctrl+W` y `Ctrl+Tab`) pueden interceptarse. En la app de Tauri funcionan con normalidad.",
              ],
            },
          ],
        },
      ],
    },
    obsidian: {
      title: "Importar un cofre de Obsidian",
      shortTitle: "Obsidian",
      summary:
        "Cómo convertir un cofre entero en un workspace nuevo: qué se convierte, cómo se genera la organización, límites y privacidad.",
      sections: [
        {
          id: "como-usar",
          title: "Cómo usar",
          blocks: [
            {
              kind: "text",
              text: "EliasNote importa un cofre (vault) de Obsidian como un **workspace nuevo**, sin alterar el cofre original y sin enviar nada a internet. Toda la lectura ocurre en tu máquina.",
            },
            {
              kind: "list",
              ordered: true,
              items: [
                "Abre el menú **Archivo (⋯) → Cofre de Obsidian**, o **Importar → Importar cofre de Obsidian**.",
                "Selecciona la **carpeta raíz** del cofre. En el escritorio se abre el selector nativo de carpetas del sistema; en el navegador, usa el selector de carpeta del propio navegador.",
                "Revisa el resumen (notas, carpetas, canvas, dibujos y adjuntos), ajusta el nombre del workspace y elige si quieres importar los adjuntos no referenciados.",
                "Haz clic en **Importar cofre**. EliasNote abre el tablero raíz del nuevo workspace.",
              ],
            },
            {
              kind: "note",
              text: "Hay un cofre de ejemplo en examples/obsidian-vault en el repositorio para probar el flujo completo.",
            },
            {
              kind: "text",
              text: "Después de importar un `.excalidraw` del cofre, se convierte en un nodo de dibujo. Para reutilizar esa escena en otro dibujo, abre el dibujo de destino, usa **Escena → Fusionar dibujo del workspace** y elige el dibujo importado. También puedes usar **Escena → Pegar escena del portapapeles** o importar el archivo `.excalidraw` directamente en el editor.",
            },
            {
              kind: "text",
              text: "La importación es una única operación en el historial: `Ctrl/Cmd + Z` deshace el workspace entero. El cofre en disco no se modifica.",
            },
          ],
        },
        {
          id: "o-que-e-convertido",
          title: "Qué se convierte",
          hint: "obsidianParser.ts · obsidianPlan.ts",
          blocks: [
            {
              kind: "table",
              columns: ["Obsidian", "EliasNote"],
              caption: "Equivalencia entre los elementos del cofre y el resultado en el workspace",
              rows: [
                ["Carpetas", "Tableros anidados (la raíz se convierte en el tablero inicial; cada subcarpeta se convierte en un subtablero)"],
                ["Notas `.md`", "Notas Markdown con título, contenido, frontmatter de tags/aliases y tareas"],
                ["`[[Nota]]` / `[[Nota|alias]]`", "Enlace interno clicable (`eliasnote://node/...`) + referencia bidireccional"],
                ["`[[Nota#Título]]`", "Enlace interno con el fragmento en el título del enlace y referencia a la nota"],
                ["`![[imagem.png]]`", "Adjunto local + nodo de imagen, vídeo o archivo en el tablero, referenciado por la nota"],
                ["`[[arquivo.pdf]]`", "Adjunto local + nodo de archivo"],
                ["`[[Quadro.canvas]]`", "Enlace al tablero importado del canvas"],
                ["`[[desenho.excalidraw]]`", "Enlace al nodo de dibujo Excalidraw"],
                [
                  "Enlaces Markdown relativos (`[Nota](Pasta/Nota.md)`, `![](img.png)`)",
                  "Convertidos en enlaces internos y adjuntos cuando el destino existe en el cofre",
                ],
                [".canvas", "Tablero propio con notas, enlaces, imágenes, grupos y conectores"],
                [".excalidraw", "Nodo de dibujo editable (la misma escena)"],
                ["Imágenes, vídeos y archivos", "Adjuntos locales; la referencia se convierte en un nodo de medios"],
                ["Canvas `group`", "Columna con los elementos contenidos en el grupo (reorganizados verticalmente)"],
                [
                  "Colores del canvas (1–6)",
                  "Paleta de colores de EliasNote (rosa, arena, ámbar, menta, cielo, lila)",
                ],
                ["Aristas del canvas", "Conectores con etiqueta, color y flechas según `fromEnd`/`toEnd`"],
              ],
            },
          ],
        },
        {
          id: "organizacao-gerada",
          title: "Organización generada",
          blocks: [
            {
              kind: "list",
              items: [
                "El workspace recibe el nombre `Obsidian · <cofre>` (editable).",
                "La raíz del workspace es un tablero con el nombre del cofre. Contiene tarjetas de tablero para cada carpeta de primer nivel y para los canvas de la raíz, además de las notas que están en la raíz.",
                "Cada carpeta tiene su propio tablero, con subcarpetas, canvas, notas, dibujos y un área de adjuntos a la derecha.",
                "Las notas se colocan en una rejilla de tres columnas; los adjuntos quedan en una columna reservada a la derecha.",
                "Los tableros de canvas se abren como subtableros y aparecen como tarjetas en el tablero de la carpeta.",
              ],
            },
          ],
        },
        {
          id: "limitacoes",
          title: "Limitaciones conocidas",
          blocks: [
            {
              kind: "list",
              items: [
                "**Los plugins y los temas de Obsidian no se ejecutan ni se importan** (`.obsidian` se ignora). Dataview, Templater, los metadatos de plugins y los CSS snippets no tienen efecto.",
                "**Dataview y los bloques de consulta** entran como texto/código, no como resultados.",
                "**La transclusión** (`![[Nota]]`) se convierte en un enlace a la nota, no en contenido embebido.",
                "**Los callouts** de Obsidian se renderizan como citas normales; el HTML se sanitiza.",
                "**Los grupos de canvas** se convierten en columnas y los elementos se reorganizan verticalmente — la posición original dentro del grupo no se conserva.",
                "Los enlaces Markdown con espacios en la ruta entre `<...>` pueden no resolverse; prefiere `[[...]]`.",
                "Los nombres de notas repetidos en carpetas distintas pueden resolverse por la ruta más corta; usa `[[Pasta/Nota]]` para desambiguar.",
                "Los cofres con más de **20.000 archivos** se leen parcialmente; la app avisa y puedes importar subcarpetas por separado.",
                "Los archivos de texto de más de 8 MB se ignoran.",
                "La importación no crea plantillas a partir del cofre; usa **Plantillas → Guardar tablero actual** después, si quieres.",
              ],
            },
          ],
        },
        {
          id: "privacidade",
          title: "Privacidad",
          blocks: [
            {
              kind: "list",
              items: [
                "La carpeta se lee con el selector local del sistema (`webkitdirectory`); nada se envía a la red.",
                "Los adjuntos se copian al almacenamiento local de EliasNote (SQLite/IndexedDB), manteniendo el cofre intacto.",
                "Los enlaces internos se abren dentro de la app; los enlaces externos (`http`, `mailto`) se abren en el navegador predeterminado.",
              ],
            },
          ],
        },
        {
          id: "solucao-de-problemas",
          title: "Solución de problemas",
          blocks: [
            {
              kind: "list",
              items: [
                "**No se encontró nada:** confirma que seleccionaste la carpeta que contiene los `.md`, no una carpeta por encima del cofre.",
                "**Faltan imágenes:** comprueba que los adjuntos están dentro del cofre y que el enlace usa `![[...]]` o una ruta relativa válida. Activa “Adjuntos no referenciados” para importar imágenes sin enlaces.",
                "**Enlaces rotos:** la app muestra el recuento de enlaces no resueltos en el resumen; permanecen como texto.",
                "**Canvas vacío:** el archivo `.canvas` debe ser JSON válido en el formato JSON Canvas; los archivos inválidos aparecen como ignorados.",
                "**Muchos archivos:** selecciona una subcarpeta del cofre y repite la importación; cada importación genera un workspace nuevo.",
              ],
            },
          ],
        },
      ],
    },
    ...esDocsExtra,
  },
};
