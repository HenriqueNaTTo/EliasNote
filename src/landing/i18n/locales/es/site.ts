import type { SiteContent } from "@/landing/i18n/types";
import { esDocs } from "@/landing/i18n/locales/es/docs";

export const esSite: SiteContent = {
  beta: {
    badge: "Beta",
    message:
      "EliasNote está en desarrollo (beta): las funciones, los atajos y el formato de los datos aún pueden cambiar entre versiones.",
    link: "Seguir las versiones",
    downloads: {
      title: "Versión en desarrollo",
      description:
        "Esta es una beta pública: la app ya es estable para el uso diario, pero la interfaz, los atajos y el formato de los datos todavía cambian entre versiones.",
      items: [
        "Haz una copia de seguridad antes de actualizar: Backups → Crear instantánea.",
        "Las funciones pueden cambiar o reorganizarse sin aviso previo.",
        "¿Encontraste un problema? Abre una incidencia con los pasos para reproducirlo.",
      ],
    },
  },
  meta: {
    titles: {
      principal: "EliasNote — canvas infinito, 100% sin conexión",
      funcionalidades: "Funciones · EliasNote",
      downloads: "Descargas · EliasNote",
      documentacao: "Documentación · EliasNote",
      sobre: "Acerca de · EliasNote",
      contato: "Contacto · EliasNote",
    },
    docTitle: "{page} · Documentación · EliasNote",
    description:
      "EliasNote es una app de escritorio local-first para organizar visualmente: lienzo infinito, tableros anidados, notas, tareas y Excalidraw nativo. Sin cuentas, sin nube, sin sincronización.",
  },
  nav: {
    brand: "EliasNote",
    brandSubtitle: "Canvas local-first",
    homeAria: "EliasNote — página principal",
    sectionsAria: "Secciones del sitio",
    download: "Descargar",
    downloadAria: "Descargar instaladores de EliasNote",
    tabs: {
      principal: "Principal",
      funcionalidades: "Funciones",
      downloads: "Descargas",
      documentacao: "Documentación",
      sobre: "Acerca de",
      contato: "Contacto",
    },
    accentGroup: "Color de acento",
    accentPrefix: "Color",
    accentNames: { blue: "Azul", emerald: "Esmeralda", rose: "Rosa", amber: "Ámbar", slate: "Pizarra" },
    themeToLight: "Activar tema claro",
    themeToDark: "Activar tema oscuro",
    language: "Idioma",
    languageAria: "Elegir idioma del sitio",
    backToTop: "Volver arriba",
  },
  footer: {
    summary:
      "Organización visual local-first con canvas infinito y Excalidraw nativo. 100% sin conexión, sin cuentas y sin sincronización.",
    offline: "Hecho para funcionar sin internet",
    navigate: "Navegar",
    resources: "Recursos",
    links: {
      repo: "Repositorio",
      releases: "Versiones",
      issues: "Incidencias",
      docs: "Fuentes de la documentación",
      license: "Licencia MIT",
    },
    copyright: "© {year} EliasNote · código abierto bajo licencia MIT",
    tech: "Tauri 2 · React · Excalidraw · sin cookies de seguimiento",
  },
  home: {
    hero: {
      badge: "Local-first · 100% sin conexión",
      titleBefore: "Tu próximo proyecto empieza en un ",
      titleHighlight: "lienzo infinito",
      titleAfter: ".",
      description:
        "Notas, tareas, imágenes, tableros y dibujos de Excalidraw en un mismo espacio visual. Todo se guarda en tu computadora: sin cuenta, sin nube y sin sincronización.",
      primaryCta: "Descargar EliasNote",
      secondaryCta: "Ver funciones",
      footnote: "Windows, Linux y macOS · instaladores adjuntos en la versión oficial · licencia MIT",
    },
    statsLabel: "EliasNote en números",
    stats: ["de los datos en tu dispositivo", "tipos de elementos", "plantillas listas", "cuentas, nube o suscripción"],
    pillars: {
      eyebrow: "Por qué local-first",
      title: "Sin nube. Sin cuenta. Sin sorpresas.",
      description:
        "EliasNote está pensado para quienes quieren pensar visualmente sin entregar su propio material a un servicio de terceros.",
      items: [
        {
          title: "Tus datos en tu disco",
          description:
            "Cada tablero se guarda en SQLite en el escritorio o en IndexedDB en el navegador, con guardado automático incremental y copias de seguridad rotativas restaurables.",
          proof: "Guardado automático cada 700 ms",
        },
        {
          title: "Funciona sin internet",
          description:
            "Abre, escribe y dibuja en cualquier lugar. La app no depende de un servidor, de una cuenta ni de sincronización para funcionar.",
          proof: "Cero peticiones de datos",
        },
        {
          title: "Sin cuentas, sin rastreo",
          description:
            "Ningún inicio de sesión, telemetría ni suscripción. Los enlaces se abren en el navegador predeterminado y el contenido del espacio de trabajo siempre es tuyo.",
          proof: "Código abierto bajo MIT",
        },
      ],
    },
    flow: {
      eyebrow: "Cómo funciona",
      title: "Del borrador a la entrega, en el mismo tablero.",
      description:
        "Cada etapa reutiliza lo que ya creaste. Sin exportar a otra herramienta y sin empezar de nuevo el contexto.",
      templatesLabel: "Empieza con una plantilla",
      steps: [
        {
          title: "Captura sin formatear",
          description:
            "Crea notas, tareas y listas de verificación con un atajo. Suelta archivos directamente en el canvas: la imagen se convierte en tarjeta y el Markdown en nota.",
        },
        {
          title: "Conecta las ideas",
          description:
            "Las columnas, los tableros anidados y los conectores ordenan el caos sin perder el contexto. Ctrl/Cmd+K lo encuentra todo.",
        },
        {
          title: "Dibuja y entrega",
          description:
            "Abre Excalidraw para diagramar, combina escenas y exporta en PNG, SVG, PDF, Markdown o JSON reimportable.",
        },
      ],
    },
    toolkit: {
      eyebrow: "La caja de herramientas",
      title: "Todo en el mismo lugar, incluido el dibujo.",
      description:
        "La organización visual y el diagrama viven en el mismo espacio de trabajo. Sin cambiar de app a mitad de la idea.",
      items: [
        "Trece tipos de elementos, de notas Markdown a dibujos editables",
        "Búsqueda global en títulos, notas, tareas, enlaces, comentarios y etiquetas",
        "Tableros anidados, espacios de trabajo independientes y pestañas por tablero",
        "Excalidraw nativo con biblioteca local, guardado automático y combinación de escenas",
        "Nueve plantillas listas: lluvia de ideas, kanban, acta, investigación, semana y más",
        "Deshacer/rehacer con transacciones: un arrastre es una entrada del historial",
      ],
      cta: "Ver todas las funciones",
    },
    obsidian: {
      eyebrow: "Integración",
      title: "¿Ya tienes una bóveda de Obsidian?",
      description:
        "Importa la carpeta completa como un espacio de trabajo nuevo, sin modificar el original y sin enviar nada a internet. La importación es una única entrada en el historial.",
      items: [
        "Las carpetas se convierten en tableros anidados y las notas en Markdown",
        "Los wiki-enlaces, las etiquetas y el frontmatter se convierten en referencias clicables",
        "Las imágenes y los adjuntos se guardan localmente",
        "Los archivos .canvas y .excalidraw entran editables",
      ],
      link: "Leer la documentación de importación",
    },
    cta: {
      eyebrow: "Empieza en un minuto",
      title: "Tu próximo tablero empieza vacío. Como todo proyecto interesante.",
      description:
        "Instala la app, elige una plantilla y empieza a organizar. Cuando necesites dibujar, Excalidraw ya está ahí.",
      primary: "Descargar ahora",
      secondary: "Ver en GitHub",
    },
    templates: [
      "Lluvia de ideas",
      "Proyecto",
      "Kanban",
      "Acta de reunión",
      "Investigación",
      "Moodboard",
      "Semana",
      "Guion",
      "Retrospectiva",
      "GDD",
      "Diseño de nivel",
      "Sistemas y mecánicas",
      "Sprint de juego",
    ],
  },
  features: {
    header: {
      eyebrow: "Funciones",
      title: "Todo lo que hace EliasNote",
      description:
        "Una sola app para capturar, organizar, dibujar y entregar. Abajo, el inventario completo de lo que ya está listo en la versión actual.",
    },
    filterAria: "Filtrar funciones por categoría",
    allCategories: "Todas",
    categories: {
      canvas: "Canvas",
      elementos: "Elementos",
      desenho: "Dibujo",
      organizacao: "Organización",
      dados: "Datos e integraciones",
    },
    countOne: "{count} función en esta categoría",
    countMany: "{count} funciones en esta categoría",
    meta: "Atajos reasignables · interfaz en portugués",
    items: {
      "canvas-infinito": {
        title: "Canvas infinito",
        description:
          "Desplazamiento con la rueda, el trackpad, el botón central o la barra espaciadora. Zoom del 25% al 200%, minimapa clicable y encuadre con Shift+1.",
      },
      "encaixe-grade": {
        title: "Ajuste y alineadores",
        description:
          "Cuadrícula opcional de 8, 16, 24 o 32 px, alineadores en el inspector y movimiento fino con las flechas del teclado.",
      },
      "selecao-multipla": {
        title: "Selección múltiple",
        description:
          "Recuadro de selección, Shift+clic y Ctrl/Cmd+A con acciones en lote para duplicar, bloquear, ocultar y ordenar.",
      },
      "mover-entre-quadros": {
        title: "Mover entre tableros",
        description:
          "Arrastra la selección a una tarjeta de tablero o al árbol lateral. Mantén pulsado Alt para copiar en lugar de mover.",
      },
      "tipos-de-elementos": {
        title: "13 tipos de elementos",
        description:
          "Notas, texto, tarjetas, tareas, listas de verificación, imágenes, videos, archivos, enlaces, tableros, columnas, comentarios y dibujos.",
      },
      "notas-markdown": {
        title: "Notas Markdown",
        description:
          "Barra de formato, vista previa, recuento de palabras, título y colores. Suelta una imagen en la nota para incrustar la miniatura.",
      },
      "tarefas-checklists": {
        title: "Tareas y listas de verificación",
        description:
          "Marca elementos como hechos, define prioridad y fecha límite, sigue el progreso y crea la tarea siguiente con Enter.",
      },
      "midia-local": {
        title: "Medios locales",
        description:
          "Imágenes, videos y archivos con adjunto en el dispositivo, leyenda, vista ampliada y ninguna subida a servidores.",
      },
      colunas: {
        title: "Columnas inteligentes",
        description:
          "Arrastra elementos dentro, reordena, contrae, redimensiona y mueve la columna entera con sus hijos.",
      },
      comentarios: {
        title: "Comentarios locales",
        description:
          "Debates con autor, respuestas y resolución, sin depender de una cuenta ni de un servicio externo.",
      },
      conectores: {
        title: "Conectores y flechas",
        description:
          "Curva, recta o codo, con etiquetas, colores, trazo discontinuo y puntas de flecha para mostrar relaciones.",
      },
      excalidraw: {
        title: "Excalidraw nativo",
        description:
          "Editor a pantalla completa con todas las herramientas, guardado automático, biblioteca local y miniaturas en el canvas.",
      },
      "mesclar-cenas": {
        title: "Combinar escenas",
        description:
          "Combina un dibujo con el portapapeles, un archivo .excalidraw u otro dibujo del espacio de trabajo conservando los vínculos y las imágenes.",
      },
      "exportar-desenho": {
        title: "PNG, SVG y PDF",
        description:
          "Exporta cualquier dibujo en los tres formatos desde el editor, sin salir de la app y sin perder la escena original.",
      },
      "quadros-aninhados": {
        title: "Tableros anidados",
        description:
          "Subtableros recursivos con árbol arrastrable, duplicación, ordenación y mosaicos de color en el canvas.",
      },
      "workspaces-abas": {
        title: "Espacios de trabajo y pestañas",
        description:
          "Varios espacios de trabajo independientes y pestañas por tablero, que se cierran con el botón, el clic central o Ctrl/Cmd+W.",
      },
      "busca-global": {
        title: "Búsqueda global",
        description:
          "Ctrl/Cmd+K busca en títulos, notas, tareas, listas de verificación, enlaces, comentarios, etiquetas y tableros.",
      },
      referencias: {
        title: "Referencias y enlaces entrantes",
        description:
          "Apunta tableros y elementos en Refs y consulta quién referencia el elemento actual en el panel de enlaces entrantes.",
      },
      modelos: {
        title: "9 plantillas listas",
        description:
          "Lluvia de ideas, proyecto, kanban, acta de reunión, investigación, moodboard, semana, guion y retrospectiva.",
      },
      autosave: {
        title: "Guardado automático en SQLite",
        description:
          "Grabación incremental por tablero en el escritorio (SQLite) y en el navegador (IndexedDB), con debounce de 700 ms.",
      },
      backups: {
        title: "Copias de seguridad y restauración",
        description:
          "Instantáneas automáticas por intervalo o manuales, con retención configurable y restauración desde el panel.",
      },
      "exportar-importar": {
        title: "Exportar e importar",
        description:
          "PNG y PDF del tablero completo, Markdown, JSON reimportable e importación de archivos y .excalidraw por arrastre.",
      },
      obsidian: {
        title: "Bóveda de Obsidian",
        description:
          "Las carpetas se convierten en tableros, las notas en Markdown con wiki-enlaces, los adjuntos quedan locales y .canvas se convierte en subtablero con conectores.",
      },
      personalizacao: {
        title: "Tema y personalización",
        description:
          "Claro, oscuro o sistema, seis colores de acento, densidad, escala de la interfaz, textura del canvas y atajos reasignables.",
      },
      historico: {
        title: "Historial fiable",
        description:
          "Deshacer y rehacer con transacciones: un arrastre es una entrada y la escritura se agrupa de forma inteligente.",
      },
      "codigo-snippets": {
        title: "Código con resaltado",
        description:
          "Bloques de código en el canvas con resaltado para GDScript, C#, shaders, JSON y YAML, lenguaje inferido por la extensión del título y copia en un clic.",
      },
      "texto-formatado": {
        title: "Texto con estilo",
        description:
          "Negrita, cursiva, subrayado, tachado, tamaños de 10 a 96 px, fuente sans, serif o mono y alineación — en la barra flotante, en el inspector o con Ctrl+B, Ctrl+I y Ctrl+U.",
      },
      "modelos-jogo": {
        title: "Plantillas para game dev",
        description:
          "GDD, diseño de nivel, sistemas y mecánicas y sprint de juego, ya con fragmentos de GDScript, JSON y shader.",
      },
    },
    elements: {
      eyebrow: "Elementos",
      title: "Cada contenido tiene el formato adecuado.",
      description:
        "Arrastra del sistema al canvas: la imagen se convierte en medio, el Markdown en nota, .excalidraw en dibujo y el JSON importa elementos.",
      columnName: "Elemento",
      columnDescription: "Qué hace",
      caption: "Tipos de elementos de EliasNote y qué hace cada uno",
      footnote: "Todos los elementos admiten color, redimensionado, bloqueo, ocultación y referencias bidireccionales.",
      items: {
        nota: {
          name: "Nota",
          description: "Markdown con barra de formato, vista previa, recuento de palabras, título y colores.",
        },
        texto: {
          name: "Texto",
          description: "Texto libre directamente en el canvas, sin tarjeta: crece con el contenido, admite colores y negrita, cursiva, tamaño, fuente y alineación.",
        },
        cartao: { name: "Tarjeta", description: "Título, descripción, etiqueta y color para agrupar referencias y resúmenes." },
        tarefa: {
          name: "Tarea",
          description: "Completar, prioridad y fecha límite; Enter crea la tarea siguiente de la secuencia.",
        },
        checklist: { name: "Lista de verificación", description: "Elementos editables con progreso, añadir, quitar y completar." },
        midia: {
          name: "Imagen y video",
          description: "Adjunto local, leyenda, relleno o ajuste y vista ampliada.",
        },
        arquivo: { name: "Archivo", description: "Nombre, tipo, tamaño y descarga del adjunto guardado en el dispositivo." },
        link: { name: "Enlace", description: "Título, descripción, URL y apertura en el navegador predeterminado." },
        quadro: {
          name: "Tablero",
          description: "Subtablero real con estadísticas, vista previa en color y apertura en pestaña.",
        },
        coluna: {
          name: "Columna",
          description: "Hijos arrastrables, contraer, redimensionar y menú de creación rápida.",
        },
        comentario: {
          name: "Comentario",
          description: "Autor local, resolución, respuestas y panel dedicado dentro del inspector.",
        },
        desenho: {
          name: "Dibujo",
          description: "Excalidraw completo, miniatura en el canvas, biblioteca local y exportación.",
        },
        "desenho-nota": {
          name: "Dibujo en nota",
          description: "Vincula un dibujo a la nota: la miniatura aparece en la tarjeta y abre el editor.",
        },
        codigo: {
          name: "Código",
          description:
            "Bloque monoespaciado con resaltado (GDScript, C#, shaders, JSON, YAML), copia rápida y lenguaje por la extensión.",
        },
      },
    },
    shortcuts: {
      title: "Atajos esenciales",
      subtitle: "Todos reasignables en Configuración → Atajos.",
      note: "Ctrl/Cmd representa ⌘ en macOS. Los atajos de una sola letra se ignoran mientras escribes.",
      actions: {
        busca: "Búsqueda global",
        "nova-nota": "Nueva nota",
        "nova-tarefa": "Nueva tarea",
        desenho: "Nuevo dibujo de Excalidraw",
        enquadrar: "Encuadrar tablero",
        zoom: "Zoom al 100%",
        sidebar: "Alternar barra lateral",
        desfazer: "Deshacer",
      },
    },
    drawing: {
      title: "Dibujar sin cambiar de app",
      description:
        "El editor Excalidraw se abre a pantalla completa y la escena queda guardada en el propio tablero, con miniatura en el canvas. La biblioteca de elementos es local y se puede importar o exportar en .excalidrawlib.",
      items: [
        "Combinación de escenas con remapeo de vínculos e imágenes",
        "Exportación del dibujo en PNG, SVG y PDF",
        "Importación de archivos .excalidraw por arrastre",
      ],
      link: "Conocer Excalidraw",
    },
    obsidian: {
      title: "Bóveda de Obsidian en un clic",
      description:
        "La importación crea un espacio de trabajo nuevo con la jerarquía de carpetas, notas, adjuntos, canvas y dibujos. La bóveda original no se modifica.",
      link: "Ver qué se convierte",
    },
    footnote: {
      start: "Los detalles técnicos y los límites conocidos están en la ",
      featuresLink: "página de funciones",
      middle: " y la lista completa de combinaciones está en ",
      shortcutsLink: "Atajos",
      end: ".",
    },
  },
  downloads: {
    header: {
      eyebrow: "Descargas",
      title: "Descarga una vez. Funciona para siempre.",
      description:
        "Instaladores oficiales publicados en GitHub. Sin registro ni licencia que activar: descarga, instala y empieza a organizar.",
    },
    version: "Versión {version}",
    free: "Gratis · código abierto",
    allReleases: "Todas las versiones",
    downloadButton: "Descargar instalador",
    unsigned: {
      title: "Instaladores sin firma",
      description:
        "Los paquetes se generan con el flujo de publicación y no tienen firma de código, así que el sistema puede mostrar un aviso en el primer inicio.",
      windowsLabel: "Windows:",
      windows: "en SmartScreen, usa “Más información” → “Ejecutar de todos modos”.",
      macosLabel: "macOS:",
      macos: "si el sistema bloquea la apertura, quita la cuarentena de la app.",
      codeTitle: "macOS · terminal",
      codeNote: "Solo es necesario cuando macOS impide la primera apertura.",
    },
    requirements: {
      title: "Requisitos",
      windowsLabel: "Windows 10/11",
      windows: "con WebView2 actualizado.",
      linuxLabel: "Linux",
      linux: "con WebKitGTK 4.1; el AppImage es portátil y el .deb resuelve las dependencias.",
      macosLabel: "macOS 11+",
      macos: "en Intel o Apple Silicon, con un único DMG universal.",
      buildLabel: "Para compilar:",
      build: "Node 20+ y Rust 1.77.2+, además de las dependencias de Tauri 2.",
      footnote: "La app no pide permisos de red para funcionar: el espacio de trabajo permanece en el dispositivo.",
    },
    platforms: {
      windows: {
        name: "Windows",
        requirement: "Windows 10/11 · WebView2",
        note: "Asistente visual (.exe) y WiX (MSI) para instalación silenciosa.",
      },
      linux: {
        name: "Linux",
        requirement: "Distribuciones con WebKitGTK 4.1",
        note: "AppImage portátil y paquete Debian.",
      },
      macos: {
        name: "macOS",
        requirement: "macOS 11+ · universal (Intel y Apple Silicon)",
        note: "Un único DMG universal para las dos arquitecturas.",
      },
    },
    source: {
      title: "Compilar desde el código fuente",
      description:
        "Clona el repositorio y ejecuta la app en modo de desarrollo. En el navegador, la persistencia usa IndexedDB; en el escritorio, SQLite.",
      codeNote: "En Linux y macOS, usa npm run tauri build para generar el paquete nativo de la plataforma.",
      repository: "Código en GitHub",
      guide: "Guía de desarrollo",
    },
    data: {
      title: "Dónde están tus datos",
      subtitle: "Los documentos, los adjuntos y las copias de seguridad están en el directorio de datos de la app.",
      caption: "Directorios de datos de EliasNote por sistema operativo",
      footnote:
        "Desinstalar la app no borra la carpeta de datos; elimínala manualmente si quieres vaciar el espacio de trabajo.",
      browserPath: "IndexedDB del propio navegador",
      systems: {
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        browser: "Navegador",
      },
    },
    workflow: {
      before: "Cada etiqueta v* activa el flujo de publicación, que ejecuta typecheck, pruebas y build y adjunta los instaladores de Windows, Linux y macOS a la versión. Sigue las ejecuciones en ",
      actionsLink: "GitHub Actions",
      middle: ". Si algo falla, abre una incidencia en ",
      repoLink: "github.com/HenriqueNaTTo/EliasNote",
      after: ".",
    },
  },
  about: {
    header: {
      eyebrow: "Acerca de",
      title: "Una herramienta de pensamiento que cabe en tu computadora.",
      description:
        "EliasNote combina la organización visual de Milanote con el dibujo de Excalidraw — sin cuentas, servidores ni sincronización. El material sigue siendo tuyo, incluso cuando la app está cerrada.",
    },
    paragraphs: [
      "nació de una necesidad sencilla: pensar visualmente sin entregar el borrador a un servicio de terceros. En lugar de una pila de apps entre la idea y la entrega, el proyecto reúne notas, tareas, referencias, tableros y diagramas en un único canvas infinito.",
      "La app está hecha con Tauri 2 y React, usa SQLite en el escritorio e IndexedDB en el navegador, y trata el dibujo como parte del flujo, no como un anexo. Excalidraw está integrado y es editable, con escenas que se pueden combinar y exportación en PNG, SVG y PDF.",
      "No hay inicio de sesión, suscripción ni telemetría. La versión se genera con un flujo público que ejecuta typecheck, pruebas y build antes de adjuntar los instaladores de las tres plataformas.",
    ],
    tags: ["Tauri 2", "React 18", "TypeScript", "Tailwind CSS", "Excalidraw", "SQLite"],
    summary: {
      title: "En resumen",
      rows: [
        { label: "Modelo", value: "Local-first · 100% sin conexión" },
        { label: "Plataformas", value: "Windows, Linux y macOS" },
        { label: "Licencia", value: "MIT" },
        { label: "Versión actual", value: "{version}" },
      ],
      repository: "Repositorio",
      license: "Licencia MIT",
    },
    principles: {
      eyebrow: "Principios",
      title: "Cuatro decisiones que definen la app.",
      description: "Aparecen en la arquitectura, en la interfaz y en los límites del producto.",
      items: [
        {
          title: "El archivo es tuyo",
          description:
            "Los tableros están en SQLite en el escritorio o en IndexedDB en el navegador, con exportación a JSON y Markdown. Nada de formatos cerrados.",
        },
        {
          title: "Sin conexión por defecto",
          description:
            "La app abre y funciona sin internet. Los enlaces se abren en el navegador predeterminado; el contenido del espacio de trabajo nunca sale del dispositivo.",
        },
        {
          title: "Sin cuentas y sin telemetría",
          description:
            "No existe inicio de sesión, suscripción, sincronización ni servidor. La instalación no solicita ningún dato personal.",
        },
        {
          title: "Código abierto",
          description:
            "Código original bajo licencia MIT, bibliotecas con sus propias licencias y ningún recurso propietario de Milanote.",
        },
      ],
    },
    limits: {
      title: "Límites conocidos",
      subtitle: "La transparencia importa tanto como la función nueva.",
      items: [
        "No hay autenticación, colaboración, servidor ni sincronización, por diseño.",
        "El historial de deshacer/rehacer es por sesión y no se guarda.",
        "El editor Excalidraw se carga bajo demanda (~4,6 MB comprimido) la primera vez que se abre.",
        "La exportación de imagen captura el área encuadrada del canvas; para tableros grandes usa escala 2x o 3x.",
        "Los instaladores de la versión no están firmados, así que el sistema puede mostrar un aviso en el primer inicio.",
      ],
      link: "Ver la lista completa",
    },
    stack: {
      title: "Stack y decisiones técnicas",
      subtitle: "Todo abierto y auditable en el repositorio.",
      layers: [
        "Aplicación de escritorio",
        "Interfaz",
        "Base visual",
        "Dibujo",
        "Estado e historial",
        "Persistencia",
        "Build y pruebas",
      ],
      footnote: { start: "Documentación de arquitectura en ", link: "Arquitectura", end: "." },
    },
    credits: {
      title: "Créditos y licencias",
      text: "Código original bajo licencia MIT. Las bibliotecas de terceros mantienen sus propias licencias: Excalidraw (MIT), React, TypeScript, Vite, Tailwind CSS, Radix UI, lucide, Zustand, Immer, marked, DOMPurify, html-to-image, jsPDF, Tauri 2 y rusqlite. No se utilizó ningún código ni recurso propietario de Milanote.",
      license: "Leer la licencia",
      docs: "Documentación completa",
    },
  },
  contact: {
    header: {
      eyebrow: "Contacto",
      title: "Habla directamente con el proyecto.",
      description:
        "Sin centro de atención y sin formulario en un servidor: el mensaje se convierte en una incidencia precargada en el repositorio oficial. Revisas el texto y decides si la publicas.",
    },
    channels: [
      {
        title: "Errores y sugerencias",
        description: "Describe el problema con pasos para reproducirlo o propón una función nueva.",
        action: "Abrir incidencias",
      },
      {
        title: "Descargas y versiones",
        description: "Instaladores y notas de cada versión publicada para Windows, Linux y macOS.",
        action: "Ver versiones",
      },
      {
        title: "Documentación",
        description: "Arquitectura, funciones, atajos, importación de Obsidian y guía de desarrollo.",
        action: "Leer la documentación",
      },
    ],
    privacy: {
      title: "Nada pasa por un servidor",
      description:
        "EliasNote no tiene backend. El único destino posible de este formulario es GitHub, y no se envía nada hasta que confirmes la publicación de la incidencia.",
    },
    startFresh: {
      before: "¿Prefieres empezar de cero? ",
      issue: "Abre una incidencia en blanco",
      middle: " o consulta el ",
      repo: "repositorio oficial",
      after: ".",
    },
    form: {
      title: "Abrir una incidencia",
      subtitle: "El texto de abajo se convierte en el cuerpo del mensaje en GitHub.",
      labels: { name: "Nombre", email: "Correo electrónico", subject: "Asunto", topic: "Tipo de mensaje", message: "Mensaje" },
      placeholders: {
        name: "Cómo podemos llamarte",
        email: "tu@ejemplo.com",
        subject: "Resumen en una línea",
        message:
          "Cuenta qué pasó, qué esperabas y cómo reproducirlo. Si es una sugerencia, describe el caso de uso.",
      },
      topics: {
        sugestao: "Sugerencia de función",
        bug: "Informe de error",
        duvida: "Duda de uso",
        outro: "Otro asunto",
      },
      errors: {
        name: "Indica tu nombre.",
        email: "Indica un correo electrónico válido.",
        subject: "Resume el asunto en al menos 3 caracteres.",
        message: "Describe el problema en al menos 20 caracteres.",
      },
      counter: "{count} de 4000 caracteres",
      submit: "Abrir incidencia en GitHub",
      disclaimer: "Nada se publica automáticamente.",
      successTitle: "Borrador de incidencia generado",
      successDescription:
        "Si GitHub no se abrió en otra pestaña, usa el enlace de abajo. Revisa el texto y pulsa “Submit new issue” para publicar.",
      successLink: "Abrir borrador",
      copyLink: "Copiar enlace",
      edit: "Editar mensaje",
      issue: { name: "Nombre", email: "Correo electrónico", type: "Tipo", footer: "Mensaje escrito en el formulario de la landing page de EliasNote." },
    },
  },
  docs: esDocs,
};
